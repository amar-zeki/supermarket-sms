export default class Toast {
    static show(message, type = 'info', duration = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-text">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static success(message) { this.show(message, 'success'); }
    static warning(message) { this.show(message, 'warning'); }
    static error(message) { this.show(message, 'error'); }
}
