/**
 * NexaMart Frontend Global State Store
 */

const Store = {
    state: {
        token: localStorage.getItem('nexamart_token') || null,
        user: JSON.parse(localStorage.getItem('nexamart_user')) || null,
        language: localStorage.getItem('nexamart_lang') || 'en',
        cart: [],
        offline: !navigator.onLine,
        paymentMethod: 'cash'
    },

    listeners: [],

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    },

    setToken(token, user) {
        this.state.token = token;
        this.state.user = user;
        
        if (token) {
            localStorage.setItem('nexamart_token', token);
            localStorage.setItem('nexamart_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('nexamart_token');
            localStorage.removeItem('nexamart_user');
        }
        
        this.notify();
    },

    setLanguage(lang) {
        this.state.language = lang;
        localStorage.setItem('nexamart_lang', lang);
        
        // Update document body for RTL/LTR
        document.body.className = `lang-${lang}`;
        document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        this.notify();
    },

    setOffline(status) {
        this.state.offline = status;
        this.notify();
    },

    addToCart(product) {
        const existing = this.state.cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.state.cart.push({
                id: product.id,
                name_en: product.name_en,
                name_ar: product.name_ar,
                name_am: product.name_am,
                barcode: product.barcode,
                sell_price: parseFloat(product.sell_price || 0),
                cost_price: parseFloat(product.cost_price || 0),
                qty: 1
            });
        }
        this.notify();
    },

    updateCartQty(productId, qty) {
        const item = this.state.cart.find(item => item.id === productId);
        if (item) {
            item.qty = Math.max(0, qty);
            if (item.qty === 0) {
                this.state.cart = this.state.cart.filter(item => item.id !== productId);
            }
        }
        this.notify();
    },

    clearCart() {
        this.state.cart = [];
        this.notify();
    },

    setPaymentMethod(method) {
        this.state.paymentMethod = method;
        this.notify();
    }
};

// Listen to browser network changes
window.addEventListener('online', () => Store.setOffline(false));
window.addEventListener('offline', () => Store.setOffline(true));

export default Store;
