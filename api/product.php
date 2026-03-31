<?php
// =============================================
// Frind Phone — Product API
// =============================================
// Endpoints:
//   GET    /api/product.php              — Get all products
//   GET    /api/product.php?id=1         — Get single product
//   POST   /api/product.php              — Add new product
//   PUT    /api/product.php?id=1         — Update product
//   DELETE /api/product.php?id=1         — Delete product

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {

    // ========== GET: ดึงข้อมูลสินค้า ==========
    case 'GET':
        if ($id) {
            // Get single product
            $stmt = getDB()->prepare("SELECT * FROM `product` WHERE `id` = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch();

            if (!$product) {
                jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
            }

            $product = formatProduct($product);
            jsonResponse(['success' => true, 'data' => $product]);

        } else {
            // Get all products
            $stmt = getDB()->query("SELECT * FROM `product` ORDER BY `id` ASC");
            $products = $stmt->fetchAll();

            $products = array_map('formatProduct', $products);
            jsonResponse(['success' => true, 'data' => $products]);
        }
        break;

    // ========== POST: เพิ่มสินค้าใหม่ ==========
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON input'], 400);
        }

        // Validate required fields
        $required = ['name', 'brand', 'category', 'original_price', 'price'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                jsonResponse(['success' => false, 'error' => "Missing required field: $field"], 400);
            }
        }

        $sql = "INSERT INTO `product` (`name`, `brand`, `category`, `specs`, `original_price`, `price`, `badge`, `views`, `sold`, `image`, `installment`, `in_stock`, `specifications`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = getDB()->prepare($sql);
        $stmt->execute([
            $input['name'],
            $input['brand'],
            $input['category'],
            $input['specs'] ?? null,
            $input['original_price'],
            $input['price'],
            $input['badge'] ?? null,
            $input['views'] ?? 0,
            $input['sold'] ?? 0,
            $input['image'] ?? null,
            $input['installment'] ?? null,
            isset($input['in_stock']) ? ($input['in_stock'] ? 1 : 0) : 1,
            isset($input['specifications']) ? json_encode($input['specifications'], JSON_UNESCAPED_UNICODE) : null,
        ]);

        $newId = getDB()->lastInsertId();

        // Fetch the newly created product
        $stmt = getDB()->prepare("SELECT * FROM `product` WHERE `id` = ?");
        $stmt->execute([$newId]);
        $product = formatProduct($stmt->fetch());

        jsonResponse(['success' => true, 'message' => 'Product created', 'data' => $product], 201);
        break;

    // ========== PUT: แก้ไขสินค้า ==========
    case 'PUT':
        if (!$id) {
            jsonResponse(['success' => false, 'error' => 'Product ID is required'], 400);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON input'], 400);
        }

        // Check if product exists
        $stmt = getDB()->prepare("SELECT `id` FROM `product` WHERE `id` = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
        }

        // Build dynamic UPDATE query
        $allowedFields = [
            'name', 'brand', 'category', 'specs', 'original_price', 'price',
            'badge', 'views', 'sold', 'image', 'installment', 'in_stock', 'specifications'
        ];

        $setClauses = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $input)) {
                $setClauses[] = "`$field` = ?";
                if ($field === 'specifications') {
                    $values[] = is_array($input[$field]) || is_object($input[$field])
                        ? json_encode($input[$field], JSON_UNESCAPED_UNICODE)
                        : $input[$field];
                } elseif ($field === 'in_stock') {
                    $values[] = $input[$field] ? 1 : 0;
                } else {
                    $values[] = $input[$field];
                }
            }
        }

        if (empty($setClauses)) {
            jsonResponse(['success' => false, 'error' => 'No fields to update'], 400);
        }

        $values[] = $id;
        $sql = "UPDATE `product` SET " . implode(', ', $setClauses) . " WHERE `id` = ?";
        $stmt = getDB()->prepare($sql);
        $stmt->execute($values);

        // Fetch updated product
        $stmt = getDB()->prepare("SELECT * FROM `product` WHERE `id` = ?");
        $stmt->execute([$id]);
        $product = formatProduct($stmt->fetch());

        jsonResponse(['success' => true, 'message' => 'Product updated', 'data' => $product]);
        break;

    // ========== DELETE: ลบสินค้า ==========
    case 'DELETE':
        if (!$id) {
            jsonResponse(['success' => false, 'error' => 'Product ID is required'], 400);
        }

        // Check if product exists
        $stmt = getDB()->prepare("SELECT `id` FROM `product` WHERE `id` = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
        }

        $stmt = getDB()->prepare("DELETE FROM `product` WHERE `id` = ?");
        $stmt->execute([$id]);

        jsonResponse(['success' => true, 'message' => 'Product deleted']);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// ========== Helper: Format DB row to JS-compatible object ==========
function formatProduct($row) {
    if (!$row) return null;
    return [
        'id'            => (int) $row['id'],
        'name'          => $row['name'],
        'brand'         => $row['brand'],
        'category'      => $row['category'],
        'specs'         => $row['specs'],
        'originalPrice' => (float) $row['original_price'],
        'price'         => (float) $row['price'],
        'badge'         => $row['badge'],
        'views'         => (int) $row['views'],
        'sold'          => (int) $row['sold'],
        'image'         => $row['image'],
        'installment'   => $row['installment'],
        'inStock'       => (bool) $row['in_stock'],
        'specifications'=> $row['specifications'] ? json_decode($row['specifications'], true) : null,
    ];
}
?>
