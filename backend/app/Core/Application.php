<?php

namespace App\Core;

class Application
{
    private Container $container;
    private Router $router;
    private Request $request;

    public function __construct()
    {
        $this->container = new Container();
        $this->router = new Router();
        $this->request = new Request();

        $this->bootstrap();
    }

    private function bootstrap(): void
    {
        // Bind core components
        $this->container->singleton(Container::class, fn() => $this->container);
        $this->container->singleton(Router::class, fn() => $this->router);
        $this->container->singleton(Request::class, fn() => $this->request);

        // Load configuration
        $this->loadRoutes();
    }

    private function loadRoutes(): void
    {
        $router = $this->router;
        
        // Include route definition file
        $routesPath = dirname(__DIR__, 2) . '/routes/api.php';
        if (file_exists($routesPath)) {
            require_once $routesPath;
        }
    }

    public function run(): void
    {
        try {
            // Apply CORS globally by default (via CorsMiddleware or preflight response)
            // Resolve the path and output response
            $response = $this->router->resolve($this->request, $this->container);
            
            // Add CORS Headers globally
            $response->setHeader('Access-Control-Allow-Origin', getenv('CORS_ALLOWED_ORIGINS') ?: '*');
            $response->setHeader('Access-Control-Allow-Methods', getenv('CORS_ALLOWED_METHODS') ?: 'GET, POST, PUT, DELETE, OPTIONS');
            $response->setHeader('Access-Control-Allow-Headers', getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type, Authorization, X-Store-ID, X-Terminal-ID');
            $response->setHeader('Access-Control-Allow-Credentials', 'true');

            $response->send();
        } catch (\Throwable $e) {
            $this->handleException($e);
        }
    }

    private function handleException(\Throwable $e): void
    {
        $statusCode = 500;
        if ($e instanceof \PDOException || strpos($e->getMessage(), 'Database') !== false) {
            $statusCode = 500;
            $message = 'Database Connection Error or Query Failure.';
        } else {
            $message = $e->getMessage();
        }

        $response = new Response();
        $response->setStatusCode($statusCode)->json([
            'success' => false,
            'message' => 'An error occurred on the server.',
            'errors' => [
                'type' => get_class($e),
                'details' => getenv('APP_DEBUG') === 'true' ? $e->getMessage() : $message,
                'trace' => getenv('APP_DEBUG') === 'true' ? $e->getTrace() : []
            ]
        ]);
        
        // CORS fallback for errors too
        $response->setHeader('Access-Control-Allow-Origin', getenv('CORS_ALLOWED_ORIGINS') ?: '*');
        $response->setHeader('Access-Control-Allow-Methods', getenv('CORS_ALLOWED_METHODS') ?: 'GET, POST, PUT, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers', getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type, Authorization, X-Store-ID, X-Terminal-ID');
        $response->setHeader('Access-Control-Allow-Credentials', 'true');

        $response->send();
    }
}
