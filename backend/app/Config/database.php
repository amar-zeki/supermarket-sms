<?php

return [
    'host' => getenv('DB_HOST') ?: 'db',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_DATABASE') ?: 'nexamart_db',
    'username' => getenv('DB_USERNAME') ?: 'nexamart_user',
    'password' => getenv('DB_PASSWORD') ?: 'nexamart_pass_2024',
    'charset' => getenv('DB_CHARSET') ?: 'utf8mb4',
    'collation' => getenv('DB_COLLATION') ?: 'utf8mb4_unicode_ci',
];
