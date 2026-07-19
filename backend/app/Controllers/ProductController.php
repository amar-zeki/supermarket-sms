<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Helpers\ApiResponse;

class ProductController
{
    public function index(Request $request): Response
    {
        try {
            $pdo = Database::getConnection();
            $sql = "SELECT p.*, c.name as category_name, b.name as brand_name, u.abbreviation as unit_name, pr.sell_price, pr.cost_price, s.quantity
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN brands b ON p.brand_id = b.id
                    LEFT JOIN units u ON p.unit_id = u.id
                    LEFT JOIN product_prices pr ON p.id = pr.product_id
                    LEFT JOIN stock_levels s ON p.id = s.product_id
                    WHERE p.is_active = 1";
            
            $stmt = $pdo->query($sql);
            $products = $stmt->fetchAll();
            
            return ApiResponse::success($products, 'Products fetched successfully');
        } catch (\Throwable $e) {
            return ApiResponse::error('Database Error: ' . $e->getMessage(), null, 500);
        }
    }
}
