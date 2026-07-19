<?php

namespace App\Helpers;

use App\Core\Response;

class ApiResponse
{
    public static function success($data = null, string $message = 'OK', array $meta = null, int $code = 200): Response
    {
        $response = new Response();
        return $response->setStatusCode($code)->json([
            'success' => true,
            'data' => $data,
            'meta' => $meta,
            'message' => $message,
            'errors' => null,
            'timestamp' => date('c')
        ]);
    }

    public static function error(string $message, array $errors = null, int $code = 400): Response
    {
        $response = new Response();
        return $response->setStatusCode($code)->json([
            'success' => false,
            'data' => null,
            'meta' => null,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('c')
        ]);
    }
}
