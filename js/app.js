/* =============================================
   Frind Phone — Main JavaScript
   ============================================= */

// ========== PRODUCT DATA MOVED TO data.js ==========

let wishlist = JSON.parse(localStorage.getItem('ag_wishlist') || '[]');
let compare = JSON.parse(localStorage.getItem('ag_compare') || '[]');

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
        <button class="btn-compare ${compare.includes(product.id) ? 'active' : ''}" onclick="toggleCompare(${product.id})" id="compare-icon-${product.id}" title="เปรียบเทียบสินค้า"><i class="fas fa-balance-scale"></i></button>
        <button class="btn-buy" onclick="addToCart(${product.id})"><i class="fas fa-shopping-cart"></i> ใส่ตะกร้า</button>
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

// ========== CART ==========
let cart = JSON.parse(localStorage.getItem('ag_cart') || '[]');

// ========== WISHLIST ==========
function updateWishlistBadge() {
    const badges = document.querySelectorAll('#wishlist-count');
    badges.forEach(b => {
        b.textContent = wishlist.length;
    });
}

function toggleWishlist(productId) {
    const isLoggedIn = localStorage.getItem('ag_auth') === 'true';
    if (!isLoggedIn) {
        showToast('กรุณาเข้าสู่ระบบก่อนเพิ่มสิ่งที่ชอบ');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`ลบ "${product.name.substring(0, 30)}..." ออกจากสิ่งที่ชอบแล้ว`);
    } else {
        wishlist.push(productId);
        showToast(`เพิ่ม "${product.name.substring(0, 30)}..." ลงสิ่งที่ชอบแล้ว`);
    }
    
    localStorage.setItem('ag_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();

    // Update icons on current page
    const icons = document.querySelectorAll(`#wishlist-icon-${productId}`);
    icons.forEach(icon => {
        const isWished = wishlist.includes(productId);
        icon.classList.toggle('active', isWished);
        icon.innerHTML = `<i class="${isWished ? 'fas' : 'far'} fa-heart"></i>`;
    });
    
    // If on wishlist page, re-render
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

function toggleCompare(productId) {
    const index = compare.indexOf(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (index > -1) {
        compare.splice(index, 1);
        showToast(`ลบ "${product.name.substring(0, 30)}..." ออกจากเปรียบเทียบแล้ว`);
    } else {
        if (compare.length >= 4) {
            showToast('คุณสามารถเปรียบเทียบสินค้าได้สูงสุด 4 รายการ');
            return;
        }
        compare.push(productId);
        showToast(`เพิ่ม "${product.name.substring(0, 30)}..." ลงเปรียบเทียบแล้ว`);
    }
    
    localStorage.setItem('ag_compare', JSON.stringify(compare));
    updateCompareBadge();

    // Update icons on current page
    const icons = document.querySelectorAll(`#compare-icon-${productId}`);
    icons.forEach(icon => {
        const isCompared = compare.includes(productId);
        icon.classList.toggle('active', isCompared);
    });
    
    // If on compare page, re-render
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
    } else {
        grid.style.display = 'grid';
        // Max 4 columns based on items, min 1
        grid.style.gridTemplateColumns = `repeat(min(${compare.length}, 4), 1fr)`;
        emptyState.style.display = 'none';
        
        const compareProducts = products.filter(p => compare.includes(p.id));
        
        // Define all keys we want to compare from specifications
        const allSpecKeys = new Set();
        compareProducts.forEach(p => {
            if (p.specifications) {
                Object.keys(p.specifications).forEach(k => allSpecKeys.add(k));
            }
        });
        
        // Render the comparison cards/table
        grid.innerHTML = compareProducts.map(p => {
            const specsHTML = Array.from(allSpecKeys).map(key => {
                const val = p.specifications && p.specifications[key] ? p.specifications[key] : '-';
                return `<div class="compare-spec-row">
                          <span class="spec-label">${key}</span>
                          <span class="spec-value">${val}</span>
                        </div>`;
            }).join('');
            
            return `
            <div class="compare-card">
                <button class="compare-remove-btn" onclick="toggleCompare(${p.id})"><i class="fas fa-times"></i></button>
                <a href="product-detail.html?id=${p.id}" class="compare-img">
                    <img src="${p.image}" alt="${p.name}">
                </a>
                <div class="compare-info">
                    <div class="compare-brand">${p.brand}</div>
                    <a href="product-detail.html?id=${p.id}" class="compare-name">${p.name}</a>
                    <div class="compare-price">฿${formatPrice(p.price)}</div>
                    <button class="btn-buy" onclick="addToCart(${p.id})"><i class="fas fa-shopping-cart"></i> ใส่ตะกร้า</button>
                </div>
                <div class="compare-specs-list">
                    ${specsHTML}
                </div>
            </div>`;
        }).join('');
    }

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

function updateCartBadge() {
    const badges = document.querySelectorAll('#cart-count');
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badges.forEach(b => b.textContent = total);
}

function addToCart(productId) {
    const isLoggedIn = localStorage.getItem('ag_auth') === 'true';
    if (!isLoggedIn) {
        showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: productId, qty: 1 });
    }

    localStorage.setItem('ag_cart', JSON.stringify(cart));
    updateCartBadge();

    // Show toast
    showToast(`เพิ่ม "${product.name.substring(0, 30)}..." ลงตะกร้าแล้ว`);
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

    // Add to cart
    const addCartBtn = document.getElementById('btn-add-cart');
    if (addCartBtn) {
        addCartBtn.addEventListener('click', () => {
            const qty = parseInt(qtyInput.value) || 1;
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ id: product.id, qty: qty });
            }
            localStorage.setItem('ag_cart', JSON.stringify(cart));
            updateCartBadge();
            showToast(`เพิ่ม "${product.name.substring(0, 30)}..." x${qty} ลงตะกร้าแล้ว`);
        });
    }

    // Buy now
    const buyNowBtn = document.getElementById('btn-buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const isLoggedIn = localStorage.getItem('ag_auth') === 'true';
            if (!isLoggedIn) {
                showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            const qty = parseInt(qtyInput.value) || 1;
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ id: product.id, qty: qty });
            }
            localStorage.setItem('ag_cart', JSON.stringify(cart));
            updateCartBadge();

            showToast('กำลังพาไปหน้าชำระเงิน...');
            setTimeout(() => { window.location.href = 'checkout.html'; }, 800);
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

// ========== CART PAGE INIT ==========
function initCartPage() {
    const cartItemsEl = document.getElementById('cart-items');
    if (!cartItemsEl) return;

    const cartLayout = document.getElementById('cart-layout');
    const cartEmpty = document.getElementById('cart-empty');
    const FREE_SHIPPING_THRESHOLD = 1500;
    const SHIPPING_COST = 50;

    function renderCartPage() {
        if (cart.length === 0) {
            // Show empty state
            if (cartLayout) cartLayout.style.display = 'none';
            if (cartEmpty) cartEmpty.style.display = 'block';

            return;
        }

        if (cartLayout) cartLayout.style.display = 'grid';
        if (cartEmpty) cartEmpty.style.display = 'none';

        // Render items
        cartItemsEl.innerHTML = cart.map((item, index) => {
            const product = products.find(p => p.id === item.id);
            if (!product) return '';

            const itemTotal = product.price * item.qty;

            return `
            <div class="cart-item" data-index="${index}" style="animation-delay: ${index * 0.05}s">
                <div class="cart-item-product">
                    <a href="product-detail.html?id=${product.id}" class="cart-item-image">
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                    <div class="cart-item-details">
                        <div class="cart-item-name">
                            <a href="product-detail.html?id=${product.id}">${product.name}</a>
                        </div>
                        <div class="cart-item-specs">${product.specs}</div>
                    </div>
                </div>
                <div class="cart-item-price">฿${formatPrice(product.price)}</div>
                <div class="cart-item-qty">
                    <div class="cart-qty-control">
                        <button onclick="changeCartQty(${index}, -1)">−</button>
                        <input type="number" value="${item.qty}" min="1" max="99" 
                               onchange="setCartQty(${index}, this.value)">
                        <button onclick="changeCartQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-total">฿${formatPrice(itemTotal)}</div>
                <div class="cart-item-remove">
                    <button onclick="removeCartItem(${index})" title="ลบสินค้า">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>`;
        }).join('');

        // Update summary
        updateCartSummary();


    }

    function updateCartSummary() {
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.id);
            return sum + (product ? product.price * item.qty : 0);
        }, 0);

        const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
        const shipping = isFreeShipping ? 0 : SHIPPING_COST;
        const total = subtotal + shipping;

        document.getElementById('summary-qty').textContent = `${totalQty} ชิ้น`;
        document.getElementById('summary-subtotal').textContent = `฿${formatPrice(subtotal)}`;
        document.getElementById('summary-shipping').textContent = isFreeShipping ? 'ฟรี!' : `฿${formatPrice(shipping)}`;
        document.getElementById('summary-total').textContent = `฿${formatPrice(total)}`;

        // Shipping note
        const shippingNote = document.getElementById('shipping-note');
        if (shippingNote) {
            if (isFreeShipping) {
                shippingNote.className = 'cart-shipping-note free-shipping';
                shippingNote.querySelector('span').textContent = 'คุณได้รับส่งฟรี! 🎉';
            } else {
                const diff = FREE_SHIPPING_THRESHOLD - subtotal;
                shippingNote.className = 'cart-shipping-note need-more';
                shippingNote.querySelector('span').textContent = `ซื้อเพิ่มอีก ฿${formatPrice(diff)} เพื่อรับส่งฟรี`;
            }
        }
    }

    // Expose functions globally
    window.changeCartQty = function(index, delta) {
        if (index < 0 || index >= cart.length) return;
        cart[index].qty = Math.max(1, Math.min(99, cart[index].qty + delta));
        localStorage.setItem('ag_cart', JSON.stringify(cart));
        updateCartBadge();
        renderCartPage();
    };

    window.setCartQty = function(index, value) {
        if (index < 0 || index >= cart.length) return;
        const qty = parseInt(value) || 1;
        cart[index].qty = Math.max(1, Math.min(99, qty));
        localStorage.setItem('ag_cart', JSON.stringify(cart));
        updateCartBadge();
        renderCartPage();
    };

    window.removeCartItem = function(index) {
        if (index < 0 || index >= cart.length) return;
        const product = products.find(p => p.id === cart[index].id);
        cart.splice(index, 1);
        localStorage.setItem('ag_cart', JSON.stringify(cart));
        updateCartBadge();
        renderCartPage();
        if (product) {
            showToast(`ลบ "${product.name.substring(0, 30)}..." ออกจากตะกร้าแล้ว`);
        }
    };

    // Clear cart button
    const clearBtn = document.getElementById('cart-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            if (confirm('คุณต้องการล้างตะกร้าสินค้าทั้งหมดหรือไม่?')) {
                cart.length = 0;
                localStorage.setItem('ag_cart', JSON.stringify(cart));
                updateCartBadge();
                renderCartPage();
                showToast('ล้างตะกร้าสินค้าเรียบร้อยแล้ว');
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('ไม่มีสินค้าในตะกร้า');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    renderCartPage();
}

// ========== CHECKOUT PAGE INIT ==========
function initCheckoutPage() {
    const container = document.getElementById('checkout-container');
    if (!container) return; // Only run on checkout page

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 60px 0;">
                <i class="fas fa-shopping-cart" style="font-size: 60px; color: #ccc; margin-bottom: 20px;"></i>
                <h2 style="margin-bottom: 10px;">ไม่พบสินค้าในตะกร้า</h2>
                <p style="color: #666; margin-bottom: 20px;">กรุณาเลือกสินค้าใส่ตะกร้าก่อนดำเนินการชำระเงิน</p>
                <a href="products.html" class="view-all-btn" style="display:inline-block; padding: 12px 24px;">เลือกซื้อสินค้า</a>
            </div>
        `;
        return;
    }

    // Render Order Summary
    const listEl = document.getElementById('chk-items-list');
    const qtyEl = document.getElementById('chk-qty');
    const subtotalEl = document.getElementById('chk-subtotal');
    const shippingEl = document.getElementById('chk-shipping');
    const totalEl = document.getElementById('chk-total');

    const FREE_SHIPPING_THRESHOLD = 1500;
    const SHIPPING_COST = 50;

    let totalQty = 0;
    let subtotal = 0;

    listEl.innerHTML = cart.map((item) => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        totalQty += item.qty;
        subtotal += product.price * item.qty;
        
        return `
            <div class="c-item">
                <div style="display:flex;">
                    <div class="c-item-img"><img src="${product.image}" alt=""></div>
                    <div class="c-item-info">
                        <div class="c-item-title">${product.name}</div>
                        <div class="c-item-qty">จำนวน: ${item.qty}</div>
                    </div>
                </div>
                <div class="c-item-price">฿${formatPrice(product.price * item.qty)}</div>
            </div>
        `;
    }).join('');

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shipping = isFreeShipping ? 0 : SHIPPING_COST;
    const finalTotal = subtotal + shipping;

    if (qtyEl) qtyEl.textContent = totalQty;
    if (subtotalEl) subtotalEl.textContent = `฿${formatPrice(subtotal)}`;
    if (shippingEl) shippingEl.textContent = isFreeShipping ? 'ฟรี!' : `฿${formatPrice(shipping)}`;
    if (totalEl) totalEl.textContent = `฿${formatPrice(finalTotal)}`;

    // Place Order validation and Success Modal
    const btnPlaceOrder = document.getElementById('btn-place-order');
    const modal = document.getElementById('checkout-success-modal');
    
    if (btnPlaceOrder) {
        btnPlaceOrder.addEventListener('click', () => {
            const fname = document.getElementById('chk-fname')?.value;
            const lname = document.getElementById('chk-lname')?.value;
            const phone = document.getElementById('chk-phone')?.value;
            const email = document.getElementById('chk-email')?.value;
            const address = document.getElementById('chk-address')?.value;
            const province = document.getElementById('chk-province')?.value;
            const zipcode = document.getElementById('chk-zipcode')?.value;
            const note = document.getElementById('chk-note')?.value || '';
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'credit_card';
            
            if (!fname || !lname || !phone || !address || !province || !zipcode) {
                showToast('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วนในช่องที่มี (*)');
                return;
            }
            
            // Generate order ID
            const orderIdStr = '#AG-' + Math.floor(100000 + Math.random() * 900000);
            
            // Build order object
            const orderItems = cart.map(item => {
                const p = products.find(pr => pr.id === item.id);
                return p ? { id: p.id, name: p.name, image: p.image, price: p.price, qty: item.qty } : null;
            }).filter(Boolean);
            
            const paymentLabels = {
                credit_card: 'บัตรเครดิต / เดบิต',
                promptpay: 'QR Code (พร้อมเพย์)',
                ibanking: 'Mobile Banking',
                cod: 'เก็บเงินปลายทาง (COD)'
            };
            
            const orderData = {
                orderId: orderIdStr,
                date: new Date().toISOString(),
                items: orderItems,
                shipping: { name: `${fname} ${lname}`, phone, email: email || '', address, province, zipcode, note },
                paymentMethod: paymentLabels[paymentMethod] || paymentMethod,
                subtotal: subtotal,
                shippingCost: shipping,
                total: finalTotal,
                status: 'processing'
            };
            
            // Save to ag_orders in localStorage (as fallback)
            const orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');
            orders.unshift(orderData);
            localStorage.setItem('ag_orders', JSON.stringify(orders));
            
            // Push to Status API Backend
            const apiPayload = {
                order_id: orderIdStr,
                customer_name: `${fname} ${lname}`,
                customer_phone: phone,
                customer_email: email || '',
                shipping_address: address,
                shipping_province: province,
                shipping_zipcode: zipcode,
                shipping_note: note,
                payment_method: orderData.paymentMethod,
                subtotal: subtotal,
                shipping_cost: shipping,
                total: finalTotal,
                status: 'processing',
                items: orderItems
            };

            fetch('api/status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            }).then(res => res.json())
              .then(data => console.log('✅ Order saved to API:', data))
              .catch(err => console.warn('⚠️ API unavailable, order saved only to local storage', err));
            
            // Show Success Modal
            document.getElementById('order-id').textContent = orderIdStr;
            modal.style.display = 'flex';
            
            // Clear Cart visually and locally
            cart.length = 0;
            localStorage.setItem('ag_cart', JSON.stringify(cart));
            updateCartBadge();
        });
    }
}

// ========== AUTHENTICATION ==========
function initAuth() {
    const isLoggedIn = localStorage.getItem('ag_auth') === 'true';
    const currentPath = window.location.pathname.toLowerCase();
    
    // Protect account.html, cart.html, checkout.html, wishlist.html
    const protectedPages = ['account.html', 'cart.html', 'checkout.html', 'wishlist.html'];
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
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const firstName = document.getElementById('reg-fname').value.trim();
            const lastName  = document.getElementById('reg-lname').value.trim();
            const email     = document.getElementById('reg-email').value.trim();
            const password  = document.getElementById('reg-password').value;
            const confirmPw = document.getElementById('reg-confirm-password').value;

            // Validation
            if (password.length < 8) {
                showToast('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
                return;
            }
            if (password !== confirmPw) {
                showToast('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่');
                return;
            }

            // Check if email already exists in the users registry
            const usersRegistry = JSON.parse(localStorage.getItem('ag_users') || '[]');
            if (usersRegistry.some(u => u.email === email)) {
                showToast('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
                return;
            }

            // Create the new user object
            const newUser = {
                id: Date.now(),
                firstName,
                lastName,
                email,
                password,   // In production this must be hashed on the server
                phone: '',
                dob: '',
                gender: '',
                role: 'user',
                createdAt: new Date().toISOString()
            };

            // Save to the users registry (simulates the database)
            usersRegistry.push(newUser);
            localStorage.setItem('ag_users', JSON.stringify(usersRegistry));

            // Set as current logged-in user
            localStorage.setItem('ag_auth', 'true');
            localStorage.setItem('ag_user', JSON.stringify(newUser));

            showToast('สมัครสมาชิกเรียบร้อยแล้ว! กำลังเข้าสู่ระบบ...');
            setTimeout(() => { window.location.href = 'account.html'; }, 1000);
        });
        return; // Don't bind login handler on register page
    }

    // ---- Handle LOGIN form ----
    const loginForm = document.getElementById('login-email') ? document.querySelector('.auth-form') : null;
    if (loginForm && currentPath.endsWith('login.html')) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email    = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            // Look up the user in the registry
            const usersRegistry = JSON.parse(localStorage.getItem('ag_users') || '[]');
            const foundUser = usersRegistry.find(u => u.email === email && u.password === password);

            if (!foundUser) {
                showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
                return;
            }

            // Set as current logged-in user
            localStorage.setItem('ag_auth', 'true');
            localStorage.setItem('ag_user', JSON.stringify(foundUser));

            showToast('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับกลับ');
            setTimeout(() => { window.location.href = 'account.html'; }, 1000);
        });
    }

    // Sidebar Logout Link in Account.html
    const sidebarLogout = document.querySelector('.logout-link');
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('ag_auth');
            localStorage.removeItem('ag_user');
            localStorage.removeItem('ag_cart');
            localStorage.removeItem('ag_wishlist');
            cart.length = 0;
            wishlist.length = 0;
            showToast('ออกจากระบบเรียบร้อยแล้ว');
            setTimeout(() => { window.location.href = 'index.html'; }, 800);
        });
    }
}

// ========== ACCOUNT PAGE ==========
function initAccountPage() {
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
            if (targetTab === 'orders') renderOrderHistory();
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

    profileForm.addEventListener('submit', (e) => {
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
        if (sidebarName) sidebarName.textContent = `${user.firstName} ${user.lastName}`.trim();
        showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว ✓');
    });

    // ===== Order History Tab =====
    function renderOrderHistory() {
        const listEl = document.getElementById('orders-list');
        const emptyEl = document.getElementById('orders-empty');
        if (!listEl) return;

        const orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');

        if (orders.length === 0) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';

        const statusLabels = {
            processing: { text: 'กำลังดำเนินการ', icon: 'fas fa-clock', cls: 'processing' },
            shipped: { text: 'จัดส่งแล้ว', icon: 'fas fa-shipping-fast', cls: 'shipped' },
            delivered: { text: 'ส่งถึงแล้ว', icon: 'fas fa-check-circle', cls: 'delivered' },
            cancelled: { text: 'ยกเลิกแล้ว', icon: 'fas fa-times-circle', cls: 'cancelled' }
        };

        listEl.innerHTML = orders.map((order, idx) => {
            const st = statusLabels[order.status] || statusLabels.processing;
            const orderDate = new Date(order.date);
            const dateStr = orderDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = orderDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

            const itemsHTML = order.items.map(item => `
                <div class="order-item-row">
                    <div class="order-item-img"><img src="${item.image}" alt=""></div>
                    <div class="order-item-info">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-qty">จำนวน: ${item.qty}</div>
                    </div>
                    <div class="order-item-price">฿${formatPrice(item.price * item.qty)}</div>
                </div>
            `).join('');

            return `
            <div class="order-card">
                <div class="order-card-header" onclick="document.getElementById('order-body-${idx}').classList.toggle('expanded'); this.querySelector('.order-toggle-icon').classList.toggle('rotated');">
                    <div class="order-meta">
                        <span class="order-meta-item"><strong>${order.orderId}</strong></span>
                        <span class="order-meta-item">${dateStr} ${timeStr}</span>
                        <span class="order-meta-item">${itemCount} ชิ้น</span>
                        <span class="order-meta-item"><strong>฿${formatPrice(order.total)}</strong></span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span class="order-status-badge ${st.cls}"><i class="${st.icon}"></i> ${st.text}</span>
                        <i class="fas fa-chevron-down order-toggle-icon"></i>
                    </div>
                </div>
                <div class="order-card-body" id="order-body-${idx}">
                    ${itemsHTML}
                    <div style="margin-top:14px;">
                        <div class="order-summary-row"><span>ยอดรวมสินค้า</span><span>฿${formatPrice(order.subtotal)}</span></div>
                        <div class="order-summary-row"><span>ค่าจัดส่ง</span><span>${order.shippingCost === 0 ? 'ฟรี' : '฿' + formatPrice(order.shippingCost)}</span></div>
                        <div class="order-summary-row total"><span>ยอดรวมทั้งสิ้น</span><span>฿${formatPrice(order.total)}</span></div>
                    </div>
                    <div class="order-shipping-info">
                        <strong><i class="fas fa-map-marker-alt"></i> ที่อยู่จัดส่ง:</strong><br>
                        ${order.shipping.name} | ${order.shipping.phone}<br>
                        ${order.shipping.address}, ${order.shipping.province} ${order.shipping.zipcode}
                        ${order.shipping.note ? '<br><em>หมายเหตุ: ' + order.shipping.note + '</em>' : ''}
                    </div>
                    <div style="margin-top:8px;font-size:13px;color:var(--text-light);">
                        <i class="fas fa-credit-card"></i> ชำระด้วย: ${order.paymentMethod}
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // ===== Addresses Tab =====
    function getAddresses() {
        return JSON.parse(localStorage.getItem('ag_addresses') || '[]');
    }
    function saveAddresses(arr) {
        localStorage.setItem('ag_addresses', JSON.stringify(arr));
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

// ========== ORDER STATUS CHECK MODAL ==========
function openOrderStatusModal() {
    const modal = document.getElementById('order-status-modal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Focus the input
    setTimeout(() => {
        const input = document.getElementById('order-status-input');
        if (input) input.focus();
    }, 300);
}

function closeOrderStatusModal() {
    const modal = document.getElementById('order-status-modal');
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

async function searchOrderStatus() {
    const input = document.getElementById('order-status-input');
    const searchBtn = document.querySelector('.order-search-btn');
    if (!input) return;

    let query = input.value.trim();
    if (!query) {
        showToast('กรุณากรอกรหัสคำสั่งซื้อ');
        input.focus();
        return;
    }

    // Normalize: ensure prefix
    if (!query.startsWith('#')) query = '#' + query;
    const queryNoHash = query.replace('#', '');

    const emptyEl = document.getElementById('order-status-empty');
    const notFoundEl = document.getElementById('order-status-notfound');
    const foundEl = document.getElementById('order-status-found');

    let order = null;

    // UI Loading state
    if (searchBtn) searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ค้นหา...';
    if (searchBtn) searchBtn.disabled = true;

    try {
        // Try to fetch from API
        const response = await fetch('api/status.php?id=' + encodeURIComponent(queryNoHash));
        const result = await response.json();
        if (result.success && result.data) {
            order = result.data;
        } else {
            // API returned successful response but order not found
            order = null;
        }
    } catch (error) {
        // API failed (offline / no server) — fallback to localStorage
        console.warn('⚠️ API unavailable, searching localStorage fallback', error.message);
        const orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');
        order = orders.find(o => o.orderId && o.orderId.toLowerCase() === query.toLowerCase());
    }

    // Restore UI UI state
    if (searchBtn) searchBtn.innerHTML = '<i class="fas fa-search"></i> ค้นหา';
    if (searchBtn) searchBtn.disabled = false;

    if (!order) {
        // Not found
        emptyEl.style.display = 'none';
        notFoundEl.style.display = 'block';
        foundEl.style.display = 'none';
        return;
    }

    // Found — show details
    emptyEl.style.display = 'none';
    notFoundEl.style.display = 'none';
    foundEl.style.display = 'block';

    renderOrderStatusDetails(order);
}

function renderOrderStatusDetails(order) {
    const STATUS_LABELS = {
        processing: 'รอดำเนินการ',
        shipping: 'กำลังจัดส่ง',
        delivered: 'จัดส่งแล้ว',
        cancelled: 'ยกเลิก'
    };

    const STATUS_STEPS = ['processing', 'shipping', 'delivered'];

    // Header
    document.getElementById('osf-order-id').textContent = order.orderId;
    const d = new Date(order.date);
    document.getElementById('osf-date').textContent = d.toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Badge
    const badgeEl = document.getElementById('osf-badge');
    badgeEl.textContent = STATUS_LABELS[order.status] || order.status;
    badgeEl.className = 'osf-badge ' + order.status;

    // Timeline
    const currentStepIndex = STATUS_STEPS.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    // Reset all
    STATUS_STEPS.forEach((step, i) => {
        const stepEl = document.getElementById('step-' + step);
        stepEl.className = 'timeline-step';
    });
    document.getElementById('line-1').className = 'timeline-line';
    document.getElementById('line-2').className = 'timeline-line';

    // Show/hide timeline vs cancelled banner
    const timelineEl = document.querySelector('.order-timeline');
    const cancelledBanner = document.getElementById('osf-cancelled-banner');

    if (isCancelled) {
        timelineEl.style.display = 'none';
        cancelledBanner.style.display = 'flex';
    } else {
        timelineEl.style.display = 'flex';
        cancelledBanner.style.display = 'none';

        // Mark completed and active steps
        STATUS_STEPS.forEach((step, i) => {
            const stepEl = document.getElementById('step-' + step);
            if (i < currentStepIndex) {
                stepEl.classList.add('completed');
            } else if (i === currentStepIndex) {
                stepEl.classList.add('active');
            }
        });

        // Lines
        if (currentStepIndex >= 1) document.getElementById('line-1').classList.add('filled');
        if (currentStepIndex >= 2) document.getElementById('line-2').classList.add('filled');
    }

    // Shipping info
    const shipping = order.shipping || {};
    document.getElementById('osf-name').textContent = shipping.name || '-';
    document.getElementById('osf-phone').textContent = shipping.phone || '-';
    document.getElementById('osf-address').textContent =
        [shipping.address, shipping.province, shipping.zipcode].filter(Boolean).join(', ') || '-';
    document.getElementById('osf-payment').textContent = order.paymentMethod || '-';

    // Items
    const itemsEl = document.getElementById('osf-items');
    const items = order.items || [];
    itemsEl.innerHTML = items.map(item => `
        <li>
            <img src="${item.image || 'https://placehold.co/44x44/f5f5f5/ccc?text=...'}" alt="">
            <div class="osf-item-info">
                <div class="osf-item-name">${item.name || '-'}</div>
                <div class="osf-item-qty">จำนวน: ${item.qty || 1}</div>
            </div>
            <div class="osf-item-price">฿${((item.price || 0) * (item.qty || 1)).toLocaleString('th-TH')}</div>
        </li>
    `).join('');

    // Totals
    document.getElementById('osf-subtotal').textContent = `฿${(order.subtotal || 0).toLocaleString('th-TH')}`;
    document.getElementById('osf-shipping').textContent =
        order.shippingCost === 0 ? 'ฟรี' : `฿${(order.shippingCost || 0).toLocaleString('th-TH')}`;
    document.getElementById('osf-total').textContent = `฿${(order.total || 0).toLocaleString('th-TH')}`;
}

function initOrderStatusModal() {
    // Enter key to search
    const input = document.getElementById('order-status-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchOrderStatus();
        });
    }

    // Close on overlay click
    const overlay = document.getElementById('order-status-modal');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOrderStatusModal();
        });
    }
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
    updateCartBadge();
    updateWishlistBadge();
    updateCompareBadge();
    initSlider();
    initMobileNav();
    initBackToTop();
    initSearch();
    initAccountPage();
    initOrderStatusModal();
    initViewToggle();

    // These depend on product data — wait for API/fallback to load
    onDataReady(() => {
        initHomepage();
        initProductsPage();
        initProductDetail();
        initCartPage();
        initCheckoutPage();
        initWishlistPage();
        initComparePage();
    });
});

