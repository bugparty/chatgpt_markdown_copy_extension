import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const markdownModulePath = path.join(repoRoot, 'extension', 'markdown.js');
const markdownCode = fs.readFileSync(markdownModulePath, 'utf8');

const inputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(repoRoot, 'fixtures', 'chatgpt20260418.html');
const outputPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.join(repoRoot, 'fixtures', `${path.basename(inputPath, path.extname(inputPath))}.parsed.md`);

const html = fs.readFileSync(inputPath, 'utf8');
const dom = new JSDOM(html);
const { window } = dom;

const context = vm.createContext({
    window,
    document: window.document,
    Node: window.Node,
    globalThis: window,
    console
});

new vm.Script(markdownCode).runInContext(context);

const root = window.document.querySelector('.markdown.prose') ||
    window.document.querySelector('.markdown');

if (!root) {
    throw new Error(`No .markdown.prose or .markdown node found in ${inputPath}`);
}

const markdown = window.MarkdownCopy.htmlToMarkdown(root) + '\n';
fs.writeFileSync(outputPath, markdown);
console.log(outputPath);
