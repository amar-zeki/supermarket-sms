<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class CorsMiddleware
{
    public function handle(Request $request, callable $next): Response
    {
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response();
            $response->setStatusCode(200);
            $response->setHeader('Access-Control-Allow-Origin', getenv('CORS_ALLOWED_ORIGINS') ?: '*');
            $response->setHeader('Access-Control-Allow-Methods', getenv('CORS_ALLOWED_METHODS') ?: 'GET, POST, PUT, DELETE, OPTIONS');
            $response->setHeader('Access-Control-Allow-Headers', getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type, Authorization, X-Store-ID, X-Terminal-ID');
            $response->setHeader('Access-Control-Allow-Credentials', 'true');
            $response->json(['status' => 'Preflight OK']);
            return $response;
        }

        $response = $next($request);
        
        $response->setHeader('Access-Control-Allow-Origin', getenv('CORS_ALLOWED_ORIGINS') ?: '*');
        $response->setHeader('Access-Control-Allow-Methods', getenv('CORS_ALLOWED_METHODS') ?: 'GET, POST, PUT, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers', getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type, Authorization, X-Store-ID, X-Terminal-ID');
        $response->setHeader('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}
