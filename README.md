# NexaMart Enterprise Supermarket Management System (SMS)

> A production-ready, multi-store, PWA-enabled supermarket ERP system built on PHP 8.3, MySQL 8.4, REST API, Docker + Apache.

---

## 🚀 Quick Start (Development)

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone & Setup

```bash
git clone <your-repo-url> supermarket-sms
cd supermarket-sms

# Copy environment config
copy .env.example .env
```

### 2. Start Docker Stack

```bash
docker compose --profile dev up -d --build
```

### 3. Install PHP Dependencies

```bash
docker exec -it nexamart_app composer install --working-dir=backend
```

### 4. Verify it's running

```bash
# Should return { "success": true, "data": { "status": "ok", "database": "connected" } }
curl http://localhost/api/health
```

Open your browser at **http://localhost** to access the PWA.

---

## 🌐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@nexamart.com | AdminPassword123 |

---

## 📁 Project Structure

```
supermarket-sms/
├── docker/                 ← Docker service configs
│   ├── php/                ← Dockerfile + php.ini
│   ├── apache/             ← vhost.conf
│   └── mysql/              ← my.cnf + init SQL schema
│
├── backend/                ← PHP 8.3 MVC REST API
│   ├── public/             ← Apache DocumentRoot (index.php + .htaccess)
│   ├── app/
│   │   ├── Core/           ← Framework kernel (Router, Request, Response, DB, Container)
│   │   ├── Controllers/    ← Thin controllers (Auth, Dashboard, Products, Health)
│   │   ├── Models/         ← PDO data access layer
│   │   ├── Services/       ← Business logic layer
│   │   ├── Middleware/     ← JWT Auth, CORS, Rate Limiter
│   │   ├── Helpers/        ← ApiResponse, Validator
│   │   └── Config/         ← app.php, database.php, permissions.php
│   └── routes/api.php      ← All REST API route definitions
│
├── frontend/               ← Vanilla JS PWA (SPA)
│   ├── public/             ← index.html, manifest.json, sw.js
│   ├── src/
│   │   ├── css/            ← main.css + components + pages
│   │   └── js/
│   │       ├── app.js      ← Bootstrap & service worker registration
│   │       ├── router.js   ← Hash-based SPA router
│   │       ├── store.js    ← Global state (auth, cart, language)
│   │       ├── api/        ← Fetch client + modules
│   │       ├── components/ ← Sidebar, Header, Toast, Modal
│   │       ├── pages/      ← Login, Dashboard, POS, Products
│   │       └── utils/      ← i18n, auth, format, offline (IndexedDB)
│   └── locales/            ← en.json, ar.json, am.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── Makefile
```

---

## 🌍 Multilingual Support

| Language | Code | Direction | Font |
|----------|------|-----------|------|
| English | `en` | LTR | Inter |
| Arabic | `ar` | RTL | Cairo |
| Amharic | `am` | LTR | Noto Sans Ethiopic |

Language can be switched in the login screen or from the header language selector.

---

## 🔌 API Endpoints

Base URL: `http://localhost/api/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | System health check |
| POST | `/auth/login` | None | Authenticate, return JWT |
| GET | `/auth/me` | JWT | Current user profile |
| GET | `/dashboard/summary` | JWT | KPI metrics |
| GET | `/products` | JWT | Product catalog list |

---

## 🐳 Docker Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| PHP 8.3 + Apache | nexamart_app | 80, 443 | Web server + API |
| MySQL 8.4 | nexamart_db | 3306 | Database |
| Redis 7 | nexamart_redis | — | Cache + Sessions |
| phpMyAdmin | nexamart_pma | 8080 | DB Admin (dev) |
| Mailhog | nexamart_mail | 8025 | Email testing (dev) |

---

## 📱 PWA Installation

| Platform | Method |
|----------|--------|
| Android | Chrome → ⋮ menu → "Add to Home Screen" |
| iPhone/iPad | Safari → Share → "Add to Home Screen" |
| Windows | Chrome/Edge → Install icon in address bar |
| macOS | Chrome → Install icon in address bar |

---

## 🗺️ Development Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| Phase 0 ✅ | Week 1-2 | Docker, Architecture, DB Schema, Frontend PWA skeleton |
| Phase 1a | Week 3-4 | Full Auth, RBAC, Store management |
| Phase 1b | Week 5-6 | Product catalog, Pricing engine |
| Phase 1c | Week 7-8 | Inventory, Stock movements |
| Phase 1d | Week 9-10 | POS (full offline-capable) |
| Phase 1e | Week 11-12 | Dashboard, Reports |
| Phase 2 | Week 13-16 | Suppliers, Purchase Orders, Returns |
| Phase 3 | Week 17-20 | Finance, HR, Payroll |
| Phase 4+ | Week 21+ | Loyalty, E-commerce |
