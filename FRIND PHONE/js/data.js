// =============================================
// Frind Phone — Product Data Layer
// =============================================
// Connects to MySQL database via PHP API
// Falls back to localStorage / defaultProducts if API is unavailable

const API_BASE = 'api/product.php';

// Detect if we're in the admin folder and adjust API path
const isAdminPage = window.location.pathname.includes('/admin/');
const API_URL = isAdminPage ? '../' + API_BASE : API_BASE;

const defaultProducts = [
    {
        id: 1,
        name: "NOTEBOOK ASUS ROG Strix G16 G614JU",
        brand: "ASUS",
        category: "notebook",
        specs: "Intel Core i7-13650HX / RTX 4050 / 16GB DDR5 / 512GB SSD / 16\" FHD+ 165Hz",
        originalPrice: 45990,
        price: 38990,
        badge: "sale",
        views: 2548,
        sold: 89,
        image: "https://placehold.co/300x250/f5f5f5/333?text=ROG+Strix+G16",
        installment: "ผ่อน 0% x10 เดือน",
        inStock: true,
        specifications: {
            "โปรเซสเซอร์": "Intel Core i7-13650HX (14 Cores, 20 Threads, up to 4.9 GHz)",
            "จอแสดงผล": "16\" FHD+ (1920x1200) IPS 165Hz",
            "การ์ดจอ": "NVIDIA GeForce RTX 4050 6GB GDDR6",
            "แรม": "16GB DDR5 4800MHz (2x8GB)",
            "ที่เก็บข้อมูล": "512GB PCIe 4.0 NVMe SSD",
            "ระบบปฏิบัติการ": "Windows 11 Home",
            "แบตเตอรี่": "90WHrs, 4-Cell",
            "น้ำหนัก": "2.5 kg"
        }
    },
    {
        id: 2,
        name: "COMPUTER SET JIB MARU-26003R RYZEN 7 / RTX 5060",
        brand: "JIB",
        category: "desktop",
        specs: "AMD Ryzen 7 9800X3D / RTX 5060 8GB / 32GB DDR5 / 1TB NVMe",
        originalPrice: 59900,
        price: 55500,
        badge: "hot",
        views: 3156,
        sold: 145,
        image: "https://placehold.co/300x250/f5f5f5/333?text=PC+SET+RTX5060",
        installment: "ผ่อน 0% x10 เดือน",
        inStock: true,
        specifications: {
            "โปรเซสเซอร์": "AMD Ryzen 7 9800X3D",
            "การ์ดจอ": "GeForce RTX 5060 8GB GDDR7",
            "แรม": "32GB DDR5 6000MHz",
            "ที่เก็บข้อมูล": "1TB PCIe 4.0 NVMe SSD",
            "เมนบอร์ด": "B650M",
            "เพาเวอร์ซัพพลาย": "750W 80+ Gold",
            "เคส": "ATX Tempered Glass RGB",
            "ระบายความร้อน": "Tower Air Cooler"
        }
    },
    {
        id: 3,
        name: "NOTEBOOK MSI Thin 15 B13UC",
        brand: "MSI",
        category: "notebook",
        specs: "Intel Core i5-13420H / RTX 3050 / 16GB / 512GB SSD / 15.6\" FHD 144Hz",
        originalPrice: 32990,
        price: 28990,
        badge: "sale",
        views: 1850,
        sold: 67,
        image: "https://placehold.co/300x250/f5f5f5/333?text=MSI+Thin+15",
        installment: "ผ่อน 0% x6 เดือน",
        inStock: true,
        specifications: {
            "โปรเซสเซอร์": "Intel Core i5-13420H",
            "จอแสดงผล": "15.6\" FHD (1920x1080) IPS 144Hz",
            "การ์ดจอ": "NVIDIA GeForce RTX 3050 4GB",
            "แรม": "16GB DDR4 3200MHz",
            "ที่เก็บข้อมูล": "512GB NVMe SSD",
            "ระบบปฏิบัติการ": "Windows 11 Home",
            "น้ำหนัก": "1.86 kg"
        }
    },
    {
        id: 4,
        name: "Monitor Acer Nitro XV272U V3 27\" IPS 2K 180Hz",
        brand: "Acer",
        category: "monitor",
        specs: "27 inch IPS / 2560x1440 QHD / 180Hz / 1ms / HDR400 / FreeSync Premium",
        originalPrice: 8990,
        price: 6950,
        badge: "sale",
        views: 4210,
        sold: 198,
        image: "https://placehold.co/300x250/f5f5f5/333?text=Acer+Nitro+27",
        installment: "ผ่อน 0% x3 เดือน",
        inStock: true,
        specifications: {
            "ขนาดจอ": "27 นิ้ว",
            "ความละเอียด": "2560 x 1440 (QHD)",
            "ประเภทแผง": "IPS",
            "อัตรารีเฟรช": "180Hz",
            "เวลาตอบสนอง": "1ms (VRB)",
            "HDR": "DisplayHDR 400",
            "พอร์ต": "HDMI 2.0 x2, DP 1.4 x1",
            "Adaptive Sync": "AMD FreeSync Premium"
        }
    },
    {
        id: 5,
        name: "Apple iPhone 16 Pro Max 256GB",
        brand: "Apple",
        category: "phone",
        specs: "A18 Pro / 6.9\" Super Retina XDR / 48MP Camera / 256GB / Titanium",
        originalPrice: 52900,
        price: 49900,
        badge: "new",
        views: 8976,
        sold: 342,
        image: "https://placehold.co/300x250/f5f5f5/333?text=iPhone+16+Pro",
        installment: "ผ่อน 0% x10 เดือน",
        inStock: true,
        specifications: {
            "ชิป": "A18 Pro",
            "จอแสดงผล": "6.9\" Super Retina XDR OLED",
            "กล้อง": "48MP Main + 12MP Ultra Wide + 12MP Telephoto 5x",
            "ความจุ": "256GB",
            "แบตเตอรี่": "4685 mAh",
            "วัสดุ": "Titanium Frame",
            "กันน้ำ": "IP68",
            "ระบบปฏิบัติการ": "iOS 18"
        }
    },
    {
        id: 6,
        name: "ROUTER ASUS RT-AX88U Pro WiFi 6",
        brand: "ASUS",
        category: "network",
        specs: "WiFi 6 AX6000 / Dual Band / AiMesh Support / Game Boost / AiProtection Pro",
        originalPrice: 8990,
        price: 7490,
        badge: "sale",
        views: 1523,
        sold: 45,
        image: "https://placehold.co/300x250/f5f5f5/333?text=ASUS+RT-AX88U",
        installment: null,
        inStock: true,
        specifications: {
            "มาตรฐาน WiFi": "WiFi 6 (802.11ax)",
            "ความเร็ว": "AX6000 (Dual Band)",
            "พอร์ต LAN": "8 x Gigabit",
            "พอร์ต WAN": "1 x 2.5G",
            "USB": "1 x USB 3.2 Gen 1",
            "ฟีเจอร์": "AiMesh, Game Boost, AiProtection Pro"
        }
    },
    {
        id: 7,
        name: "INKJET PRINTER Canon PIXMA G7070",
        brand: "Canon",
        category: "printer",
        specs: "Print/Scan/Copy/Fax / WiFi / Duplex Print / Ink Tank System",
        originalPrice: 5990,
        price: 4990,
        badge: null,
        views: 876,
        sold: 34,
        image: "https://placehold.co/300x250/f5f5f5/333?text=Canon+G7070",
        installment: null,
        inStock: true,
        specifications: {
            "ประเภท": "Inkjet Printer (Ink Tank System)",
            "ฟังก์ชั่น": "Print / Scan / Copy / Fax",
            "ความเร็วพิมพ์": "13 ipm (B/W), 6.8 ipm (Color)",
            "การเชื่อมต่อ": "USB, WiFi, Ethernet",
            "พิมพ์สองหน้า": "Auto Duplex",
            "รองรับกระดาษ": "A4, Legal, Letter, Envelope"
        }
    },
    {
        id: 8,
        name: "KEYBOARD SteelSeries Apex 9 Mini",
        brand: "SteelSeries",
        category: "gaming",
        specs: "OptiPoint Optical Switch / 60% Layout / Per-Key RGB / Detachable USB-C",
        originalPrice: 5490,
        price: 4790,
        badge: "hot",
        views: 3476,
        sold: 156,
        image: "https://placehold.co/300x250/f5f5f5/333?text=Apex+9+Mini",
        installment: null,
        inStock: true,
        specifications: {
            "สวิตช์": "OptiPoint Optical (Adjustable)",
            "เลย์เอาท์": "60% Compact",
            "ไฟ": "Per-Key RGB (16.8M สี)",
            "เชื่อมต่อ": "USB-C (Detachable)",
            "Anti-Ghosting": "Full N-Key Rollover",
            "วัสดุ": "Aircraft-Grade Aluminum Alloy"
        }
    },
    {
        id: 9,
        name: "VGA GALAX GeForce RTX 5070 Ti CLICK 1-OC",
        brand: "GALAX",
        category: "hardware",
        specs: "12GB GDDR7 / Boost Clock 2617 MHz / PCIe 5.0 / DLSS 4",
        originalPrice: 29900,
        price: 27900,
        badge: "new",
        views: 6789,
        sold: 78,
        image: "https://placehold.co/300x250/f5f5f5/333?text=RTX+5070+Ti",
        installment: "ผ่อน 0% x10 เดือน",
        inStock: true,
        specifications: {
            "GPU": "NVIDIA GeForce RTX 5070 Ti",
            "หน่วยความจำ": "12GB GDDR7",
            "Bus": "192-bit",
            "Boost Clock": "2617 MHz",
            "พอร์ตแสดงผล": "HDMI 2.1 x1, DP 2.1 x3",
            "เทคโนโลยี": "DLSS 4, Ray Tracing",
            "TDP": "300W",
            "พอร์ตไฟ": "1 x 16-pin"
        }
    },
    {
        id: 10,
        name: "RAM (แรม) 16GB DDR5 6000MHz CL30 ADATA XPG",
        brand: "ADATA",
        category: "hardware",
        specs: "16GB (2x8GB) DDR5 6000MHz CL30 / RGB / Intel XMP 3.0",
        originalPrice: 2990,
        price: 2490,
        badge: "sale",
        views: 5210,
        sold: 312,
        image: "https://placehold.co/300x250/f5f5f5/333?text=XPG+DDR5+16GB",
        installment: null,
        inStock: true,
        specifications: {
            "ประเภท": "DDR5",
            "ความจุ": "16GB (2x8GB)",
            "ความเร็ว": "6000MHz",
            "CAS Latency": "CL30",
            "แรงดัน": "1.35V",
            "ฟีเจอร์": "RGB, Intel XMP 3.0"
        }
    },
    {
        id: 11,
        name: "SSD 1TB NVMe Kingston NV3 PCIe 4x4",
        brand: "Kingston",
        category: "hardware",
        specs: "1TB M.2 2280 NVMe / PCIe Gen 4x4 / Read 6000 MB/s / Write 4000 MB/s",
        originalPrice: 2590,
        price: 1890,
        badge: "sale",
        views: 4320,
        sold: 456,
        image: "https://placehold.co/300x250/f5f5f5/333?text=Kingston+NV3",
        installment: null,
        inStock: true,
        specifications: {
            "ความจุ": "1TB",
            "ฟอร์มแฟคเตอร์": "M.2 2280",
            "ประเภท": "NVMe PCIe Gen 4x4",
            "อ่าน": "6,000 MB/s",
            "เขียน": "4,000 MB/s",
            "TBW": "800 TBW"
        }
    },
    {
        id: 12,
        name: "UPS SYNDOME ECO II-1000 LED 1000VA/630W",
        brand: "SYNDOME",
        category: "ups",
        specs: "1000VA / 630W / Line Interactive / 4 Outlets / Auto Voltage Regulation",
        originalPrice: 2990,
        price: 2590,
        badge: null,
        views: 1890,
        sold: 87,
        image: "https://placehold.co/300x250/f5f5f5/333?text=UPS+1000VA",
        installment: null,
        inStock: true,
        specifications: {
            "กำลังไฟ": "1000VA / 630W",
            "ประเภท": "Line Interactive",
            "เต้ารับ": "4 Universal Outlets",
            "Surge Protection": "Yes",
            "AVR": "Auto Voltage Regulation",
            "แบตเตอรี่": "12V 7Ah"
        }
    },
    {
        id: 13,
        name: "PRINTER EPSON EcoTank L3250 All-in-One",
        brand: "Epson",
        category: "printer",
        specs: "Print/Scan/Copy / WiFi / Ink Tank / ลดต้นทุน",
        originalPrice: 4990,
        price: 4290,
        badge: "sale",
        views: 3210,
        sold: 234,
        image: "https://placehold.co/300x250/f5f5f5/333?text=Epson+L3250",
        installment: null,
        inStock: true,
        specifications: {
            "ประเภท": "Inkjet Printer (EcoTank)",
            "ฟังก์ชั่น": "Print / Scan / Copy",
            "ความเร็วพิมพ์": "10.5 ipm (B/W), 5.0 ipm (Color)",
            "การเชื่อมต่อ": "USB, WiFi, WiFi Direct",
            "ต้นทุนต่อหน้า": "~0.07 บาท (B/W)"
        }
    },
    {
        id: 14,
        name: "SPEAKER Creative Pebble 2.0 USB",
        brand: "Creative",
        category: "audio",
        specs: "2.0 Channel / USB Power / 4.4W RMS / Far-Field Drivers",
        originalPrice: 890,
        price: 690,
        badge: null,
        views: 2340,
        sold: 567,
        image: "https://placehold.co/300x250/f5f5f5/333?text=Creative+Pebble",
        installment: null,
        inStock: true,
        specifications: {
            "ประเภท": "2.0 Desktop Speakers",
            "กำลังขับ": "4.4W RMS",
            "ไดรเวอร์": "2\" Far-Field Drivers",
            "เชื่อมต่อ": "USB Power + 3.5mm Audio",
            "วัสดุ": "ABS Matte Black"
        }
    },
    {
        id: 15,
        name: "POWER SUPPLY Gamdias AURA GP550 550W 80+ Bronze",
        brand: "Gamdias",
        category: "hardware",
        specs: "550W / 80+ Bronze / Active PFC / 120mm Fan / Non-Modular",
        originalPrice: 1290,
        price: 990,
        badge: "sale",
        views: 1560,
        sold: 189,
        image: "https://placehold.co/300x250/f5f5f5/333?text=PSU+550W",
        installment: null,
        inStock: true,
        specifications: {
            "กำลังไฟ": "550W",
            "มาตรฐาน": "80 PLUS Bronze",
            "ประเภท": "Non-Modular",
            "พัดลม": "120mm Hydraulic Bearing",
            "สายไฟ GPU": "1 x 6+2 pin",
            "PFC": "Active PFC"
        }
    },
    {
        id: 16,
        name: "MOUSE Logitech G Pro X Superlight 2",
        brand: "Logitech",
        category: "gaming",
        specs: "HERO 2 Sensor 44K DPI / 63g / LIGHTSPEED Wireless / 95 Hours Battery",
        originalPrice: 4690,
        price: 3990,
        badge: "hot",
        views: 5678,
        sold: 234,
        image: "https://placehold.co/300x250/f5f5f5/333?text=GPro+X2",
        installment: null,
        inStock: true,
        specifications: {
            "เซ็นเซอร์": "HERO 2 (25,600 DPI, up to 44K via software)",
            "น้ำหนัก": "63g",
            "เชื่อมต่อ": "LIGHTSPEED Wireless / USB-C",
            "แบตเตอรี่": "95 ชั่วโมง",
            "สวิตช์": "LIGHTFORCE Hybrid",
            "Polling Rate": "2000Hz (via firmware)"
        }
    }
];

// ========== Product Data (loaded from API or fallback) ==========
let products = [];
let dataReady = false;
let dataReadyCallbacks = [];

// Function to notify when data is ready
function onDataReady(callback) {
    if (dataReady) {
        callback();
    } else {
        dataReadyCallbacks.push(callback);
    }
}

function notifyDataReady() {
    dataReady = true;
    dataReadyCallbacks.forEach(cb => cb());
    dataReadyCallbacks = [];
}

// ========== API Functions ==========

// Fetch all products from API
async function fetchProductsFromAPI() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return null;
    } catch (error) {
        console.warn('API unavailable, using fallback:', error.message);
        return null;
    }
}

// Add product via API
async function apiAddProduct(productData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: productData.name,
                brand: productData.brand,
                category: productData.category,
                specs: productData.specs,
                original_price: productData.originalPrice,
                price: productData.price,
                badge: productData.badge || null,
                views: productData.views || 0,
                sold: productData.sold || 0,
                image: productData.image,
                installment: productData.installment || null,
                in_stock: productData.inStock !== false,
                specifications: productData.specifications || {},
            })
        });
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        console.error('API add error:', result.error);
        return null;
    } catch (error) {
        console.warn('API add failed, using fallback:', error.message);
        return null;
    }
}

// Update product via API
async function apiUpdateProduct(id, productData) {
    try {
        const response = await fetch(API_URL + '?id=' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: productData.name,
                brand: productData.brand,
                category: productData.category,
                specs: productData.specs,
                original_price: productData.originalPrice,
                price: productData.price,
                badge: productData.badge || null,
                views: productData.views,
                sold: productData.sold,
                image: productData.image,
                installment: productData.installment || null,
                in_stock: productData.inStock !== false,
                specifications: productData.specifications || {},
            })
        });
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        console.error('API update error:', result.error);
        return null;
    } catch (error) {
        console.warn('API update failed, using fallback:', error.message);
        return null;
    }
}

// Delete product via API
async function apiDeleteProduct(id) {
    try {
        const response = await fetch(API_URL + '?id=' + id, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            return true;
        }
        console.error('API delete error:', result.error);
        return false;
    } catch (error) {
        console.warn('API delete failed, using fallback:', error.message);
        return false;
    }
}

// ========== Fallback: localStorage ==========
function saveProducts() {
    localStorage.setItem('ag_products', JSON.stringify(products));
}

// ========== Initialize: Try API first, then fallback ==========
(async function initProducts() {
    const apiProducts = await fetchProductsFromAPI();

    if (apiProducts && apiProducts.length > 0) {
        products = apiProducts;
        console.log('✅ Products loaded from database (' + products.length + ' items)');
    } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('ag_products'));
        if (stored && stored.length > 0) {
            products = stored;
            console.log('⚠️ API unavailable — loaded from localStorage (' + products.length + ' items)');
        } else {
            products = defaultProducts;
            localStorage.setItem('ag_products', JSON.stringify(products));
            console.log('⚠️ API unavailable — using default products (' + products.length + ' items)');
        }
    }

    // Notify that data is ready
    notifyDataReady();
})();
