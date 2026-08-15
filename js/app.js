/* =============================================
   Frind Phone — Main JavaScript
   ============================================= */

// ========== PRODUCT DATA MOVED TO data.js ==========

let wishlist = JSON.parse(localStorage.getItem('ag_wishlist') || '[]');
let compare = JSON.parse(localStorage.getItem('ag_compare') || '[]');

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('ag_user') || '{}');
}

function getCurrentUserId() {
    const user = getCurrentUser();
    return user && user.id ? Number(user.id) : null;
}

async function hydrateUserStateFromServer() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const [wishlistRes, compareRes] = await Promise.all([
            fetch(`api/user-data.php?type=wishlist&user_id=${userId}`),
            fetch(`api/user-data.php?type=compare&user_id=${userId}`)
        ]);

        const wishlistData = await wishlistRes.json();
        const compareData = await compareRes.json();

        if (wishlistData.success && Array.isArray(wishlistData.data)) {
            wishlist = wishlistData.data.map(Number);
            localStorage.setItem('ag_wishlist', JSON.stringify(wishlist));
        }

        if (compareData.success && Array.isArray(compareData.data)) {
            compare = compareData.data.map(Number);
            localStorage.setItem('ag_compare', JSON.stringify(compare));
        }
    } catch (error) {
        console.warn('Could not hydrate user state from database:', error.message);
    }
}

// ========== UTILITY FUNCTIONS ==========
function formatPrice(num) {
    return num.toLocaleString('th-TH');
}

function getDiscount(original, current) {
    return Math.round(((original - current) / original) * 100);
}

function createProductCard(product) {
    const discount = getDiscount(product.originalPrice, product.price);
    const badgeHTML = product.badge ? `
    <div class="card-badges">
      <span class="card-badge ${product.badge}">
        ${product.badge === 'sale' ? `-${discount}%` : product.badge === 'new' ? 'ใหม่' : '🔥 Hot'}
      </span>
    </div>
  ` : '';

    const installmentHTML = product.installment ? `
    <div class="installment"><i class="fas fa-credit-card"></i> ${product.installment}</div>
  ` : '';

    return `
    <div class="product-card" data-id="${product.id}">
      ${badgeHTML}
      <a href="product-detail.html?id=${product.id}" class="card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </a>
      <div class="card-cta">
        <button class="btn-wishlist ${wishlist.includes(product.id) ? 'active' : ''}" onclick="toggleWishlist(${product.id})" id="wishlist-icon-${product.id}" title="เพิ่มสิ่งที่ชอบ"><i class="${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart"></i></button>
        <button class="btn-compare ${compare.includes(product.id) ? 'active' : ''}" onclick="toggleCompare(${product.id})" id="compare-icon-${product.id}" title="เปรียบเทียบสินค้า"><i class="fas fa-exchange-alt"></i></button>
      </div>
      <a href="product-detail.html?id=${product.id}" class="card-body">
        <span class="card-brand">${product.brand}</span>
        <h3 class="card-title">${product.name}</h3>
        <p class="card-specs">${product.specs}</p>
        <div class="card-price">
          <div class="original-price">฿${formatPrice(product.originalPrice)}</div>
          <div class="current-price"><span class="currency">฿</span>${formatPrice(product.price)}.-</div>
          ${installmentHTML}
        </div>
      </a>
      <div class="card-stats">
        <span><i class="far fa-eye"></i> ${formatPrice(product.views)} views</span>
        <span><i class="fas fa-shopping-bag"></i> ${product.sold} sold</span>
      </div>
    </div>
  `;
}

function renderProducts(containerId, productList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = productList.map(p => createProductCard(p)).join('');
}

// ========== WISHLIST ==========
function updateWishlistBadge() {
    const badges = document.querySelectorAll('#wishlist-count');
    badges.forEach(b => {
        b.textContent = wishlist.length;
    });
}

async function toggleWishlist(productId) {
    const isLoggedIn = localStorage.getItem('ag_auth') === 'true';
    if (!isLoggedIn) {
        showToast('กรุณาเข้าสู่ระบบก่อนเพิ่มสิ่งที่ชอบ');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const action = index > -1 ? 'remove' : 'add';
    if (action === 'remove') {
        wishlist.splice(index, 1);
        showToast(`ลบ "${product.name.substring(0, 30)}..." ออกจากสิ่งที่ชอบแล้ว`);
    } else {
        wishlist.push(productId);
        showToast(`เพิ่ม "${product.name.substring(0, 30)}..." ลงสิ่งที่ชอบแล้ว`);
    }

    localStorage.setItem('ag_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();

    const userId = getCurrentUserId();
    if (userId) {
        try {
            const res = await fetch('api/user-data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'wishlist', user_id: userId, product_id: productId, action })
            });
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                wishlist = result.data.map(Number);
                localStorage.setItem('ag_wishlist', JSON.stringify(wishlist));
            }
        } catch (error) {
            console.warn('Wishlist sync failed:', error.message);
        }
    }

    const icons = document.querySelectorAll(`#wishlist-icon-${productId}`);
    icons.forEach(icon => {
        const isWished = wishlist.includes(productId);
        icon.classList.toggle('active', isWished);
        icon.innerHTML = `<i class="${isWished ? 'fas' : 'far'} fa-heart"></i>`;
    });

    if (window.location.href.includes('wishlist.html')) {
        initWishlistPage();
    }
}

function initWishlistPage() {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('wishlist-empty');
    const actionBar = document.getElementById('wishlist-actions-bar');
    if (!grid || !emptyState) return;

    if (wishlist.length === 0) {
        grid.style.display = 'none';
        if (actionBar) actionBar.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyState.style.flexDirection = 'column';
        emptyState.style.alignItems = 'center';
        emptyState.style.padding = '60px 0';
    } else {
        grid.style.display = 'grid';
        if (actionBar) actionBar.style.display = 'flex';
        emptyState.style.display = 'none';
        
        const wishlistProducts = products.filter(p => wishlist.includes(p.id));
        renderProducts('wishlist-grid', wishlistProducts);
    }

    const clearBtn = document.getElementById('wishlist-clear-btn');
    if (clearBtn) {
        const newBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newBtn, clearBtn);
        newBtn.addEventListener('click', () => {
            if (wishlist.length === 0) return;
            if (confirm('คุณต้องการล้างรายการสิ่งที่ชอบทั้งหมดหรือไม่?')) {
                wishlist.length = 0;
                localStorage.setItem('ag_wishlist', JSON.stringify(wishlist));
                updateWishlistBadge();
                initWishlistPage();
                showToast('ล้างรายการสิ่งที่ชอบเรียบร้อยแล้ว');
                
                const icons = document.querySelectorAll('.btn-wishlist.active');
                icons.forEach(icon => {
                    icon.classList.remove('active');
                    icon.innerHTML = '<i class="far fa-heart"></i>';
                });
            }
        });
    }
}

// ========== COMPARE ==========
function updateCompareBadge() {
    const badges = document.querySelectorAll('#compare-count');
    badges.forEach(b => {
        b.textContent = compare.length;
    });
}

async function toggleCompare(productId) {
    const index = compare.indexOf(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const action = index > -1 ? 'remove' : 'add';
    if (action === 'remove') {
        compare.splice(index, 1);
        showToast(`ลบ "${product.name.substring(0, 30)}..." ออกจากเปรียบเทียบแล้ว`);
    } else {
        if (compare.length >= 4) {
            showToast('คุณสามารถเปรียบเทียบสินค้าได้สูงสุด 4 รายการ');
            return;
        }

        if (compare.length > 0) {
            const firstProduct = products.find(p => p.id === compare[0]);
            if (firstProduct && firstProduct.category !== product.category) {
                showToast(`กรุณาเลือกสินค้าในหมวดหมู่เดียวกัน (${firstProduct.category}) เพื่อเปรียบเทียบ`);
                return;
            }
        }

        compare.push(productId);
        showToast(`เพิ่ม "${product.name.substring(0, 30)}..." ลงเปรียบเทียบแล้ว`);
    }

    localStorage.setItem('ag_compare', JSON.stringify(compare));
    updateCompareBadge();

    const userId = getCurrentUserId();
    if (userId) {
        try {
            const res = await fetch('api/user-data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'compare', user_id: userId, product_id: productId, action })
            });
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                compare = result.data.map(Number);
                localStorage.setItem('ag_compare', JSON.stringify(compare));
            }
        } catch (error) {
            console.warn('Compare sync failed:', error.message);
        }
    }

    const icons = document.querySelectorAll(`#compare-icon-${productId}`);
    icons.forEach(icon => {
        const isCompared = compare.includes(productId);
        icon.classList.toggle('active', isCompared);
    });

    if (window.location.href.includes('compare.html')) {
        initComparePage();
    }
}

function initComparePage() {
    const grid = document.getElementById('compare-grid');
    const emptyState = document.getElementById('compare-empty');
    if (!grid || !emptyState) return;

    if (compare.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyState.style.flexDirection = 'column';
        emptyState.style.alignItems = 'center';
        emptyState.style.padding = '60px 0';
        return;
    }

    grid.style.display = 'block';
    grid.style.gridTemplateColumns = 'none';
    emptyState.style.display = 'none';

    const compareProducts = products.filter(p => compare.includes(p.id));
    const allSpecKeys = Array.from(new Set(
        compareProducts.flatMap(p => Object.keys(p.specifications || {}))
    ));

    const headerCells = compareProducts.map(p => `
        <th class="compare-product-header">
            <div class="compare-product-box">
                <button class="compare-remove-btn" onclick="toggleCompare(${p.id})"><i class="fas fa-times"></i></button>
                <a href="product-detail.html?id=${p.id}" class="compare-table-image">
                    <img src="${p.image}" alt="${p.name}">
                </a>
                <div class="compare-table-info">
                    <div class="compare-brand">${p.brand}</div>
                    <a href="product-detail.html?id=${p.id}" class="compare-name">${p.name}</a>
                    <div class="compare-price">฿${formatPrice(p.price)}</div>
                </div>
            </div>
        </th>
    `).join('');

    const specRows = allSpecKeys.map(key => {
        const values = compareProducts.map(p => {
            const rawValue = p.specifications && p.specifications[key] !== undefined ? p.specifications[key] : '-';
            return rawValue === null || rawValue === '' ? '-' : String(rawValue).trim();
        });

        const normalizedValues = values.map(v => v === '-' ? '-' : v.toLowerCase());
        const uniqueValues = [...new Set(normalizedValues.filter(v => v !== '-'))];
        const isUniform = uniqueValues.length === 0 || uniqueValues.length === 1;
        const rowClass = uniqueValues.length === 0 ? 'compare-row-neutral' : isUniform ? 'compare-row-match' : 'compare-row-different';

        const cells = compareProducts.map(p => {
            const rawValue = p.specifications && p.specifications[key] !== undefined ? p.specifications[key] : '-';
            const value = rawValue === null || rawValue === '' ? '-' : String(rawValue).trim();
            const normalizedValue = value === '-' ? '-' : value.toLowerCase();
            const cellClass = value === '-' ? 'compare-cell-neutral' : isUniform ? 'compare-cell-match' : 'compare-cell-different';
            const highlightNote = value === '-' ? '' : isUniform ? '<span class="compare-badge compare-badge-match">เหมือนกัน</span>' : '<span class="compare-badge compare-badge-different">ต่างกัน</span>';

            const isExactMatch = normalizedValue !== '-' && uniqueValues.length > 0 && uniqueValues.every(v => v === normalizedValue);
            const finalClass = value === '-' ? 'compare-cell-neutral' : isExactMatch || isUniform ? 'compare-cell-match' : 'compare-cell-different';

            return `<td class="compare-table-cell ${finalClass}">${value}${highlightNote}</td>`;
        }).join('');

        return `
            <tr>
                <th class="compare-feature-label ${rowClass}">${key}</th>
                ${cells}
            </tr>
        `;
    }).join('');

    grid.innerHTML = `
        <div class="compare-table-wrap">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th class="compare-feature-label compare-empty-label">สเปคสินค้า</th>
                        ${headerCells}
                    </tr>
                </thead>
                <tbody>
                    ${specRows}
                </tbody>
            </table>
        </div>
    `;

    const clearBtn = document.getElementById('compare-clear-btn');
    if (clearBtn) {
        const newBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newBtn, clearBtn);
        newBtn.addEventListener('click', () => {
            if (compare.length === 0) return;
            if (confirm('คุณต้องการล้างรายการเปรียบเทียบทั้งหมดหรือไม่?')) {
                compare.length = 0;
                localStorage.setItem('ag_compare', JSON.stringify(compare));
                updateCompareBadge();
                initComparePage();
                showToast('ล้างรายการเปรียบเทียบเรียบร้อยแล้ว');

                const icons = document.querySelectorAll('.btn-compare.active');
                icons.forEach(icon => {
                    icon.classList.remove('active');
                });
            }
        });
    }
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: #333; color: #fff; padding: 14px 28px; border-radius: 8px;
      font-size: 14px; z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2); max-width: 90%;
    `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ========== HERO SLIDER ==========
function initSlider() {
    const track = document.getElementById('slider-track');
    const dots = document.querySelectorAll('#slider-dots .dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    if (!track) return;

    let currentSlide = 0;
    const totalSlides = track.children.length;

    function goToSlide(index) {
        currentSlide = index;
        if (currentSlide < 0) currentSlide = totalSlides - 1;
        if (currentSlide >= totalSlides) currentSlide = 0;

        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });

    // Auto-slide every 4 seconds
    let interval = setInterval(() => goToSlide(currentSlide + 1), 4000);
    const slider = document.getElementById('banner-slider');
    if (slider) {
        slider.addEventListener('mouseenter', () => clearInterval(interval));
        slider.addEventListener('mouseleave', () => {
            interval = setInterval(() => goToSlide(currentSlide + 1), 4000);
        });
    }
}

// ========== MOBILE NAV ==========
function initMobileNav() {
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== HOMEPAGE INIT ==========
function initHomepage() {
    // Promo: first 4
    renderProducts('promo-products', products.slice(0, 4));
    // New arrivals: items with "new" badge + some extra
    const newItems = products.filter(p => p.badge === 'new').concat(products.slice(8, 12)).slice(0, 4);
    renderProducts('new-products', newItems);

}

// ========== PRODUCTS PAGE INIT ==========
function initProductsPage() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Filter Elements
    const categoryCheckboxes = document.querySelectorAll('#filter-categories input[type="checkbox"]');
    const brandCheckboxes = document.querySelectorAll('#filter-brands input[type="checkbox"]');
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const applyFilterBtn = document.getElementById('apply-filter');
    const sortSelect = document.getElementById('sort-select');
    const countEl = document.getElementById('result-count');

    // Get URL params
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    const searchParam = params.get('search');

    // Pre-check filters based on URL
    if (catParam) {
        const catCb = Array.from(categoryCheckboxes).find(cb => cb.value.toLowerCase() === catParam.toLowerCase());
        if (catCb) catCb.checked = true;
        
        const brandCb = Array.from(brandCheckboxes).find(cb => cb.value.toLowerCase() === catParam.toLowerCase());
        if (brandCb) brandCb.checked = true;
    }

    // Map for titles
    const catNames = {
        notebook: 'โน้ตบุ๊ค',
        hardware: 'คอมพิวเตอร์ฮาร์ดแวร์', monitor: 'จอคอมพิวเตอร์',
        gaming: 'อุปกรณ์เกมมิ่งเกียร์', phone: 'สมาร์ทโฟน',
        audio: 'ลำโพง / หูฟัง', printer: 'เครื่องพิมพ์',
        network: 'อุปกรณ์เน็ตเวิร์ค', apple: 'Apple Products'
    };

    const titleEl = document.getElementById('page-title');
    const breadEl = document.getElementById('breadcrumb-cat');
    
    // Set Header
    if (searchParam) {
        if (titleEl) titleEl.textContent = `ค้นหา: "${searchParam}"`;
        if (breadEl) breadEl.textContent = 'ผลการค้นหา';
    } else if (catParam && catNames[catParam.toLowerCase()]) {
        if (titleEl) titleEl.textContent = catNames[catParam.toLowerCase()];
        if (breadEl) breadEl.textContent = catNames[catParam.toLowerCase()];
    }

    // Apply Filters Function
    function applyFilters() {
        let filtered = [...products];

        // 1. Search Param
        if (searchParam) {
            const query = searchParam.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.brand.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        // 2. Categories
        const activeCats = Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
        if (activeCats.length > 0) {
            filtered = filtered.filter(p => activeCats.includes(p.category.toLowerCase()));
        }

        // 3. Brands
        const activeBrands = Array.from(brandCheckboxes).filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
        if (activeBrands.length > 0) {
            filtered = filtered.filter(p => activeBrands.includes(p.brand.toLowerCase()));
        }

        // 4. Price
        const min = parseFloat(priceMin?.value);
        const max = parseFloat(priceMax?.value);
        if (!isNaN(min)) filtered = filtered.filter(p => p.price >= min);
        if (!isNaN(max)) filtered = filtered.filter(p => p.price <= max);

        // 5. Sorting
        if (sortSelect) {
            const val = sortSelect.value;
            if (val === 'price-low') filtered.sort((a, b) => a.price - b.price);
            else if (val === 'price-high') filtered.sort((a, b) => b.price - a.price);
            else if (val === 'newest') filtered.sort((a, b) => b.id - a.id);
            else filtered.sort((a, b) => b.sold - a.sold); // popular
        }

        // Update count
        if (countEl) countEl.textContent = `แสดง ${filtered.length} สินค้า`;

        // Pagination Logic
        const itemsPerPage = 12;
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1 || isNaN(currentPage)) currentPage = 1;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filtered.slice(startIndex, endIndex);

        renderProducts('products-grid', paginatedItems);

        // Render Pagination UI
        const paginationEl = document.getElementById('pagination');
        if (paginationEl) {
            paginationEl.innerHTML = '';
            if (totalPages > 1) {
                const createPageBtn = (text, targetPage, isActive=false) => {
                    const el = document.createElement(isActive ? 'span' : 'a');
                    if (!isActive) el.href = '#';
                    if (isActive) el.className = 'active';
                    el.textContent = text;
                    if (!isActive) {
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            if(currentPage !== targetPage) {
                                currentPage = targetPage;
                                applyFilters();
                                const toolbar = document.querySelector('.products-toolbar');
                                if (toolbar) window.scrollTo({ top: toolbar.offsetTop - 100, behavior: 'smooth' });
                            }
                        });
                    }
                    return el;
                };

                if (currentPage > 1) {
                    paginationEl.appendChild(createPageBtn('«', currentPage - 1));
                }
                for (let i = 1; i <= totalPages; i++) {
                    paginationEl.appendChild(createPageBtn(i, i, i === currentPage));
                }
                if (currentPage < totalPages) {
                    paginationEl.appendChild(createPageBtn('»', currentPage + 1));
                }
            }
        }
    }

    let currentPage = 1;

    // Event Listeners (reset to page 1 on filter/sort change)
    const onFilterChange = () => { currentPage = 1; applyFilters(); };
    categoryCheckboxes.forEach(cb => cb.addEventListener('change', onFilterChange));
    brandCheckboxes.forEach(cb => cb.addEventListener('change', onFilterChange));
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', onFilterChange);
    if (sortSelect) sortSelect.addEventListener('change', onFilterChange);

    // Initial Filter Apply
    applyFilters();
}

// ========== PRODUCT DETAIL PAGE INIT ==========
function initProductDetail() {
    const nameEl = document.getElementById('detail-name');
    if (!nameEl) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id')) || 1;
    const product = products.find(p => p.id === id) || products[0];

    // Update page
    document.title = `${product.name} — Frind Phone`;
    nameEl.textContent = product.name;
    document.getElementById('detail-code').textContent = `รหัสสินค้า: AG-${String(product.id).padStart(6, '0')}`;

    // Breadcrumb
    const breadEl = document.getElementById('breadcrumb-product');
    if (breadEl) breadEl.textContent = product.name.substring(0, 50) + '...';
    const pageTitleEl = document.getElementById('detail-page-title');
    if (pageTitleEl) pageTitleEl.textContent = product.brand + ' ' + product.category;

    // Price
    const discount = getDiscount(product.originalPrice, product.price);
    document.getElementById('detail-original-price').textContent = `ราคาปกติ ฿${formatPrice(product.originalPrice)}`;
    document.getElementById('detail-price-value').textContent = formatPrice(product.price);
    document.getElementById('detail-save').textContent = `ประหยัด ฿${formatPrice(product.originalPrice - product.price)} (${discount}%)`;

    // Main image
    const mainImg = document.getElementById('main-image');
    mainImg.src = product.image;
    mainImg.alt = product.name;

    // Thumbnails (create 3 variants)
    const thumbsContainer = document.getElementById('gallery-thumbs');
    if (thumbsContainer) {
        const colors = ['f5f5f5', 'e8e8e8', 'fafafa'];
        thumbsContainer.innerHTML = colors.map((c, i) => `
      <div class="thumb ${i === 0 ? 'active' : ''}" data-src="${product.image}">
        <img src="${product.image}" alt="Thumbnail ${i + 1}">
      </div>
    `).join('');

        thumbsContainer.querySelectorAll('.thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbsContainer.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                mainImg.src = thumb.dataset.src;
            });
        });
    }

    // Specs
    const specsTable = document.getElementById('specs-table');
    if (specsTable && product.specifications) {
        specsTable.innerHTML = Object.entries(product.specifications)
            .map(([key, val]) => `<tr><td>${key}</td><td>${val}</td></tr>`)
            .join('');
    }

    // Quantity controls
    const qtyInput = document.getElementById('qty-input');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');

    if (qtyMinus && qtyPlus && qtyInput) {
        qtyMinus.addEventListener('click', () => {
            const v = parseInt(qtyInput.value) || 1;
            if (v > 1) qtyInput.value = v - 1;
        });
        qtyPlus.addEventListener('click', () => {
            const v = parseInt(qtyInput.value) || 1;
            if (v < 99) qtyInput.value = v + 1;
        });
    }

    // Add to compare list
    const addCartBtn = document.getElementById('btn-add-cart');
    if (addCartBtn) {
        addCartBtn.addEventListener('click', () => {
            toggleCompare(product.id);
        });
    }

    // Compare page
    const buyNowBtn = document.getElementById('btn-buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            toggleCompare(product.id);
            setTimeout(() => { window.location.href = 'compare.html'; }, 500);
        });
    }

    // Related products
    const related = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);
    if (related.length < 4) {
        const extra = products.filter(p => p.id !== product.id && !related.includes(p)).slice(0, 4 - related.length);
        related.push(...extra);
    }
    renderProducts('related-products', related);
}

// ========== SEARCH ==========
function initSearch() {
    const searchInputs = document.querySelectorAll('#search-input');
    const searchBtns = document.querySelectorAll('.search-btn');

    function executeSearch(inputEl, catEl) {
        const query = inputEl ? inputEl.value.trim() : '';
        const cat = catEl ? catEl.value : '';
        
        let url = 'products.html?';
        if (query) url += `search=${encodeURIComponent(query)}&`;
        if (cat) url += `cat=${encodeURIComponent(cat)}`;
        
        url = url.endsWith('&') || url.endsWith('?') ? url.slice(0, -1) : url;
        
        if (query || cat) {
            window.location.href = url;
        } else {
            window.location.href = 'products.html';
        }
    }

    searchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = btn.closest('.search-bar') || document;
            executeSearch(container.querySelector('#search-input'), container.querySelector('#search-category'));
        });
    });

    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const container = input.closest('.search-bar') || document;
                executeSearch(input, container.querySelector('#search-category'));
            }
        });
    });
}

// ========== AUTHENTICATION ==========
function initAuth() {
    const isLoggedIn = localStorage.getItem('ag_auth') === 'true';
    const currentPath = window.location.pathname.toLowerCase();
    
    // Protect account.html and wishlist.html only
    const protectedPages = ['account.html', 'wishlist.html'];
    if (protectedPages.some(page => currentPath.endsWith(page)) && !isLoggedIn) {
        window.location.href = 'login.html';
        return; // Stop execution
    }

    // Protect login/register.html (if already logged in, redirect to account)
    if ((currentPath.endsWith('login.html') || currentPath.endsWith('register.html')) && isLoggedIn) {
        window.location.href = 'account.html';
        return;
    }

    // Update Header Account Button
    const accountBtn = document.getElementById('account-btn');
    if (accountBtn) {
        if (isLoggedIn) {
            const user = JSON.parse(localStorage.getItem('ag_user') || '{}');
            const displayName = user.firstName || 'บัญชีของฉัน';
            accountBtn.href = 'account.html';
            accountBtn.innerHTML = `<span class="icon"><i class="far fa-user"></i></span><span>${displayName}</span>`;

            // Show Admin Dashboard link for admin users
            if (user.role === 'admin') {
                const headerActions = accountBtn.parentElement;
                if (headerActions && !document.getElementById('admin-link')) {
                    const adminLink = document.createElement('a');
                    adminLink.href = 'admin/index.html';
                    adminLink.className = 'header-action admin-header-link';
                    adminLink.id = 'admin-link';
                    adminLink.innerHTML = '<span class="icon"><i class="fas fa-user-shield"></i></span><span>Admin</span>';
                    headerActions.appendChild(adminLink);
                }
            }
        } else {
            accountBtn.href = 'login.html';
            accountBtn.innerHTML = '<span class="icon"><i class="fas fa-sign-in-alt"></i></span><span>เข้าสู่ระบบ</span>';
        }
    }

    // ---- Handle REGISTER form ----
    const regForm = document.getElementById('reg-fname') ? document.querySelector('.auth-form') : null;
    if (regForm && currentPath.endsWith('register.html')) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('reg-fname').value.trim();
            const lastName  = document.getElementById('reg-lname').value.trim();
            const email     = document.getElementById('reg-email').value.trim();
            const password  = document.getElementById('reg-password').value;
            const confirmPw = document.getElementById('reg-confirm-password').value;

            if (password.length < 8) {
                showToast('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
                return;
            }
            if (password !== confirmPw) {
                showToast('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่');
                return;
            }

            try {
                const response = await fetch('api/auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'register', firstName, lastName, email, password })
                });
                const result = await response.json();

                if (!result.success) {
                    showToast(result.error || 'สมัครสมาชิกไม่สำเร็จ');
                    return;
                }

                const newUser = { ...result.data, firstName: result.data.firstName, lastName: result.data.lastName };
                localStorage.setItem('ag_auth', 'true');
                localStorage.setItem('ag_user', JSON.stringify(newUser));
                localStorage.setItem('ag_users', JSON.stringify([newUser]));

                showToast('สมัครสมาชิกเรียบร้อยแล้ว! กำลังเข้าสู่ระบบ...');
                await hydrateUserStateFromServer();
                setTimeout(() => { window.location.href = 'account.html'; }, 1000);
            } catch (error) {
                showToast('สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่');
            }
        });
        return;
    }

    // ---- Handle LOGIN form ----
    const loginForm = document.getElementById('login-email') ? document.querySelector('.auth-form') : null;
    if (loginForm && currentPath.endsWith('login.html')) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email    = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('api/auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'login', email, password })
                });
                const result = await response.json();

                if (!result.success) {
                    showToast(result.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                    return;
                }

                const foundUser = { ...result.data, firstName: result.data.firstName, lastName: result.data.lastName };
                localStorage.setItem('ag_auth', 'true');
                localStorage.setItem('ag_user', JSON.stringify(foundUser));

                showToast('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับกลับ');
                await hydrateUserStateFromServer();
                setTimeout(() => { window.location.href = 'account.html'; }, 1000);
            } catch (error) {
                showToast('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
            }
        });
    }

    // Sidebar Logout Link in Account.html
    const sidebarLogout = document.querySelector('.logout-link');
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('ag_auth');
            localStorage.removeItem('ag_user');
            localStorage.removeItem('ag_wishlist');
            wishlist.length = 0;
            showToast('ออกจากระบบเรียบร้อยแล้ว');
            setTimeout(() => { window.location.href = 'index.html'; }, 800);
        });
    }
}

// ========== ACCOUNT PAGE ==========
function initAccountPage() {
    const isLoggedIn = localStorage.getItem('ag_auth') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;

    const user = JSON.parse(localStorage.getItem('ag_user') || '{}');
    if (!user.email) return;

    // Populate sidebar
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarEmail = document.getElementById('sidebar-user-email');
    if (sidebarName) sidebarName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'ผู้ใช้งาน';
    if (sidebarEmail) sidebarEmail.textContent = user.email;

    // ===== Tab Switching =====
    const tabLinks = document.querySelectorAll('.account-nav-menu a[data-tab]');
    const tabPanels = document.querySelectorAll('.account-tab-panel');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.dataset.tab;

            // Update active link
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show active panel
            tabPanels.forEach(panel => {
                panel.classList.toggle('active', panel.dataset.panel === targetTab);
            });

            // Lazy render tabs
            if (targetTab === 'addresses') renderAddresses();
        });
    });

    // ===== Profile Tab =====
    const fnameInput = document.getElementById('first-name');
    const lnameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const dobInput   = document.getElementById('dob');

    if (fnameInput) fnameInput.value = user.firstName || '';
    if (lnameInput) lnameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (dobInput)   dobInput.value   = user.dob || '';

    if (user.gender) {
        const genderRadio = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
        if (genderRadio) genderRadio.checked = true;
    } else {
        document.querySelectorAll('input[name="gender"]').forEach(r => r.checked = false);
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        user.firstName = fnameInput?.value.trim() || '';
        user.lastName  = lnameInput?.value.trim() || '';
        user.phone     = phoneInput?.value.trim() || '';
        user.dob       = dobInput?.value || '';
        const selectedGender = document.querySelector('input[name="gender"]:checked');
        user.gender = selectedGender ? selectedGender.value : '';

        localStorage.setItem('ag_user', JSON.stringify(user));
        const usersRegistry = JSON.parse(localStorage.getItem('ag_users') || '[]');
        const idx = usersRegistry.findIndex(u => u.email === user.email);
        if (idx > -1) {
            usersRegistry[idx] = { ...usersRegistry[idx], ...user };
            localStorage.setItem('ag_users', JSON.stringify(usersRegistry));
        }

        try {
            const response = await fetch('api/auth.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone, dob: user.dob, gender: user.gender, email: user.email })
            });
            const result = await response.json();
            if (result.success && result.data) {
                const updatedUser = { ...user, ...result.data, firstName: result.data.firstName, lastName: result.data.lastName };
                localStorage.setItem('ag_user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.warn('Profile sync failed:', error.message);
        }

        if (sidebarName) sidebarName.textContent = `${user.firstName} ${user.lastName}`.trim();
        showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว ✓');
    });

    // ===== Addresses Tab =====
    function getAddresses() {
        return JSON.parse(localStorage.getItem('ag_addresses') || '[]');
    }
    async function saveAddresses(arr) {
        localStorage.setItem('ag_addresses', JSON.stringify(arr));
        const userId = getCurrentUserId();
        if (!userId) return;
        try {
            const response = await fetch('api/user-data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'addresses', user_id: userId, addresses: arr })
            });
            await response.json();
        } catch (error) {
            console.warn('Address sync failed:', error.message);
        }
    }

    function renderAddresses() {
        const listEl = document.getElementById('addresses-list');
        const emptyEl = document.getElementById('addresses-empty');
        if (!listEl) return;

        const addresses = getAddresses();

        if (addresses.length === 0) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';

        listEl.innerHTML = addresses.map((addr, idx) => `
            <div class="address-card ${addr.isDefault ? 'is-default' : ''}">
                <div class="address-card-label">
                    <h4>
                        <i class="fas fa-map-pin"></i> ${addr.label}
                        ${addr.isDefault ? '<span class="address-default-tag">ที่อยู่หลัก</span>' : ''}
                    </h4>
                    <div class="address-card-actions">
                        ${!addr.isDefault ? `<button onclick="window._setDefaultAddr(${idx})" title="ตั้งเป็นที่อยู่หลัก"><i class="fas fa-star"></i> ตั้งเป็นหลัก</button>` : ''}
                        <button onclick="window._editAddr(${idx})"><i class="fas fa-edit"></i> แก้ไข</button>
                        <button class="btn-delete" onclick="window._deleteAddr(${idx})"><i class="fas fa-trash"></i> ลบ</button>
                    </div>
                </div>
                <div class="address-card-body">
                    <span class="addr-name">${addr.name}</span> | ${addr.phone}<br>
                    ${addr.address}<br>
                    ${addr.province} ${addr.zipcode}
                </div>
            </div>
        `).join('');
    }

    // Address Modal logic
    const addrModal = document.getElementById('address-modal');
    const addrForm = document.getElementById('address-form');
    const addrModalTitle = document.getElementById('address-modal-title');
    const addrCloseBtn = document.getElementById('address-modal-close');
    const addrAddBtn = document.getElementById('btn-add-address');

    function openAddressModal(editIdx = -1) {
        if (!addrModal || !addrForm) return;
        addrForm.reset();
        document.getElementById('addr-edit-id').value = editIdx;

        if (editIdx >= 0) {
            const addresses = getAddresses();
            const addr = addresses[editIdx];
            if (!addr) return;
            addrModalTitle.textContent = 'แก้ไขที่อยู่';
            document.getElementById('addr-label').value = addr.label || '';
            document.getElementById('addr-name').value = addr.name || '';
            document.getElementById('addr-phone').value = addr.phone || '';
            document.getElementById('addr-address').value = addr.address || '';
            document.getElementById('addr-province').value = addr.province || '';
            document.getElementById('addr-zipcode').value = addr.zipcode || '';
            document.getElementById('addr-default').checked = addr.isDefault || false;
        } else {
            addrModalTitle.textContent = 'เพิ่มที่อยู่ใหม่';
        }

        addrModal.style.display = 'flex';
    }

    function closeAddressModal() {
        if (addrModal) addrModal.style.display = 'none';
    }

    if (addrAddBtn) addrAddBtn.addEventListener('click', () => openAddressModal(-1));
    if (addrCloseBtn) addrCloseBtn.addEventListener('click', closeAddressModal);
    if (addrModal) addrModal.addEventListener('click', (e) => { if (e.target === addrModal) closeAddressModal(); });

    if (addrForm) {
        addrForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editIdx = parseInt(document.getElementById('addr-edit-id').value);
            const isDefault = document.getElementById('addr-default').checked;

            const newAddr = {
                label: document.getElementById('addr-label').value.trim(),
                name: document.getElementById('addr-name').value.trim(),
                phone: document.getElementById('addr-phone').value.trim(),
                address: document.getElementById('addr-address').value.trim(),
                province: document.getElementById('addr-province').value,
                zipcode: document.getElementById('addr-zipcode').value.trim(),
                isDefault: isDefault
            };

            const addresses = getAddresses();

            // If setting as default, unset others
            if (isDefault) {
                addresses.forEach(a => a.isDefault = false);
            }

            if (editIdx >= 0 && editIdx < addresses.length) {
                addresses[editIdx] = newAddr;
                showToast('แก้ไขที่อยู่เรียบร้อยแล้ว ✓');
            } else {
                // If first address, make it default
                if (addresses.length === 0) newAddr.isDefault = true;
                addresses.push(newAddr);
                showToast('เพิ่มที่อยู่ใหม่เรียบร้อยแล้ว ✓');
            }

            saveAddresses(addresses);
            closeAddressModal();
            renderAddresses();
        });
    }

    // Global handlers for address actions
    window._editAddr = function(idx) {
        openAddressModal(idx);
    };

    window._deleteAddr = function(idx) {
        if (!confirm('คุณต้องการลบที่อยู่นี้หรือไม่?')) return;
        const addresses = getAddresses();
        const wasDefault = addresses[idx]?.isDefault;
        addresses.splice(idx, 1);
        if (wasDefault && addresses.length > 0) addresses[0].isDefault = true;
        saveAddresses(addresses);
        renderAddresses();
        showToast('ลบที่อยู่เรียบร้อยแล้ว');
    };

    window._setDefaultAddr = function(idx) {
        const addresses = getAddresses();
        addresses.forEach((a, i) => a.isDefault = (i === idx));
        saveAddresses(addresses);
        renderAddresses();
        showToast('ตั้งเป็นที่อยู่หลักเรียบร้อยแล้ว ✓');
    };
}

// ========== LIST/GRID VIEW TOGGLE ==========
function initViewToggle() {
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    // On products page, the grid is inside #products-grid container. 
    // We toggle a class on the #products-grid to avoid breaking other grids
    const productGrid = document.getElementById('products-grid') || document.querySelector('.product-section .product-grid');
    
    if (!gridBtn || !listBtn || !productGrid) return;
    
    const currentView = localStorage.getItem('ag_view_mode') || 'grid';
    if (currentView === 'list') {
        productGrid.classList.add('list-view');
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
    }
    
    gridBtn.addEventListener('click', () => {
        productGrid.classList.remove('list-view');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        localStorage.setItem('ag_view_mode', 'grid');
    });
    
    listBtn.addEventListener('click', () => {
        productGrid.classList.add('list-view');
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        localStorage.setItem('ag_view_mode', 'list');
    });
}

// ========== INIT ON DOM READY ==========
document.addEventListener('DOMContentLoaded', () => {
    // These don't depend on product data — init immediately
    initAuth();
    hydrateUserStateFromServer();
    updateWishlistBadge();
    updateCompareBadge();
    initSlider();
    initMobileNav();
    initBackToTop();
    initSearch();
    initAccountPage();
    initViewToggle();

    // These depend on product data — wait for API/fallback to load
    onDataReady(() => {
        initHomepage();
        initProductsPage();
        initProductDetail();
        initWishlistPage();
        initComparePage();
    });
});

