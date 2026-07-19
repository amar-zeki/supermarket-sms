<?php

namespace App\Models;

use App\Core\Database;

class User extends BaseModel
{
    protected string $table = 'users';

    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT u.*, r.name as role_name 
                FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.email = :email LIMIT 1";
        $stmt = Database::query($sql, ['email' => $email]);
        return $stmt->fetch() ?: null;
    }
}
