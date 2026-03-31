<?php
// =============================================
// Frind Phone — Order Status API
// =============================================
// Endpoints:
//   GET    /api/status.php              → ดึงคำสั่งซื้อทั้งหมด
//   GET    /api/status.php?id=AG-123456 → ดึงคำสั่งซื้อตาม order_id
//   POST   /api/status.php              → สร้างคำสั่งซื้อใหม่
//   PUT    /api/status.php?id=AG-123456 → อัปเดตสถานะ/ข้อมูลคำสั่งซื้อ
//   DELETE /api/status.php?id=AG-123456 → ลบคำสั่งซื้อ

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Normalize order_id: accept with or without #
function normalizeOrderId($id) {
    $id = trim($id);
    if (strpos($id, '#') !== 0) {
        $id = '#' . $id;
    }
    return $id;
}

// Format order row + items for JSON response
function formatOrder($row, $items = []) {
    return [
        'orderId'       => $row['order_id'],
        'date'          => $row['ordered_at'],
        'shipping'      => [
            'name'      => $row['customer_name'],
            'phone'     => $row['customer_phone'],
            'email'     => $row['customer_email'] ?? '',
            'address'   => $row['shipping_address'],
            'province'  => $row['shipping_province'],
            'zipcode'   => $row['shipping_zipcode'],
            'note'      => $row['shipping_note'] ?? '',
        ],
        'paymentMethod'  => $row['payment_method'],
        'subtotal'       => (float)$row['subtotal'],
        'shippingCost'   => (float)$row['shipping_cost'],
        'total'          => (float)$row['total'],
        'status'         => $row['status'],
        'trackingNumber' => $row['tracking_number'],
        'carrier'        => $row['carrier'],
        'statusNote'     => $row['status_note'],
        'shippedAt'      => $row['shipped_at'],
        'deliveredAt'    => $row['delivered_at'],
        'cancelledAt'    => $row['cancelled_at'],
        'items'          => array_map(function($item) {
            return [
                'id'    => (int)$item['product_id'],
                'name'  => $item['product_name'],
                'image' => $item['product_image'],
                'price' => (float)$item['price'],
                'qty'   => (int)$item['quantity'],
            ];
        }, $items),
    ];
}

// GET items for a given order_id
function getOrderItems($db, $orderId) {
    $stmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $stmt->execute([$orderId]);
    return $stmt->fetchAll();
}

switch ($method) {

    // ========== GET ==========
    case 'GET':
        $db = getDB();

        if (isset($_GET['id']) && !empty($_GET['id'])) {
            // Single order
            $orderId = normalizeOrderId($_GET['id']);
            $stmt = $db->prepare("SELECT * FROM orders WHERE order_id = ?");
            $stmt->execute([$orderId]);
            $row = $stmt->fetch();

            if (!$row) {
                jsonResponse(['success' => false, 'error' => 'Order not found'], 404);
            }

            $items = getOrderItems($db, $row['order_id']);
            jsonResponse(['success' => true, 'data' => formatOrder($row, $items)]);
        } else {
            // All orders (newest first)
            $stmt = $db->query("SELECT * FROM orders ORDER BY ordered_at DESC");
            $rows = $stmt->fetchAll();

            $result = [];
            foreach ($rows as $row) {
                $items = getOrderItems($db, $row['order_id']);
                $result[] = formatOrder($row, $items);
            }

            jsonResponse(['success' => true, 'data' => $result]);
        }
        break;

    // ========== POST — Create New Order ==========
    case 'POST':
        $db = getDB();
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
        }

        // Generate order_id if not provided
        $orderId = $input['order_id'] ?? ('#AG-' . rand(100000, 999999));

        // Normalize
        $orderId = normalizeOrderId($orderId);

        try {
            $db->beginTransaction();

            // Insert order
            $stmt = $db->prepare("INSERT INTO orders 
                (order_id, customer_name, customer_phone, customer_email, 
                 shipping_address, shipping_province, shipping_zipcode, shipping_note,
                 payment_method, subtotal, shipping_cost, total, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $orderId,
                $input['customer_name'] ?? '',
                $input['customer_phone'] ?? null,
                $input['customer_email'] ?? null,
                $input['shipping_address'] ?? null,
                $input['shipping_province'] ?? null,
                $input['shipping_zipcode'] ?? null,
                $input['shipping_note'] ?? null,
                $input['payment_method'] ?? null,
                $input['subtotal'] ?? 0,
                $input['shipping_cost'] ?? 0,
                $input['total'] ?? 0,
                $input['status'] ?? 'processing',
            ]);

            // Insert items
            if (!empty($input['items']) && is_array($input['items'])) {
                $itemStmt = $db->prepare("INSERT INTO order_items 
                    (order_id, product_id, product_name, product_image, price, quantity) 
                    VALUES (?, ?, ?, ?, ?, ?)");

                foreach ($input['items'] as $item) {
                    $itemStmt->execute([
                        $orderId,
                        $item['id'] ?? null,
                        $item['name'] ?? '',
                        $item['image'] ?? null,
                        $item['price'] ?? 0,
                        $item['qty'] ?? 1,
                    ]);
                }
            }

            $db->commit();

            // Return created order
            $stmt = $db->prepare("SELECT * FROM orders WHERE order_id = ?");
            $stmt->execute([$orderId]);
            $row = $stmt->fetch();
            $items = getOrderItems($db, $orderId);

            jsonResponse(['success' => true, 'data' => formatOrder($row, $items)], 201);

        } catch (Exception $e) {
            $db->rollBack();
            jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
        break;

    // ========== PUT — Update Order Status ==========
    case 'PUT':
        $db = getDB();

        if (!isset($_GET['id']) || empty($_GET['id'])) {
            jsonResponse(['success' => false, 'error' => 'Order ID required'], 400);
        }

        $orderId = normalizeOrderId($_GET['id']);
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
        }

        // Check order exists
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonResponse(['success' => false, 'error' => 'Order not found'], 404);
        }

        // Build dynamic UPDATE
        $updates = [];
        $params = [];

        $allowedFields = [
            'status', 'tracking_number', 'carrier', 'status_note',
            'customer_name', 'customer_phone', 'customer_email',
            'shipping_address', 'shipping_province', 'shipping_zipcode',
            'payment_method', 'subtotal', 'shipping_cost', 'total'
        ];

        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }

        // Auto-set timestamp fields based on status change
        if (isset($input['status'])) {
            $newStatus = $input['status'];
            if ($newStatus === 'shipping' && empty($existing['shipped_at'])) {
                $updates[] = "shipped_at = NOW()";
            }
            if ($newStatus === 'delivered' && empty($existing['delivered_at'])) {
                $updates[] = "delivered_at = NOW()";
                if (empty($existing['shipped_at'])) {
                    $updates[] = "shipped_at = NOW()";
                }
            }
            if ($newStatus === 'cancelled' && empty($existing['cancelled_at'])) {
                $updates[] = "cancelled_at = NOW()";
            }
        }

        if (empty($updates)) {
            jsonResponse(['success' => false, 'error' => 'No fields to update'], 400);
        }

        $params[] = $orderId;
        $sql = "UPDATE orders SET " . implode(', ', $updates) . " WHERE order_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        // Return updated order
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $row = $stmt->fetch();
        $items = getOrderItems($db, $orderId);

        jsonResponse(['success' => true, 'data' => formatOrder($row, $items)]);
        break;

    // ========== DELETE ==========
    case 'DELETE':
        $db = getDB();

        if (!isset($_GET['id']) || empty($_GET['id'])) {
            jsonResponse(['success' => false, 'error' => 'Order ID required'], 400);
        }

        $orderId = normalizeOrderId($_GET['id']);

        $stmt = $db->prepare("SELECT id FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        if (!$stmt->fetch()) {
            jsonResponse(['success' => false, 'error' => 'Order not found'], 404);
        }

        // order_items deleted by CASCADE
        $stmt = $db->prepare("DELETE FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);

        jsonResponse(['success' => true, 'message' => 'Order deleted']);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>
