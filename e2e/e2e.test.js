import test from 'node:test';
import assert from 'node:assert';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('E2E Test: Extension functions normally with fixtures', async (t) => {
  const extensionPath = path.join(__dirname, '../dist');

  const browser = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      `--headless=new`
    ]
  });

  await browser.grantPermissions(['clipboard-read', 'clipboard-write']);

  await t.test('ChatGPT fixture parsing', async () => {
    const chatgptFixturePath = path.join(__dirname, '../fixtures/chatgpt20260418.html');
    const chatgptExpectedPath = path.join(__dirname, '../fixtures/chatgpt20260418.parsed.md');

    const rawHtml = await fs.readFile(chatgptFixturePath, 'utf8');
    const bodyMatch = rawHtml.match(/<body>([\s\S]*?)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : rawHtml;
    const expectedMd = await fs.readFile(chatgptExpectedPath, 'utf8');

    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>ChatGPT Test</title></head>
      <body>
        <main>
          <div data-testid="conversation-turn-1">
            <div class="text-base">
              ${bodyHtml}
            </div>
            <div class="flex flex-wrap items-center">
              <button data-testid="copy-turn-action-button">Copy</button>
            </div>
          </div>
        </main>
      </body>
      </html>
    `;

    const page = await browser.newPage();
    await page.route('https://chatgpt.com/test', async route => {
       await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrappedHtml });
    });

    await page.goto('https://chatgpt.com/test');

    const copyButton = page.locator('[data-markdown-copy="true"]');
    await copyButton.waitFor({ state: 'attached', timeout: 5000 });
    await copyButton.click();
    await page.waitForTimeout(500);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    assert.strictEqual(clipboardText.trim(), expectedMd.trim(), "ChatGPT clipboard content should match expected output");
    await page.close();
  });

  await t.test('Gemini fixture parsing', async () => {
    const geminiFixturePath = path.join(__dirname, '../fixtures/gemini20260418.html');
    const geminiExpectedPath = path.join(__dirname, '../fixtures/gemini20260418.parsed.md');

    const rawHtml = await fs.readFile(geminiFixturePath, 'utf8');
    const modifiedHtml = rawHtml.replace(
      /(<copy-button[^>]*>[\s\S]*?<\/copy-button>)/,
      '<div><div><div><div>$1</div></div></div></div>'
    );
    const expectedMd = await fs.readFile(geminiExpectedPath, 'utf8');

    const page = await browser.newPage();
    await page.route('https://gemini.google.com/test', async route => {
       await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: modifiedHtml });
    });

    await page.goto('https://gemini.google.com/test');

    const copyButton = page.locator('[data-markdown-copy="true"]');
    await copyButton.waitFor({ state: 'attached', timeout: 5000 });
    await copyButton.click();
    await page.waitForTimeout(500);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    assert.strictEqual(clipboardText.trim(), expectedMd.trim(), "Gemini clipboard content should match expected output");
    await page.close();
  });

  await browser.close();
});
