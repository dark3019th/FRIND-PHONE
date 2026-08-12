// Admin JS functionality

// DOM Elements
const tbody = document.getElementById('admin-product-tbody');
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');

// Render products table
function renderAdminProducts() {
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const catFilter = document.getElementById('admin-category-filter');
    const selectedCat = catFilter ? catFilter.value : 'all';

    const filteredProducts = selectedCat === 'all' 
        ? products 
        : products.filter(p => p.category === selectedCat);
    
    filteredProducts.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" class="product-img-cell" alt="Img"></td>
            <td>#${p.id}</td>
            <td><strong>${p.name}</strong><br><small style="color:var(--text-muted)">${p.brand}</small></td>
            <td><span class="badge" style="background:#eee; color:#333;">${p.category}</span></td>
            <td>฿${p.price.toLocaleString('th-TH')}</td>
            <td>
                <div class="action-btns">
                    <button class="action-icon edit" onclick="editProduct(${p.id})" title="แก้ไข"><i class="fas fa-edit"></i></button>
                    <button class="action-icon delete" onclick="deleteProduct(${p.id})" title="ลบ"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Open modal for Adding
function openProductModal() {
    modalTitle.innerText = "เพิ่มสินค้าใหม่";
    form.reset();
    document.getElementById('p-id').value = ""; // Empty ID means new
    modal.classList.add('show');
}

// Open modal for Editing
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    modalTitle.innerText = "แก้ไขสินค้า #" + id;
    document.getElementById('p-id').value = product.id;
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-category').value = product.category;
    document.getElementById('p-brand').value = product.brand;
    document.getElementById('p-original-price').value = product.originalPrice;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-image').value = product.image;
    document.getElementById('p-specs').value = product.specs;
    
    modal.classList.add('show');
}

// Close Modal
function closeProductModal() {
    modal.classList.remove('show');
}

// Delete Product
async function deleteProduct(id) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้ารหัส #" + id + "?")) {
        // Try API first
        const apiSuccess = await apiDeleteProduct(id);

        const index = products.findIndex(p => p.id === id);
        if (index > -1) {
            products.splice(index, 1);
            saveProducts(); // Sync localStorage fallback
        }

        if (apiSuccess) {
            console.log('✅ Product #' + id + ' deleted from database');
        } else {
            console.warn('⚠️ API unavailable — deleted from localStorage only');
        }

        renderAdminProducts();
    }
}

// Form Submit (Add or Edit)
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idVal = document.getElementById('p-id').value;
        const isEditing = idVal !== "";
        
        const newProduct = {
            id: isEditing ? parseInt(idVal) : (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1),
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            brand: document.getElementById('p-brand').value,
            originalPrice: parseInt(document.getElementById('p-original-price').value),
            price: parseInt(document.getElementById('p-price').value),
            image: document.getElementById('p-image').value,
            specs: document.getElementById('p-specs').value,
            badge: "new",
            views: 0,
            sold: 0,
            inStock: true,
            specifications: {}
        };
        
        if (isEditing) {
            const index = products.findIndex(p => p.id === newProduct.id);
            // Preserve existing data
            newProduct.specifications = products[index].specifications;
            newProduct.views = products[index].views;
            newProduct.sold = products[index].sold;
            newProduct.badge = products[index].badge;

            // Try API update
            const apiResult = await apiUpdateProduct(newProduct.id, newProduct);
            if (apiResult) {
                products[index] = apiResult;
                console.log('✅ Product #' + newProduct.id + ' updated in database');
            } else {
                products[index] = newProduct;
                console.warn('⚠️ API unavailable — updated in localStorage only');
            }
        } else {
            // Try API add
            const apiResult = await apiAddProduct(newProduct);
            if (apiResult) {
                products.unshift(apiResult);
                console.log('✅ Product added to database with ID #' + apiResult.id);
            } else {
                products.unshift(newProduct);
                console.warn('⚠️ API unavailable — added to localStorage only');
            }
        }
        
        // Sync localStorage as fallback
        saveProducts();
        
        closeProductModal();
        renderAdminProducts();
    });
}

function formatThaiDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ========== DASHBOARD SYNC ==========
function renderDashboardData() {
    const el = (id) => document.getElementById(id);

    if (el('total-products')) el('total-products').textContent = products.length;

    const users = getUsers().filter(u => u.role !== 'admin');
    if (el('dash-customers')) el('dash-customers').textContent = users.length;


}

// ========== CUSTOMER MANAGEMENT ==========
const AVATAR_COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
    '#1abc9c', '#e67e22', '#2c3e50', '#d35400', '#16a085'
];

function getUsers() {
    return JSON.parse(localStorage.getItem('ag_users') || '[]');
}

function getAvatarColor(id) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function getInitials(firstName, lastName) {
    const f = (firstName || '').charAt(0).toUpperCase();
    const l = (lastName || '').charAt(0).toUpperCase();
    return f + l || '?';
}

function renderCustomerStats() {
    const users = getUsers().filter(u => u.role !== 'admin');
    const el = (id) => document.getElementById(id);

    if (el('stat-total-customers')) el('stat-total-customers').textContent = users.length;

    const now = new Date();
    const newThisMonth = users.filter(u => {
        if (!u.createdAt) return false;
        const d = new Date(u.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    if (el('stat-new-customers')) el('stat-new-customers').textContent = newThisMonth.length;

    if (el('stat-account-status')) el('stat-account-status').textContent = users.length > 0 ? 'ปกติ' : 'ไม่มีข้อมูล';
}

function renderCustomersPage(searchQuery) {
    const tbody = document.getElementById('customers-tbody');
    const emptyState = document.getElementById('customers-empty');
    const table = document.getElementById('customers-table');
    if (!tbody) return;

    let users = getUsers().filter(u => u.role !== 'admin');

    // Filter by search
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        users = users.filter(u =>
            (u.firstName && u.firstName.toLowerCase().includes(q)) ||
            (u.lastName && u.lastName.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q))
        );
    }

    if (users.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (table) table.querySelector('thead').style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (table) table.querySelector('thead').style.display = '';

    tbody.innerHTML = users.map(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-';
        const initials = getInitials(user.firstName, user.lastName);
        const color = getAvatarColor(user.id || 0);
        const createdAt = user.createdAt ? formatThaiDate(user.createdAt) : '-';
        const role = user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก';

        return `
            <tr>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar" style="background:${color};">${initials}</div>
                        <div class="customer-cell-info">
                            <span class="customer-cell-name">${fullName}</span>
                            <span class="customer-cell-role">${role}</span>
                        </div>
                    </div>
                </td>
                <td>${user.email || '-'}</td>
                <td>${user.phone || '-'}</td>
                <td><span class="badge" style="background:#eef6ff;color:#1e88e5;">${role}</span></td>
                <td><small>${createdAt}</small></td>
                <td>
                    <div class="action-btns">
                        <button class="action-icon edit" onclick="openCustomerDetailModal(${user.id})" title="ดูรายละเอียด"><i class="fas fa-eye"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openCustomerDetailModal(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('customer-detail-modal');
    const titleEl = document.getElementById('modal-customer-title');
    const bodyEl = document.getElementById('modal-customer-body');

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'ผู้ใช้งาน';
    const initials = getInitials(user.firstName, user.lastName);
    const color = getAvatarColor(user.id || 0);
    const createdAt = user.createdAt ? formatThaiDate(user.createdAt) : '-';
    const role = user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก';

    titleEl.textContent = 'รายละเอียดลูกค้า';

    const accountInfoHTML = '<p style="color:#999; text-align:center; padding:20px 0;">ไม่มีข้อมูลเพิ่มเติมในระบบนี้</p>';

    bodyEl.innerHTML = `
        <div class="customer-profile-header">
            <div class="customer-profile-avatar" style="background:${color};">${initials}</div>
            <div class="customer-profile-meta">
                <h3>${fullName}</h3>
                <p><i class="fas fa-envelope"></i> ${user.email || '-'}</p>
                <p><i class="fas fa-phone"></i> ${user.phone || '-'}  ·  <i class="fas fa-user-tag"></i> ${role}  ·  <i class="fas fa-calendar"></i> สมัครเมื่อ ${createdAt}</p>
            </div>
        </div>

        <div class="customer-stats-grid">
            <div class="customer-stat-box">
                <div class="stat-number">${role}</div>
                <div class="stat-label">ประเภทผู้ใช้</div>
            </div>
            <div class="customer-stat-box">
                <div class="stat-number">${createdAt}</div>
                <div class="stat-label">วันที่สมัคร</div>
            </div>
        </div>

        <div class="customer-detail-section">
            <h3><i class="fas fa-receipt"></i> ข้อมูลส่วนตัว</h3>
            <div class="customer-info-grid">
                <div class="customer-info-item">
                    <span class="label">ชื่อ</span>
                    <span class="value">${user.firstName || '-'}</span>
                </div>
                <div class="customer-info-item">
                    <span class="label">นามสกุล</span>
                    <span class="value">${user.lastName || '-'}</span>
                </div>
                <div class="customer-info-item">
                    <span class="label">อีเมล</span>
                    <span class="value">${user.email || '-'}</span>
                </div>
                <div class="customer-info-item">
                    <span class="label">เบอร์โทร</span>
                    <span class="value">${user.phone || '-'}</span>
                </div>
                <div class="customer-info-item">
                    <span class="label">วันเกิด</span>
                    <span class="value">${user.dob || '-'}</span>
                </div>
                <div class="customer-info-item">
                    <span class="label">เพศ</span>
                    <span class="value">${user.gender === 'male' ? 'ชาย' : user.gender === 'female' ? 'หญิง' : user.gender === 'other' ? 'อื่นๆ' : '-'}</span>
                </div>
            </div>
        </div>

        <div class="customer-detail-section" style="margin-top:24px;">
            <h3><i class="fas fa-info-circle"></i> ข้อมูลบัญชี</h3>
            ${accountInfoHTML}
        </div>
    `;

    modal.classList.add('show');
}

function closeCustomerModal() {
    const m = document.getElementById('customer-detail-modal');
    if (m) m.classList.remove('show');
}

// ========== SETTINGS / ROLE MANAGEMENT ==========
let pendingRoleChange = null;

function saveUsers(users) {
    localStorage.setItem('ag_users', JSON.stringify(users));
}

function renderSettingsStats() {
    const users = getUsers();
    const el = (id) => document.getElementById(id);
    const admins = users.filter(u => u.role === 'admin');
    const normalUsers = users.filter(u => u.role !== 'admin');

    if (el('stat-settings-total')) el('stat-settings-total').textContent = users.length;
    if (el('stat-settings-admins')) el('stat-settings-admins').textContent = admins.length;
    if (el('stat-settings-users')) el('stat-settings-users').textContent = normalUsers.length;
}

function renderRolesPage(searchQuery) {
    const tbody = document.getElementById('roles-tbody');
    const emptyState = document.getElementById('roles-empty');
    const table = document.getElementById('roles-table');
    if (!tbody) return;

    let users = getUsers();

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        users = users.filter(u =>
            (u.firstName && u.firstName.toLowerCase().includes(q)) ||
            (u.lastName && u.lastName.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q))
        );
    }

    if (users.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (table) table.querySelector('thead').style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (table) table.querySelector('thead').style.display = '';

    tbody.innerHTML = users.map(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-';
        const initials = getInitials(user.firstName, user.lastName);
        const color = getAvatarColor(user.id || 0);
        const isAdmin = user.role === 'admin';
        const createdAt = user.createdAt ? formatThaiDate(user.createdAt) : '-';

        return `
            <tr>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar" style="background:${color};">${initials}</div>
                        <div class="customer-cell-info">
                            <span class="customer-cell-name">${fullName}</span>
                        </div>
                    </div>
                </td>
                <td>${user.email || '-'}</td>
                <td><small>${createdAt}</small></td>
                <td>
                    <span class="role-badge ${isAdmin ? 'admin' : 'user'}">
                        <i class="fas ${isAdmin ? 'fa-user-shield' : 'fa-user'}"></i>
                        ${isAdmin ? 'Admin' : 'สมาชิก'}
                    </span>
                </td>
                <td>
                    <div class="role-toggle-cell">
                        <label class="toggle-switch">
                            <input type="checkbox" ${isAdmin ? 'checked' : ''} onchange="confirmRoleChange(${user.id}, this.checked, this)">
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="role-toggle-label">${isAdmin ? 'เป็น Admin' : 'สมาชิกทั่วไป'}</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function confirmRoleChange(userId, makeAdmin, toggleEl) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const modal = document.getElementById('role-confirm-modal');
    const titleEl = document.getElementById('role-modal-title');
    const bodyEl = document.getElementById('role-modal-body');
    const confirmBtn = document.getElementById('role-confirm-btn');

    if (makeAdmin) {
        titleEl.textContent = 'มอบสิทธิ์ Admin';
        bodyEl.innerHTML = `
            <p style="font-size:15px; line-height:1.7;">คุณต้องการมอบสิทธิ์ <strong style="color:#e74c3c;">ผู้ดูแลระบบ (Admin)</strong> ให้กับ</p>
            <div style="margin:16px 0; padding:16px; background:#f9fafb; border-radius:8px; display:flex; align-items:center; gap:12px;">
                <div class="customer-avatar" style="background:${getAvatarColor(userId)};">${getInitials(user.firstName, user.lastName)}</div>
                <div>
                    <strong>${fullName}</strong><br>
                    <small style="color:#999;">${user.email}</small>
                </div>
            </div>
            <p style="font-size:13px; color:#e67e22;"><i class="fas fa-exclamation-triangle"></i> ผู้ใช้จะสามารถเข้าถึงหน้า Admin Dashboard ได้ทั้งหมด</p>
        `;
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.style.background = '#e74c3c';
    } else {
        titleEl.textContent = 'ถอนสิทธิ์ Admin';
        bodyEl.innerHTML = `
            <p style="font-size:15px; line-height:1.7;">คุณต้องการ <strong>ถอนสิทธิ์ผู้ดูแลระบบ</strong> ของ</p>
            <div style="margin:16px 0; padding:16px; background:#f9fafb; border-radius:8px; display:flex; align-items:center; gap:12px;">
                <div class="customer-avatar" style="background:${getAvatarColor(userId)};">${getInitials(user.firstName, user.lastName)}</div>
                <div>
                    <strong>${fullName}</strong><br>
                    <small style="color:#999;">${user.email}</small>
                </div>
            </div>
            <p style="font-size:13px; color:#999;"><i class="fas fa-info-circle"></i> ผู้ใช้จะกลับเป็นสมาชิกทั่วไป ไม่สามารถเข้าถึง Admin Dashboard ได้</p>
        `;
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.style.background = '#333';
    }

    pendingRoleChange = { userId, makeAdmin, toggleEl };
    modal.classList.add('show');

    // Revert toggle visually until confirmed
    toggleEl.checked = !makeAdmin;
}

function executeRoleChange() {
    if (!pendingRoleChange) return;

    const { userId, makeAdmin } = pendingRoleChange;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;

    users[idx].role = makeAdmin ? 'admin' : 'user';
    saveUsers(users);

    // If this is the currently logged-in user, update ag_user too
    const currentUser = JSON.parse(localStorage.getItem('ag_user') || '{}');
    if (currentUser.id === userId) {
        currentUser.role = users[idx].role;
        localStorage.setItem('ag_user', JSON.stringify(currentUser));
    }

    closeRoleModal();
    renderRolesPage(document.getElementById('settings-search-input')?.value?.trim());
    renderSettingsStats();
    pendingRoleChange = null;
}

function closeRoleModal() {
    const m = document.getElementById('role-confirm-modal');
    if (m) m.classList.remove('show');
    pendingRoleChange = null;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Products page — wait for async data loading
    if (document.getElementById('admin-product-tbody')) {
        onDataReady(() => {
            renderAdminProducts();
            
            const catFilter = document.getElementById('admin-category-filter');
            if (catFilter) {
                catFilter.addEventListener('change', () => {
                    renderAdminProducts();
                    const searchInput = document.querySelector('.topbar-search input');
                    if (searchInput && searchInput.value.trim() !== '') {
                        const evt = new Event('input');
                        searchInput.dispatchEvent(evt);
                    }
                });
            }
        });
    }

    // Customers page
    if (document.getElementById('customers-tbody')) {
        renderCustomerStats();
        renderCustomersPage();

        const searchInput = document.getElementById('customer-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                renderCustomersPage(searchInput.value.trim());
            });
        }
    }

    // Settings / Role management page
    if (document.getElementById('roles-tbody')) {
        renderSettingsStats();
        renderRolesPage();

        const searchInput = document.getElementById('settings-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                renderRolesPage(searchInput.value.trim());
            });
        }

        // Confirm button
        const confirmBtn = document.getElementById('role-confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', executeRoleChange);
        }
    }

    // Dashboard page
    if (document.getElementById('total-products')) {
        onDataReady(() => {
            renderDashboardData();
        });
    }

    // Admin Search (products page)
    const searchInput = document.querySelector('.topbar-search input');
    if (searchInput && window.location.href.includes('products.html')) {
        const filterProducts = (query) => {
            const term = query.toLowerCase();
            const rows = document.querySelectorAll('#admin-product-tbody tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        };

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterProducts(searchInput.value.trim());
            }
        });

        searchInput.addEventListener('input', () => {
            filterProducts(searchInput.value.trim());
        });
    }
});
