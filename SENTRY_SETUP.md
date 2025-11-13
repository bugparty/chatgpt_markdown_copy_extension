# Sentry Error Tracking Setup Guide

This guide will walk you through setting up Sentry error tracking for the ChatGPT & Gemini Markdown Copy extension.

## Why Use Sentry?

Sentry helps you:
- Track errors that users encounter in production
- Get detailed stack traces and context for debugging
- Monitor extension health and stability
- Identify and fix issues quickly

## Prerequisites

- A Sentry account (free tier available at [sentry.io](https://sentry.io))
- Your extension installed in development mode

## Step-by-Step Setup

### 1. Create a Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up for a free account (no credit card required)
3. Choose the free plan (sufficient for personal projects)

### 2. Create a New Project

1. After logging in, click "Create Project"
2. Select **"Browser"** as the platform
3. Choose **JavaScript** as the framework
4. Name your project (e.g., "chatgpt-markdown-copy")
5. Click "Create Project"

### 3. Get Your DSN

After creating the project, you'll see your DSN (Data Source Name). It looks like:

```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

**Important**: Copy this DSN - you'll need it in the next step.

You can always find your DSN later at:
- Project Settings → Client Keys (DSN)
- Or at: `https://sentry.io/settings/[your-org]/projects/[project-name]/keys/`

### 4. Configure the Extension

1. Open the file: `extension/sentry-config.js`

2. Replace `YOUR_SENTRY_DSN_HERE` with your actual DSN:

```javascript
const SENTRY_CONFIG = {
    dsn: 'https://abc123def456@o123456.ingest.sentry.io/7890123', // Your actual DSN
    environment: 'production',
    release: 'chatgpt-markdown-copy@2.0.0',
    tracesSampleRate: 1.0,
    tags: {
        extension: 'chatgpt-markdown-copy'
    }
};
```

3. (Optional) Customize other settings:
   - `environment`: Set to 'development', 'staging', or 'production'
   - `release`: Update to match your extension version
   - `tracesSampleRate`: Set to a value between 0.0 and 1.0 (1.0 = 100% of errors)

4. Save the file

### 5. Test the Integration

1. Reload your extension in the browser
2. Visit ChatGPT or Gemini
3. Check the browser console - you should see:
   ```
   [Sentry] Initialized successfully
   ```

4. To test error reporting, you can temporarily add a test error in `content.js`:
   ```javascript
   // Temporary test - remove after testing
   throw new Error('Test Sentry integration');
   ```

5. Check your Sentry dashboard - you should see the error appear within a few seconds

### 6. Verify in Sentry Dashboard

1. Go to your Sentry project dashboard
2. Navigate to **Issues** tab
3. You should see errors appearing here (if any occur)
4. Click on an issue to see:
   - Stack trace
   - Browser information
   - Platform (ChatGPT or Gemini)
   - Extension version

## Configuration Options

### Environment Settings

Set different environments for tracking:

```javascript
// For development
environment: 'development',

// For testing
environment: 'staging',

// For production (Chrome/Firefox stores)
environment: 'production',
```

### Sample Rate

Control what percentage of errors are sent:

```javascript
// Send all errors (100%)
tracesSampleRate: 1.0,

// Send 50% of errors
tracesSampleRate: 0.5,

// Send 10% of errors
tracesSampleRate: 0.1,
```

### Custom Tags

Add custom tags to help filter issues:

```javascript
tags: {
    extension: 'chatgpt-markdown-copy',
    version: '2.0.0',
    build: 'chrome-store'
}
```

## Privacy and Data Filtering

The extension is configured to protect user privacy:

### Automatically Filtered Data

- Clipboard content
- ChatGPT/Gemini conversation text
- User identification
- Any breadcrumbs containing clipboard data

### What IS Sent to Sentry

- Error messages and stack traces
- Browser type (user agent)
- Platform (ChatGPT or Gemini)
- Extension version
- Non-sensitive context information

### Customizing Filters

You can modify the `beforeSend` function in `sentry-config.js` to add more filters:

```javascript
beforeSend(event, hint) {
    // Filter out specific errors
    if (event.exception && event.exception.values) {
        const error = event.exception.values[0];
        if (error.value.includes('SensitiveWord')) {
            return null; // Don't send this error
        }
    }

    return event;
}
```

## Disabling Sentry

### Temporary Disable

Set the DSN back to the placeholder:

```javascript
dsn: 'YOUR_SENTRY_DSN_HERE',
```

### Permanent Removal

1. Delete these files:
   - `extension/sentry.min.js`
   - `extension/sentry-config.js`

2. Update `manifest.json`:
   ```json
   "js": ["content.js"]
   ```

3. Remove from `manifest.json`:
   ```json
   "host_permissions": [
     "https://*.ingest.sentry.io/*"
   ],
   "content_security_policy": {
     ...
   },
   ```

## Troubleshooting

### Sentry Not Initializing

**Check console for**:
- `[Sentry] Not initialized - DSN not configured`

**Solution**: Make sure you've replaced `YOUR_SENTRY_DSN_HERE` with your actual DSN.

### Errors Not Appearing in Sentry

**Possible causes**:
1. Sample rate is too low
2. DSN is incorrect
3. Browser is blocking requests to Sentry

**Solutions**:
1. Set `tracesSampleRate: 1.0`
2. Verify your DSN in Sentry project settings
3. Check browser console for network errors

### Permission Errors

**Error**: "Permission denied to access Sentry"

**Solution**: Make sure `manifest.json` includes:
```json
"host_permissions": [
  "https://*.ingest.sentry.io/*"
]
```

## Best Practices

### For Development

```javascript
environment: 'development',
tracesSampleRate: 1.0, // Capture all errors
```

### For Production

```javascript
environment: 'production',
tracesSampleRate: 0.5, // Capture 50% to reduce quota usage
release: 'chatgpt-markdown-copy@2.0.0', // Always set release version
```

### Quota Management

Sentry free tier includes:
- 5,000 events per month
- 1 project
- 30-day data retention

To stay within limits:
- Use sample rates (0.5 or lower for high-traffic extensions)
- Set up alerts in Sentry for quota usage
- Filter out known/ignorable errors

## Support

### Sentry Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [JavaScript SDK Guide](https://docs.sentry.io/platforms/javascript/)
- [Browser Extension Guide](https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/)

### Extension Support

- [GitHub Issues](https://github.com/bugparty/chatgpt_markdown_copy_extension/issues)
- Check `PRIVACY.md` for privacy information
- See `README.md` for general documentation

## Example: Multiple Environments

You can create different config files for different environments:

**sentry-config.dev.js**:
```javascript
const SENTRY_CONFIG = {
    dsn: 'https://dev-dsn@o123.ingest.sentry.io/456',
    environment: 'development',
    tracesSampleRate: 1.0
};
```

**sentry-config.prod.js**:
```javascript
const SENTRY_CONFIG = {
    dsn: 'https://prod-dsn@o123.ingest.sentry.io/789',
    environment: 'production',
    tracesSampleRate: 0.3
};
```

Then update `manifest.json` to use the appropriate config file.
