import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownPath = path.join(__dirname, '../extension/markdown.js');
const chatgptFixturePath = path.join(__dirname, '../fixtures/chatgpt20260418.html');
const geminiFixturePath = path.join(__dirname, '../fixtures/gemini20260418.html');
const markdownCode = fs.readFileSync(markdownPath, 'utf8');

function loadMarkdownHelpers(window) {
    const context = vm.createContext({
        window,
        document: window.document,
        Node: window.Node,
        globalThis: window,
        console
    });

    new vm.Script(markdownCode).runInContext(context);
    return window.MarkdownCopy;
}

function renderFixtureToMarkdown(fixturePath, selector) {
    const html = fs.readFileSync(fixturePath, 'utf8');
    const dom = new JSDOM(html);
    const helpers = loadMarkdownHelpers(dom.window);
    const root = dom.window.document.querySelector(selector);

    assert.ok(root, `expected selector ${selector} in ${path.basename(fixturePath)}`);
    assert.ok(helpers?.htmlToMarkdown, 'expected htmlToMarkdown to be available on window.MarkdownCopy');

    return helpers.htmlToMarkdown(root);
}

test('ChatGPT fixture markdown does not contain excessive blank lines', () => {
    const markdown = renderFixtureToMarkdown(chatgptFixturePath, '.markdown.prose');

    assert.doesNotMatch(markdown, /\n{3,}/, 'markdown should not contain 3+ consecutive newlines');
    assert.match(markdown, /\*\*一整条轨迹/, 'expected main explanation paragraph to be present');
    assert.match(markdown, /\$\$\n\\tau=\(s_0,a_0,s_1,a_1,\\dots,s_T\)\n\$\$/, 'expected display math block to be preserved');
});

test('Gemini fixture markdown preserves formulas and tables', () => {
    const markdown = renderFixtureToMarkdown(geminiFixturePath, '.markdown');

    assert.match(markdown, /\$\$\nV\^\{\\pi\}\(s\) = \\mathbb\{E\}_\{\\pi\}/, 'expected first display equation to be preserved');
    assert.match(markdown, /\| Feature \| V-Function \$V\(s\)\$ \| Q-Function \$Q\(s, a\)\$ \|/, 'expected comparison table to be converted to markdown');
    assert.doesNotMatch(markdown, /导出到 Google 表格/, 'expected Gemini UI actions to be excluded from markdown output');
});
