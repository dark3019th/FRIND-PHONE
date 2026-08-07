<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function getUserIdFromInput($input) {
    $userId = null;
    if (isset($_GET['user_id'])) {
        $userId = intval($_GET['user_id']);
    } elseif (isset($input['user_id'])) {
        $userId = intval($input['user_id']);
    }
    return $userId;
}

function readList($db, $userId, $table, $column) {
    $stmt = $db->prepare("SELECT $column FROM $table WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

switch ($method) {
    case 'GET':
        $db = getDB();
        $input = [];
        $type = $_GET['type'] ?? null;
        $userId = getUserIdFromInput($input);

        if (!$type || !$userId) {
            jsonResponse(['success' => false, 'error' => 'type and user_id are required'], 400);
        }

        if ($type === 'wishlist') {
            jsonResponse(['success' => true, 'data' => readList($db, $userId, 'wishlist_items', 'product_id')]);
        }

        if ($type === 'compare') {
            jsonResponse(['success' => true, 'data' => readList($db, $userId, 'compare_items', 'product_id')]);
        }

        if ($type === 'cart') {
            $stmt = $db->prepare('SELECT product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY updated_at DESC');
            $stmt->execute([$userId]);
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
        }

        if ($type === 'addresses') {
            $stmt = $db->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
            $stmt->execute([$userId]);
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
        }

        jsonResponse(['success' => false, 'error' => 'Unsupported type'], 400);
        break;

    case 'POST':
        $db = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        $type = $input['type'] ?? null;
        $userId = getUserIdFromInput($input);

        if (!$type || !$userId) {
            jsonResponse(['success' => false, 'error' => 'type and user_id are required'], 400);
        }

        if ($type === 'wishlist') {
            $productId = intval($input['product_id'] ?? 0);
            if (!$productId) {
                jsonResponse(['success' => false, 'error' => 'product_id is required'], 400);
            }
            $action = $input['action'] ?? 'add';
            if ($action === 'remove') {
                $stmt = $db->prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?');
                $stmt->execute([$userId, $productId]);
            } else {
                $stmt = $db->prepare('INSERT OR IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)');
                $stmt->execute([$userId, $productId]);
            }
            jsonResponse(['success' => true, 'data' => readList($db, $userId, 'wishlist_items', 'product_id')]);
        }

        if ($type === 'compare') {
            $productId = intval($input['product_id'] ?? 0);
            if (!$productId) {
                jsonResponse(['success' => false, 'error' => 'product_id is required'], 400);
            }
            $action = $input['action'] ?? 'add';
            if ($action === 'remove') {
                $stmt = $db->prepare('DELETE FROM compare_items WHERE user_id = ? AND product_id = ?');
                $stmt->execute([$userId, $productId]);
            } else {
                $stmt = $db->prepare('INSERT OR IGNORE INTO compare_items (user_id, product_id) VALUES (?, ?)');
                $stmt->execute([$userId, $productId]);
            }
            jsonResponse(['success' => true, 'data' => readList($db, $userId, 'compare_items', 'product_id')]);
        }

        if ($type === 'cart') {
            $productId = intval($input['product_id'] ?? 0);
            if (!$productId) {
                jsonResponse(['success' => false, 'error' => 'product_id is required'], 400);
            }
            $action = $input['action'] ?? 'add';
            $qty = max(1, intval($input['quantity'] ?? 1));
            if ($action === 'remove') {
                $stmt = $db->prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?');
                $stmt->execute([$userId, $productId]);
            } else {
                $stmt = $db->prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + excluded.quantity');
                $stmt->execute([$userId, $productId, $qty]);
            }
            $stmt = $db->prepare('SELECT product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY updated_at DESC');
            $stmt->execute([$userId]);
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
        }

        if ($type === 'addresses') {
            $addresses = $input['addresses'] ?? null;
            if (!$addresses && isset($input['address'])) {
                $addresses = [$input['address']];
            }
            if (!is_array($addresses)) {
                jsonResponse(['success' => false, 'error' => 'address payload is required'], 400);
            }

            $db->prepare('DELETE FROM addresses WHERE user_id = ?')->execute([$userId]);

            foreach ($addresses as $index => $addr) {
                if (!is_array($addr)) {
                    continue;
                }
                $stmt = $db->prepare('INSERT INTO addresses (user_id, label, name, phone, address, province, zipcode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $userId,
                    $addr['label'] ?? '',
                    $addr['name'] ?? '',
                    $addr['phone'] ?? '',
                    $addr['address'] ?? '',
                    $addr['province'] ?? '',
                    $addr['zipcode'] ?? '',
                    (!empty($addr['isDefault']) || $index === 0) ? 1 : 0
                ]);
            }

            $stmt = $db->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
            $stmt->execute([$userId]);
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
        }

        jsonResponse(['success' => false, 'error' => 'Unsupported type'], 400);
        break;

    case 'DELETE':
        $db = getDB();
        $type = $_GET['type'] ?? null;
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        if (!$type || !$userId) {
            jsonResponse(['success' => false, 'error' => 'type and user_id are required'], 400);
        }

        if ($type === 'addresses' && $id) {
            $stmt = $db->prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);
            jsonResponse(['success' => true, 'message' => 'Address deleted']);
        }

        jsonResponse(['success' => false, 'error' => 'Unsupported delete action'], 400);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
