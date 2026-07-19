<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, $handler, array $middlewares = []): void
    {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, $handler, array $middlewares = []): void
    {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put(string $path, $handler, array $middlewares = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function delete(string $path, $handler, array $middlewares = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    public function options(string $path, $handler, array $middlewares = []): void
    {
        $this->addRoute('OPTIONS', $path, $handler, $middlewares);
    }

    private function addRoute(string $method, string $path, $handler, array $middlewares): void
    {
        // Convert path to regex
        // e.g. "/products/{id}" -> "#^/products/(?P<id>[^/]+)$#s"
        $regex = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        $regex = '#^' . $regex . '$#s';

        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'regex' => $regex,
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function resolve(Request $request, Container $container): Response
    {
        $method = $request->getMethod();
        $path = $request->getPath();

        // Handle CORS Preflight OPTIONS globally or fallback
        if ($method === 'OPTIONS') {
            $response = new Response();
            return $response->setStatusCode(200)->json(['status' => 'CORS_OK']);
        }

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['regex'], $path, $matches)) {
                // Extract route parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                // Setup middleware pipeline
                $pipeline = $route['middlewares'];
                
                // Final handler to call
                $handler = $route['handler'];

                return $this->runPipeline($pipeline, $request, $container, function($req) use ($handler, $container, $params) {
                    if (is_array($handler)) {
                        $controllerClass = $handler[0];
                        $methodName = $handler[1];
                        
                        $controller = $container->get($controllerClass);
                        return call_user_func_array([$controller, $methodName], [$req, $params]);
                    }

                    if (is_callable($handler)) {
                        return call_user_func_array($handler, [$req, $params]);
                    }

                    throw new \Exception("Invalid route handler.");
                });
            }
        }

        $response = new Response();
        return $response->setStatusCode(404)->json([
            'success' => false,
            'message' => "Route not found: [{$method}] {$path}",
            'errors' => null
        ]);
    }

    private function runPipeline(array $middlewares, Request $request, Container $container, callable $destination): Response
    {
        $runner = function($req) use (&$runner, &$middlewares, $container, $destination) {
            if (empty($middlewares)) {
                return $destination($req);
            }

            $middlewareClass = array_shift($middlewares);
            $middleware = $container->get($middlewareClass);

            return $middleware->handle($req, $runner);
        };

        return $runner($request);
    }
}
