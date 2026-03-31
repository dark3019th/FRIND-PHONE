-- =============================================
-- Frind Phone — Product Database Schema
-- =============================================

CREATE TABLE `product` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `specs` TEXT DEFAULT NULL,
  `original_price` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `badge` ENUM('sale', 'hot', 'new') DEFAULT NULL,
  `views` INT DEFAULT 0,
  `sold` INT DEFAULT 0,
  `image` VARCHAR(500) DEFAULT NULL,
  `installment` VARCHAR(100) DEFAULT NULL,
  `in_stock` BOOLEAN DEFAULT TRUE,
  `specifications` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insert sample product data
-- =============================================

INSERT INTO `product` (`id`, `name`, `brand`, `category`, `specs`, `original_price`, `price`, `badge`, `views`, `sold`, `image`, `installment`, `in_stock`, `specifications`) VALUES

(1, 'NOTEBOOK ASUS ROG Strix G16 G614JU', 'ASUS', 'notebook',
 'Intel Core i7-13650HX / RTX 4050 / 16GB DDR5 / 512GB SSD / 16" FHD+ 165Hz',
 45990.00, 38990.00, 'sale', 2548, 89,
 'https://placehold.co/300x250/f5f5f5/333?text=ROG+Strix+G16',
 'ผ่อน 0% x10 เดือน', TRUE,
 '{"โปรเซสเซอร์":"Intel Core i7-13650HX (14 Cores, 20 Threads, up to 4.9 GHz)","จอแสดงผล":"16\\" FHD+ (1920x1200) IPS 165Hz","การ์ดจอ":"NVIDIA GeForce RTX 4050 6GB GDDR6","แรม":"16GB DDR5 4800MHz (2x8GB)","ที่เก็บข้อมูล":"512GB PCIe 4.0 NVMe SSD","ระบบปฏิบัติการ":"Windows 11 Home","แบตเตอรี่":"90WHrs, 4-Cell","น้ำหนัก":"2.5 kg"}'),

(2, 'COMPUTER SET JIB MARU-26003R RYZEN 7 / RTX 5060', 'JIB', 'desktop',
 'AMD Ryzen 7 9800X3D / RTX 5060 8GB / 32GB DDR5 / 1TB NVMe',
 59900.00, 55500.00, 'hot', 3156, 145,
 'https://placehold.co/300x250/f5f5f5/333?text=PC+SET+RTX5060',
 'ผ่อน 0% x10 เดือน', TRUE,
 '{"โปรเซสเซอร์":"AMD Ryzen 7 9800X3D","การ์ดจอ":"GeForce RTX 5060 8GB GDDR7","แรม":"32GB DDR5 6000MHz","ที่เก็บข้อมูล":"1TB PCIe 4.0 NVMe SSD","เมนบอร์ด":"B650M","เพาเวอร์ซัพพลาย":"750W 80+ Gold","เคส":"ATX Tempered Glass RGB","ระบายความร้อน":"Tower Air Cooler"}'),

(3, 'NOTEBOOK MSI Thin 15 B13UC', 'MSI', 'notebook',
 'Intel Core i5-13420H / RTX 3050 / 16GB / 512GB SSD / 15.6" FHD 144Hz',
 32990.00, 28990.00, 'sale', 1850, 67,
 'https://placehold.co/300x250/f5f5f5/333?text=MSI+Thin+15',
 'ผ่อน 0% x6 เดือน', TRUE,
 '{"โปรเซสเซอร์":"Intel Core i5-13420H","จอแสดงผล":"15.6\\" FHD (1920x1080) IPS 144Hz","การ์ดจอ":"NVIDIA GeForce RTX 3050 4GB","แรม":"16GB DDR4 3200MHz","ที่เก็บข้อมูล":"512GB NVMe SSD","ระบบปฏิบัติการ":"Windows 11 Home","น้ำหนัก":"1.86 kg"}'),

(4, 'Monitor Acer Nitro XV272U V3 27" IPS 2K 180Hz', 'Acer', 'monitor',
 '27 inch IPS / 2560x1440 QHD / 180Hz / 1ms / HDR400 / FreeSync Premium',
 8990.00, 6950.00, 'sale', 4210, 198,
 'https://placehold.co/300x250/f5f5f5/333?text=Acer+Nitro+27',
 'ผ่อน 0% x3 เดือน', TRUE,
 '{"ขนาดจอ":"27 นิ้ว","ความละเอียด":"2560 x 1440 (QHD)","ประเภทแผง":"IPS","อัตรารีเฟรช":"180Hz","เวลาตอบสนอง":"1ms (VRB)","HDR":"DisplayHDR 400","พอร์ต":"HDMI 2.0 x2, DP 1.4 x1","Adaptive Sync":"AMD FreeSync Premium"}'),

(5, 'Apple iPhone 16 Pro Max 256GB', 'Apple', 'phone',
 'A18 Pro / 6.9" Super Retina XDR / 48MP Camera / 256GB / Titanium',
 52900.00, 49900.00, 'new', 8976, 342,
 'https://placehold.co/300x250/f5f5f5/333?text=iPhone+16+Pro',
 'ผ่อน 0% x10 เดือน', TRUE,
 '{"ชิป":"A18 Pro","จอแสดงผล":"6.9\\" Super Retina XDR OLED","กล้อง":"48MP Main + 12MP Ultra Wide + 12MP Telephoto 5x","ความจุ":"256GB","แบตเตอรี่":"4685 mAh","วัสดุ":"Titanium Frame","กันน้ำ":"IP68","ระบบปฏิบัติการ":"iOS 18"}'),

(6, 'ROUTER ASUS RT-AX88U Pro WiFi 6', 'ASUS', 'network',
 'WiFi 6 AX6000 / Dual Band / AiMesh Support / Game Boost / AiProtection Pro',
 8990.00, 7490.00, 'sale', 1523, 45,
 'https://placehold.co/300x250/f5f5f5/333?text=ASUS+RT-AX88U',
 NULL, TRUE,
 '{"มาตรฐาน WiFi":"WiFi 6 (802.11ax)","ความเร็ว":"AX6000 (Dual Band)","พอร์ต LAN":"8 x Gigabit","พอร์ต WAN":"1 x 2.5G","USB":"1 x USB 3.2 Gen 1","ฟีเจอร์":"AiMesh, Game Boost, AiProtection Pro"}'),

(7, 'INKJET PRINTER Canon PIXMA G7070', 'Canon', 'printer',
 'Print/Scan/Copy/Fax / WiFi / Duplex Print / Ink Tank System',
 5990.00, 4990.00, NULL, 876, 34,
 'https://placehold.co/300x250/f5f5f5/333?text=Canon+G7070',
 NULL, TRUE,
 '{"ประเภท":"Inkjet Printer (Ink Tank System)","ฟังก์ชั่น":"Print / Scan / Copy / Fax","ความเร็วพิมพ์":"13 ipm (B/W), 6.8 ipm (Color)","การเชื่อมต่อ":"USB, WiFi, Ethernet","พิมพ์สองหน้า":"Auto Duplex","รองรับกระดาษ":"A4, Legal, Letter, Envelope"}'),

(8, 'KEYBOARD SteelSeries Apex 9 Mini', 'SteelSeries', 'gaming',
 'OptiPoint Optical Switch / 60% Layout / Per-Key RGB / Detachable USB-C',
 5490.00, 4790.00, 'hot', 3476, 156,
 'https://placehold.co/300x250/f5f5f5/333?text=Apex+9+Mini',
 NULL, TRUE,
 '{"สวิตช์":"OptiPoint Optical (Adjustable)","เลย์เอาท์":"60% Compact","ไฟ":"Per-Key RGB (16.8M สี)","เชื่อมต่อ":"USB-C (Detachable)","Anti-Ghosting":"Full N-Key Rollover","วัสดุ":"Aircraft-Grade Aluminum Alloy"}'),

(9, 'VGA GALAX GeForce RTX 5070 Ti CLICK 1-OC', 'GALAX', 'hardware',
 '12GB GDDR7 / Boost Clock 2617 MHz / PCIe 5.0 / DLSS 4',
 29900.00, 27900.00, 'new', 6789, 78,
 'https://placehold.co/300x250/f5f5f5/333?text=RTX+5070+Ti',
 'ผ่อน 0% x10 เดือน', TRUE,
 '{"GPU":"NVIDIA GeForce RTX 5070 Ti","หน่วยความจำ":"12GB GDDR7","Bus":"192-bit","Boost Clock":"2617 MHz","พอร์ตแสดงผล":"HDMI 2.1 x1, DP 2.1 x3","เทคโนโลยี":"DLSS 4, Ray Tracing","TDP":"300W","พอร์ตไฟ":"1 x 16-pin"}'),

(10, 'RAM (แรม) 16GB DDR5 6000MHz CL30 ADATA XPG', 'ADATA', 'hardware',
 '16GB (2x8GB) DDR5 6000MHz CL30 / RGB / Intel XMP 3.0',
 2990.00, 2490.00, 'sale', 5210, 312,
 'https://placehold.co/300x250/f5f5f5/333?text=XPG+DDR5+16GB',
 NULL, TRUE,
 '{"ประเภท":"DDR5","ความจุ":"16GB (2x8GB)","ความเร็ว":"6000MHz","CAS Latency":"CL30","แรงดัน":"1.35V","ฟีเจอร์":"RGB, Intel XMP 3.0"}'),

(11, 'SSD 1TB NVMe Kingston NV3 PCIe 4x4', 'Kingston', 'hardware',
 '1TB M.2 2280 NVMe / PCIe Gen 4x4 / Read 6000 MB/s / Write 4000 MB/s',
 2590.00, 1890.00, 'sale', 4320, 456,
 'https://placehold.co/300x250/f5f5f5/333?text=Kingston+NV3',
 NULL, TRUE,
 '{"ความจุ":"1TB","ฟอร์มแฟคเตอร์":"M.2 2280","ประเภท":"NVMe PCIe Gen 4x4","อ่าน":"6,000 MB/s","เขียน":"4,000 MB/s","TBW":"800 TBW"}'),

(12, 'UPS SYNDOME ECO II-1000 LED 1000VA/630W', 'SYNDOME', 'ups',
 '1000VA / 630W / Line Interactive / 4 Outlets / Auto Voltage Regulation',
 2990.00, 2590.00, NULL, 1890, 87,
 'https://placehold.co/300x250/f5f5f5/333?text=UPS+1000VA',
 NULL, TRUE,
 '{"กำลังไฟ":"1000VA / 630W","ประเภท":"Line Interactive","เต้ารับ":"4 Universal Outlets","Surge Protection":"Yes","AVR":"Auto Voltage Regulation","แบตเตอรี่":"12V 7Ah"}'),

(13, 'PRINTER EPSON EcoTank L3250 All-in-One', 'Epson', 'printer',
 'Print/Scan/Copy / WiFi / Ink Tank / ลดต้นทุน',
 4990.00, 4290.00, 'sale', 3210, 234,
 'https://placehold.co/300x250/f5f5f5/333?text=Epson+L3250',
 NULL, TRUE,
 '{"ประเภท":"Inkjet Printer (EcoTank)","ฟังก์ชั่น":"Print / Scan / Copy","ความเร็วพิมพ์":"10.5 ipm (B/W), 5.0 ipm (Color)","การเชื่อมต่อ":"USB, WiFi, WiFi Direct","ต้นทุนต่อหน้า":"~0.07 บาท (B/W)"}'),

(14, 'SPEAKER Creative Pebble 2.0 USB', 'Creative', 'audio',
 '2.0 Channel / USB Power / 4.4W RMS / Far-Field Drivers',
 890.00, 690.00, NULL, 2340, 567,
 'https://placehold.co/300x250/f5f5f5/333?text=Creative+Pebble',
 NULL, TRUE,
 '{"ประเภท":"2.0 Desktop Speakers","กำลังขับ":"4.4W RMS","ไดรเวอร์":"2\\" Far-Field Drivers","เชื่อมต่อ":"USB Power + 3.5mm Audio","วัสดุ":"ABS Matte Black"}'),

(15, 'POWER SUPPLY Gamdias AURA GP550 550W 80+ Bronze', 'Gamdias', 'hardware',
 '550W / 80+ Bronze / Active PFC / 120mm Fan / Non-Modular',
 1290.00, 990.00, 'sale', 1560, 189,
 'https://placehold.co/300x250/f5f5f5/333?text=PSU+550W',
 NULL, TRUE,
 '{"กำลังไฟ":"550W","มาตรฐาน":"80 PLUS Bronze","ประเภท":"Non-Modular","พัดลม":"120mm Hydraulic Bearing","สายไฟ GPU":"1 x 6+2 pin","PFC":"Active PFC"}'),

(16, 'MOUSE Logitech G Pro X Superlight 2', 'Logitech', 'gaming',
 'HERO 2 Sensor 44K DPI / 63g / LIGHTSPEED Wireless / 95 Hours Battery',
 4690.00, 3990.00, 'hot', 5678, 234,
 'https://placehold.co/300x250/f5f5f5/333?text=GPro+X2',
 NULL, TRUE,
 '{"เซ็นเซอร์":"HERO 2 (25,600 DPI, up to 44K via software)","น้ำหนัก":"63g","เชื่อมต่อ":"LIGHTSPEED Wireless / USB-C","แบตเตอรี่":"95 ชั่วโมง","สวิตช์":"LIGHTFORCE Hybrid","Polling Rate":"2000Hz (via firmware)"}');
