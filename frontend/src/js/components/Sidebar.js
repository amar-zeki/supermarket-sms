import { t } from '../utils/i18n.js';
import Store from '../store.js';

export default function Sidebar(activePath) {
    const role = Store.state.user ? Store.state.user.role : '';

    const menuItems = [
        { path: '/dashboard', label: 'dashboard', icon: '📊' },
        { path: '/pos', label: 'pos', icon: '🛒' },
        { path: '/products', label: 'products', icon: '📦' }
    ];

    const menuHtml = menuItems.map(item => {
        const active = activePath === item.path ? 'active' : '';
        return `
            <li>
                <a href="#${item.path}" class="sidebar-link ${active}">
                    <span>${item.icon}</span>
                    <span>${t(item.label)}</span>
                </a>
            </li>
        `;
    }).join('');

    return `
        <aside class="sidebar">
            <div class="sidebar-brand">
                <span>🏪</span>
                <span>${t('app_name')}</span>
            </div>
            <nav style="flex-grow: 1;">
                <ul class="sidebar-menu">
                    ${menuHtml}
                </ul>
            </nav>
            <div class="sidebar-footer">
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    Role: <strong style="color: var(--primary);">${role}</strong>
                </div>
                <button id="logout-btn" class="btn btn-secondary" style="width: 100%; padding: 0.5rem 1rem; font-size: 0.85rem;">
                    🚪 ${t('logout')}
                </button>
            </div>
        </aside>
    `;
}
