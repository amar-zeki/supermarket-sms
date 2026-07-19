import Sidebar from '../../components/Sidebar.js';
import Header from '../../components/Header.js';
import { t, getLocaleName } from '../../utils/i18n.js';
import Store from '../../store.js';
import Client from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import Toast from '../../components/Toast.js';
import { logout } from '../../utils/auth.js';

export default class ProductsPage {
    constructor() {
        this.products = [];
    }

    async loadData() {
        try {
            const response = await Client.get('/products');
            if (response && response.success) {
                this.products = response.data;
            }
        } catch (e) {
            console.warn('Using fallback mock products list', e);
            this.products = [
                { id: 1, barcode: '5449000000996', sku: 'COKE-0.5L', name_en: 'Coca-Cola 500ml', name_ar: 'كوكا كولا ٥٠٠ مل', name_am: 'ኮካ ኮላ 500ml', category_name: 'Beverages', brand_name: 'Coca-Cola Company', sell_price: 35.00, quantity: 150.00 },
                { id: 2, barcode: '9900000001234', sku: 'ANBESSA-5KG', name_en: 'Anbessa Flour 5kg', name_ar: 'دقيق عنبسة ٥ كجم', name_am: 'አንበሳ ዱቄት 5kg', category_name: 'Grains & Flours', brand_name: 'Anbessa Flour', sell_price: 250.00, quantity: 80.00 }
            ];
        }
    }

    render() {
        const activePath = '/products';

        const rowsHtml = this.products.map(p => `
            <tr style="border-bottom:1px solid var(--border-color); height:50px;">
                <td style="padding:0.75rem 1rem;"><strong>${p.sku}</strong></td>
                <td style="padding:0.75rem 1rem; color:var(--text-secondary);">${p.barcode}</td>
                <td style="padding:0.75rem 1rem;">${getLocaleName(p)}</td>
                <td style="padding:0.75rem 1rem; color:var(--text-secondary);">${p.category_name || 'N/A'}</td>
                <td style="padding:0.75rem 1rem; font-weight:600; color:${parseFloat(p.quantity) < 10 ? 'var(--error)' : 'var(--text-primary)'};">${p.quantity}</td>
                <td style="padding:0.75rem 1rem; font-weight:700; color:var(--success);">${formatCurrency(parseFloat(p.sell_price))}</td>
            </tr>
        `).join('');

        return `
            <div class="app-layout">
                ${Sidebar(activePath)}
                <main class="main-content">
                    ${Header()}
                    
                    <div style="padding:2rem; display:flex; flex-direction:column; gap:1.5rem;">
                        <div class="dashboard-title-bar">
                            <h2>📦 ${t('products')}</h2>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">Browse registered items catalog</p>
                        </div>
                        
                        <!-- Table grid container -->
                        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); overflow:hidden;">
                            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.95rem;">
                                <thead>
                                    <tr style="background:rgba(15,23,42,0.4); border-bottom:1px solid var(--border-color); color:var(--text-secondary); height:45px;">
                                        <th style="padding:0.75rem 1rem; font-weight:500;">${t('sku')}</th>
                                        <th style="padding:0.75rem 1rem; font-weight:500;">${t('barcode')}</th>
                                        <th style="padding:0.75rem 1rem; font-weight:500;">${t('product_name')}</th>
                                        <th style="padding:0.75rem 1rem; font-weight:500;">Category</th>
                                        <th style="padding:0.75rem 1rem; font-weight:500;">${t('stock')}</th>
                                        <th style="padding:0.75rem 1rem; font-weight:500;">${t('price')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml.length > 0 ? rowsHtml : `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No products registered yet.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    init() {
        // Wire up language selector
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
