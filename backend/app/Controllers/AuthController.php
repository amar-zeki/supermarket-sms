<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Helpers\ApiResponse;
use App\Helpers\Validator;

class AuthController
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(Request $request): Response
    {
        $validator = new Validator();
        $body = $request->getBody();

        $rules = [
            'email' => 'required|email',
            'password' => 'required|min:6'
        ];

        if (!$validator->validate($body, $rules)) {
            return ApiResponse::error('Validation failed', $validator->getErrors(), 422);
        }

        $result = $this->authService->authenticate($body['email'], $body['password']);
        if (!$result) {
            return ApiResponse::error('Invalid email or password credentials', null, 401);
        }

        return ApiResponse::success($result, 'Login successful');
    }

    public function me(Request $request): Response
    {
        // User data was injected by AuthMiddleware into $_REQUEST['user']
        $user = $_REQUEST['user'] ?? null;
        if (!$user) {
            return ApiResponse::error('Unauthorized', null, 401);
        }
        return ApiResponse::success(['user' => $user], 'User profile fetched');
    }
}
