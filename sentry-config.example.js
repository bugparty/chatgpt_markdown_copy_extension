// Sentry Configuration Example
// Copy this file to extension/sentry-config.js and update with your values

const SENTRY_CONFIG = {
    // REQUIRED: Set your Sentry DSN here
    // Get your DSN from: https://sentry.io/settings/projects/
    // Example: 'https://abc123def456@o123456.ingest.sentry.io/7890123'
    dsn: 'YOUR_SENTRY_DSN_HERE',

    // Optional: Environment (production, staging, development)
    environment: 'production',

    // Optional: Release version (should match your extension version)
    release: 'chatgpt-markdown-copy@2.0.0',

    // Optional: Sample rate for error tracking (1.0 = 100%)
    tracesSampleRate: 1.0,

    // Optional: Custom tags
    tags: {
        extension: 'chatgpt-markdown-copy'
    }
};
