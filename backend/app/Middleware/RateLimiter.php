<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\ApiResponse;

class RateLimiter
{
    public function handle(Request $request, callable $next): Response
    {
        $limit = (int)(getenv('RATE_LIMIT_PER_MINUTE') ?: 120);
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $key = 'rate_limit_' . md5($ip);
        
        $cacheDir = BACKEND_PATH . '/storage/cache';
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0777, true);
        }

        $cacheFile = $cacheDir . '/' . $key . '.json';
        
        $now = time();
        $window = 60; // 1 minute
        
        if (file_exists($cacheFile)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            if ($data && ($now - $data['start_time']) < $window) {
                if ($data['count'] >= $limit) {
                    return ApiResponse::error('Too Many Requests. Rate limit exceeded.', null, 429);
                }
                $data['count']++;
            } else {
                $data = [
                    'start_time' => $now,
                    'count' => 1
                ];
            }
        } else {
            $data = [
                'start_time' => $now,
                'count' => 1
            ];
        }

        file_put_contents($cacheFile, json_encode($data));

        $response = $next($request);
        
        // Add rate limiting headers
        $response->setHeader('X-RateLimit-Limit', (string)$limit);
        $response->setHeader('X-RateLimit-Remaining', (string)max(0, $limit - $data['count']));
        $response->setHeader('X-RateLimit-Reset', (string)($data['start_time'] + $window));

        return $response;
    }
}
