(function() {
    'use strict';

    // Default selectors (same as in content.js)
    const DEFAULT_SELECTORS = {
        chatgpt: {
            messageSelector: '[data-testid^="conversation-turn"]',
            buttonContainerSelector: '.flex.flex-wrap.items-center',
            copyButtonSelector: '[aria-label="Copy"]',
            contentSelector: '.markdown.prose'
        },
        gemini: {
            messageSelector: 'message-content',
            buttonContainerSelector: 'copy-button',
            copyButtonSelector: 'button[aria-label="Copy"]',
            contentSelector: '.markdown'
        }
    };

    // DOM elements
    const elements = {
        // Feedback
        feedbackType: document.getElementById('feedback-type'),
        feedbackText: document.getElementById('feedback-text'),
        contactEmail: document.getElementById('contact-email'),
        includeInfo: document.getElementById('include-info'),
        feedbackPreview: document.getElementById('feedback-preview'),
        previewContent: document.getElementById('preview-content'),
        submitFeedback: document.getElementById('submit-feedback'),
        githubLink: document.getElementById('github-link'),
        feedbackStatus: document.getElementById('feedback-status'),

        // ChatGPT Selectors
        chatgptMessage: document.getElementById('chatgpt-message'),
        chatgptButtonContainer: document.getElementById('chatgpt-button-container'),
        chatgptCopyButton: document.getElementById('chatgpt-copy-button'),
        chatgptContent: document.getElementById('chatgpt-content'),

        // Gemini Selectors
        geminiMessage: document.getElementById('gemini-message'),
        geminiButtonContainer: document.getElementById('gemini-button-container'),
        geminiCopyButton: document.getElementById('gemini-copy-button'),
        geminiContent: document.getElementById('gemini-content'),

        // Selector buttons
        saveSelectors: document.getElementById('save-selectors'),
        resetSelectors: document.getElementById('reset-selectors'),
        testSelectors: document.getElementById('test-selectors'),
        selectorStatus: document.getElementById('selector-status'),

        // Debug options
        enableSentry: document.getElementById('enable-sentry'),
        enableDomSnapshot: document.getElementById('enable-dom-snapshot'),
        saveDebug: document.getElementById('save-debug'),
        debugStatus: document.getElementById('debug-status')
    };

    // Show status message
    function showStatus(element, message, type = 'success', duration = 3000) {
        element.textContent = message;
        element.className = `status-message ${type}`;
        element.style.display = 'block';

        if (duration > 0) {
            setTimeout(() => {
                element.style.display = 'none';
            }, duration);
        }
    }

    // Load settings from storage
    function loadSettings() {
        chrome.storage.sync.get(['customSelectors', 'debugOptions'], (result) => {
            const selectors = result.customSelectors || {};
            const debugOptions = result.debugOptions || {};

            // Load ChatGPT selectors
            const chatgpt = selectors.chatgpt || DEFAULT_SELECTORS.chatgpt;
            elements.chatgptMessage.value = chatgpt.messageSelector || '';
            elements.chatgptButtonContainer.value = chatgpt.buttonContainerSelector || '';
            elements.chatgptCopyButton.value = chatgpt.copyButtonSelector || '';
            elements.chatgptContent.value = chatgpt.contentSelector || '';

            // Load Gemini selectors
            const gemini = selectors.gemini || DEFAULT_SELECTORS.gemini;
            elements.geminiMessage.value = gemini.messageSelector || '';
            elements.geminiButtonContainer.value = gemini.buttonContainerSelector || '';
            elements.geminiCopyButton.value = gemini.copyButtonSelector || '';
            elements.geminiContent.value = gemini.contentSelector || '';

            // Load debug options
            elements.enableSentry.checked = debugOptions.enableSentry !== false; // default true
            elements.enableDomSnapshot.checked = debugOptions.enableDomSnapshot || false;

            // Set placeholders as default values
            setPlaceholdersAsDefaults();
        });
    }

    // Set placeholders to show default values
    function setPlaceholdersAsDefaults() {
        elements.chatgptMessage.placeholder = DEFAULT_SELECTORS.chatgpt.messageSelector;
        elements.chatgptButtonContainer.placeholder = DEFAULT_SELECTORS.chatgpt.buttonContainerSelector;
        elements.chatgptCopyButton.placeholder = DEFAULT_SELECTORS.chatgpt.copyButtonSelector;
        elements.chatgptContent.placeholder = DEFAULT_SELECTORS.chatgpt.contentSelector;

        elements.geminiMessage.placeholder = DEFAULT_SELECTORS.gemini.messageSelector;
        elements.geminiButtonContainer.placeholder = DEFAULT_SELECTORS.gemini.buttonContainerSelector;
        elements.geminiCopyButton.placeholder = DEFAULT_SELECTORS.gemini.copyButtonSelector;
        elements.geminiContent.placeholder = DEFAULT_SELECTORS.gemini.contentSelector;
    }

    // Save selector settings
    function saveSelectors() {
        const customSelectors = {
            chatgpt: {
                messageSelector: elements.chatgptMessage.value.trim() || DEFAULT_SELECTORS.chatgpt.messageSelector,
                buttonContainerSelector: elements.chatgptButtonContainer.value.trim() || DEFAULT_SELECTORS.chatgpt.buttonContainerSelector,
                copyButtonSelector: elements.chatgptCopyButton.value.trim() || DEFAULT_SELECTORS.chatgpt.copyButtonSelector,
                contentSelector: elements.chatgptContent.value.trim() || DEFAULT_SELECTORS.chatgpt.contentSelector
            },
            gemini: {
                messageSelector: elements.geminiMessage.value.trim() || DEFAULT_SELECTORS.gemini.messageSelector,
                buttonContainerSelector: elements.geminiButtonContainer.value.trim() || DEFAULT_SELECTORS.gemini.buttonContainerSelector,
                copyButtonSelector: elements.geminiCopyButton.value.trim() || DEFAULT_SELECTORS.gemini.copyButtonSelector,
                contentSelector: elements.geminiContent.value.trim() || DEFAULT_SELECTORS.gemini.contentSelector
            }
        };

        chrome.storage.sync.set({ customSelectors }, () => {
            if (chrome.runtime.lastError) {
                showStatus(elements.selectorStatus, 'Error saving settings: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus(elements.selectorStatus, 'Settings saved! Please refresh ChatGPT/Gemini pages.', 'success');
            }
        });
    }

    // Reset to default selectors
    function resetSelectors() {
        if (!confirm('Reset all selectors to default values?')) {
            return;
        }

        chrome.storage.sync.remove('customSelectors', () => {
            loadSettings();
            showStatus(elements.selectorStatus, 'Reset to default values. Please refresh ChatGPT/Gemini pages.', 'success');
        });
    }

    // Test selectors
    function testSelectors() {
        const platform = prompt('Which platform to test? (chatgpt/gemini)');
        if (!platform || !['chatgpt', 'gemini'].includes(platform.toLowerCase())) {
            showStatus(elements.selectorStatus, 'Invalid platform. Enter "chatgpt" or "gemini".', 'error');
            return;
        }

        const url = platform.toLowerCase() === 'chatgpt'
            ? 'https://chatgpt.com'
            : 'https://gemini.google.com';

        showStatus(elements.selectorStatus, `Opening ${platform}... Check the console for selector test results.`, 'info', 5000);

        // Open platform in new tab and send test message
        chrome.tabs.create({ url }, (tab) => {
            // Send message to content script to test selectors
            setTimeout(() => {
                chrome.tabs.sendMessage(tab.id, { action: 'testSelectors' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Tab not ready yet or content script not loaded');
                    }
                });
            }, 3000);
        });
    }

    // Generate issue body for preview and submission
    function generateIssueBody() {
        const text = elements.feedbackText.value.trim();
        const email = elements.contactEmail.value.trim();

        if (!text) {
            return null;
        }

        let issueBody = text;

        // Add contact email if provided
        if (email) {
            issueBody += '\n\n---\n**Contact Information:**\n';
            issueBody += `Email: ${email}\n`;
        }

        // Add system info if requested
        if (elements.includeInfo.checked) {
            const info = {
                version: chrome.runtime.getManifest().version,
                browser: navigator.userAgent,
                platform: navigator.platform,
                url: window.location.href
            };

            issueBody += '\n\n---\n**System Information:**\n';
            issueBody += `- Extension Version: ${info.version}\n`;
            issueBody += `- Browser: ${info.browser}\n`;
            issueBody += `- Platform: ${info.platform}\n`;
        }

        return issueBody;
    }

    // Update preview
    function updatePreview() {
        const issueBody = generateIssueBody();

        if (issueBody && elements.includeInfo.checked) {
            elements.previewContent.textContent = issueBody;
            elements.feedbackPreview.style.display = 'block';
        } else {
            elements.feedbackPreview.style.display = 'none';
        }
    }

    // Submit feedback
    function submitFeedback() {
        const type = elements.feedbackType.value;
        const text = elements.feedbackText.value.trim();

        if (!text) {
            showStatus(elements.feedbackStatus, 'Please enter your feedback message.', 'error');
            return;
        }

        // Generate issue body
        const issueBody = generateIssueBody();

        // Create GitHub issue URL with pre-filled content
        const issueTitle = encodeURIComponent(`[${type.toUpperCase()}] ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        const issueBodyEncoded = encodeURIComponent(issueBody);
        const githubIssueUrl = `https://github.com/bugparty/chatgpt_markdown_copy_extension/issues/new?title=${issueTitle}&body=${issueBodyEncoded}`;

        // Open GitHub issue page
        window.open(githubIssueUrl, '_blank');

        // Clear form
        elements.feedbackText.value = '';
        elements.contactEmail.value = '';
        updatePreview();
        showStatus(elements.feedbackStatus, 'Opening GitHub to submit your feedback...', 'success');
    }

    // Open GitHub issues page
    function openGitHub() {
        window.open('https://github.com/bugparty/chatgpt_markdown_copy_extension/issues', '_blank');
    }

    // Save debug options
    function saveDebugOptions() {
        const debugOptions = {
            enableSentry: elements.enableSentry.checked,
            enableDomSnapshot: elements.enableDomSnapshot.checked
        };

        chrome.storage.sync.set({ debugOptions }, () => {
            if (chrome.runtime.lastError) {
                showStatus(elements.debugStatus, 'Error saving debug options: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus(elements.debugStatus, 'Debug options saved! Please refresh ChatGPT/Gemini pages.', 'success');
            }
        });
    }

    // Event listeners
    elements.saveSelectors.addEventListener('click', saveSelectors);
    elements.resetSelectors.addEventListener('click', resetSelectors);
    elements.testSelectors.addEventListener('click', testSelectors);
    elements.submitFeedback.addEventListener('click', submitFeedback);
    elements.githubLink.addEventListener('click', openGitHub);
    elements.saveDebug.addEventListener('click', saveDebugOptions);

    // Feedback preview listeners
    elements.feedbackText.addEventListener('input', updatePreview);
    elements.contactEmail.addEventListener('input', updatePreview);
    elements.includeInfo.addEventListener('change', updatePreview);
    elements.feedbackType.addEventListener('change', updatePreview);

    // Load settings on page load
    document.addEventListener('DOMContentLoaded', () => {
        loadSettings();
        updatePreview(); // Show preview on load if checkbox is checked
    });

})();
