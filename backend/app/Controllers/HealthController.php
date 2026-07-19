<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Helpers\ApiResponse;

class HealthController
{
    public function index(Request $request): Response
    {
        $dbStatus = 'disconnected';
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->query("SELECT 1");
            if ($stmt) {
                $dbStatus = 'connected';
            }
        } catch (\Throwable $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        return ApiResponse::success([
            'status' => 'ok',
            'database' => $dbStatus,
            'php_version' => PHP_VERSION,
            'time' => date('c'),
            'env' => getenv('APP_ENV') ?: 'development'
        ], 'System is healthy');
    }
}
