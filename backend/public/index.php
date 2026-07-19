<?php
/**
 * NexaMart Enterprise SMS - Front Controller
 */

// Error handling in development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define path constants
define('ROOT_PATH', dirname(__DIR__, 2));
define('BACKEND_PATH', dirname(__DIR__));
define('APP_PATH', BACKEND_PATH . '/app');

// Autoload composer classes
if (file_exists(BACKEND_PATH . '/vendor/autoload.php')) {
    require_once BACKEND_PATH . '/vendor/autoload.php';
} else {
    // Custom basic autoloader for App namespace prior to running composer install
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $base_dir = APP_PATH . '/';
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }
        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    });
}

// Load Environment variables (.env file)
if (file_exists(ROOT_PATH . '/.env')) {
    $lines = file(ROOT_PATH . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        // Remove quotes if any
        if (preg_match('/^"https?:.*"$/', $value)) {
             $value = trim($value, '"');
        } elseif (preg_match('/^"(.*)"$/', $value, $matches)) {
            $value = $matches[1];
        }
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Bootstrap application
$app = new App\Core\Application();
$app->run();
