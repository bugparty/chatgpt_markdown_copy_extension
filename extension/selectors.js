const CHATGPT_COPY_BUTTON_SELECTOR = [
    'button[data-testid="copy-turn-action-button"]',
    'button[aria-label^="Copy"]',
    'button[aria-label^="复制"]',
    'button[aria-label^="複製"]',
    'button[aria-label^="Copiar"]',
    'button[aria-label^="Copier"]',
    'button[aria-label^="Kopieren"]',
    'button[aria-label^="Copia"]',
    'button[aria-label^="Копировать"]',
    'button[aria-label^="コピー"]',
    'button[aria-label^="복사"]'
].join(', ');

globalThis.CHATGPT_COPY_BUTTON_SELECTOR = CHATGPT_COPY_BUTTON_SELECTOR;
globalThis.DEFAULT_PLATFORM_SELECTORS = {
    chatgpt: {
        messageSelector: '[data-testid^="conversation-turn"]',
        buttonContainerSelector: '.flex.flex-wrap.items-center',
        copyButtonSelector: CHATGPT_COPY_BUTTON_SELECTOR,
        fallbackCopyButtonSelector: '#thread article > div > div > div:last-child > div > button:first-child',
        contentSelector: '.markdown.prose'
    },
    gemini: {
        messageSelector: 'message-content',
        buttonContainerSelector: 'copy-button',
        copyButtonSelector: 'button[data-test-id="copy-button"]',
        contentSelector: '.markdown'
    }
};
