import Sidebar from '../../components/Sidebar.js';
import Header from '../../components/Header.js';
import { t, getLocaleName } from '../../utils/i18n.js';
import Store from '../../store.js';
import Client from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import Toast from '../../components/Toast.js';
import { logout } from '../../utils/auth.js';

export default class DashboardPage {
    constructor() {
        this.data = {
            summary: { total_sales: 0, transaction_count: 0, active_products: 0, customers_registered: 0 },
            sales_trend: { labels: [], datasets: [{ data: [] }] },
            recent_low_stock: []
        };
    }

    async loadData() {
        try {
            const response = await Client.get('/dashboard/summary');
            if (response && response.success) {
                this.data = response.data;
            }
        } catch (e) {
            console.warn('Using fallback mock dashboard stats', e);
        }
    }

    render() {
        const sum = this.data.summary;
        const lowStock = this.data.recent_low_stock || [];
        const activePath = '/dashboard';

        // Render sparkline bars dynamically
        const trendData = this.data.sales_trend?.datasets?.[0]?.data || [1200, 2400, 4300, 3100, 2800, 5200, 1420];
        const trendLabels = this.data.sales_trend?.labels || ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
        const maxVal = Math.max(...trendData, 1);

        const barsHtml = trendData.map((val, idx) => {
            const pct = (val / maxVal) * 90; // percentage height (max 90% space)
            return `
                <div class="sparkline-bar" style="height: ${pct}%;" data-val="${formatCurrency(val)}"></div>
            `;
        }).join('');

        const labelHtml = trendLabels.map(lbl => `<span>${lbl}</span>`).join('');

        // Render low stock cards
        const lowStockHtml = lowStock.length > 0 
            ? lowStock.map(item => `
                <div class="low-stock-item">
                    <div class="item-info">
                        <span class="item-name">${getLocaleName(item)}</span>
                        <span class="item-min">Min Stock Level: ${item.min_stock_level}</span>
                    </div>
                    <span class="item-badge">${item.quantity} units left</span>
                </div>
            `).join('')
            : `<p style="color: var(--text-muted); font-size:0.9rem; text-align:center; padding:1rem;">All items are well stocked! 🎉</p>`;

        return `
            <div class="app-layout">
                ${Sidebar(activePath)}
                <main class="main-content">
                    ${Header()}
                    
                    <div class="dashboard-container">
                        <div class="dashboard-title-bar">
                            <h2>${t('dashboard')}</h2>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">Real-time store analysis metrics</p>
                        </div>
                        
                        <!-- Stats grid -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">💰</div>
                                <div class="stat-info">
                                    <span class="stat-label">${t('total_sales')}</span>
                                    <span class="stat-value">${formatCurrency(sum.total_sales)}</span>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">🧾</div>
                                <div class="stat-info">
                                    <span class="stat-label">${t('transactions')}</span>
                                    <span class="stat-value">${sum.transaction_count}</span>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">📦</div>
                                <div class="stat-info">
                                    <span class="stat-label">${t('active_items')}</span>
                                    <span class="stat-value">${sum.active_products}</span>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">⚠️</div>
                                <div class="stat-info">
                                    <span class="stat-label">${t('low_stock_alert')}</span>
                                    <span class="stat-value">${lowStock.length}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Visual analytics panels -->
                        <div class="dashboard-grid">
                            <div class="dashboard-panel">
                                <div class="panel-header">
                                    <h3 class="panel-title">${t('sales_trend_title')}</h3>
                                </div>
                                <div class="sparkline-mock">
                                    ${barsHtml}
                                </div>
                                <div class="sparkline-label-row">
                                    ${labelHtml}
                                </div>
                            </div>
                            
                            <div class="dashboard-panel">
                                <div class="panel-header">
                                    <h3 class="panel-title">${t('low_stock_alert')}</h3>
                                </div>
                                <div class="low-stock-list">
                                    ${lowStockHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    init() {
        // Wire up language switcher
        const langSelector = document.getElementById('header-lang-selector');
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                Store.setLanguage(e.target.value);
                window.location.reload();
            });
        }

        // Wire up logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                logout();
                Toast.warning('Session terminated');
            });
        }
    }
}
