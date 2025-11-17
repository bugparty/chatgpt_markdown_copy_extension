(function() {
    'use strict';

    // Helper function to safely capture Sentry events
    function captureSentryException(error, context = {}) {
        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
            try {
                Sentry.captureException(error, {
                    tags: {
                        platform: currentPlatform || 'unknown',
                        ...context.tags
                    },
                    extra: context.extra || {}
                });
            } catch (sentryError) {
                console.error('[Sentry] Failed to capture exception:', sentryError);
            }
        }
    }

    function captureSentryMessage(message, level = 'info', context = {}) {
        if (typeof Sentry !== 'undefined' && Sentry.captureMessage) {
            try {
                Sentry.captureMessage(message, {
                    level: level,
                    tags: {
                        platform: currentPlatform || 'unknown',
                        ...context.tags
                    },
                    extra: context.extra || {}
                });
            } catch (sentryError) {
                console.error('[Sentry] Failed to capture message:', sentryError);
            }
        }
    }

    // Add global variables at the beginning of script
    let observer = null;
    let processingQueue = new Set();
    let processTimeout = null;

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
            messageSelector: '[data-testid^="conversation-turn"]',
            buttonContainerSelector: '.flex.flex-wrap.items-center',
            copyButtonSelector: '[aria-label="Copy"]',
            contentSelector: '.markdown.prose',
            getButtonContainer: (copyButton) => copyButton.parentNode
        },
        gemini: {
            messageSelector: 'message-content',
            buttonContainerSelector: 'copy-button',
            copyButtonSelector: 'button[aria-label="Copy"]',
            contentSelector: '.markdown',
            getButtonContainer: (copyButton) => copyButton.closest('copy-button')
        }
    };

    const currentPlatform = detectPlatform();
    if (!currentPlatform) {
        console.log('Unsupported platform');
        return;
    }
    console.log("current platform", currentPlatform);

    // Global config variable (will be loaded from storage)
    let config = null;

    // Load custom selectors from storage
    function loadCustomSelectors(callback) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(['customSelectors', 'debugOptions'], (result) => {
                const customSelectors = result.customSelectors || {};
                const debugOptions = result.debugOptions || {};

                // Merge custom selectors with defaults
                const platformSelectors = customSelectors[currentPlatform] || {};
                const defaultSelectors = DEFAULT_PLATFORM_CONFIG[currentPlatform];

                config = {
                    messageSelector: platformSelectors.messageSelector || defaultSelectors.messageSelector,
                    buttonContainerSelector: platformSelectors.buttonContainerSelector || defaultSelectors.buttonContainerSelector,
                    copyButtonSelector: platformSelectors.copyButtonSelector || defaultSelectors.copyButtonSelector,
                    contentSelector: platformSelectors.contentSelector || defaultSelectors.contentSelector,
                    getButtonContainer: defaultSelectors.getButtonContainer
                };

                console.log('[Markdown Copy] Loaded config:', config);
                console.log('[Markdown Copy] Debug options:', debugOptions);

                if (callback) callback();
            });
        } else {
            // Fallback if chrome.storage is not available
            config = DEFAULT_PLATFORM_CONFIG[currentPlatform];
            console.log('[Markdown Copy] Using default config (storage not available)');
            if (callback) callback();
        }
    }

    // HTML to Markdown function
    function htmlToMarkdown(element) {
        function processNode(node, indent = '') {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) {
                return '';
            }

            const tag = node.tagName.toLowerCase();
            let result = '';

            switch(tag) {
                // Handle code-block at the beginning
                case 'code-block':
                    // Extract language name
                    const langSpan = node.querySelector('.code-block-decoration span');
                    const language = langSpan ? langSpan.textContent.trim().toLowerCase() : '';

                    // Extract code content
                    const codeContent = node.querySelector('code[data-test-id="code-content"]');
                    if (codeContent) {
                        const code = codeContent.textContent;
                        result = '```' + language + '\n' + code + '\n```\n\n';
                    }
                    break;
                case 'h1':
                    result = '# ' + node.textContent + '\n\n';
                    break;
                case 'h2':
                    result = '## ' + node.textContent + '\n\n';
                    break;
                case 'h3':
                    result = '### ' + node.textContent + '\n\n';
                    break;
                case 'h4':
                    result = '#### ' + node.textContent + '\n\n';
                    break;
                case 'h5':
                    result = '##### ' + node.textContent + '\n\n';
                    break;
                case 'h6':
                    result = '###### ' + node.textContent + '\n\n';
                    break;
                case 'p':
                    result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('') + '\n\n';
                    break;
                case 'strong':
                case 'b':
                    result = '**' + node.textContent + '**';
                    break;
                case 'em':
                case 'i':
                    result = '*' + node.textContent + '*';
                    break;
                case 'code':
                    // Skip code that's already processed in code-block or pre
                    if (node.closest('code-block') || node.parentElement.tagName.toLowerCase() === 'pre') {
                        return '';
                    }
                    result = '`' + node.textContent + '`';
                    break;
                case 'pre':
                    // Skip if pre is inside code-block (Gemini already processed)
                    if (node.closest('code-block')) {
                        return '';
                    }
                    // ChatGPT code blocks: extract language from pre's first child's first child
                    const codeElement = node.querySelector('code');
                    if (codeElement) {
                        let language = '';

                        // Get language from pre > div > div (first child's first child)
                        const langElement = node.firstElementChild?.firstElementChild;
                        if (langElement) {
                            const langText = langElement.textContent.trim();
                            // Ensure text looks like a language name (short and only alphanumeric)
                            if (langText.length < 20 && /^[a-zA-Z0-9+#\-]+$/.test(langText)) {
                                language = langText.toLowerCase();
                            }
                        }

                        const code = codeElement.textContent;
                        result = '```' + language + '\n' + code + '\n```\n\n';
                    } else {
                        result = '```\n' + node.textContent + '\n```\n\n';
                    }

                    break;
                case 'a':
                    result = '[' + node.textContent + '](' + node.href + ')';
                    break;
                case 'ul':
                    result = Array.from(node.children).map(li => {
                        return indent + '- ' + processNode(li, indent + '  ').trim();
                    }).join('\n') + '\n\n';
                    break;
                case 'ol':
                    result = Array.from(node.children).map((li, i) => {
                        return indent + (i + 1) + '. ' + processNode(li, indent + '   ').trim();
                    }).join('\n') + '\n\n';
                    break;
                case 'li':
                    result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('');
                    break;
                case 'blockquote':
                    result = Array.from(node.childNodes)
                        .map(child => processNode(child, indent))
                        .join('')
                        .split('\n')
                        .map(line => line ? '> ' + line : '>')
                        .join('\n') + '\n\n';
                    break;
                case 'hr':
                    result = '---\n\n';
                    break;
                case 'br':
                    result = '\n';
                    break;
                case 'span':
                    // Handle KaTeX math formulas (ChatGPT)
                    if (node.classList.contains('katex')) {
                        const mathAnnotation = node.querySelector('annotation[encoding="application/x-tex"]');
                        if (mathAnnotation) {
                            const isDisplay = node.classList.contains('katex-display') ||
                                            node.parentElement?.classList.contains('katex-display');
                            if (isDisplay) {
                                result = '\n$$\n' + mathAnnotation.textContent + '\n$$\n\n';
                            } else {
                                result = '$' + mathAnnotation.textContent + '$';
                            }
                        }
                    }
                    // Handle Gemini math formulas
                    else if (node.classList.contains('math-inline') || node.classList.contains('math-block')) {
                        const mathContent = node.getAttribute('data-math');
                        if (mathContent) {
                            if (node.classList.contains('math-block')) {
                                result = '\n$$\n' + mathContent + '\n$$\n\n';
                            } else {
                                result = '$' + mathContent + '$';
                            }
                        }
                    } else {
                        result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('');
                    }
                    break;
                case 'div':
                    // Handle Gemini math-block
                    if (node.classList.contains('math-block')) {
                        const mathContent = node.getAttribute('data-math');
                        if (mathContent) {
                            result = '\n$$\n' + mathContent + '\n$$\n\n';
                        }
                    } else {
                        result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('');
                    }
                    break;
                default:
                    result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('');
            }

            return result;
        }

        return processNode(element).trim();
    }

    // Modified addMarkdownCopyButton, no longer disconnecting observer
    function addMarkdownCopyButton(buttonContainer) {
        // Generate unique identifier
        const containerId = buttonContainer.getAttribute('data-md-id') || Math.random().toString(36);

        // Check if processing or already processed
        if (processingQueue.has(containerId)) {
            return;
        }

        // Check if button already added
        if (buttonContainer.querySelector('[data-markdown-copy="true"]')) {
            return;
        }

        // For Gemini, additionally check if next sibling is our button
        if (currentPlatform === 'gemini' && buttonContainer.nextElementSibling?.hasAttribute('data-markdown-copy')) {
            return;
        }

        const copyButton = buttonContainer.querySelector(config.copyButtonSelector);
        if (!copyButton) return;

        // Mark as processing
        processingQueue.add(containerId);
        buttonContainer.setAttribute('data-md-id', containerId);

        // Create new button
        const mdButton = document.createElement('button');

        // Set button style based on platform
        if (currentPlatform === 'chatgpt') {
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

        } else if (currentPlatform === 'gemini') {
            mdButton.className = copyButton.className;
            mdButton.setAttribute('mat-button', '');
            mdButton.setAttribute('tabindex', '0');

            const ripple = document.createElement('span');
            ripple.className = 'mat-mdc-button-persistent-ripple mdc-button__ripple';

            const matIcon = document.createElement('mat-icon');
            matIcon.setAttribute('role', 'img');
            matIcon.className = 'mat-icon notranslate embedded-copy-icon google-symbols mat-ligature-font mat-icon-no-color';
            matIcon.setAttribute('aria-hidden', 'true');
            matIcon.textContent = 'description';

            const label = document.createElement('span');
            label.className = 'mdc-button__label';

            const focusIndicator = document.createElement('span');
            focusIndicator.className = 'mat-focus-indicator';

            const touchTarget = document.createElement('span');
            touchTarget.className = 'mat-mdc-button-touch-target';

            const ripple2 = document.createElement('span');
            ripple2.className = 'mat-ripple mat-mdc-button-ripple';

            mdButton.appendChild(ripple);
            mdButton.appendChild(matIcon);
            mdButton.appendChild(label);
            mdButton.appendChild(focusIndicator);
            mdButton.appendChild(touchTarget);
            mdButton.appendChild(ripple2);
        }

        mdButton.setAttribute('aria-label', 'Copy as Markdown');
        mdButton.setAttribute('data-markdown-copy', 'true');
        mdButton.setAttribute('title', 'Copy as Markdown');

        // Add click event
        mdButton.addEventListener('click', async () => {
            console.log("on click")
            let markdownContent;

            if (currentPlatform === 'chatgpt') {
                const messageContainer = buttonContainer.closest(config.messageSelector);
                markdownContent = messageContainer?.querySelector(config.contentSelector);
            } else if (currentPlatform === 'gemini') {
                // Go up 4 levels then find previous sibling
                const contentDiv = buttonContainer.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling;
                if (contentDiv) {
                    // Content might be directly in this div, or in message-content child
                    const messageContent = contentDiv.querySelector('message-content') || contentDiv;
                    markdownContent = messageContent.querySelector('.markdown');
                }
            }

            if (markdownContent) {
                try {
                    const markdown = htmlToMarkdown(markdownContent);
                    console.log(markdown);

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
                            const matIcon = mdButton.querySelector('mat-icon');
                            const originalText = matIcon.textContent;
                            matIcon.textContent = 'check';

                            setTimeout(() => {
                                matIcon.textContent = originalText;
                            }, 1000);
                        }
                    } catch (err) {
                        console.error('Failed to copy to clipboard:', err);
                        captureSentryException(err, {
                            tags: { operation: 'clipboard_write' },
                            extra: { markdownLength: markdown.length }
                        });
                    }
                } catch (err) {
                    console.error('Failed to convert to markdown:', err);
                    captureSentryException(err, {
                        tags: { operation: 'markdown_conversion' },
                        extra: {
                            hasContent: !!markdownContent,
                            contentType: markdownContent?.tagName
                        }
                    });
                }
            } else {
                const errorMsg = "Can't find message body";
                console.error(errorMsg);
                captureSentryMessage(errorMsg, 'warning', {
                    tags: { operation: 'find_content' },
                    extra: {
                        buttonContainerExists: !!buttonContainer,
                        platform: currentPlatform
                    }
                });
            }
        });

        // Insert button
        if (currentPlatform === 'chatgpt') {
            copyButton.parentNode.insertBefore(mdButton, copyButton.nextSibling);
        } else if (currentPlatform === 'gemini') {
            buttonContainer.parentNode.insertBefore(mdButton, buttonContainer.nextSibling);
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
            if (currentPlatform === 'chatgpt') {
                const containers = document.querySelectorAll(`${config.messageSelector} ${config.buttonContainerSelector}`);
                containers.forEach(container => {
                    addMarkdownCopyButton(container);
                });
            } else if (currentPlatform === 'gemini') {
                const copyButtons = document.querySelectorAll(config.buttonContainerSelector);
                copyButtons.forEach(button => {
                    addMarkdownCopyButton(button);
                });
            }
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

    // Modified init function observer configuration
    async function init() {
        try {
            await waitForPageLoad();
            await waitForMainContent();
            await new Promise(resolve => setTimeout(resolve, 1000));

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
                                    // ChatGPT: check if new message container added
                                    if (currentPlatform === 'chatgpt' &&
                                        (node.matches?.(config.messageSelector) ||
                                         node.querySelector?.(config.messageSelector))) {
                                        hasNewButtons = true;
                                        break;
                                    }
                                    // Gemini: check if new copy-button added
                                    if (currentPlatform === 'gemini' &&
                                        (node.matches?.(config.buttonContainerSelector) ||
                                         node.querySelector?.(config.buttonContainerSelector))) {
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
                    console.error('[MutationObserver] Error:', error);
                    captureSentryException(error, {
                        tags: { operation: 'mutation_observer' }
                    });
                }
            });

            const mainContent = document.querySelector('main') ||
                               document.querySelector('[role="main"]') ||
                               document.body;

            observer.observe(mainContent, {
                childList: true,
                subtree: true
            });

            console.log(`Markdown Copy initialized for ${currentPlatform}`);

            // Report successful initialization
            if (typeof Sentry !== 'undefined' && Sentry.addBreadcrumb) {
                Sentry.addBreadcrumb({
                    category: 'initialization',
                    message: 'Extension initialized successfully',
                    level: 'info',
                    data: { platform: currentPlatform }
                });
            }
        } catch (error) {
            console.error('[Init] Failed to initialize extension:', error);
            captureSentryException(error, {
                tags: { operation: 'initialization' },
                extra: { platform: currentPlatform }
            });
        }
    }

    // Start script with error handling
    try {
        // Load custom selectors first, then initialize
        loadCustomSelectors(() => {
            init();
        });
    } catch (error) {
        console.error('[Main] Failed to start extension:', error);
        captureSentryException(error, {
            tags: { operation: 'startup' }
        });
    }
})();
