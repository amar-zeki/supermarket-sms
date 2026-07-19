import { t } from '../../utils/i18n.js';
import Store from '../../store.js';
import Client from '../../api/client.js';
import Toast from '../../components/Toast.js';

export default class LoginPage {
    render() {
        const currentLang = Store.state.language;
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">🏪</div>
                        <h2 class="auth-title">${t('login_title')}</h2>
                        <p class="auth-subtitle">${t('login_subtitle')}</p>
                    </div>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email">${t('email')}</label>
                            <input type="email" id="email" class="form-control" placeholder="admin@nexamart.com" required value="admin@nexamart.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="password">${t('password')}</label>
                            <input type="password" id="password" class="form-control" placeholder="••••••••" required value="AdminPassword123">
                        </div>
                        
                        <button type="submit" id="submit-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem; font-weight:600;">
                            ${t('sign_in')}
                        </button>
                    </form>
                    
                    <div class="auth-lang-picker">
                        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                        <button class="lang-btn ${currentLang === 'ar' ? 'active' : ''}" data-lang="ar">العربية</button>
                        <button class="lang-btn ${currentLang === 'am' ? 'active' : ''}" data-lang="am">አማርኛ</button>
                    </div>
                    
                    <!-- Quick Dev Credentials -->
                    <div style="margin-top: 2rem; border-top: 1px dashed var(--border-color); padding-top: 1rem; font-size: 0.8rem; color: var(--text-muted); text-align: center;">
                        <p>Demo Admin Credentials:</p>
                        <p><strong>admin@nexamart.com</strong> / <strong>AdminPassword123</strong></p>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        const form = document.getElementById('login-form');
        const submitBtn = document.getElementById('submit-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            submitBtn.innerText = t('authenticating');
            submitBtn.disabled = true;

            try {
                const response = await Client.post('/auth/login', { email, password });
                Toast.success(t('welcome') + ', ' + response.data.user.name);
                
                // Save session in Store
                Store.setToken(response.data.token, response.data.user);
                
                // Redirect to dashboard
                window.location.hash = '/dashboard';
            } catch (error) {
                Toast.error(error.message || 'Login credentials failed');
                submitBtn.innerText = t('sign_in');
                submitBtn.disabled = false;
            }
        });

        // Language switches wire-up
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const lang = e.target.dataset.lang;
                Store.setLanguage(lang);
                // Reload translations
                window.location.reload();
            });
        });
    }
}
