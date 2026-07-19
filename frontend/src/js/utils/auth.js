import Store from '../store.js';

export function isAuthenticated() {
    const token = Store.state.token;
    if (!token) return false;
    
    // Parse JWT token expiration
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && payload.exp < Date.now() / 1000) {
            // Token expired
            logout();
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

export function logout() {
    Store.setToken(null, null);
    window.location.hash = '/login';
}
