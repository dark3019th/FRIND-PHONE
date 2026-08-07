<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function formatUser($row) {
    if (!$row) return null;
    return [
        'id' => (int) $row['id'],
        'firstName' => $row['first_name'],
        'lastName' => $row['last_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'dob' => $row['date_of_birth'],
        'gender' => $row['gender'],
        'role' => $row['role'],
        'createdAt' => $row['created_at'],
    ];
}

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
        }

        $mode = $input['mode'] ?? 'register';
        $db = getDB();

        if ($mode === 'login') {
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            if (!$email || !$password) {
                jsonResponse(['success' => false, 'error' => 'Email and password are required'], 400);
            }

            $stmt = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $row = $stmt->fetch();

            if (!$row || !password_verify($password, $row['password'])) {
                jsonResponse(['success' => false, 'error' => 'Email or password is incorrect'], 401);
            }

            jsonResponse(['success' => true, 'data' => formatUser($row)]);
            break;
        }

        $firstName = trim($input['firstName'] ?? '');
        $lastName = trim($input['lastName'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$firstName || !$lastName || !$email || strlen($password) < 8) {
            jsonResponse(['success' => false, 'error' => 'Please provide a valid first name, last name, email, and password (8+ characters)'], 400);
        }

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            jsonResponse(['success' => false, 'error' => 'Email is already registered'], 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare('INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, gender, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $email,
            $hash,
            $firstName,
            $lastName,
            $input['phone'] ?? null,
            $input['dob'] ?? null,
            $input['gender'] ?? null,
            'user'
        ]);

        $id = $db->lastInsertId();
        $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        jsonResponse(['success' => true, 'data' => formatUser($row)], 201);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
        }

        $db = getDB();
        $userId = $input['id'] ?? null;
        if (!$userId) {
            jsonResponse(['success' => false, 'error' => 'User id is required'], 400);
        }

        $allowed = ['first_name' => $input['firstName'] ?? null, 'last_name' => $input['lastName'] ?? null, 'phone' => $input['phone'] ?? null, 'date_of_birth' => $input['dob'] ?? null, 'gender' => $input['gender'] ?? null, 'email' => $input['email'] ?? null];
        $changes = [];
        $values = [];
        foreach ($allowed as $field => $value) {
            if ($value !== null && $value !== '') {
                $changes[] = "$field = ?";
                $values[] = $value;
            }
        }

        if (empty($changes)) {
            jsonResponse(['success' => false, 'error' => 'No profile changes provided'], 400);
        }

        $values[] = $userId;
        $stmt = $db->prepare('UPDATE users SET ' . implode(', ', $changes) . ' WHERE id = ?');
        $stmt->execute($values);

        $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        jsonResponse(['success' => true, 'data' => formatUser($row)]);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
