function htmlToMarkdown(element) {
    function normalizeInline(text) {
        return text
            .replace(/[ \t]*\n[ \t]*/g, ' ')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
    }

    function normalizeTex(text) {
        return text
            .replace(/>/g, '\\gt ')
            .replace(/</g, '\\lt ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function decodeHtmlEntities(text) {
        if (!text) return '';
        return text
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
    }

    function escapeTableCell(text) {
        return text.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
    }

    function formatListItem(indent, marker, content) {
        const lines = content.split('\n').filter(Boolean);
        if (lines.length === 0) {
            return `${indent}${marker}`;
        }

        const firstLine = lines[0];
        const restLines = lines.slice(1);

        return [
            `${indent}${marker}${firstLine}`,
            ...restLines.map(line => `${indent}  ${line}`)
        ].join('\n');
    }

    function processNode(node, indent = '') {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.textContent.trim()) {
                return node.textContent.includes('\n') ? '' : ' ';
            }
            return node.textContent;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        if (node.hasAttribute?.('hide-from-message-actions') || node.classList?.contains('hide-from-message-actions')) {
            return '';
        }

        if (node.hasAttribute?.('only-show-to-message-actions') || node.classList?.contains('only-show-to-message-actions')) {
            const strongNode = node.querySelector('strong, b');
            if (strongNode) {
                let titleText = normalizeInline(processNode(strongNode));
                // Extract clean text inside strong tag, stripping asterisks and trailing colons
                let cleanTitle = titleText.replace(/:?\*\*$/, '').replace(/^\*\*/, '').trim();

                // Clone node and remove strongNode to extract subtitle text
                const cloned = node.cloneNode(true);
                const clonedStrong = cloned.querySelector('strong, b');
                if (clonedStrong) {
                    clonedStrong.remove();
                }
                let subtitleText = normalizeInline(cloned.textContent).trim();
                let cleanSubtitle = subtitleText.replace(/^\*+/, '').replace(/\*+$/, '').replace(/\.$/, '').trim();

                let markdown = '';
                if (cleanTitle) {
                    markdown += '**' + cleanTitle + '**  \n';
                }
                if (cleanSubtitle) {
                    markdown += '*' + cleanSubtitle + '*';
                }
                return markdown + '\n\n';
            }

            const rawText = Array.from(node.childNodes).map(child => processNode(child, indent)).join('');
            const text = rawText.replace(/(?<=[^\s*])\*\*(?=[a-zA-Z0-9])/g, '** ');
            return normalizeInline(text) + '\n\n';
        }

        const tag = node.tagName.toLowerCase();
        let result = '';

        if (node.classList?.contains('katex-html') || node.classList?.contains('katex-mathml')) {
            return '';
        }

        switch (tag) {
            case 'code-block': {
                const langSpan = node.querySelector('.code-block-decoration span');
                const language = langSpan ? langSpan.textContent.trim().toLowerCase() : '';
                const codeContent = node.querySelector('code[data-test-id="code-content"]');
                if (codeContent) {
                    const code = codeContent.textContent;
                    result = '```' + language + '\n' + code + '\n```\n\n';
                }
                break;
            }
            case 'h1':
                result = '# ' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '\n\n';
                break;
            case 'h2':
                result = '## ' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '\n\n';
                break;
            case 'h3':
                result = '### ' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '\n\n';
                break;
            case 'h4':
                result = '#### ' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '\n\n';
                break;
            case 'h5':
                result = '##### ' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '\n\n';
                break;
            case 'h6':
                result = '###### ' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '\n\n';
                break;
            case 'p': {
                const hasBlockChildren = node.querySelector('div, table, ul, ol, blockquote, pre, hr, h1, h2, h3, h4, h5, h6, sequence, structured-node-sequence, [only-show-to-message-actions], .only-show-to-message-actions') !== null;
                if (hasBlockChildren) {
                    result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('') + '\n\n';
                } else {
                    result = normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '\n\n';
                }
                break;
            }
            case 'strong':
            case 'b':
                result = '**' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '**';
                break;
            case 'em':
            case 'i':
                result = '*' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '*';
                break;
            case 'code':
                if (node.closest('code-block') || node.parentElement.tagName.toLowerCase() === 'pre') {
                    return '';
                }
                result = '`' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '`';
                break;
            case 'pre': {
                if (node.closest('code-block')) {
                    return '';
                }
                const codeElement = node.querySelector('code');
                if (codeElement) {
                    let language = '';
                    const langElement = node.firstElementChild?.firstElementChild;
                    if (langElement) {
                        const langText = langElement.textContent.trim();
                        if (langText.length < 20 && /^[a-zA-Z0-9+#-]+$/.test(langText)) {
                            language = langText.toLowerCase();
                        }
                    }

                    const code = codeElement.textContent;
                    result = '```' + language + '\n' + code + '\n```\n\n';
                } else {
                    result = '```\n' + node.textContent + '\n```\n\n';
                }

                break;
            }
            case 'a':
                result = '[' + normalizeInline(Array.from(node.childNodes).map(child => processNode(child, indent)).join('')) + '](' + node.href + ')';
                break;
            case 'ul':
                result = Array.from(node.children).map(li => {
                    return formatListItem(indent, '- ', processNode(li, indent + '  '));
                }).join('\n') + '\n\n';
                break;
            case 'ol':
                result = Array.from(node.children).map((li, i) => {
                    return formatListItem(indent, (i + 1) + '. ', processNode(li, indent + '   '));
                }).join('\n') + '\n\n';
                break;
            case 'li': {
                const inlineParts = [];
                const nestedBlocks = [];

                Array.from(node.childNodes).forEach(child => {
                    if (child.nodeType === Node.ELEMENT_NODE && ['ul', 'ol'].includes(child.tagName.toLowerCase())) {
                        nestedBlocks.push(processNode(child, indent).trimEnd());
                    } else {
                        inlineParts.push(processNode(child, indent));
                    }
                });

                result = [normalizeInline(inlineParts.join('')), ...nestedBlocks]
                    .filter(Boolean)
                    .join('\n');
                break;
            }
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
                if (node.classList.contains('katex')) {
                    const mathAnnotation = node.querySelector('annotation[encoding="application/x-tex"]');
                    if (mathAnnotation) {
                        const isDisplay = node.classList.contains('katex-display') ||
                            node.parentElement?.classList.contains('katex-display');
                        const mathText = decodeHtmlEntities(mathAnnotation.textContent);
                        if (isDisplay) {
                            result = '$$\n' + normalizeTex(mathText) + '\n$$\n\n';
                        } else {
                            result = '$' + normalizeTex(mathText) + '$';
                        }
                    }
                } else if (node.classList.contains('math-inline') || node.classList.contains('math-block')) {
                    const mathContent = node.getAttribute('data-math');
                    if (mathContent) {
                        const mathText = decodeHtmlEntities(mathContent);
                        if (node.classList.contains('math-block')) {
                            result = '$$\n' + normalizeTex(mathText) + '\n$$\n\n';
                        } else {
                            result = '$' + normalizeTex(mathText) + '$';
                        }
                    }
                } else if ((node.hasAttribute('data-state') && node.getAttribute('data-state') === 'closed') ||
                    node.firstElementChild?.firstElementChild?.tagName === 'BUTTON') {
                    result = '';
                } else {
                    result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('');
                }
                break;
            case 'table': {
                const rows = Array.from(node.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tr'))
                    .map(row => Array.from(row.children).map(cell => escapeTableCell(normalizeInline(processNode(cell, indent)))));
                if (rows.length > 0) {
                    const header = rows[0];
                    const separator = header.map(() => '---');
                    result = [
                        '| ' + header.join(' | ') + ' |',
                        '| ' + separator.join(' | ') + ' |',
                        ...rows.slice(1).map(row => '| ' + row.join(' | ') + ' |')
                    ].join('\n') + '\n\n';
                }
                break;
            }
            case 'thead':
            case 'tbody':
            case 'tr':
            case 'th':
            case 'td':
                result = Array.from(node.childNodes).map(child => processNode(child, indent)).join('');
                break;
            case 'div':
                if (node.classList.contains('math-block')) {
                    const mathContent = node.getAttribute('data-math');
                    if (mathContent) {
                        const mathText = decodeHtmlEntities(mathContent);
                        result = '$$\n' + normalizeTex(mathText) + '\n$$\n\n';
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

    return normalizeMarkdown(processNode(element));
}

function normalizeMarkdown(markdown) {
    return markdown
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n*\$\$\s*\n([\s\S]*?)\n\s*\$\$\n*/g, (_match, body) => `\n\n$$\n${body}\n$$\n\n`)
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

globalThis.MarkdownCopy = globalThis.MarkdownCopy || {};
globalThis.MarkdownCopy.htmlToMarkdown = htmlToMarkdown;
globalThis.MarkdownCopy.normalizeMarkdown = normalizeMarkdown;
