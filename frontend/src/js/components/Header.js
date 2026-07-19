import { t } from '../utils/i18n.js';
import Store from '../store.js';

export default function Header() {
    const userName = Store.state.user ? Store.state.user.name : 'User';
    const currentLang = Store.state.language;
    const offline = Store.state.offline;

    const statusPill = offline 
        ? `<div class="status-pill offline" style="background: rgba(239, 68, 68, 0.15); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.25rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
            <span class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--error);"></span> Offline Mode
          </div>`
        : `<div class="status-pill online" style="background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.25rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
            <span class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite;"></span> Online
          </div>`;

    return `
        <header class="app-header">
            <div class="header-left" style="display: flex; align-items: center; gap: 1rem;">
                ${statusPill}
            </div>
            
            <div class="header-right" style="display: flex; align-items: center; gap: 1.5rem;">
                <!-- Multilingual dropdown -->
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <label for="header-lang-selector" style="font-size: 0.8rem; color: var(--text-secondary);">${t('language')}:</label>
                    <select id="header-lang-selector" class="lang-selector">
                        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>${t('english')}</option>
                        <option value="ar" ${currentLang === 'ar' ? 'selected' : ''}>${t('arabic')}</option>
                        <option value="am" ${currentLang === 'am' ? 'selected' : ''}>${t('amharic')}</option>
                    </select>
                </div>
                
                <div class="header-user">
                    <span style="font-weight: 500; font-size: 0.95rem;">👤 ${userName}</span>
                </div>
            </div>
        </header>
        
        <style>
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
        </style>
    `;
}
