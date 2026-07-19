export default class DataTable {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.columns = options.columns || [];
        this.data = options.data || [];
        this.searchable = options.searchable !== false;
        this.filteredData = [...this.data];
        this.currentPage = 1;
        this.perPage = options.perPage || 25;
    }

    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.currentPage = 1;
        this.render();
    }

    search(query) {
        if (!query) {
            this.filteredData = [...this.data];
        } else {
            const q = query.toLowerCase();
            this.filteredData = this.data.filter(row => {
                return Object.values(row).some(val =>
                    String(val).toLowerCase().includes(q)
                );
            });
        }
        this.currentPage = 1;
        this.renderBody();
    }

    getPageData() {
        const start = (this.currentPage - 1) * this.perPage;
        return this.filteredData.slice(start, start + this.perPage);
    }

    render() {
        if (!this.container) return;

        const headHtml = this.columns.map(col => `
            <th style="padding:0.75rem 1rem; font-weight:500; color:var(--text-secondary);">${col.label}</th>
        `).join('');

        this.container.innerHTML = `
            <div class="datatable-wrapper">
                ${this.searchable ? `
                    <div style="margin-bottom:1rem;">
                        <input type="text" class="form-control datatable-search" placeholder="Search..." style="max-width:360px;">
                    </div>` : ''}
                <div style="overflow-x:auto; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:rgba(15,23,42,0.4); border-bottom:1px solid var(--border-color);">
                                ${headHtml}
                            </tr>
                        </thead>
                        <tbody class="datatable-body">
                            ${this.renderBodyHtml()}
                        </tbody>
                    </table>
                </div>
                <div class="datatable-pagination" style="display:flex; justify-content:flex-end; margin-top:1rem; gap:0.5rem;"></div>
            </div>
        `;

        if (this.searchable) {
            const search = this.container.querySelector('.datatable-search');
            search.addEventListener('input', e => this.search(e.target.value));
        }
    }

    renderBodyHtml() {
        const pageData = this.getPageData();
        if (pageData.length === 0) {
            return `<tr><td colspan="${this.columns.length}" style="text-align:center; padding:2rem; color:var(--text-muted);">No records found</td></tr>`;
        }

        return pageData.map(row => {
            const cells = this.columns.map(col => {
                const val = col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-');
                return `<td style="padding:0.75rem 1rem; border-bottom:1px solid var(--border-color);">${val}</td>`;
            }).join('');
            return `<tr style="transition:background 0.15s ease;" onmouseover="this.style.background='rgba(99,102,241,0.05)'" onmouseout="this.style.background=''">${cells}</tr>`;
        }).join('');
    }

    renderBody() {
        const body = this.container ? this.container.querySelector('.datatable-body') : null;
        if (body) {
            body.innerHTML = this.renderBodyHtml();
        }
    }
}
