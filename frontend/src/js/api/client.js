import Store from '../store.js';

const Client = {
    async request(endpoint, options = {}) {
        const url = `/api${endpoint}`;
        
        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (Store.state.token) {
            headers['Authorization'] = `Bearer ${Store.state.token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const payload = await response.json();
            
            if (!response.ok) {
                throw new Error(payload.message || 'HTTP error, status: ' + response.status);
            }
            
            return payload;
        } catch (error) {
            console.error('Fetch Client Error:', error);
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body = {}, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    },

    put(endpoint, body = {}, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
};

export default Client;
