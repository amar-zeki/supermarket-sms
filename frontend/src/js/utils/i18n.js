import Store from '../store.js';

let translations = {};

export async function initTranslations() {
    const lang = Store.state.language;
    try {
        const res = await fetch(`/locales/${lang}.json`);
        translations = await res.json();
        Store.setLanguage(lang);
    } catch (e) {
        console.error("Could not load translation dictionary for language " + lang, e);
    }
}

export function t(key) {
    return translations[key] || key;
}

export function getLocaleName(product, fieldPrefix = 'name') {
    const lang = Store.state.language;
    if (lang === 'ar' && product[`${fieldPrefix}_ar`]) {
        return product[`${fieldPrefix}_ar`];
    }
    if (lang === 'am' && product[`${fieldPrefix}_am`]) {
        return product[`${fieldPrefix}_am`];
    }
    return product[`${fieldPrefix}_en`] || product[fieldPrefix] || '';
}
