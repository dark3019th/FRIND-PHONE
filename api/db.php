<?php
// =============================================
// Frind Phone — Database Connection
// =============================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$databasePath = __DIR__ . '/frind_phone.sqlite';

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'sqlite:' . __DIR__ . '/frind_phone.sqlite';
            $pdo = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
            $pdo->exec('PRAGMA foreign_keys = ON');
            initializeSchema($pdo);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

function initializeSchema($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            category TEXT NOT NULL,
            specs TEXT,
            original_price REAL NOT NULL,
            price REAL NOT NULL,
            badge TEXT,
            views INTEGER DEFAULT 0,
            sold INTEGER DEFAULT 0,
            image TEXT,
            installment TEXT,
            in_stock INTEGER DEFAULT 1,
            specifications TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            date_of_birth TEXT,
            gender TEXT,
            role TEXT DEFAULT 'user',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS wishlist_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS compare_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            label TEXT,
            name TEXT,
            phone TEXT,
            address TEXT,
            province TEXT,
            zipcode TEXT,
            is_default INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");

    $count = $pdo->query('SELECT COUNT(*) as c FROM product')->fetchColumn();
    if ((int) $count === 0) {
        $seedProducts = [
            [1, 'NOTEBOOK ASUS ROG Strix G16 G614JU', 'ASUS', 'notebook', 'Intel Core i7-13650HX / RTX 4050 / 16GB DDR5 / 512GB SSD / 16" FHD+ 165Hz', 45990.00, 38990.00, 'sale', 2548, 89, 'https://placehold.co/300x250/f5f5f5/333?text=ROG+Strix+G16', 'ผ่อน 0% x10 เดือน', 1, '{"โปรเซสเซอร์":"Intel Core i7-13650HX (14 Cores, 20 Threads, up to 4.9 GHz)","จอแสดงผล":"16\\" FHD+ (1920x1200) IPS 165Hz","การ์ดจอ":"NVIDIA GeForce RTX 4050 6GB GDDR6","แรม":"16GB DDR5 4800MHz (2x8GB)","ที่เก็บข้อมูล":"512GB PCIe 4.0 NVMe SSD","ระบบปฏิบัติการ":"Windows 11 Home","แบตเตอรี่":"90WHrs, 4-Cell","น้ำหนัก":"2.5 kg"}'],
            [2, 'COMPUTER SET JIB MARU-26003R RYZEN 7 / RTX 5060', 'JIB', 'desktop', 'AMD Ryzen 7 9800X3D / RTX 5060 8GB / 32GB DDR5 / 1TB NVMe', 59900.00, 55500.00, 'hot', 3156, 145, 'https://placehold.co/300x250/f5f5f5/333?text=PC+SET+RTX5060', 'ผ่อน 0% x10 เดือน', 1, '{"โปรเซสเซอร์":"AMD Ryzen 7 9800X3D","การ์ดจอ":"GeForce RTX 5060 8GB GDDR7","แรม":"32GB DDR5 6000MHz","ที่เก็บข้อมูล":"1TB PCIe 4.0 NVMe SSD","เมนบอร์ด":"B650M","เพาเวอร์ซัพพลาย":"750W 80+ Gold","เคส":"ATX Tempered Glass RGB","ระบายความร้อน":"Tower Air Cooler"}'],
            [3, 'NOTEBOOK MSI Thin 15 B13UC', 'MSI', 'notebook', 'Intel Core i5-13420H / RTX 3050 / 16GB / 512GB SSD / 15.6" FHD 144Hz', 32990.00, 28990.00, 'sale', 1850, 67, 'https://placehold.co/300x250/f5f5f5/333?text=MSI+Thin+15', 'ผ่อน 0% x6 เดือน', 1, '{"โปรเซสเซอร์":"Intel Core i5-13420H","จอแสดงผล":"15.6\\" FHD (1920x1080) IPS 144Hz","การ์ดจอ":"NVIDIA GeForce RTX 3050 4GB","แรม":"16GB DDR4 3200MHz","ที่เก็บข้อมูล":"512GB NVMe SSD","ระบบปฏิบัติการ":"Windows 11 Home","น้ำหนัก":"1.86 kg"}'],
            [4, 'Monitor Acer Nitro XV272U V3 27" IPS 2K 180Hz', 'Acer', 'monitor', '27 inch IPS / 2560x1440 QHD / 180Hz / 1ms / HDR400 / FreeSync Premium', 8990.00, 6950.00, 'sale', 4210, 198, 'https://placehold.co/300x250/f5f5f5/333?text=Acer+Nitro+27', 'ผ่อน 0% x3 เดือน', 1, '{"ขนาดจอ":"27 นิ้ว","ความละเอียด":"2560 x 1440 (QHD)","ประเภทแผง":"IPS","อัตรารีเฟรช":"180Hz","เวลาตอบสนอง":"1ms (VRB)","HDR":"DisplayHDR 400","พอร์ต":"HDMI 2.0 x2, DP 1.4 x1","Adaptive Sync":"AMD FreeSync Premium"}'],
            [5, 'Apple iPhone 16 Pro Max 256GB', 'Apple', 'phone', 'A18 Pro / 6.9" Super Retina XDR / 48MP Camera / 256GB / Titanium', 52900.00, 49900.00, 'new', 8976, 342, 'https://placehold.co/300x250/f5f5f5/333?text=iPhone+16+Pro', 'ผ่อน 0% x10 เดือน', 1, '{"ชิป":"A18 Pro","จอแสดงผล":"6.9\\" Super Retina XDR OLED","กล้อง":"48MP Main + 12MP Ultra Wide + 12MP Telephoto 5x","ความจุ":"256GB","แบตเตอรี่":"4685 mAh","วัสดุ":"Titanium Frame","กันน้ำ":"IP68","ระบบปฏิบัติการ":"iOS 18"}']
        ];

        $stmt = $pdo->prepare('INSERT INTO product (id, name, brand, category, specs, original_price, price, badge, views, sold, image, installment, in_stock, specifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($seedProducts as $row) {
            $stmt->execute($row);
        }
    }

    $userCount = $pdo->query('SELECT COUNT(*) as c FROM users')->fetchColumn();
    if ((int) $userCount === 0) {
        $pdo->exec("INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, gender, role) VALUES ('admin@frindphone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Admin', '021234567', '1990-01-01', 'male', 'admin')");
        $pdo->exec("INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, gender, role) VALUES ('demo@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'User', '0891234567', '1995-05-15', 'male', 'user')");
    }
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
?>
