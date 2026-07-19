import Store from '../store.js';

export function formatCurrency(amount) {
    const lang = Store.state.language;
    // Ethiopic currency is ETB, others can fall back. Let's use local settings
    const currency = 'ETB';
    
    try {
        const locale = lang === 'ar' ? 'ar-EG' : (lang === 'am' ? 'am-ET' : 'en-US');
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        return amount.toFixed(2) + ' ' + currency;
    }
}

export function formatDate(dateString) {
    const lang = Store.state.language;
    if (!dateString) return '';
    
    const date = new Date(dateString);
    try {
        const locale = lang === 'ar' ? 'ar-EG' : (lang === 'am' ? 'am-ET' : 'en-US');
        return new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    } catch (e) {
        return date.toLocaleString();
    }
}
