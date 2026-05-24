// Content Script
// Content Script

// Add global variables at the beginning of script
let observer = null;
const processingQueue = new Set();
let processTimeout = null;
// Global config variable (will be loaded from storage)
let config = null;
const DEFAULT_PLATFORM_SELECTORS = globalThis.DEFAULT_PLATFORM_SELECTORS;

// Logging helpers
function logInfo(...args) {
    console.log('[Markdown Copy]', ...args);
}

function logError(...args) {
    console.error('[Markdown Copy]', ...args);
}

function logDebug(..._args) {
}

// Detect current platform
function detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
        return 'chatgpt';
    } else if (hostname.includes('gemini.google.com')) {
        return 'gemini';
    }
    return null;
}

// Default platform configuration
const DEFAULT_PLATFORM_CONFIG = {
    chatgpt: {
        ...DEFAULT_PLATFORM_SELECTORS.chatgpt,
        getButtonContainer: (copyButton) => copyButton.parentNode
    },
    gemini: {
        ...DEFAULT_PLATFORM_SELECTORS.gemini,
        getButtonContainer: (copyButton) => copyButton.closest('copy-button')
    }
};

function mergeSelectors(...selectorGroups) {
    const selectors = selectorGroups
        .filter(Boolean)
        .flatMap(group => group.split(','))
        .map(selector => selector.trim())
        .filter(Boolean);

    return [...new Set(selectors)].join(', ');
}

// Load custom selectors from storage
function loadCustomSelectors(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['customSelectors'], (result) => {
            const customSelectors = result.customSelectors || {};

            // Merge custom selectors with defaults
            const platformSelectors = customSelectors[currentPlatform] || {};
            const defaultSelectors = DEFAULT_PLATFORM_CONFIG[currentPlatform];

            config = {
                messageSelector: platformSelectors.messageSelector || defaultSelectors.messageSelector,
                buttonContainerSelector: platformSelectors.buttonContainerSelector || defaultSelectors.buttonContainerSelector,
                copyButtonSelector: currentPlatform === 'chatgpt'
                    ? mergeSelectors(platformSelectors.copyButtonSelector, defaultSelectors.copyButtonSelector)
                    : (platformSelectors.copyButtonSelector || defaultSelectors.copyButtonSelector),
                fallbackCopyButtonSelector: platformSelectors.fallbackCopyButtonSelector || defaultSelectors.fallbackCopyButtonSelector,
                contentSelector: platformSelectors.contentSelector || defaultSelectors.contentSelector,
                getButtonContainer: defaultSelectors.getButtonContainer
            };

            logInfo('Loaded config:', config);

            if (callback) callback();
        });
    } else {
        // Fallback if chrome.storage is not available
        config = DEFAULT_PLATFORM_CONFIG[currentPlatform];
        logInfo('Using default config (storage not available)');
        if (callback) callback();
    }
}

// Modified addMarkdownCopyButton, no longer disconnecting observer
function addMarkdownCopyButton(buttonContainer, directCopyButton = null) {
    // Generate unique identifier
    const containerId = buttonContainer.getAttribute('data-md-id') || Math.random().toString(36);

    // Check if processing or already processed
    if (processingQueue.has(containerId)) {
        logDebug('[addMarkdownCopyButton] Skipping - already in processing queue:', containerId);
        return;
    }

    // Check if button already added
    if (buttonContainer.querySelector('[data-markdown-copy="true"]')) {
        logDebug('[addMarkdownCopyButton] Skipping - markdown button already exists');
        return;
    }

    // For Gemini, additionally check if next sibling is our button
    if (currentPlatform === 'gemini' && (
        buttonContainer.nextElementSibling?.hasAttribute('data-markdown-copy') ||
        buttonContainer.nextElementSibling?.querySelector('[data-markdown-copy]')
    )) {
        logDebug('[addMarkdownCopyButton] Skipping - Gemini button already exists');
        return;
    }

    let copyButton = directCopyButton || buttonContainer.querySelector(config.copyButtonSelector);
    if (!copyButton && config.fallbackCopyButtonSelector) {
        const fallbacks = document.querySelectorAll(config.fallbackCopyButtonSelector);
        for (const btn of fallbacks) {
            if (buttonContainer.contains(btn)) {
                copyButton = btn;
                break;
            }
        }
    }

    if (!copyButton) {
        logError('[addMarkdownCopyButton] Copy button not found, selector:', config.copyButtonSelector);
        return;
    }

    logInfo('[addMarkdownCopyButton] Adding markdown copy button to container:', containerId);

    // Mark as processing
    processingQueue.add(containerId);
    buttonContainer.setAttribute('data-md-id', containerId);

    let mdButton;
    let mdWrapper;

    // Set button style based on platform
    if (currentPlatform === 'chatgpt') {
        mdButton = document.createElement('button');
        mdButton.className = copyButton.className;

        // Create ChatGPT button content using DOM API
        const span = document.createElement('span');
        span.className = 'flex items-center justify-center touch:w-10 h-8 w-8';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '0 0 20 20');
        svg.setAttribute('fill', 'currentColor');
        svg.classList.add('icon');

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('opacity', '0.9');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '10');
        text.setAttribute('y', '15');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-size', '7');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'currentColor');
        text.textContent = 'M';

        g.appendChild(path);
        svg.appendChild(g);
        svg.appendChild(text);
        span.appendChild(svg);
        mdButton.appendChild(span);

        mdButton.setAttribute('aria-label', chrome.i18n.getMessage('copyAsMarkdown'));
        mdButton.setAttribute('data-markdown-copy', 'true');
        mdButton.setAttribute('title', chrome.i18n.getMessage('copyAsMarkdown'));
    } else if (currentPlatform === 'gemini') {
        // Clone the whole <copy-button> wrapper for robust, clean Angular component reproduction
        mdWrapper = buttonContainer.cloneNode(true);
        mdWrapper.removeAttribute('id');
        mdWrapper.setAttribute('data-markdown-copy', 'true');
        mdWrapper.removeAttribute('data-md-id');
        // Remove duplicate attributes from cloned descendants.
        mdWrapper.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        mdWrapper.querySelectorAll('[data-md-id]').forEach(el => el.removeAttribute('data-md-id'));

        mdButton = mdWrapper.querySelector('button');
        const matIcon = mdWrapper.querySelector('mat-icon');
        const tooltipEl = mdWrapper.querySelector('[gemtooltip]');

        if (tooltipEl) {
            tooltipEl.setAttribute('gemtooltip', chrome.i18n.getMessage('copyAsMarkdown'));
            tooltipEl.setAttribute('arialabel', chrome.i18n.getMessage('copyAsMarkdown'));
        }

        if (mdButton) {
            mdButton.setAttribute('aria-label', chrome.i18n.getMessage('copyAsMarkdown'));
            mdButton.setAttribute('title', chrome.i18n.getMessage('copyAsMarkdown'));
            mdButton.setAttribute('data-markdown-copy', 'true');
            mdButton.removeAttribute('jslog');
        }

        // Remove all id and data-md-id attributes from cloned descendants to avoid duplicates
        mdWrapper.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        mdWrapper.querySelectorAll('[data-md-id]').forEach(el => el.removeAttribute('data-md-id'));


        mdButton = mdWrapper.querySelector('button');
        const matIcon = mdWrapper.querySelector('mat-icon');
        const tooltipEl = mdWrapper.querySelector('[gemtooltip]');

        if (tooltipEl) {
            tooltipEl.setAttribute('gemtooltip', chrome.i18n.getMessage('copyAsMarkdown'));
            tooltipEl.setAttribute('arialabel', chrome.i18n.getMessage('copyAsMarkdown'));
        }

        if (mdButton) {
            mdButton.setAttribute('aria-label', chrome.i18n.getMessage('copyAsMarkdown'));
            mdButton.setAttribute('title', chrome.i18n.getMessage('copyAsMarkdown'));
            mdButton.setAttribute('data-markdown-copy', 'true');
            // Remove Angular attributes that could conflict or trigger duplicate behavior
            mdButton.removeAttribute('jslog');
        }

        if (matIcon) {
            // Replace the <mat-icon> with a beautiful custom inline SVG document icon
            // to completely avoid any custom subset symbol font loading limitations
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '20');
            svg.setAttribute('height', '20');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            svg.setAttribute('class', 'mat-icon notranslate lm-icon-m');
            svg.style.width = '20px';
            svg.style.height = '20px';

            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');

            const polyline1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline1.setAttribute('points', '14 2 14 8 20 8');

            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line1.setAttribute('x1', '16');
            line1.setAttribute('y1', '13');
            line1.setAttribute('x2', '8');
            line1.setAttribute('y2', '13');

            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', '16');
            line2.setAttribute('y1', '17');
            line2.setAttribute('x2', '8');
            line2.setAttribute('y2', '17');

            const polyline2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline2.setAttribute('points', '10 9 9 9 8 9');

            svg.appendChild(path1);
            svg.appendChild(polyline1);
            svg.appendChild(line1);
            svg.appendChild(line2);
            svg.appendChild(polyline2);

            matIcon.replaceWith(svg);
        }
    }

    // Add click event
    mdButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        logDebug('on click');
        let markdownContent;
        let markdownToCopy = '';

        if (currentPlatform === 'chatgpt') {
            const messageContainer = buttonContainer.closest(config.messageSelector);
            if (messageContainer) {
                const assistantDivs = messageContainer.querySelectorAll('[data-message-author-role="assistant"]');
                if (assistantDivs.length > 0) {
                    const parts = [];
                    assistantDivs.forEach(aiDiv => {
                        const content = aiDiv.querySelector(config.contentSelector) || aiDiv.querySelector('.markdown') || aiDiv;
                        const md = globalThis.MarkdownCopy.htmlToMarkdown(content).trim();
                        if (md) parts.push(md);
                    });
                    markdownToCopy = parts.join('\n\n');
                } else {
                    markdownContent = messageContainer.querySelector(config.contentSelector);
                }
            }
        } else if (currentPlatform === 'gemini') {
            const modelResponse = buttonContainer.closest('model-response');
            if (modelResponse) {
                const messageContent = modelResponse.querySelector('message-content') || modelResponse;
                markdownContent = messageContent.querySelector('.markdown') || messageContent;
            } else {
                // Fallback to original climbing traversal if model-response is missing
                const contentDiv = buttonContainer.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling;
                if (contentDiv) {
                    const messageContent = contentDiv.querySelector('message-content') || contentDiv;
                    markdownContent = messageContent.querySelector('.markdown') || messageContent;
                }
            }
        }

        if (markdownToCopy || markdownContent) {
            try {
                const markdown = markdownToCopy || globalThis.MarkdownCopy.htmlToMarkdown(markdownContent);
                logDebug(markdown);

                try {
                    await navigator.clipboard.writeText(markdown);

                    if (currentPlatform === 'chatgpt') {
                        const svg = mdButton.querySelector('svg');
                        const originalSVG = svg.cloneNode(true);
                        svg.innerHTML = '';
                        const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        checkPath.setAttribute('d', 'M7 10l2 2 4-4');
                        checkPath.setAttribute('stroke', 'currentColor');
                        checkPath.setAttribute('stroke-width', '2');
                        checkPath.setAttribute('fill', 'none');
                        svg.appendChild(checkPath);

                        setTimeout(() => {
                            svg.replaceWith(originalSVG);
                        }, 1000);
                    } else if (currentPlatform === 'gemini') {
                        const svg = mdButton.querySelector('svg');
                        if (svg) {
                            const originalHTML = svg.innerHTML;
                            svg.innerHTML = '';
                            const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            checkPath.setAttribute('d', 'M20 6L9 17l-5-5');
                            checkPath.setAttribute('stroke', 'currentColor');
                            checkPath.setAttribute('stroke-width', '2');
                            checkPath.setAttribute('stroke-linecap', 'round');
                            checkPath.setAttribute('stroke-linejoin', 'round');
                            checkPath.setAttribute('fill', 'none');
                            svg.appendChild(checkPath);

                            setTimeout(() => {
                                svg.innerHTML = originalHTML;
                            }, 1000);
                        } else {
                            const iconToChange = mdButton.querySelector('mat-icon') || mdButton;
                            const originalText = iconToChange.textContent;
                            iconToChange.textContent = 'check';
                            if (iconToChange.hasAttribute('fonticon')) {
                                iconToChange.setAttribute('fonticon', 'check');
                            }

                            setTimeout(() => {
                                iconToChange.textContent = originalText;
                                if (iconToChange.hasAttribute('fonticon')) {
                                    iconToChange.setAttribute('fonticon', 'description');
                                }
                            }, 1000);
                        }
                    }
                } catch (err) {
                    logError('Failed to copy to clipboard:', err);
                }
            } catch (err) {
                logError('Failed to convert to markdown:', err);
            }
        } else {
            const errorMsg = chrome.i18n.getMessage('cantFindMessageBody');
            logError(errorMsg);
        }
    });

    // Insert button
    if (currentPlatform === 'chatgpt') {
        copyButton.parentNode.insertBefore(mdButton, copyButton.nextSibling);
    } else if (currentPlatform === 'gemini') {
        buttonContainer.parentNode.insertBefore(mdWrapper, buttonContainer.nextSibling);
    }

    // Remove from queue after processing
    setTimeout(() => {
        processingQueue.delete(containerId);
    }, 100);
}

// Modified processExistingMessages, added debounce
function processExistingMessages() {
    // Debounce: avoid multiple executions in short time
    if (processTimeout) {
        clearTimeout(processTimeout);
    }

    processTimeout = setTimeout(() => {
        logInfo('[processExistingMessages] Starting to process messages...');

        if (currentPlatform === 'chatgpt') {
            // Try multiple selector strategies for better coverage
            const containers = document.querySelectorAll(`${config.messageSelector} ${config.buttonContainerSelector}`);
            logInfo(`[processExistingMessages] Found ${containers.length} button containers using primary selector`);

            // If no containers found, try finding copy buttons directly
            if (containers.length === 0) {
                let copyButtons = Array.from(document.querySelectorAll(config.copyButtonSelector));
                if (copyButtons.length === 0 && config.fallbackCopyButtonSelector) {
                    copyButtons = Array.from(document.querySelectorAll(config.fallbackCopyButtonSelector));
                }
                logInfo(`[processExistingMessages] Fallback: Found ${copyButtons.length} copy buttons`);

                copyButtons.forEach(copyButton => {
                    const container = config.getButtonContainer(copyButton);
                    if (container && container.closest(config.messageSelector)) {
                        logInfo('[processExistingMessages] Adding button to container found via copy button');
                        addMarkdownCopyButton(container, copyButton);
                    }
                });
            } else {
                containers.forEach(container => {
                    addMarkdownCopyButton(container);
                });
            }
        } else if (currentPlatform === 'gemini') {
            const copyButtons = document.querySelectorAll(config.buttonContainerSelector);
            logInfo(`[processExistingMessages] Found ${copyButtons.length} Gemini copy buttons`);
            copyButtons.forEach(button => {
                addMarkdownCopyButton(button);
            });
        }

        logInfo('[processExistingMessages] Processing complete');
        processTimeout = null;
    }, 300); // 300ms debounce delay
}

// Wait for page load complete
function waitForPageLoad() {
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
}

// Wait for main content container to appear
function waitForMainContent() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const mainContent = document.querySelector('main') ||
                document.querySelector('[role="main"]') ||
                document.querySelector('message-content');
            if (mainContent) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);

        // Timeout protection
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
        }, 5000);
    });
}

function exportConversation() {
    let markdown = '';

    if (currentPlatform === 'chatgpt') {
        const turns = document.querySelectorAll(config.messageSelector);
        turns.forEach(turn => {
            const userDiv = turn.querySelector('[data-message-author-role="user"]');
            const aiDivs = turn.querySelectorAll('[data-message-author-role="assistant"]');

            if (userDiv) {
                const userText = (userDiv.innerText || userDiv.textContent || '').trim();
                markdown += `${chrome.i18n.getMessage('userRole')}\n${userText}\n\n`;
            }

            aiDivs.forEach(aiDiv => {
                const content = aiDiv.querySelector('.markdown') || aiDiv;
                markdown += `${chrome.i18n.getMessage('aiRole')}\n${globalThis.MarkdownCopy.htmlToMarkdown(content)}\n\n`;
            });

            if (userDiv || aiDivs.length > 0) {
                markdown += '---\n\n';
            }
        });
    } else if (currentPlatform === 'gemini') {
        // Find all conversation containers (each contains a user-query and model-response pair)
        const conversationContainers = document.querySelectorAll('.conversation-container');
        
        conversationContainers.forEach(container => {
            // Find user query within this container
            const userQuery = container.querySelector('user-query');
            if (userQuery) {
                // Extract user text from query-text-line paragraphs
                const queryTextLines = userQuery.querySelectorAll('.query-text-line');
                if (queryTextLines.length > 0) {
                    const userText = Array.from(queryTextLines)
                        .map(p => p.textContent.trim())
                        .filter(text => text.length > 0)
                        .join('\n');
                    if (userText) {
                        markdown += `${chrome.i18n.getMessage('userRole')}\n${userText}\n\n`;
                    }
                } else {
                    // Fallback: try query-text div or user-query-bubble-with-background
                    const queryText = userQuery.querySelector('.query-text') ||
                                     userQuery.querySelector('.user-query-bubble-with-background');
                    if (queryText) {
                        const userText = queryText.textContent.trim();
                        if (userText) {
                            markdown += `${chrome.i18n.getMessage('userRole')}\n${userText}\n\n`;
                        }
                    }
                }
            }

            // Find AI response within this container
            const messageContent = container.querySelector('message-content');
            if (messageContent) {
                const markdownEl = messageContent.querySelector('.markdown');
                const content = markdownEl || messageContent;
                markdown += `${chrome.i18n.getMessage('aiRole')}\n${globalThis.MarkdownCopy.htmlToMarkdown(content)}\n\n---\n\n`;
            }
        });
    }

    return markdown || chrome.i18n.getMessage('noConversationFound');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXPORT_CONVERSATION') {
        try {
            const md = exportConversation();
            sendResponse({ markdown: md });
        } catch (e) {
            console.error('Export error:', e);
            sendResponse({ error: e.message });
        }
    }
});

// Modified init function observer configuration
async function init() {
    try {
        logInfo('[Init] Initializing Markdown Copy extension...');

        initUrlChangeListener();
        await waitForPageLoad();
        logDebug('[Init] Page load complete');
        await waitForMainContent();
        logDebug('[Init] Main content detected');
        await new Promise(resolve => setTimeout(resolve, 1000));
        logDebug('[Init] Starting to process existing messages');
        processExistingMessages();


        // Create observer with more relaxed observation options
        observer = new MutationObserver((mutations) => {
            try {
                // Check if new copy-button added
                let hasNewButtons = false;

                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // ChatGPT: check if new message container or copy button added
                                if (currentPlatform === 'chatgpt') {
                                    // Check for message container
                                    if (node.matches?.(config.messageSelector) ||
                                        node.querySelector?.(config.messageSelector)) {
                                        logInfo('[MutationObserver] Detected new message container');
                                        hasNewButtons = true;
                                        break;
                                    }
                                    // Also check for copy button directly (handles incremental rendering)
                                    if (node.matches?.(config.copyButtonSelector) ||
                                        node.querySelector?.(config.copyButtonSelector) ||
                                        (config.fallbackCopyButtonSelector && (node.matches?.(config.fallbackCopyButtonSelector) || node.querySelector?.(config.fallbackCopyButtonSelector)))) {
                                        logInfo('[MutationObserver] Detected new copy button');
                                        hasNewButtons = true;
                                        break;
                                    }
                                    // Check for button container
                                    if (node.matches?.(config.buttonContainerSelector) ||
                                        node.querySelector?.(config.buttonContainerSelector)) {
                                        // Verify it's within a message container
                                        if (node.closest?.(config.messageSelector)) {
                                            logInfo('[MutationObserver] Detected new button container in message');
                                            hasNewButtons = true;
                                            break;
                                        }
                                    }
                                }
                                // Gemini: check if new copy-button added
                                if (currentPlatform === 'gemini' &&
                                    (node.matches?.(config.buttonContainerSelector) ||
                                        node.querySelector?.(config.buttonContainerSelector))) {
                                    logInfo('[MutationObserver] Detected new Gemini copy button');
                                    hasNewButtons = true;
                                    break;
                                }
                            }
                        }
                    }
                    // Also handle attribute changes that might indicate new content
                    if (mutation.type === 'attributes') {
                        const target = mutation.target;
                        if (target.nodeType === Node.ELEMENT_NODE) {
                            if (currentPlatform === 'chatgpt') {
                                // Check if the attribute change is on a message container
                                if (target.matches?.(config.messageSelector) ||
                                    target.querySelector?.(config.messageSelector)) {
                                    logInfo('[MutationObserver] Detected attribute change on message container');
                                    hasNewButtons = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (hasNewButtons) break;
                }

                if (hasNewButtons) {
                    processExistingMessages();
                }
            } catch (error) {
                logError('[MutationObserver] Error:', error);
            }
        });

        const mainContent = document.body;

        observer.observe(mainContent, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-testid', 'class', 'aria-label', 'hidden', 'style']
        });

        logInfo(`Markdown Copy initialized for ${currentPlatform}`);
    } catch (error) {
        logError('[Init] Failed to initialize extension:', error);
    }
}
const currentPlatform = detectPlatform();
if (!currentPlatform) {
    logInfo('Unsupported platform');
} else {
    logInfo('current platform', currentPlatform);
    // Start script with error handling
    try {
        // Load custom selectors first, then initialize
        loadCustomSelectors(() => {
            init();
        });
    } catch (error) {
        logError('[Main] Failed to start extension:', error);
    }
}
// define url change event
function createUrlChangeEvent() {
    window.dispatchEvent(new Event('urlchange'));
}

// hook pushState
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;
let currentUrl = location.href;

function initUrlChangeListener() {
    console.log('[Init] init url change listener');
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        currentUrl = location.href;
        createUrlChangeEvent();
    };
    // hook replaceState
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        currentUrl = location.href;
        createUrlChangeEvent();
    };
    // monitor popstate（browser back/forward）
    window.addEventListener('popstate', createUrlChangeEvent);
    // monitor hash  change
    window.addEventListener('hashchange', createUrlChangeEvent);
    window.addEventListener('urlchange', () => {
        console.log('URL change :', location.href);
        currentUrl = location.href;
        processExistingMessages();
    });
    // use MutationObserver as a fallback for other url changes
    const urlObserver = new MutationObserver(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            createUrlChangeEvent();
        }
    });
    urlObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}
// End of content script
