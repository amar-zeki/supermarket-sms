<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\ApiResponse;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    public function handle(Request $request, callable $next): Response
    {
        $authHeader = $request->getHeader('Authorization');
        if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
            return ApiResponse::error('Unauthorized: Missing or invalid token format', null, 401);
        }

        $token = substr($authHeader, 7);
        $secret = getenv('JWT_SECRET') ?: 'default_dev_secret_key_change_in_production_1234567890';
        $algo = getenv('JWT_ALGORITHM') ?: 'HS256';

        try {
            if (class_exists('Firebase\JWT\JWT')) {
                $decoded = JWT::decode($token, new Key($secret, $algo));
                $userData = (array)$decoded;
                // Add the user data to custom request properties
                $_REQUEST['user'] = $userData;
            } else {
                // Dev/Fallback parser for testing before composer dependencies are fetched
                $parts = explode('.', $token);
                if (count($parts) !== 3) {
                    throw new \Exception('Invalid JWT structure');
                }
                $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
                if (!$payload) {
                    throw new \Exception('Invalid payload encoding');
                }
                if (isset($payload['exp']) && $payload['exp'] < time()) {
                    throw new \Exception('Token expired');
                }
                $_REQUEST['user'] = $payload;
            }
        } catch (\Throwable $e) {
            return ApiResponse::error('Unauthorized: ' . $e->getMessage(), null, 401);
        }

        return $next($request);
    }
}
