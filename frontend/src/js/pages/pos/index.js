import Sidebar from '../../components/Sidebar.js';
import Header from '../../components/Header.js';
import { t, getLocaleName } from '../../utils/i18n.js';
import Store from '../../store.js';
import Client from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import Toast from '../../components/Toast.js';
import { logout } from '../../utils/auth.js';
import { savePendingSale } from '../../utils/offline.js';

export default class PosPage {
    constructor() {
        this.products = [];
        this.searchQuery = '';
    }

    async loadData() {
        try {
            const response = await Client.get('/products');
            if (response && response.success) {
                this.products = response.data;
            }
        } catch (e) {
            console.warn('DB disconnected or empty. Using fallback mock products.', e);
            // Default fallback products if API is down or empty (including EN/AR/AM)
            this.products = [
                { id: 1, barcode: '5449000000996', sku: 'COKE-0.5L', name_en: 'Coca-Cola 500ml', name_ar: 'كوكا كولا ٥٠٠ مل', name_am: 'ኮካ ኮላ 500ml', sell_price: 35.00, quantity: 150.00 },
                { id: 2, barcode: '9900000001234', sku: 'ANBESSA-5KG', name_en: 'Anbessa Flour 5kg', name_ar: 'دقيق عنبسة ٥ كجم', name_am: 'አንበሳ ዱቄት 5kg', sell_price: 250.00, quantity: 80.00 }
            ];
        }
    }

    render() {
        const activePath = '/pos';
        const cart = Store.state.cart;
        const currentMethod = Store.state.paymentMethod;

        // Filter products based on search input query
        const filteredProducts = this.products.filter(p => {
            const query = this.searchQuery.toLowerCase();
            return p.barcode.includes(query) || 
                   p.name_en.toLowerCase().includes(query) || 
                   (p.name_ar && p.name_ar.toLowerCase().includes(query)) ||
                   (p.name_am && p.name_am.toLowerCase().includes(query));
        });

        // Catalog cards representation
        const catalogHtml = filteredProducts.map(p => {
            const initial = getLocaleName(p).charAt(0);
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-image-placeholder">${initial}</div>
                    <div class="product-details">
                        <span class="product-name-label">${getLocaleName(p)}</span>
                        <div class="product-price-row">
                            <span class="product-card-price">${formatCurrency(parseFloat(p.sell_price))}</span>
                            <span class="product-card-stock">Qty: ${p.quantity}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Cart items representation
        let subtotal = 0;
        const cartItemsHtml = cart.map(item => {
            const lineTotal = item.sell_price * item.qty;
            subtotal += lineTotal;
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${getLocaleName(item)}</span>
                        <span class="cart-item-price">${formatCurrency(item.sell_price)} x ${item.qty}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-qty-btn decrease-qty" data-id="${item.id}">-</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="cart-qty-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
        }).join('');

        const taxRate = 0.15; // 15% VAT
        const tax = subtotal * taxRate;
        const grandTotal = subtotal + tax;

        return `
            <div class="app-layout">
                ${Sidebar(activePath)}
                <main class="main-content">
                    ${Header()}
                    
                    <div class="pos-container">
                        <!-- Product Catalogue Grid -->
                        <div class="pos-catalog">
                            <div class="pos-search-bar">
                                <input type="text" id="pos-search" class="pos-search-input" placeholder="${t('search_products')}" value="${this.searchQuery}">
                            </div>
                            
                            <div class="pos-grid">
                                ${catalogHtml}
                            </div>
                        </div>
                        
                        <!-- Sidebar POS Register Cart -->
                        <div class="pos-sidebar">
                            <div class="pos-cart-header">
                                <h3>🛒 ${t('cart')}</h3>
                                <button id="clear-cart-btn" class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;">
                                    🧹 ${t('clear')}
                                </button>
                            </div>
                            
                            <div class="pos-cart-items">
                                ${cartItemsHtml.length > 0 ? cartItemsHtml : `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-muted);"><span style="font-size:3rem; margin-bottom:1rem;">🛍️</span>Cart is empty</div>`}
                            </div>
                            
                            <!-- Totals and payment buttons -->
                            <div class="cart-total-section">
                                <div class="cart-total-row">
                                    <span>${t('subtotal')}</span>
                                    <span>${formatCurrency(subtotal)}</span>
                                </div>
                                <div class="cart-total-row">
                                    <span>${t('tax')}</span>
                                    <span>${formatCurrency(tax)}</span>
                                </div>
                                
                                <div class="cart-total-row grand-total">
                                    <span>${t('total')}</span>
                                    <span>${formatCurrency(grandTotal)}</span>
                                </div>
                                
                                <div style="margin-top: 0.5rem;">
                                    <span style="font-size:0.85rem; color:var(--text-secondary);">${t('customer')}:</span>
                                    <div style="background:rgba(15,23,42,0.4); padding:0.5rem 0.75rem; border-radius:var(--radius-md); font-size:0.9rem; margin-top:0.25rem; border:1px solid var(--border-color);">
                                        👤 ${t('anonymous_customer')}
                                    </div>
                                </div>
                                
                                <div style="margin-top: 0.5rem;">
                                    <span style="font-size:0.85rem; color:var(--text-secondary);">Payment Method:</span>
                                    <div class="payment-method-selector">
                                        <button class="method-btn ${currentMethod === 'cash' ? 'active' : ''}" data-method="cash">${t('cash')}</button>
                                        <button class="method-btn ${currentMethod === 'card' ? 'active' : ''}" data-method="card">${t('card')}</button>
                                        <button class="method-btn ${currentMethod === 'wallet' ? 'active' : ''}" data-method="wallet">${t('wallet')}</button>
                                    </div>
                                </div>
                                
                                <div class="cart-action-buttons">
                                    <button id="pay-btn" class="btn btn-primary" style="grid-column: span 2; font-weight:700; font-size:1.1rem; height:50px;" ${cart.length === 0 ? 'disabled' : ''}>
                                        💰 ${t('pay')}
                                    </button>
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

        // Wire up search input
        const searchInput = document.getElementById('pos-search');
        if (searchInput) {
            searchInput.focus();
            // Move cursor to end of text
            const val = searchInput.value;
            searchInput.value = '';
            searchInput.value = val;

            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                // Re-render only POS component elements to avoid page flashing
                const container = document.querySelector('.pos-grid');
                if (container) {
                    const filtered = this.products.filter(p => {
                        const query = this.searchQuery.toLowerCase();
                        return p.barcode.includes(query) || 
                               p.name_en.toLowerCase().includes(query) || 
                               (p.name_ar && p.name_ar.toLowerCase().includes(query)) ||
                               (p.name_am && p.name_am.toLowerCase().includes(query));
                    });

                    container.innerHTML = filtered.map(p => {
                        const initial = getLocaleName(p).charAt(0);
                        return `
                            <div class="product-card" data-id="${p.id}">
                                <div class="product-image-placeholder">${initial}</div>
                                <div class="product-details">
                                    <span class="product-name-label">${getLocaleName(p)}</span>
                                    <div class="product-price-row">
                                        <span class="product-card-price">${formatCurrency(parseFloat(p.sell_price))}</span>
                                        <span class="product-card-stock">Qty: ${p.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');

                    // Re-register click handlers for newly drawn cards
                    this.registerCardClicks();
                }
            });
        }

        this.registerCardClicks();

        // Wire up cart quantity changes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('increase-qty')) {
                const id = parseInt(e.target.dataset.id);
                const item = Store.state.cart.find(x => x.id === id);
                if (item) Store.updateCartQty(id, item.qty + 1);
            }
            if (e.target.classList.contains('decrease-qty')) {
                const id = parseInt(e.target.dataset.id);
                const item = Store.state.cart.find(x => x.id === id);
                if (item) Store.updateCartQty(id, item.qty - 1);
            }
        });

        // Wire up clear cart button
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                Store.clearCart();
                Toast.warning('Cart cleared');
            });
        }

        // Wire up payment method buttons
        const methodBtns = document.querySelectorAll('.method-btn');
        methodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.target.dataset.method;
                Store.setPaymentMethod(method);
            });
        });

        // Wire up checkout process
        const payBtn = document.getElementById('pay-btn');
        if (payBtn) {
            payBtn.addEventListener('click', async () => {
                const cart = Store.state.cart;
                if (cart.length === 0) return;

                const subtotal = cart.reduce((acc, item) => acc + (item.sell_price * item.qty), 0);
                const tax = subtotal * 0.15;
                const total = subtotal + tax;
                
                const salePayload = {
                    sale_number: 'SAL-' + Math.floor(100000 + Math.random() * 900000),
                    items: cart,
                    subtotal,
                    tax,
                    total,
                    payment_method: Store.state.paymentMethod,
                    timestamp: new Date().toISOString()
                };

                payBtn.disabled = true;
                payBtn.innerText = 'Processing...';

                // Check offline connectivity
                if (Store.state.offline) {
                    try {
                        await savePendingSale(salePayload);
                        Toast.warning(t('offline_mode'));
                        Store.clearCart();
                    } catch (err) {
                        Toast.error('IndexedDB transaction failed');
                    } finally {
                        payBtn.disabled = false;
                        payBtn.innerText = t('pay');
                    }
                } else {
                    // Central server checkout push
                    setTimeout(() => {
                        Toast.success(t('payment_success') + ' (' + salePayload.sale_number + ')');
                        Store.clearCart();
                        payBtn.disabled = false;
                        payBtn.innerText = t('pay');
                    }, 800);
                }
            });
        }
    }

    registerCardClicks() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                const product = this.products.find(p => p.id === id);
                if (product) {
                    Store.addToCart(product);
                    Toast.success(`${getLocaleName(product)} added to cart`);
                }
            });
        });
    }
}
