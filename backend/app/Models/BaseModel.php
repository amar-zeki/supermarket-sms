<?php

namespace App\Models;

use App\Core\Database;

abstract class BaseModel
{
    protected string $table;
    protected string $primaryKey = 'id';

    public function find($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id LIMIT 1";
        $stmt = Database::query($sql, ['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function all(): array
    {
        $sql = "SELECT * FROM {$this->table}";
        $stmt = Database::query($sql);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_map(fn($key) => ":{$key}", array_keys($data)));
        
        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
        Database::query($sql, $data);
        
        return (int)Database::getConnection()->lastInsertId();
    }

    public function update($id, array $data): bool
    {
        $sets = [];
        foreach (array_keys($data) as $key) {
            $sets[] = "{$key} = :{$key}";
        }
        $setString = implode(', ', $sets);
        
        $sql = "UPDATE {$this->table} SET {$setString} WHERE {$this->primaryKey} = :id_param";
        
        $params = $data;
        $params['id_param'] = $id;
        
        $stmt = Database::query($sql, $params);
        return $stmt->rowCount() > 0;
    }

    public function delete($id): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id";
        $stmt = Database::query($sql, ['id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
