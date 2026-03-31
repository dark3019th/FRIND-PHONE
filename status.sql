-- =============================================
-- Frind Phone — Order Status Database
-- =============================================

-- ตาราง orders: เก็บคำสั่งซื้อหลัก
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'รหัสคำสั่งซื้อ เช่น #AG-123456',
  `customer_name` VARCHAR(200) NOT NULL COMMENT 'ชื่อผู้สั่งซื้อ',
  `customer_phone` VARCHAR(20) DEFAULT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `shipping_address` TEXT DEFAULT NULL,
  `shipping_province` VARCHAR(100) DEFAULT NULL,
  `shipping_zipcode` VARCHAR(10) DEFAULT NULL,
  `shipping_note` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(100) DEFAULT NULL COMMENT 'วิธีชำระเงิน',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `shipping_cost` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` ENUM('processing', 'shipping', 'delivered', 'cancelled') NOT NULL DEFAULT 'processing' COMMENT 'สถานะการขนส่ง',
  `tracking_number` VARCHAR(100) DEFAULT NULL COMMENT 'เลขพัสดุ',
  `carrier` VARCHAR(100) DEFAULT NULL COMMENT 'บริษัทขนส่ง เช่น Kerry, Flash',
  `status_note` TEXT DEFAULT NULL COMMENT 'หมายเหตุสถานะ',
  `ordered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สั่งซื้อ',
  `shipped_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'วันที่จัดส่ง',
  `delivered_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'วันที่ลูกค้าได้รับ',
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'วันที่ยกเลิก',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง order_items: เก็บรายการสินค้าในแต่ละคำสั่งซื้อ
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(20) NOT NULL COMMENT 'FK → orders.order_id',
  `product_id` INT DEFAULT NULL COMMENT 'FK → product.id',
  `product_name` VARCHAR(500) NOT NULL,
  `product_image` VARCHAR(500) DEFAULT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `quantity` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ข้อมูลตัวอย่าง (Sample Data)
-- =============================================

INSERT INTO `orders` (`order_id`, `customer_name`, `customer_phone`, `customer_email`, `shipping_address`, `shipping_province`, `shipping_zipcode`, `payment_method`, `subtotal`, `shipping_cost`, `total`, `status`, `tracking_number`, `carrier`, `ordered_at`, `shipped_at`, `delivered_at`) VALUES
('#AG-100001', 'สมชาย ใจดี', '0891234567', 'somchai@email.com', '123 ซ.สุขุมวิท 71 แขวงพระโขนงเหนือ เขตวัฒนา', 'กรุงเทพมหานคร', '10110', 'บัตรเครดิต / เดบิต', 38990.00, 0.00, 38990.00, 'delivered', 'TH12345678901', 'Kerry Express', '2026-03-20 14:30:00', '2026-03-21 09:00:00', '2026-03-23 11:30:00'),
('#AG-100002', 'สมหญิง รักเรียน', '0812345678', 'somying@email.com', '456 หมู่บ้านพฤกษา ต.บางพลี', 'สมุทรปราการ', '10540', 'QR Code (พร้อมเพย์)', 55500.00, 0.00, 55500.00, 'shipping', 'FL99887766554', 'Flash Express', '2026-03-25 10:15:00', '2026-03-26 08:45:00', NULL),
('#AG-100003', 'วิชัย สุขสันต์', '0987654321', 'wichai@email.com', '789 ถ.มิตรภาพ ต.ในเมือง อ.เมือง', 'นครราชสีมา', '30000', 'Mobile Banking', 6950.00, 0.00, 6950.00, 'processing', NULL, NULL, '2026-03-28 16:20:00', NULL, NULL),
('#AG-100004', 'นิดา โอชา', '0801112233', 'nida@email.com', '321 ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง', 'เชียงใหม่', '50200', 'เก็บเงินปลายทาง (COD)', 4790.00, 50.00, 4840.00, 'processing', NULL, NULL, '2026-03-28 20:00:00', NULL, NULL),
('#AG-100005', 'อนันต์ ทองดี', '0899988877', 'anan@email.com', '55 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่', 'สงขลา', '90110', 'บัตรเครดิต / เดบิต', 49900.00, 0.00, 49900.00, 'cancelled', NULL, NULL, '2026-03-22 09:30:00', NULL, NULL);

INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `product_image`, `price`, `quantity`) VALUES
('#AG-100001', 1, 'NOTEBOOK ASUS ROG Strix G16 G614JU', 'https://placehold.co/300x250/f5f5f5/333?text=ROG+Strix+G16', 38990.00, 1),
('#AG-100002', 2, 'COMPUTER SET JIB MARU-26003R RYZEN 7 / RTX 5060', 'https://placehold.co/300x250/f5f5f5/333?text=PC+SET+RTX5060', 55500.00, 1),
('#AG-100003', 4, 'Monitor Acer Nitro XV272U V3 27" IPS 2K 180Hz', 'https://placehold.co/300x250/f5f5f5/333?text=Acer+Nitro+27', 6950.00, 1),
('#AG-100004', 8, 'KEYBOARD SteelSeries Apex 9 Mini', 'https://placehold.co/300x250/f5f5f5/333?text=Apex+9+Mini', 4790.00, 1),
('#AG-100005', 5, 'Apple iPhone 16 Pro Max 256GB', 'https://placehold.co/300x250/f5f5f5/333?text=iPhone+16+Pro', 49900.00, 1);
