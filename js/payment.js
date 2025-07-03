// Payment Processing System
class PaymentManager {
  constructor() {
    this.adminContacts = {
      gopay: "0895340205302",
      whatsapp: "6285810526151",
    };
    this.exchangeRates = {
      coins: 10, // 1 coin = Rp 10
      diamonds: 500, // 1 diamond = Rp 500
    };
    this.init();
  }

  init() {
    this.setupPaymentEventListeners();
    this.loadPaymentMethods();
  }

  setupPaymentEventListeners() {
    // Listen for payment method selection
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("payment-btn")) {
        this.selectPaymentMethod(e.target);
      }
    });
  }

  selectPaymentMethod(button) {
    // Remove active class from all payment buttons
    document.querySelectorAll(".payment-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to selected button
    button.classList.add("active");

    // Update payment details
    this.updatePaymentDetails(button.dataset.method);
  }

  updatePaymentDetails(method) {
    const paymentDetails = document.getElementById("paymentDetails");
    if (!paymentDetails) return;

    const paymentInfo = this.getPaymentInfo(method);
    paymentDetails.innerHTML = paymentInfo;
  }

  getPaymentInfo(method) {
    switch (method) {
      case "gopay":
        return `
                    <div class="payment-info">
                        <h4>💳 Pembayaran GoPay</h4>
                        <div class="payment-details-card">
                            <div class="payment-detail-row">
                                <span class="detail-label">Nomor GoPay:</span>
                                <span class="detail-value">${this.adminContacts.gopay}</span>
                                <button class="copy-btn" onclick="navigator.clipboard.writeText('${this.adminContacts.gopay}')">📋</button>
                            </div>
                            <div class="payment-detail-row">
                                <span class="detail-label">Atas Nama:</span>
                                <span class="detail-value">Admin Nabila Stream</span>
                            </div>
                        </div>
                        <div class="payment-instructions">
                            <h5>📋 Instruksi Pembayaran:</h5>
                            <ol>
                                <li>Buka aplikasi GoPay/Gojek</li>
                                <li>Pilih menu "Transfer" atau "Kirim Uang"</li>
                                <li>Masukkan nomor: <strong>${this.adminContacts.gopay}</strong></li>
                                <li>Masukkan nominal sesuai total pembayaran</li>
                                <li>Konfirmasi transfer</li>
                                <li>Screenshot bukti transfer</li>
                                <li>Klik "Checkout via WhatsApp" untuk konfirmasi</li>
                            </ol>
                        </div>
                        <div class="payment-warning">
                            ⚠️ Pastikan nominal transfer sesuai dengan total pembayaran
                        </div>
                    </div>
                `;

      case "bank":
        return `
                    <div class="payment-info">
                        <h4>🏦 Transfer Bank</h4>
                        <div class="payment-details-card">
                            <div class="payment-detail-row">
                                <span class="detail-label">Bank:</span>
                                <span class="detail-value">BCA</span>
                            </div>
                            <div class="payment-detail-row">
                                <span class="detail-label">No. Rekening:</span>
                                <span class="detail-value">1234567890</span>
                                <button class="copy-btn" onclick="navigator.clipboard.writeText('1234567890')">📋</button>
                            </div>
                            <div class="payment-detail-row">
                                <span class="detail-label">Atas Nama:</span>
                                <span class="detail-value">Admin Nabila Stream</span>
                            </div>
                        </div>
                        <div class="payment-instructions">
                            <h5>📋 Instruksi Pembayaran:</h5>
                            <ol>
                                <li>Buka aplikasi mobile banking atau datang ke ATM</li>
                                <li>Pilih menu "Transfer"</li>
                                <li>Pilih "Transfer ke BCA"</li>
                                <li>Masukkan nomor rekening: <strong>1234567890</strong></li>
                                <li>Masukkan nominal sesuai total pembayaran</li>
                                <li>Konfirmasi transfer</li>
                                <li>Simpan bukti transfer</li>
                                <li>Klik "Checkout via WhatsApp" untuk konfirmasi</li>
                            </ol>
                        </div>
                        <div class="payment-warning">
                            ⚠️ Transfer hanya diterima dari rekening atas nama sendiri
                        </div>
                    </div>
                `;

      default:
        return '<div class="payment-info">Pilih metode pembayaran</div>';
    }
  }

  loadPaymentMethods() {
    // Set default payment method
    const defaultPaymentBtn = document.querySelector(
      '.payment-btn[data-method="gopay"]',
    );
    if (defaultPaymentBtn) {
      this.selectPaymentMethod(defaultPaymentBtn);
    }
  }

  generatePaymentReference() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `NS${timestamp}${random}`;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  createWhatsAppMessage(orderData) {
    const { item, quantity, totalPrice, paymentMethod, user, orderRef } =
      orderData;

    let message = `🛍️ *PESANAN BARU - NABILA STREAM*\n\n`;
    message += `📋 *Ref Order:* ${orderRef}\n`;
    message += `⏰ *Waktu:* ${new Date().toLocaleString("id-ID")}\n\n`;

    message += `👤 *DATA CUSTOMER:*\n`;
    message += `• Nama: ${user.name}\n`;
    message += `• Email: ${user.email}\n`;
    message += `• Username: ${user.username || user.email}\n\n`;

    message += `📦 *DETAIL PESANAN:*\n`;
    message += `• Item: ${item.icon} ${item.name}\n`;
    message += `• Deskripsi: ${item.description}\n`;
    message += `• Jumlah: ${quantity}\n`;
    message += `• Harga Satuan: ${this.formatCurrency(item.price)}\n`;
    message += `• Total: ${this.formatCurrency(totalPrice)}\n\n`;

    if (item.features && item.features.length > 0) {
      message += `✨ *FEATURES INCLUDED:*\n`;
      item.features.forEach((feature) => {
        message += `• ${feature}\n`;
      });
      message += `\n`;
    }

    message += `💳 *METODE PEMBAYARAN:*\n`;
    if (paymentMethod === "gopay") {
      message += `• GoPay: ${this.adminContacts.gopay}\n`;
      message += `• Saya sudah transfer via GoPay ✅\n\n`;
    } else {
      message += `• Transfer Bank BCA: 1234567890\n`;
      message += `• Saya sudah transfer via Bank ✅\n\n`;
    }

    message += `📎 *BUKTI TRANSFER:*\n`;
    message += `Saya akan mengirim screenshot bukti transfer setelah pesan ini.\n\n`;

    message += `🙏 *Mohon diproses dan konfirmasi pesanan saya.*\n`;
    message += `Terima kasih!`;

    return message;
  }

  createTopUpWhatsAppMessage(orderData) {
    const { currency, amount, price, user, orderRef } = orderData;
    const currencyIcon = currency === "coins" ? "💎" : "💍";
    const currencyName = currency === "coins" ? "Coins" : "Diamonds";

    let message = `💰 *TOP UP REQUEST - NABILA STREAM*\n\n`;
    message += `📋 *Ref Order:* ${orderRef}\n`;
    message += `⏰ *Waktu:* ${new Date().toLocaleString("id-ID")}\n\n`;

    message += `👤 *DATA CUSTOMER:*\n`;
    message += `• Nama: ${user.name}\n`;
    message += `• Email: ${user.email}\n`;
    message += `• Username: ${user.username || user.email}\n\n`;

    message += `💰 *DETAIL TOP UP:*\n`;
    message += `• ${currencyIcon} ${currencyName}: ${amount.toLocaleString()}\n`;
    message += `• Total Pembayaran: ${this.formatCurrency(price)}\n`;
    message += `• Rate: 1 ${currencyName.slice(0, -1)} = ${this.formatCurrency(currency === "coins" ? this.exchangeRates.coins : this.exchangeRates.diamonds)}\n\n`;

    message += `💳 *PEMBAYARAN:*\n`;
    message += `• GoPay: ${this.adminContacts.gopay}\n`;
    message += `• Saya sudah transfer via GoPay ✅\n\n`;

    message += `📎 *BUKTI TRANSFER:*\n`;
    message += `Saya akan mengirim screenshot bukti transfer setelah pesan ini.\n\n`;

    message += `🙏 *Mohon tambahkan ${currencyName} ke akun saya.*\n`;
    message += `Terima kasih!`;

    return message;
  }

  processWhatsAppCheckout(orderData) {
    const message = orderData.isTopUp
      ? this.createTopUpWhatsAppMessage(orderData)
      : this.createWhatsAppMessage(orderData);

    const whatsappUrl = `https://wa.me/${this.adminContacts.whatsapp}?text=${encodeURIComponent(message)}`;

    // Track the order
    this.trackOrder(orderData);

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    return {
      success: true,
      message:
        "Pesanan berhasil dibuat! Anda akan diarahkan ke WhatsApp admin.",
      orderRef: orderData.orderRef,
    };
  }

  trackOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");

    const order = {
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(order);
    localStorage.setItem("nabila_orders", JSON.stringify(orders));

    // Also add to purchase history for compatibility
    if (window.shopManager) {
      window.shopManager.addPurchaseToHistory(
        orderData.item,
        orderData.quantity,
        "pending",
      );
    }
  }

  getUserOrders(userId) {
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");
    return orders.filter((order) => order.user.id === userId);
  }

  updateOrderStatus(orderRef, status, adminNotes = "") {
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");
    const orderIndex = orders.findIndex((order) => order.orderRef === orderRef);

    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date().toISOString();
      orders[orderIndex].adminNotes = adminNotes;

      localStorage.setItem("nabila_orders", JSON.stringify(orders));

      // Update user balance if approved and it's a top-up
      if (status === "approved" && orders[orderIndex].isTopUp) {
        this.processTopUpApproval(orders[orderIndex]);
      }

      return true;
    }

    return false;
  }

  processTopUpApproval(order) {
    const balances = JSON.parse(
      localStorage.getItem("nabila_balances") || "{}",
    );
    const userId = order.user.id;

    if (!balances[userId]) {
      balances[userId] = { coins: 0, diamonds: 0 };
    }

    if (order.currency === "coins") {
      balances[userId].coins += order.amount;
    } else if (order.currency === "diamonds") {
      balances[userId].diamonds += order.amount;
    }

    localStorage.setItem("nabila_balances", JSON.stringify(balances));

    // Send notification to user (if they're currently online)
    this.notifyUser(userId, {
      type: "topup_approved",
      currency: order.currency,
      amount: order.amount,
      message: `Top up ${order.amount.toLocaleString()} ${order.currency} berhasil!`,
    });
  }

  notifyUser(userId, notification) {
    const notifications = JSON.parse(
      localStorage.getItem("nabila_notifications") || "{}",
    );

    if (!notifications[userId]) {
      notifications[userId] = [];
    }

    notifications[userId].unshift({
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    });

    // Keep only last 50 notifications per user
    notifications[userId] = notifications[userId].slice(0, 50);

    localStorage.setItem("nabila_notifications", JSON.stringify(notifications));

    // Show notification if user is currently active
    if (
      window.shopManager &&
      window.shopManager.currentUser &&
      window.shopManager.currentUser.id === userId
    ) {
      this.showInAppNotification(notification);
    }
  }

  showInAppNotification(notification) {
    const notificationElement = document.createElement("div");
    notificationElement.className = "payment-notification success";
    notificationElement.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">💰</span>
                <span class="notification-message">${notification.message}</span>
            </div>
        `;

    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.remove();
    }, 5000);

    // Update balance display
    if (window.shopManager) {
      window.shopManager.updateBalanceDisplay();
    }
  }

  generateOrderSummary(orderData) {
    const { item, quantity, totalPrice, paymentMethod, orderRef } = orderData;

    return `
            <div class="order-summary">
                <h4>📋 Ringkasan Pesanan</h4>
                <div class="summary-row">
                    <span>Order Reference:</span>
                    <span>${orderRef}</span>
                </div>
                <div class="summary-row">
                    <span>Item:</span>
                    <span>${item.icon} ${item.name}</span>
                </div>
                <div class="summary-row">
                    <span>Jumlah:</span>
                    <span>${quantity}</span>
                </div>
                <div class="summary-row">
                    <span>Total:</span>
                    <span>${this.formatCurrency(totalPrice)}</span>
                </div>
                <div class="summary-row">
                    <span>Pembayaran:</span>
                    <span>${paymentMethod === "gopay" ? "GoPay" : "Transfer Bank"}</span>
                </div>
                <div class="summary-row">
                    <span>Status:</span>
                    <span class="status-pending">Menunggu Konfirmasi</span>
                </div>
            </div>
        `;
  }
}

// Initialize payment manager
document.addEventListener("DOMContentLoaded", () => {
  window.paymentManager = new PaymentManager();
});

// Add additional styles for payment UI
const paymentStyles = document.createElement("style");
paymentStyles.textContent = `
    .payment-details-card {
        background: var(--bg-dark);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
        margin: 15px 0;
    }
    
    .payment-detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .payment-detail-row:last-child {
        border-bottom: none;
    }
    
    .detail-label {
        color: var(--text-dark);
        font-weight: 500;
    }
    
    .detail-value {
        color: var(--text-light);
        font-weight: bold;
        font-family: monospace;
    }
    
    .copy-btn {
        background: var(--secondary-color);
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }
    
    .copy-btn:hover {
        background: var(--primary-color);
        transform: scale(1.05);
    }
    
    .payment-instructions {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
        margin: 15px 0;
    }
    
    .payment-instructions h5 {
        color: var(--text-light);
        margin-bottom: 15px;
        font-size: 1.1rem;
    }
    
    .payment-instructions ol {
        color: var(--text-dark);
        line-height: 1.6;
        padding-left: 20px;
    }
    
    .payment-instructions li {
        margin-bottom: 8px;
    }
    
    .payment-instructions strong {
        color: var(--accent-color);
        font-weight: bold;
    }
    
    .payment-warning {
        background: rgba(241, 196, 15, 0.1);
        border: 1px solid #f1c40f;
        border-radius: 8px;
        padding: 12px;
        color: #f1c40f;
        font-weight: bold;
        margin-top: 15px;
        text-align: center;
    }
    
    .order-summary {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
    }
    
    .order-summary h4 {
        color: var(--text-light);
        margin-bottom: 15px;
        text-align: center;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .summary-row:last-child {
        border-bottom: none;
        font-weight: bold;
        margin-top: 10px;
        padding-top: 15px;
        border-top: 2px solid var(--border-color);
    }
    
    .summary-row span:first-child {
        color: var(--text-dark);
    }
    
    .summary-row span:last-child {
        color: var(--text-light);
        font-weight: 500;
    }
`;
document.head.appendChild(paymentStyles);
