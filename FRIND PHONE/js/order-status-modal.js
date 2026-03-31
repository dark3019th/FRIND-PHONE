// =============================================
// Order Status Modal — Auto-inject HTML
// =============================================
// This script automatically injects the order status modal HTML
// into any page that includes it. No need to copy modal HTML to every page.

(function() {
    const modalHTML = `
    <div class="order-status-overlay" id="order-status-modal">
        <div class="order-status-modal">
            <button class="order-status-close" onclick="closeOrderStatusModal()">&times;</button>
            <div class="order-status-header">
                <div class="order-status-icon"><i class="fas fa-shipping-fast"></i></div>
                <h2>เช็คสถานะคำสั่งซื้อ</h2>
                <p>กรอกรหัสคำสั่งซื้อเพื่อตรวจสอบสถานะ</p>
            </div>
            <div class="order-status-search">
                <div class="order-search-input-wrap">
                    <i class="fas fa-search"></i>
                    <input type="text" id="order-status-input" placeholder="เช่น #AG-123456" autocomplete="off">
                </div>
                <button class="order-search-btn" onclick="searchOrderStatus()">
                    <i class="fas fa-search"></i> ค้นหา
                </button>
            </div>
            <div class="order-status-result" id="order-status-result">
                <div class="order-status-empty" id="order-status-empty">
                    <i class="fas fa-box-open"></i>
                    <p>กรอกรหัสคำสั่งซื้อด้านบนเพื่อเริ่มค้นหา</p>
                </div>
                <div class="order-status-notfound" id="order-status-notfound" style="display:none;">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>ไม่พบคำสั่งซื้อนี้</p>
                    <small>กรุณาตรวจสอบรหัสคำสั่งซื้อแล้วลองใหม่อีกครั้ง</small>
                </div>
                <div class="order-status-found" id="order-status-found" style="display:none;">
                    <div class="osf-header">
                        <div>
                            <span class="osf-order-id" id="osf-order-id"></span>
                            <span class="osf-date" id="osf-date"></span>
                        </div>
                        <span class="osf-badge" id="osf-badge"></span>
                    </div>
                    <div class="order-timeline">
                        <div class="timeline-step" id="step-processing">
                            <div class="timeline-dot"><i class="fas fa-clipboard-list"></i></div>
                            <span>รอดำเนินการ</span>
                        </div>
                        <div class="timeline-line" id="line-1"></div>
                        <div class="timeline-step" id="step-shipping">
                            <div class="timeline-dot"><i class="fas fa-truck"></i></div>
                            <span>กำลังจัดส่ง</span>
                        </div>
                        <div class="timeline-line" id="line-2"></div>
                        <div class="timeline-step" id="step-delivered">
                            <div class="timeline-dot"><i class="fas fa-check-circle"></i></div>
                            <span>จัดส่งแล้ว</span>
                        </div>
                    </div>
                    <div class="osf-cancelled-banner" id="osf-cancelled-banner" style="display:none;">
                        <i class="fas fa-ban"></i> คำสั่งซื้อนี้ถูกยกเลิก
                    </div>
                    <div class="osf-details">
                        <div class="osf-detail-section">
                            <h4><i class="fas fa-user"></i> ข้อมูลผู้รับ</h4>
                            <div class="osf-detail-grid">
                                <div><span class="label">ชื่อ</span><span class="val" id="osf-name"></span></div>
                                <div><span class="label">เบอร์โทร</span><span class="val" id="osf-phone"></span></div>
                                <div><span class="label">ที่อยู่</span><span class="val" id="osf-address"></span></div>
                                <div><span class="label">ชำระเงิน</span><span class="val" id="osf-payment"></span></div>
                            </div>
                        </div>
                        <div class="osf-detail-section">
                            <h4><i class="fas fa-box"></i> รายการสินค้า</h4>
                            <ul class="osf-items" id="osf-items"></ul>
                        </div>
                        <div class="osf-totals">
                            <div><span>ราคาสินค้า</span><span id="osf-subtotal"></span></div>
                            <div><span>ค่าจัดส่ง</span><span id="osf-shipping"></span></div>
                            <div class="osf-grand"><span>ยอดรวม</span><span id="osf-total"></span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    // Inject into body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
})();
