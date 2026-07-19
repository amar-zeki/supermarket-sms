-- NexaMart Enterprise Supermarket Management System (SMS)
-- Schema Baseline v1.0 (MySQL 8.0+)

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS terminals;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_stores;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS price_lists;
DROP TABLE IF EXISTS product_prices;
DROP TABLE IF EXISTS store_prices;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS promotion_products;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS stock_levels;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS stock_adjustments;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS cashier_sessions;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sale_payments;
DROP TABLE IF EXISTS sale_returns;
DROP TABLE IF EXISTS sale_return_items;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS purchase_items;
DROP TABLE IF EXISTS goods_receipts;
DROP TABLE IF EXISTS goods_receipt_items;
DROP TABLE IF EXISTS supplier_invoices;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS journal_lines;
DROP TABLE IF EXISTS cash_registers;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS employee_shifts;
DROP TABLE IF EXISTS attendance;
SET FOREIGN_KEY_CHECKS = 1;

-- 🏢 Organization Structure
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255) NULL,
    timezone VARCHAR(100) DEFAULT 'Africa/Addis_Ababa',
    currency VARCHAR(10) DEFAULT 'ETB',
    tax_rate DECIMAL(5,2) DEFAULT 15.00,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    manager_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    region_id INT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NULL,
    phone VARCHAR(50) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE terminals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    device_fingerprint VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    last_sync TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 👤 User & Authorization (RBAC)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    guard_name VARCHAR(50) DEFAULT 'api',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    store_id INT NULL,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin VARCHAR(6) NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_stores (
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    PRIMARY KEY (user_id, store_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    store_id INT NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    ip VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 📦 Product Catalog
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    parent_id INT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    base_unit_id INT NULL,
    conversion_factor DECIMAL(10,4) DEFAULT 1.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (base_unit_id) REFERENCES units(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    barcode VARCHAR(50) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NULL,
    name_am VARCHAR(255) NULL,
    description TEXT NULL,
    category_id INT NULL,
    brand_id INT NULL,
    unit_id INT NULL,
    image VARCHAR(255) NULL,
    min_stock_level DECIMAL(10,2) DEFAULT 0.00,
    reorder_qty DECIMAL(10,2) DEFAULT 0.00,
    shelf_life_days INT NULL,
    is_perishable BOOLEAN DEFAULT FALSE,
    has_variants BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_company_barcode (company_id, barcode),
    UNIQUE KEY uq_company_sku (company_id, sku),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 💰 Pricing & Promotions
CREATE TABLE price_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    currency_code VARCHAR(10) DEFAULT 'ETB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    price_list_id INT NOT NULL,
    product_id INT NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    sell_price DECIMAL(12,2) NOT NULL,
    min_price DECIMAL(12,2) NULL,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE store_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    sell_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_store_product (store_id, product_id),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 🗃️ Inventory Management
CREATE TABLE warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('main', 'shelf', 'cold', 'back') DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 0.00,
    reserved_qty DECIMAL(10,2) DEFAULT 0.00,
    batch_number VARCHAR(50) NULL,
    expiry_date DATE NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_warehouse_product_batch (warehouse_id, product_id, batch_number),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    store_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    product_id INT NOT NULL,
    type ENUM('in', 'out', 'transfer', 'adjustment', 'write_off') NOT NULL,
    qty DECIMAL(10,2) NOT NULL,
    before_qty DECIMAL(10,2) NOT NULL,
    after_qty DECIMAL(10,2) NOT NULL,
    reference_id INT NULL,
    reference_type VARCHAR(100) NULL,
    note TEXT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 🛒 Sales & POS Transactions
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(100) NULL,
    loyalty_points INT DEFAULT 0,
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cashier_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    terminal_id INT NOT NULL,
    user_id INT NOT NULL,
    opening_cash DECIMAL(10,2) NOT NULL,
    closing_cash DECIMAL(10,2) NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    store_id INT NOT NULL,
    terminal_id INT NOT NULL,
    session_id INT NOT NULL,
    sale_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0.00,
    tax DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    paid DECIMAL(12,2) NOT NULL,
    `change` DECIMAL(12,2) NOT NULL,
    status ENUM('completed', 'refunded', 'partial_refunded', 'cancelled') DEFAULT 'completed',
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES cashier_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    barcode VARCHAR(50) NOT NULL,
    name_snapshot VARCHAR(255) NOT NULL,
    qty DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0.00,
    tax DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sale_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    method ENUM('cash', 'card', 'wallet', 'credit') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reference VARCHAR(100) NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Data Insertion
-- ============================================================

-- 1. Companies
INSERT INTO companies (id, name, timezone, currency, tax_rate, status)
VALUES (1, 'NexaMart HQ', 'Africa/Addis_Ababa', 'ETB', 15.00, 'active');

-- 2. Regions
INSERT INTO regions (id, company_id, name)
VALUES (1, 1, 'Addis Ababa Central');

-- 3. Stores
INSERT INTO stores (id, company_id, region_id, name, address, phone, status)
VALUES (1, 1, 1, 'NexaMart Bole Branch', 'Bole Road, Addis Ababa', '+251911223344', 'active');

-- 4. Terminals
INSERT INTO terminals (id, store_id, name, status)
VALUES (1, 1, 'Bole Terminal 01', 'active');

-- 5. Roles
INSERT INTO roles (id, company_id, name) VALUES
(1, 1, 'Super Admin'),
(2, 1, 'Store Manager'),
(3, 1, 'Cashier');

-- 6. Permissions
INSERT INTO permissions (id, name, module, action) VALUES
(1, 'dashboard.view', 'dashboard', 'view'),
(2, 'products.create', 'products', 'create'),
(3, 'products.view', 'products', 'view'),
(4, 'products.update', 'products', 'update'),
(5, 'products.delete', 'products', 'delete'),
(6, 'sales.create', 'sales', 'create'),
(7, 'sales.view', 'sales', 'view');

-- 7. Role Permissions mappings
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Super Admin gets all
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
-- Store Manager gets dashboard, product view/update, sales view
(2, 1), (2, 3), (2, 4), (2, 7),
-- Cashier gets sales create/view and dashboard view
(3, 1), (3, 6), (3, 7);

-- 8. Users
-- Default password: AdminPassword123 (hashed using bcrypt)
INSERT INTO users (id, company_id, store_id, role_id, name, email, password_hash, pin, status)
VALUES (1, 1, 1, 1, 'System Administrator', 'admin@nexamart.com', '$2y$12$tGkF4o17.oP5oW29QhO6reQYfJ07pE9H/B/6HghE3v2b4lq4m0iG.', '123456', 'active');

-- 9. Warehouses
INSERT INTO warehouses (id, store_id, name, type) VALUES
(1, 1, 'Main Store Shelf', 'shelf'),
(2, 1, 'Backroom Inventory', 'back');

-- 10. Brands
INSERT INTO brands (id, company_id, name) VALUES
(1, 1, 'Coca-Cola Company'),
(2, 1, 'Anbessa Flour');

-- 11. Categories
INSERT INTO categories (id, company_id, name) VALUES
(1, 1, 'Beverages'),
(2, 1, 'Grains & Flours');

-- 12. Units
INSERT INTO units (id, company_id, name, abbreviation) VALUES
(1, 1, 'Pieces', 'pcs'),
(2, 1, 'Kilograms', 'kg');

-- 13. Products
INSERT INTO products (id, company_id, barcode, sku, name_en, name_ar, name_am, category_id, brand_id, unit_id, is_active) VALUES
(1, 1, '5449000000996', 'COKE-0.5L', 'Coca-Cola 500ml', 'كوكا كولا ٥٠٠ مل', 'ኮካ ኮላ 500ml', 1, 1, 1, 1),
(2, 1, '9900000001234', 'ANBESSA-5KG', 'Anbessa Flour 5kg', 'دقيق عنبسة ٥ كجم', 'አንበሳ ዱቄት 5kg', 2, 2, 2, 1);

-- 14. Price Lists
INSERT INTO price_lists (id, company_id, name, is_default) VALUES
(1, 1, 'Default Retail Prices', 1);

-- 15. Product Prices (Coke cost 25, sells for 35; Flour cost 200, sells for 250)
INSERT INTO product_prices (price_list_id, product_id, cost_price, sell_price, effective_from) VALUES
(1, 1, 25.00, 35.00, CURRENT_TIMESTAMP),
(1, 2, 200.00, 250.00, CURRENT_TIMESTAMP);

-- 16. Stock Levels
INSERT INTO stock_levels (warehouse_id, product_id, quantity) VALUES
(1, 1, 150.00),
(1, 2, 80.00);
