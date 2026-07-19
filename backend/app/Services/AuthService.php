<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;

class AuthService
{
    private User $userModel;

    public function __construct(User $userModel)
    {
        $this->userModel = $userModel;
    }

    public function authenticate(string $email, string $password): ?array
    {
        $user = $this->userModel->findByEmail($email);
        if (!$user) {
            return null;
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            return null;
        }

        // Generate Token
        $token = $this->generateJwt($user);

        return [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role_name'],
                'company_id' => $user['company_id'],
                'store_id' => $user['store_id']
            ],
            'token' => $token
        ];
    }

    private function generateJwt(array $user): string
    {
        $secret = getenv('JWT_SECRET') ?: 'default_dev_secret_key_change_in_production_1234567890';
        $expiry = (int)(getenv('JWT_ACCESS_EXPIRY') ?: 900);
        
        $payload = [
            'iss' => getenv('APP_URL') ?: 'http://localhost',
            'aud' => getenv('APP_URL') ?: 'http://localhost',
            'iat' => time(),
            'exp' => time() + $expiry,
            'sub' => $user['id'],
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role_name'],
                'company_id' => $user['company_id'],
                'store_id' => $user['store_id']
            ]
        ];

        if (class_exists('Firebase\JWT\JWT')) {
            $algo = getenv('JWT_ALGORITHM') ?: 'HS256';
            return JWT::encode($payload, $secret, $algo);
        }

        // Dev/Fallback base64 token generator
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        $payloadStr = json_encode($payload);
        
        $base64UrlHeader = strtr(rtrim(base64_encode($header), '='), '+/', '-_');
        $base64UrlPayload = strtr(rtrim(base64_encode($payloadStr), '='), '+/', '-_');
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = strtr(rtrim(base64_encode($signature), '='), '+/', '-_');
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
}
