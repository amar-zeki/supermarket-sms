<?php

namespace App\Core;

class Container
{
    private array $bindings = [];
    private array $instances = [];

    public function bind(string $key, $resolver): void
    {
        $this->bindings[$key] = $resolver;
    }

    public function singleton(string $key, $resolver): void
    {
        $this->bind($key, function ($container) use ($resolver) {
            static $instance;
            if (null === $instance) {
                $instance = is_callable($resolver) ? $resolver($container) : new $resolver();
            }
            return $instance;
        });
    }

    public function get(string $key)
    {
        if (isset($this->instances[$key])) {
            return $this->instances[$key];
        }

        if (!isset($this->bindings[$key])) {
            // Auto resolve class
            if (class_exists($key)) {
                return $this->resolveClass($key);
            }
            throw new \Exception("Target binding [{$key}] does not exist.");
        }

        $resolver = $this->bindings[$key];
        $instance = $resolver($this);

        return $instance;
    }

    private function resolveClass(string $className)
    {
        $reflector = new \ReflectionClass($className);

        if (!$reflector->isInstantiable()) {
            throw new \Exception("Class [{$className}] is not instantiable.");
        }

        $constructor = $reflector->getConstructor();

        if (null === $constructor) {
            return new $className();
        }

        $parameters = $constructor->getParameters();
        $dependencies = [];

        foreach ($parameters as $parameter) {
            $type = $parameter->getType();
            if ($type && !$type->isBuiltin()) {
                $dependencies[] = $this->get($type->getName());
            } else {
                if ($parameter->isDefaultValueAvailable()) {
                    $dependencies[] = $parameter->getDefaultValue();
                } else {
                    throw new \Exception("Cannot resolve parameter [{$parameter->getName()}] in class [{$className}].");
                }
            }
        }

        return $reflector->newInstanceArgs($dependencies);
    }
}
