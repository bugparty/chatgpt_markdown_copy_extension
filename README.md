# ChatGPT & Gemini Markdown Copy Extension

A browser extension that adds a Markdown copy button to ChatGPT and Google Gemini responses, making it easy to copy AI responses in Markdown format.

## Features

- 🔄 Works on both ChatGPT (chatgpt.com, chat.openai.com) and Google Gemini (gemini.google.com)
- 📝 Converts HTML responses to clean Markdown format
- ✨ Supports code blocks with syntax highlighting
- 🔢 Handles mathematical formulas (KaTeX and Gemini math)
- 📋 Preserves formatting: headings, lists, links, blockquotes, etc.
- 🎯 Seamlessly integrates with the native UI

## Installation

### For Development/Testing

#### Chrome/Edge/Brave

1. Open your browser and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project

#### Firefox

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `extension` folder and select the `manifest.json` file

## Before Publishing: Generate Icons

The extension requires icon files. Follow these steps to generate them:

### Method 1: Using the Icon Generator (Recommended)

1. Open `icon-generator.html` in your browser
2. The icons will be automatically generated and displayed
3. Click "Download All" to download all three icon sizes
4. Move the downloaded files to `extension/icons/` folder:
   - `icon16.png` (16x16)
   - `icon48.png` (48x48)
   - `icon128.png` (128x128)

### Method 2: Using Online Tools

1. Open `extension/icons/icon.svg` in an SVG editor or online converter
2. Export to PNG at these sizes: 16x16, 48x48, 128x128
3. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `extension/icons/` folder

### Method 3: Using Command Line (requires ImageMagick)

```bash
cd extension/icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## Error Tracking with Sentry (Optional)

This extension includes built-in Sentry integration for error tracking. This is **optional** and disabled by default.

### Setting Up Sentry

1. **Create a Sentry Account**
   - Go to [sentry.io](https://sentry.io) and create a free account
   - Create a new project for browser JavaScript

2. **Get Your DSN**
   - After creating a project, you'll get a DSN (Data Source Name)
   - It looks like: `https://abc123def456@o123456.ingest.sentry.io/7890123`

3. **Configure the Extension**
   - Open `extension/sentry-config.js`
   - Replace `YOUR_SENTRY_DSN_HERE` with your actual DSN:
     ```javascript
     dsn: 'https://abc123def456@o123456.ingest.sentry.io/7890123',
     ```
   - Update other settings as needed (environment, release version, etc.)

4. **Privacy Considerations**
   - The extension filters out clipboard data and sensitive information
   - Only error messages and stack traces are sent to Sentry
   - No user identification is collected
   - See `PRIVACY.md` for full details

### Disabling Sentry

Sentry is automatically disabled if:
- The DSN is not configured (default state)
- The DSN is set to `YOUR_SENTRY_DSN_HERE`

To completely remove Sentry:
1. Remove `sentry.min.js` and `sentry-config.js` from the `extension/` folder
2. Update `manifest.json` to remove these files from the `js` array:
   ```json
   "js": ["content.js"]
   ```
3. Remove `host_permissions` and `content_security_policy` from `manifest.json`

## Publishing to Browser Stores

### Chrome Web Store

1. **Create a Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay the one-time $5 registration fee

2. **Prepare the Package**
   ```bash
   cd extension
   zip -r ../chatgpt-markdown-copy.zip .
   ```

3. **Upload**
   - Click "New Item" in the dashboard
   - Upload the ZIP file
   - Fill in the store listing details:
     - Name: ChatGPT & Gemini Markdown Copy
     - Description: Add Markdown copy button to ChatGPT and Gemini responses
     - Category: Productivity
     - Screenshots (at least 1, 1280x800 or 640x400)
     - Icon (128x128, already in your package)

4. **Submit for Review**
   - Review can take a few days

### Firefox Add-ons (AMO)

1. **Create a Developer Account**
   - Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
   - Create an account (free)

2. **Prepare the Package**
   ```bash
   cd extension
   zip -r ../chatgpt-markdown-copy-firefox.zip .
   ```

3. **Upload**
   - Go to [Submit a New Add-on](https://addons.mozilla.org/developers/addon/submit/)
   - Upload the ZIP file
   - Choose distribution channel (On this site / Self-distribution)
   - Fill in the listing details

4. **Submit for Review**
   - Firefox reviews are typically faster than Chrome

### Important Notes for Publishing

- **Privacy Policy**: Both stores may require a privacy policy. Since this extension only uses `clipboardWrite` permission and doesn't collect any data, you can include this simple statement:

  ```
  Privacy Policy for ChatGPT & Gemini Markdown Copy

  This extension does not collect, store, or transmit any user data.
  It only requires clipboard write permission to copy text to your clipboard when you click the Markdown copy button.
  All processing is done locally in your browser.
  ```

- **Screenshots**: Create screenshots showing:
  - The extension in action on ChatGPT
  - The extension in action on Gemini
  - The Markdown copy button highlighted
  - Example of copied Markdown content

- **Promotional Images**: Chrome requires promotional images (440x280, 920x680, 1400x560)

## Project Structure

```
chatgpt_markdown_copy_extension/
├── extension/
│   ├── manifest.json          # Extension configuration
│   ├── content.js             # Main extension script
│   └── icons/
│       ├── icon.svg           # Source SVG icon
│       ├── icon16.png         # 16x16 icon (generate this)
│       ├── icon48.png         # 48x48 icon (generate this)
│       └── icon128.png        # 128x128 icon (generate this)
├── icon-generator.html        # Tool to generate PNG icons from SVG
└── README.md                  # This file
```

## Supported Markdown Features

- Headings (H1-H6)
- Bold and italic text
- Code blocks with language detection
- Inline code
- Links
- Ordered and unordered lists (with nesting)
- Blockquotes
- Horizontal rules
- Mathematical formulas (inline and block)

## Browser Compatibility

- Chrome/Edge/Brave: Version 88+
- Firefox: Version 109+

## Development

### Modifying the Extension

1. Edit `extension/content.js` for functionality changes
2. Edit `extension/manifest.json` for permissions or metadata changes
3. Reload the extension in your browser:
   - Chrome: Go to `chrome://extensions/`, click the refresh icon
   - Firefox: Go to `about:debugging`, click "Reload"

### Testing

1. Install the extension in developer mode
2. Visit [ChatGPT](https://chatgpt.com) or [Google Gemini](https://gemini.google.com)
3. Generate a response from the AI
4. Look for the Markdown copy button (marked with "M") next to the regular copy button
5. Click it and paste the result to verify Markdown formatting

## Troubleshooting

**Button not appearing?**
- Refresh the page after installing the extension
- Check browser console for errors (F12)
- Ensure the extension is enabled in your browser's extension manager

**Markdown formatting issues?**
- The extension tries to preserve the original formatting as closely as possible
- Some complex nested structures might not convert perfectly
- Open an issue if you find consistent formatting problems

## License

MIT License - feel free to modify and distribute

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

bugparty

## Version History

- **2.0.0** - Browser extension version
  - Converted from Tampermonkey script
  - Support for both Chrome and Firefox
  - Improved stability and performance
