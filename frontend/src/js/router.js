import LoginPage from './pages/auth/login.js';
import DashboardPage from './pages/dashboard/index.js';
import PosPage from './pages/pos/index.js';
import ProductsPage from './pages/products/index.js';
import { isAuthenticated } from './utils/auth.js';

const routes = {
    '/login': LoginPage,
    '/dashboard': DashboardPage,
    '/pos': PosPage,
    '/products': ProductsPage
};

export default class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        window.addEventListener('hashchange', () => this.handleRouting());
    }

    async handleRouting() {
        let hash = window.location.hash || '#/dashboard';
        let path = hash.substring(1);

        // Normalize trailing slash if any
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // Apply authentication guards
        const auth = isAuthenticated();
        if (!auth && path !== '/login') {
            window.location.hash = '/login';
            return;
        }

        if (auth && path === '/login') {
            window.location.hash = '/dashboard';
            return;
        }

        // Catch unregistered routes
        const PageClass = routes[path] || DashboardPage;
        const page = new PageClass();

        // Show a temporary loader while retrieving API data if the page defines it
        if (page.loadData) {
            this.showLoader();
            await page.loadData();
        }

        // Render page contents
        this.appContainer.innerHTML = page.render();

        // Initialize page logic/events
        if (page.init) {
            page.init();
        }
    }

    showLoader() {
        this.appContainer.innerHTML = `
            <div class="app-bootstrap-loader">
                <div class="spinner"></div>
                <h2>NexaMart</h2>
                <p>Retrieving data metrics...</p>
            </div>
        `;
    }
}
