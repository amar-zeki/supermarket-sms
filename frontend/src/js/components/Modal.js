export default class Modal {
    static open(title, contentHtml, actions = []) {
        // Remove existing modal if any
        this.close();

        const backdrop = document.createElement('div');
        backdrop.id = 'modal-backdrop';
        backdrop.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center; z-index: 999;
            opacity: 0; transition: opacity 0.2s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #1e293b; border: 1px solid #334155; border-radius: 12px;
            width: 90%; max-width: 500px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
            transform: scale(0.95); transition: transform 0.2s ease;
        `;

        const header = document.createElement('h3');
        header.innerText = title;
        header.style.cssText = 'margin-bottom: 1rem; color: #fff; font-size: 1.3rem;';

        const content = document.createElement('div');
        content.innerHTML = contentHtml;
        content.style.cssText = 'color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem;';

        const buttonRow = document.createElement('div');
        buttonRow.style.cssText = 'display: flex; justify-content: flex-end; gap: 0.75rem;';

        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = `btn ${action.class || 'btn-secondary'}`;
            btn.innerText = action.label;
            btn.onclick = () => {
                if (action.onClick) action.onClick();
                this.close();
            };
            buttonRow.appendChild(btn);
        });

        if (actions.length === 0) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'btn btn-secondary';
            closeBtn.innerText = 'Close';
            closeBtn.onclick = () => this.close();
            buttonRow.appendChild(closeBtn);
        }

        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(buttonRow);
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        // Force reflow
        backdrop.offsetHeight;
        backdrop.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }

    static close() {
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.style.opacity = '0';
            backdrop.style.transform = 'scale(0.95)';
            setTimeout(() => backdrop.remove(), 200);
        }
    }
}
