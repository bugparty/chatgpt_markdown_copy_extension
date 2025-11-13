// Sentry Configuration
// Replace SENTRY_DSN with your actual Sentry DSN
// Get your DSN from: https://sentry.io/settings/projects/

const SENTRY_CONFIG = {
    // REQUIRED: Set your Sentry DSN here
    // Example: 'https://examplePublicKey@o0.ingest.sentry.io/0'
    dsn: 'YOUR_SENTRY_DSN_HERE',

    // Optional: Environment (production, staging, development)
    environment: 'production',

    // Optional: Release version (should match your extension version)
    release: 'chatgpt-markdown-copy@2.0.0',

    // Optional: Sample rate for error tracking (1.0 = 100%)
    tracesSampleRate: 1.0,

    // Optional: Enable performance monitoring
    enablePerformance: false,

    // Optional: Enable session replay
    enableReplay: false,

    // Optional: Custom tags
    tags: {
        extension: 'chatgpt-markdown-copy'
    }
};

// Initialize Sentry if DSN is configured
if (typeof Sentry !== 'undefined' && SENTRY_CONFIG.dsn && SENTRY_CONFIG.dsn !== 'YOUR_SENTRY_DSN_HERE') {
    try {
        Sentry.init({
            dsn: SENTRY_CONFIG.dsn,
            environment: SENTRY_CONFIG.environment,
            release: SENTRY_CONFIG.release,
            tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,

            // Capture unhandled promise rejections
            integrations: [
                Sentry.browserTracingIntegration(),
            ],

            // Filter out sensitive information
            beforeSend(event, hint) {
                // Don't send events if user hasn't configured DSN
                if (!SENTRY_CONFIG.dsn || SENTRY_CONFIG.dsn === 'YOUR_SENTRY_DSN_HERE') {
                    return null;
                }

                // Add custom tags
                event.tags = { ...event.tags, ...SENTRY_CONFIG.tags };

                // Filter out clipboard data from breadcrumbs
                if (event.breadcrumbs) {
                    event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
                        return !breadcrumb.message?.includes('clipboard');
                    });
                }

                return event;
            },

            // Set context
            initialScope: {
                tags: SENTRY_CONFIG.tags,
                user: {
                    // Don't track user IDs for privacy
                    // Just track browser info
                    browser: navigator.userAgent
                }
            }
        });

        console.log('[Sentry] Initialized successfully');
    } catch (error) {
        console.error('[Sentry] Initialization failed:', error);
    }
} else {
    console.log('[Sentry] Not initialized - DSN not configured');
}
