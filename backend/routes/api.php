<?php
/**
 * NexaMart API Routes Registration
 */

use App\Controllers\HealthController;
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\ProductController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimiter;

/** @var App\Core\Router $router */

// Public Endpoints
$router->get('/health', [HealthController::class, 'index']);
$router->post('/auth/login', [AuthController::class, 'login'], [RateLimiter::class]);

// Protected Endpoints
$router->get('/auth/me', [AuthController::class, 'me'], [AuthMiddleware::class]);
$router->get('/dashboard/summary', [DashboardController::class, 'index'], [AuthMiddleware::class]);
$router->get('/products', [ProductController::class, 'index'], [AuthMiddleware::class]);
