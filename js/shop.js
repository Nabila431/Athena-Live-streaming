// Shop Management System
class ShopManager {
  constructor() {
    this.currentUser = null;
    this.shopItems = {
      coins: [
        {
          id: "coins_basic",
          name: "100 Coins",
          description: "Perfect for beginners to start gifting!",
          icon: "💎",
          amount: 100,
          price: 500,
          bonus: null,
          popular: false,
        },
        {
          id: "coins_starter",
          name: "500 Coins",
          description: "Great starter pack for new users!",
          icon: "💎",
          amount: 500,
          price: 2500,
          bonus: "50 Bonus Coins",
          popular: true,
        },
        {
          id: "coins_popular",
          name: "1,000 Coins",
          description: "Most popular choice with bonus!",
          icon: "💎",
          amount: 1000,
          price: 5000,
          bonus: "150 Bonus Coins",
          popular: true,
        },
        {
          id: "coins_value",
          name: "2,500 Coins",
          description: "Best value pack with 20% bonus!",
          icon: "💎",
          amount: 2500,
          price: 12000,
          bonus: "500 Bonus Coins",
          popular: false,
        },
        {
          id: "coins_mega",
          name: "5,000 Coins",
          description: "Mega pack with maximum bonus!",
          icon: "💎",
          amount: 5000,
          price: 22000,
          bonus: "1,250 Bonus Coins",
          popular: false,
        },
        {
          id: "coins_ultimate",
          name: "10,000 Coins",
          description: "Ultimate pack for power users!",
          icon: "💎",
          amount: 10000,
          price: 40000,
          bonus: "3,000 Bonus Coins",
          popular: false,
        },
      ],
      diamonds: [
        {
          id: "diamonds_mini",
          name: "10 Diamonds",
          description: "Mini premium pack for special gifts!",
          icon: "💍",
          amount: 10,
          price: 1500,
          bonus: null,
          popular: false,
        },
        {
          id: "diamonds_starter",
          name: "50 Diamonds",
          description: "Perfect starter for premium features!",
          icon: "💍",
          amount: 50,
          price: 7000,
          bonus: "5 Bonus Diamonds",
          popular: true,
        },
        {
          id: "diamonds_popular",
          name: "100 Diamonds",
          description: "Most popular premium pack!",
          icon: "💍",
          amount: 100,
          price: 13000,
          bonus: "15 Bonus Diamonds",
          popular: true,
        },
        {
          id: "diamonds_value",
          name: "250 Diamonds",
          description: "Great value with bonus diamonds!",
          icon: "💍",
          amount: 250,
          price: 30000,
          bonus: "50 Bonus Diamonds",
          popular: false,
        },
        {
          id: "diamonds_premium",
          name: "500 Diamonds",
          description: "Premium pack for VIP features!",
          icon: "💍",
          amount: 500,
          price: 55000,
          bonus: "125 Bonus Diamonds",
          popular: false,
        },
        {
          id: "diamonds_ultimate",
          name: "1,000 Diamonds",
          description: "Ultimate premium experience!",
          icon: "💍",
          amount: 1000,
          price: 100000,
          bonus: "300 Bonus Diamonds",
          popular: false,
        },
      ],
      gifts: [
        {
          id: "gift_rose",
          name: "Rose",
          description: "Beautiful rose for special moments",
          icon: "🌹",
          price: 500,
          category: "romantic",
        },
        {
          id: "gift_heart",
          name: "Heart",
          description: "Show your love with a glowing heart",
          icon: "❤️",
          price: 1000,
          category: "romantic",
        },
        {
          id: "gift_kiss",
          name: "Kiss",
          description: "Send a sweet kiss to someone special",
          icon: "💋",
          price: 1500,
          category: "romantic",
        },
        {
          id: "gift_coffee",
          name: "Coffee",
          description: "Buy someone a virtual coffee",
          icon: "☕",
          price: 2000,
          category: "casual",
        },
        {
          id: "gift_crown",
          name: "Crown",
          description: "Make someone feel like royalty",
          icon: "👑",
          price: 5000,
          category: "premium",
        },
        {
          id: "gift_trophy",
          name: "Trophy",
          description: "Award excellence with a trophy",
          icon: "🏆",
          price: 7500,
          category: "premium",
        },
        {
          id: "gift_rocket",
          name: "Rocket",
          description: "Blast off with this amazing gift!",
          icon: "🚀",
          price: 15000,
          category: "epic",
        },
        {
          id: "gift_diamond_ring",
          name: "Diamond Ring",
          description: "Ultimate luxury gift with special effects",
          icon: "💎💍",
          price: 25000,
          category: "legendary",
        },
        {
          id: "gift_sports_car",
          name: "Sports Car",
          description: "The most impressive gift in the platform!",
          icon: "🏎️",
          price: 50000,
          category: "legendary",
        },
        {
          id: "gift_mansion",
          name: "Mansion",
          description: "The ultimate show of appreciation!",
          icon: "🏰",
          price: 100000,
          category: "legendary",
        },
      ],
      vip: [
        {
          id: "vip_bronze",
          name: "VIP Bronze (30 Days)",
          description: "Bronze badge, priority support, exclusive emotes",
          icon: "🥉",
          price: 15000,
          features: [
            "Bronze VIP Badge",
            "Priority Support",
            "10 Exclusive Emotes",
            "Chat Colors",
          ],
        },
        {
          id: "vip_silver",
          name: "VIP Silver (30 Days)",
          description:
            "Silver badge, advanced features, custom username colors",
          icon: "🥈",
          price: 30000,
          features: [
            "Silver VIP Badge",
            "Custom Username Colors",
            "25 Exclusive Emotes",
            "Private Messages",
            "Stream Priority",
          ],
        },
        {
          id: "vip_gold",
          name: "VIP Gold (30 Days)",
          description: "Gold badge, premium features, exclusive room access",
          icon: "🥇",
          price: 55000,
          features: [
            "Gold VIP Badge",
            "Exclusive VIP Room",
            "50 Exclusive Emotes",
            "Custom Profile Themes",
            "Advanced Analytics",
          ],
        },
        {
          id: "vip_diamond",
          name: "VIP Diamond (30 Days)",
          description: "Ultimate VIP experience with all premium features",
          icon: "💎",
          price: 100000,
          features: [
            "Diamond VIP Badge",
            "Personal Assistant",
            "Unlimited Emotes",
            "Custom Stream Overlays",
            "Revenue Boost",
          ],
        },
      ],
      emotes: [
        {
          id: "emote_laugh",
          name: "Super Laugh",
          description: "Animated laughing emote",
          icon: "😂",
          price: 1000,
        },
        {
          id: "emote_cool",
          name: "Cool Sunglasses",
          description: "Look cool with animated sunglasses",
          icon: "😎",
          price: 1500,
        },
        {
          id: "emote_fire",
          name: "Fire Reaction",
          description: "Express excitement with fire effects",
          icon: "🔥",
          price: 2000,
        },
        {
          id: "emote_party",
          name: "Party Time",
          description: "Animated party emote with confetti",
          icon: "🎉",
          price: 2500,
        },
        {
          id: "emote_magic",
          name: "Magic Sparkles",
          description: "Premium emote with magical effects",
          icon: "✨",
          price: 5000,
        },
        {
          id: "emote_rainbow",
          name: "Rainbow Blast",
          description: "Epic rainbow animation emote",
          icon: "🌈",
          price: 7500,
        },
        {
          id: "emote_love",
          name: "Love Eyes",
          description: "Show your love with heart eyes",
          icon: "😍",
          price: 3000,
        },
        {
          id: "emote_shocked",
          name: "Mind Blown",
          description: "Express shock and amazement",
          icon: "🤯",
          price: 4000,
        },
      ],
    };
    this.init();
  }

  init() {
    this.checkAuthStatus();
    this.setupEventListeners();
    this.loadShopItems();
    this.loadPurchaseHistory();
    this.updateBalanceDisplay();
  }

  checkAuthStatus() {
    const userData = localStorage.getItem("nabila_user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.showUserWallet();
    } else {
      this.hideUserWallet();
    }
  }

  showUserWallet() {
    const walletElement = document.getElementById("userWallet");
    const loginBtn = document.getElementById("loginRegisterBtn");
    const userInfo = document.getElementById("userInfo");

    if (walletElement) walletElement.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "none";
    if (userInfo) userInfo.style.display = "flex";

    this.updateBalanceDisplay();
  }

  hideUserWallet() {
    const walletElement = document.getElementById("userWallet");
    const loginBtn = document.getElementById("loginRegisterBtn");
    const userInfo = document.getElementById("userInfo");

    if (walletElement) walletElement.style.display = "none";
    if (loginBtn) loginBtn.style.display = "block";
    if (userInfo) userInfo.style.display = "none";
  }

  updateBalanceDisplay() {
    if (!this.currentUser) return;

    const userBalance = this.getUserBalance();

    // Update main currency display
    const coinBalance = document.getElementById("userCoins");
    const diamondBalance = document.getElementById("userDiamonds");

    if (coinBalance)
      coinBalance.textContent = userBalance.coins.toLocaleString();
    if (diamondBalance)
      diamondBalance.textContent = userBalance.diamonds.toLocaleString();

    // Update nav wallet display
    const navCoinBalance = document.getElementById("coinBalance");
    const navDiamondBalance = document.getElementById("diamondBalance");

    if (navCoinBalance)
      navCoinBalance.textContent = userBalance.coins.toLocaleString();
    if (navDiamondBalance)
      navDiamondBalance.textContent = userBalance.diamonds.toLocaleString();
  }

  getUserBalance() {
    if (!this.currentUser) return { coins: 0, diamonds: 0 };

    const balances = JSON.parse(
      localStorage.getItem("nabila_balances") || "{}",
    );
    return balances[this.currentUser.id] || { coins: 0, diamonds: 0 };
  }

  updateUserBalance(newBalance) {
    if (!this.currentUser) return;

    const balances = JSON.parse(
      localStorage.getItem("nabila_balances") || "{}",
    );
    balances[this.currentUser.id] = newBalance;
    localStorage.setItem("nabila_balances", JSON.stringify(balances));

    this.updateBalanceDisplay();
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll(".shop-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Top up button
    const topUpBtn = document.getElementById("topUpBtn");
    if (topUpBtn) {
      topUpBtn.addEventListener("click", () => {
        this.showTopUpModal();
      });
    }

    // Modal close buttons
    document.querySelectorAll(".modal .close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none";
      });
    });

    // Click outside to close modals
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".shop-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Update sections
    document.querySelectorAll(".shop-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${tabName}-tab`).classList.add("active");

    // Load items for the selected tab
    this.loadTabItems(tabName);
  }

  loadShopItems() {
    this.loadTabItems("coins");
  }

  loadTabItems(tabName) {
    const items = this.shopItems[tabName] || [];
    const container = document.getElementById(`${tabName}Grid`);

    if (!container) return;

    container.innerHTML = items
      .map((item) => this.createItemCard(item, tabName))
      .join("");

    // Add event listeners to buy buttons
    container.querySelectorAll(".buy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = e.target.dataset.itemId;
        const item = items.find((i) => i.id === itemId);
        if (item) {
          this.showPurchaseModal(item, tabName);
        }
      });
    });
  }

  createItemCard(item, category) {
    const isAffordable = this.canAffordItem(item);
    const buttonClass = isAffordable ? "buy-btn" : "buy-btn disabled";
    const buttonText = isAffordable ? "Beli Sekarang" : "Login Required";

    // All items now use IDR pricing
    const priceDisplay = `<div class="item-price">Rp ${item.price.toLocaleString()}</div>`;

    const bonusDisplay = item.bonus
      ? `<div class="bonus-indicator">${item.bonus}</div>`
      : "";
    const popularBadge = item.popular
      ? '<div class="bonus-indicator" style="background: #e74c3c;">POPULER</div>'
      : "";

    let featuresDisplay = "";
    if (item.features) {
      featuresDisplay = `
                <div class="vip-features">
                    ${item.features.map((feature) => `<div class="feature-item">✓ ${feature}</div>`).join("")}
                </div>
            `;
    }

    return `
            <div class="item-card">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                ${popularBadge}
                ${bonusDisplay}
                ${featuresDisplay}
                ${priceDisplay}
                <button class="${buttonClass}" data-item-id="${item.id}" ${!isAffordable ? "disabled" : ""}>
                    ${buttonText}
                </button>
            </div>
        `;
  }

  canAffordItem(item) {
    if (!this.currentUser) return false;

    // All items now use IDR pricing, so they're always "affordable" until payment
    return true;
  }

  showPurchaseModal(item, category) {
    if (!this.currentUser) {
      alert("Silakan login terlebih dahulu untuk melakukan pembelian.");
      return;
    }

    const modal = document.getElementById("purchaseModal");
    const itemPreview = document.getElementById("itemPreview");

    // Check if it's a virtual currency purchase (with virtual currency)
    const isVirtualPurchase =
      item.currency === "coins" || item.currency === "diamonds";

    if (isVirtualPurchase && !this.canAffordItem(item)) {
      alert(
        "Saldo Anda tidak mencukupi untuk pembelian ini. Silakan top up terlebih dahulu.",
      );
      return;
    }

    // Set up item preview
    let featuresDisplay = "";
    if (item.features) {
      featuresDisplay = `
                <div class="vip-features" style="margin-top: 15px;">
                    ${item.features.map((feature) => `<div style="color: var(--text-dark); margin: 5px 0;">✓ ${feature}</div>`).join("")}
                </div>
            `;
    }

    itemPreview.innerHTML = `
            <div class="preview-icon">${item.icon}</div>
            <div class="preview-name">${item.name}</div>
            <div class="preview-description">${item.description}</div>
            ${featuresDisplay}
        `;

    // Set up quantity and pricing
    const quantityInput = document.getElementById("quantity");
    quantityInput.value = 1;

    this.currentPurchaseItem = { ...item, category };
    this.updatePurchaseTotal();

    // Set up payment method display
    this.updatePaymentDetails();

    // Set up event listeners for this modal
    this.setupPurchaseModalEventListeners();

    modal.style.display = "block";
  }

  setupPurchaseModalEventListeners() {
    const decreaseBtn = document.getElementById("decreaseQty");
    const increaseBtn = document.getElementById("increaseQty");
    const quantityInput = document.getElementById("quantity");
    const confirmBtn = document.getElementById("confirmPurchase");
    const cancelBtn = document.getElementById("cancelPurchase");

    // Remove old listeners
    const newDecreaseBtn = decreaseBtn.cloneNode(true);
    const newIncreaseBtn = increaseBtn.cloneNode(true);
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);

    decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
    increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Add new listeners
    newDecreaseBtn.addEventListener("click", () => {
      const currentVal = parseInt(quantityInput.value);
      if (currentVal > 1) {
        quantityInput.value = currentVal - 1;
        this.updatePurchaseTotal();
      }
    });

    newIncreaseBtn.addEventListener("click", () => {
      const currentVal = parseInt(quantityInput.value);
      if (currentVal < 999) {
        quantityInput.value = currentVal + 1;
        this.updatePurchaseTotal();
      }
    });

    quantityInput.addEventListener("input", () => {
      this.updatePurchaseTotal();
    });

    newConfirmBtn.addEventListener("click", () => {
      this.processPurchase();
    });

    newCancelBtn.addEventListener("click", () => {
      document.getElementById("purchaseModal").style.display = "none";
    });

    // Payment method selection
    document.querySelectorAll(".payment-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".payment-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.updatePaymentDetails();
      });
    });
  }

  updatePurchaseTotal() {
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const item = this.currentPurchaseItem;

    // All items now use IDR pricing
    const totalPrice = item.price * quantity;

    const totalPriceElement = document.getElementById("totalPrice");
    totalPriceElement.textContent = totalPrice.toLocaleString();
  }

  updatePaymentDetails() {
    const paymentDetails = document.getElementById("paymentDetails");
    const activePaymentMethod = document.querySelector(".payment-btn.active");
    const method = activePaymentMethod
      ? activePaymentMethod.dataset.method
      : "gopay";

    if (method === "gopay") {
      paymentDetails.innerHTML = `
                <div class="payment-info">
                    <h4>💳 Pembayaran GoPay</h4>
                    <p><strong>Nomor GoPay Admin:</strong> 0895340205302</p>
                    <p><strong>Atas Nama:</strong> Admin Nabila Stream</p>
                    <p style="color: var(--text-dark); margin-top: 15px;">
                        Setelah transfer, Anda akan diarahkan ke WhatsApp admin untuk konfirmasi pembayaran.
                    </p>
                </div>
            `;
    } else {
      paymentDetails.innerHTML = `
                <div class="payment-info">
                    <h4>🏦 Transfer Bank</h4>
                    <p><strong>Bank:</strong> BCA</p>
                    <p><strong>No. Rekening:</strong> 1234567890</p>
                    <p><strong>Atas Nama:</strong> Admin Nabila Stream</p>
                    <p style="color: var(--text-dark); margin-top: 15px;">
                        Setelah transfer, Anda akan diarahkan ke WhatsApp admin untuk konfirmasi pembayaran.
                    </p>
                </div>
            `;
    }
  }

  processPurchase() {
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const item = this.currentPurchaseItem;

    // All items now use IDR pricing, so process as real money purchase
    this.processRealMoneyPurchase(item, quantity);
  }

  processRealMoneyPurchase(item, quantity) {
    const totalPrice = item.price * quantity;
    const paymentMethod = document.querySelector(".payment-btn.active").dataset
      .method;
    const orderRef = window.paymentManager
      ? window.paymentManager.generatePaymentReference()
      : "ORDER_" + Date.now();

    // Create order data
    const orderData = {
      orderRef: orderRef,
      user: this.currentUser,
      item: item,
      quantity: quantity,
      totalPrice: totalPrice,
      paymentMethod: paymentMethod,
      isTopUp: false,
    };

    // Process through payment manager if available
    if (window.paymentManager) {
      const result = window.paymentManager.processWhatsAppCheckout(orderData);
      if (result.success) {
        document.getElementById("purchaseModal").style.display = "none";
        this.showPurchaseSuccess(result.message);
        this.loadPurchaseHistory();
      }
    } else {
      // Fallback to direct WhatsApp
      this.addPurchaseToHistory(item, quantity, "pending");

      let message = `🛍️ *Pembelian Virtual Item - Nabila Stream*\n\n`;
      message += `📋 *Order ID:* ${orderRef}\n`;
      message += `📦 *Item:* ${item.name}\n`;
      message += `🔢 *Jumlah:* ${quantity}\n`;
      message += `💰 *Total:* Rp ${totalPrice.toLocaleString()}\n`;
      message += `💳 *Metode:* ${paymentMethod === "gopay" ? "GoPay" : "Transfer Bank"}\n`;
      message += `👤 *Username:* ${this.currentUser.name}\n`;
      message += `📧 *Email:* ${this.currentUser.email}\n\n`;

      if (paymentMethod === "gopay") {
        message += `Saya sudah transfer ke GoPay: *0895340205302*\n\n`;
      } else {
        message += `Saya sudah transfer ke rekening BCA yang diberikan\n\n`;
      }

      message += `Mohon konfirmasi dan proses pesanan saya. Terima kasih! 🙏`;

      const whatsappUrl = `https://wa.me/6285810526151?text=${encodeURIComponent(message)}`;

      document.getElementById("purchaseModal").style.display = "none";
      window.open(whatsappUrl, "_blank");

      this.showPurchaseSuccess(
        "Pesanan berhasil dibuat! Anda akan diarahkan ke WhatsApp admin.",
      );
      this.loadPurchaseHistory();
    }
  }

  addPurchaseToHistory(item, quantity, status) {
    const purchases = JSON.parse(
      localStorage.getItem("nabila_purchases") || "[]",
    );
    const purchase = {
      id: "purchase_" + Date.now(),
      userId: this.currentUser.id,
      item: item,
      quantity: quantity,
      totalPrice: item.price ? item.price * quantity : item.cost * quantity,
      status: status,
      date: new Date().toISOString(),
      paymentMethod: item.price
        ? document.querySelector(".payment-btn.active").dataset.method
        : "virtual",
    };

    purchases.unshift(purchase);
    localStorage.setItem("nabila_purchases", JSON.stringify(purchases));
  }

  showPurchaseSuccess(message) {
    // Create success notification
    const notification = document.createElement("div");
    notification.className = "purchase-notification success";
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  showTopUpModal() {
    if (!this.currentUser) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    const modal = document.getElementById("topUpModal");

    // Set up package button listeners
    modal.querySelectorAll(".package-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const amount = parseInt(e.target.dataset.amount);
        const price = parseInt(e.target.dataset.price);
        const currency = e.target
          .closest(".top-up-card")
          .querySelector("h3")
          .textContent.includes("Coins")
          ? "coins"
          : "diamonds";

        this.processTopUpPurchase(currency, amount, price);
      });
    });

    modal.style.display = "block";
  }

  processTopUpPurchase(currency, amount, price) {
    const currencyIcon = currency === "coins" ? "💎" : "💍";
    const currencyName = currency === "coins" ? "Coins" : "Diamonds";
    const orderRef = window.paymentManager
      ? window.paymentManager.generatePaymentReference()
      : "TOPUP_" + Date.now();

    // Create top-up order data
    const orderData = {
      orderRef: orderRef,
      user: this.currentUser,
      currency: currency,
      amount: amount,
      price: price,
      paymentMethod: "gopay",
      isTopUp: true,
      item: {
        id: `topup_${currency}_${Date.now()}`,
        name: `${amount.toLocaleString()} ${currencyName}`,
        description: `Top up ${currencyName}`,
        icon: currencyIcon,
        price: price,
      },
      quantity: 1,
      totalPrice: price,
    };

    // Process through payment manager if available
    if (window.paymentManager) {
      const result = window.paymentManager.processWhatsAppCheckout(orderData);
      if (result.success) {
        document.getElementById("topUpModal").style.display = "none";
        this.showPurchaseSuccess(result.message);
        this.loadPurchaseHistory();
      }
    } else {
      // Fallback to direct WhatsApp
      let message = `💰 *Top Up ${currencyName} - Nabila Stream*\n\n`;
      message += `📋 *Order ID:* ${orderRef}\n`;
      message += `${currencyIcon} *${currencyName}:* ${amount.toLocaleString()}\n`;
      message += `💰 *Total:* Rp ${price.toLocaleString()}\n`;
      message += `💳 *Metode:* GoPay\n`;
      message += `👤 *Username:* ${this.currentUser.name}\n`;
      message += `📧 *Email:* ${this.currentUser.email}\n\n`;
      message += `Saya sudah transfer ke GoPay: *0895340205302*\n\n`;
      message += `Mohon konfirmasi dan tambahkan ${currencyName} ke akun saya. Terima kasih! 🙏`;

      const whatsappUrl = `https://wa.me/6285810526151?text=${encodeURIComponent(message)}`;

      this.addPurchaseToHistory(orderData.item, 1, "pending");

      document.getElementById("topUpModal").style.display = "none";
      window.open(whatsappUrl, "_blank");

      this.showPurchaseSuccess(
        "Permintaan top up berhasil dibuat! Anda akan diarahkan ke WhatsApp admin.",
      );
      this.loadPurchaseHistory();
    }
  }

  loadPurchaseHistory() {
    if (!this.currentUser) return;

    const container = document.getElementById("purchaseHistory");
    const purchases = JSON.parse(
      localStorage.getItem("nabila_purchases") || "[]",
    );
    const userPurchases = purchases.filter(
      (p) => p.userId === this.currentUser.id,
    );

    if (userPurchases.length === 0) {
      container.innerHTML = `
                <div style="text-align: center; color: var(--text-dark); padding: 40px;">
                    📋 Belum ada riwayat pembelian
                </div>
            `;
      return;
    }

    container.innerHTML = userPurchases
      .map((purchase) => {
        const statusClass = `status-${purchase.status}`;
        const statusText = {
          pending: "Menunggu Konfirmasi",
          approved: "Berhasil",
          rejected: "Ditolak",
        };

        const totalDisplay =
          purchase.paymentMethod === "virtual"
            ? `${purchase.item.currency === "coins" ? "💎" : "💍"} ${purchase.totalPrice.toLocaleString()}`
            : `Rp ${purchase.totalPrice.toLocaleString()}`;

        return `
                <div class="history-item">
                    <div class="history-info">
                        <div class="history-item-name">
                            ${purchase.item.icon} ${purchase.item.name}
                            ${purchase.quantity > 1 ? ` (x${purchase.quantity})` : ""}
                        </div>
                        <div class="history-date">
                            ${new Date(purchase.date).toLocaleDateString("id-ID")} - ${totalDisplay}
                        </div>
                    </div>
                    <div class="history-status ${statusClass}">
                        ${statusText[purchase.status]}
                    </div>
                </div>
            `;
      })
      .join("");
  }
}

// Initialize shop when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.shopManager = new ShopManager();
});

// Add custom styles for notifications
const style = document.createElement("style");
style.textContent = `
    .purchase-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
        z-index: 10000;
        min-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
    }

    .purchase-notification.success {
        border-color: #27ae60;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .notification-icon {
        font-size: 1.5rem;
    }

    .notification-message {
        color: var(--text-light);
        font-weight: bold;
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .vip-features {
        text-align: left;
        margin-top: 15px;
    }

    .feature-item {
        color: var(--text-dark);
        margin: 5px 0;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);
