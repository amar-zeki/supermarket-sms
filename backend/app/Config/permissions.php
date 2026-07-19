<?php

return [
    'roles' => [
        'Super Admin' => [
            'dashboard.view',
            'products.create',
            'products.view',
            'products.update',
            'products.delete',
            'sales.create',
            'sales.view',
            'inventory.view',
            'inventory.adjust',
            'reports.view',
            'settings.view',
            'settings.update',
        ],
        'Store Manager' => [
            'dashboard.view',
            'products.view',
            'products.update',
            'sales.view',
            'inventory.view',
            'inventory.adjust',
            'reports.view',
        ],
        'Cashier' => [
            'dashboard.view',
            'products.view',
            'sales.create',
            'sales.view',
        ]
    ]
];
