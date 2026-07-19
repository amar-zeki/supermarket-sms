import Router from './router.js';
import { initTranslations } from './utils/i18n.js';
import Store from './store.js';

// Application entry point bootstrapping
async function bootstrapApp() {
    console.log('[NexaMart PWA] Starting Bootstrap Lifecycle...');

    // 1. Initialize translation dictionaries
    await initTranslations();

    // 2. Instantiate and start Router routing
    const router = new Router();
    await router.handleRouting();

    // 3. Register Service Worker in production/supported environments
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((reg) => {
                    console.log('[NexaMart PWA] Service Worker registered successfully', reg.scope);
                })
                .catch((err) => {
                    console.error('[NexaMart PWA] Service Worker registration failed', err);
                });
        });
    }
}

// Start application
bootstrapApp();
