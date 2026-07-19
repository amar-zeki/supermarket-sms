<?php

return [
    'name' => getenv('APP_NAME') ?: 'NexaMart',
    'env' => getenv('APP_ENV') ?: 'development',
    'debug' => getenv('APP_DEBUG') === 'true',
    'url' => getenv('APP_URL') ?: 'http://localhost',
    'timezone' => getenv('APP_TIMEZONE') ?: 'Africa/Addis_Ababa',
    'locale' => getenv('APP_DEFAULT_LANG') ?: 'en',
    'supported_locales' => explode(',', getenv('SUPPORTED_LANGUAGES') ?: 'en,ar,am'),
    
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'default_dev_secret_key_change_in_production_1234567890',
        'access_expiry' => (int)(getenv('JWT_ACCESS_EXPIRY') ?: 900),
        'refresh_expiry' => (int)(getenv('JWT_REFRESH_EXPIRY') ?: 604800),
        'algorithm' => getenv('JWT_ALGORITHM') ?: 'HS256',
    ]
];
