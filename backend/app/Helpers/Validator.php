<?php

namespace App\Helpers;

class Validator
{
    private array $errors = [];

    public function validate(array $data, array $rules): bool
    {
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $ruleList = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;

            foreach ($ruleList as $rule) {
                $params = [];
                if (strpos($rule, ':') !== false) {
                    list($ruleName, $paramStr) = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                    $rule = $ruleName;
                }

                $method = 'validate' . ucfirst($rule);
                if (method_exists($this, $method)) {
                    $isValid = $this->$method($field, $value, $params, $data);
                    if (!$isValid) {
                        break; // Stop evaluating rules for this field on first failure
                    }
                }
            }
        }

        return empty($this->errors);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    private function validateRequired(string $field, $value): bool
    {
        if ($value === null || $value === '' || (is_array($value) && empty($value))) {
            $this->addError($field, "The {$field} field is required.");
            return false;
        }
        return true;
    }

    private function validateEmail(string $field, $value): bool
    {
        if (empty($value)) return true;
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "The {$field} field must be a valid email address.");
            return false;
        }
        return true;
    }

    private function validateMin(string $field, $value, array $params): bool
    {
        if (empty($value)) return true;
        $min = (int)($params[0] ?? 0);
        
        if (is_string($value) && strlen($value) < $min) {
            $this->addError($field, "The {$field} field must be at least {$min} characters.");
            return false;
        }
        if (is_numeric($value) && $value < $min) {
            $this->addError($field, "The {$field} field must be at least {$min}.");
            return false;
        }
        return true;
    }

    private function validateMax(string $field, $value, array $params): bool
    {
        if (empty($value)) return true;
        $max = (int)($params[0] ?? 0);

        if (is_string($value) && strlen($value) > $max) {
            $this->addError($field, "The {$field} field must not exceed {$max} characters.");
            return false;
        }
        if (is_numeric($value) && $value > $max) {
            $this->addError($field, "The {$field} field must not exceed {$max}.");
            return false;
        }
        return true;
    }
}
