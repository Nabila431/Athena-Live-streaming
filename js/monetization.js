// Monetization & Creator Management System
class MonetizationManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    this.checkAuthStatus();
    this.setupEventListeners();
  }

  checkAuthStatus() {
    const userData = localStorage.getItem("nabila_user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  setupEventListeners() {
    // Withdrawal request
    document
      .getElementById("requestWithdraw")
      ?.addEventListener("click", () => {
        this.requestWithdrawal();
      });

    // Monetization options
    document.querySelectorAll(".option-card .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const optionType = e.target.textContent.toLowerCase();
        this.handleMonetizationOption(optionType);
      });
    });
  }

  requestWithdrawal() {
    if (!this.currentUser) {
      this.showAlert("Please login to request withdrawal.", "error");
      return;
    }

    const amount = parseInt(document.getElementById("withdrawAmount").value);
    const method = document.getElementById("withdrawMethod").value;

    if (!amount || amount < 50000) {
      this.showAlert("Minimum withdrawal amount is Rp 50,000", "error");
      return;
    }

    // Check user earnings
    const userEarnings = this.getUserEarnings();
    if (amount > userEarnings) {
      this.showAlert("Insufficient earnings balance.", "error");
      return;
    }

    const withdrawal = {
      id: "withdrawal_" + Date.now(),
      userId: this.currentUser.id,
      amount: amount,
      method: method,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    // Save withdrawal request
    const withdrawals = JSON.parse(
      localStorage.getItem("nabila_withdrawals") || "[]",
    );
    withdrawals.unshift(withdrawal);
    localStorage.setItem("nabila_withdrawals", JSON.stringify(withdrawals));

    // Create WhatsApp message for admin
    let message = `💳 *WITHDRAWAL REQUEST - NABILA STREAM*\n\n`;
    message += `📋 *Request ID:* ${withdrawal.id}\n`;
    message += `👤 *User:* ${this.currentUser.name}\n`;
    message += `📧 *Email:* ${this.currentUser.email}\n`;
    message += `💰 *Amount:* Rp ${amount.toLocaleString()}\n`;
    message += `💳 *Method:* ${method.toUpperCase()}\n`;
    message += `📅 *Date:* ${new Date().toLocaleDateString("id-ID")}\n\n`;
    message += `Mohon proses withdrawal request saya. Terima kasih! 🙏`;

    const whatsappUrl = `https://wa.me/6285810526151?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Reset form
    document.getElementById("withdrawAmount").value = "";
    this.showAlert(
      "Withdrawal request submitted! Admin will process your request.",
      "success",
    );
  }

  getUserEarnings() {
    if (!this.currentUser) return 0;

    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    const userPosts = posts.filter(
      (post) => post.author.id === this.currentUser.id,
    );

    return userPosts.reduce((total, post) => total + (post.earnings || 0), 0);
  }

  handleMonetizationOption(optionType) {
    if (!this.currentUser) {
      this.showAlert("Please login to access monetization features.", "error");
      return;
    }

    switch (optionType) {
      case "learn more":
        this.showSponsoredPostsInfo();
        break;
      case "setup premium":
        this.showPremiumContentSetup();
        break;
      case "enable gifts":
        this.enableFanSupport();
        break;
    }
  }

  showSponsoredPostsInfo() {
    const modal = this.createInfoModal(
      "🎯 Sponsored Posts",
      `
            <div class="info-content">
                <h4>How Sponsored Posts Work:</h4>
                <ul>
                    <li>✅ Partner with brands and companies</li>
                    <li>✅ Create authentic sponsored content</li>
                    <li>✅ Earn Rp 100,000 - Rp 5,000,000 per post</li>
                    <li>✅ Maintain creative control</li>
                    <li>✅ Build long-term partnerships</li>
                </ul>
                
                <h4>Requirements:</h4>
                <ul>
                    <li>📊 Minimum 1,000 followers</li>
                    <li>📈 Consistent engagement rate above 3%</li>
                    <li>✨ High-quality content creation</li>
                    <li>📝 Professional communication</li>
                </ul>
                
                <div class="action-section">
                    <button class="btn primary" onclick="monetizationManager.applySponsoredProgram()">
                        Apply for Sponsored Program
                    </button>
                </div>
            </div>
            `,
    );
    document.body.appendChild(modal);
  }

  showPremiumContentSetup() {
    const modal = this.createInfoModal(
      "💎 Premium Content",
      `
            <div class="info-content">
                <h4>Premium Content Features:</h4>
                <ul>
                    <li>🔒 Exclusive content for subscribers</li>
                    <li>💰 Monthly subscription fees: Rp 10,000 - Rp 100,000</li>
                    <li>📹 Premium video content</li>
                    <li>🎯 Direct fan engagement</li>
                    <li>📊 Detailed subscriber analytics</li>
                </ul>
                
                <h4>Content Types:</h4>
                <ul>
                    <li>🎥 Behind-the-scenes videos</li>
                    <li>📚 Educational tutorials</li>
                    <li>🎮 Gaming sessions</li>
                    <li>🎵 Music performances</li>
                    <li>💬 Live Q&A sessions</li>
                </ul>
                
                <div class="premium-setup">
                    <h4>Set Your Subscription Price:</h4>
                    <select id="premiumPrice">
                        <option value="10000">Rp 10,000/month</option>
                        <option value="25000">Rp 25,000/month</option>
                        <option value="50000">Rp 50,000/month</option>
                        <option value="100000">Rp 100,000/month</option>
                    </select>
                    <button class="btn primary" onclick="monetizationManager.enablePremiumContent()">
                        Enable Premium Content
                    </button>
                </div>
            </div>
            `,
    );
    document.body.appendChild(modal);
  }

  enableFanSupport() {
    const modal = this.createInfoModal(
      "🎁 Fan Support",
      `
            <div class="info-content">
                <h4>Fan Support Features:</h4>
                <ul>
                    <li>🎁 Receive virtual gifts from fans</li>
                    <li>💝 Direct donations and tips</li>
                    <li>🏆 Fan appreciation rewards</li>
                    <li>📱 Easy mobile payment integration</li>
                    <li>💰 Instant earnings notification</li>
                </ul>
                
                <h4>Gift Categories:</h4>
                <div class="gift-categories">
                    <div class="gift-category">
                        <h5>💝 Basic Gifts (Rp 500 - Rp 5,000)</h5>
                        <p>Hearts, roses, coffee, thumbs up</p>
                    </div>
                    <div class="gift-category">
                        <h5>🎯 Premium Gifts (Rp 10,000 - Rp 50,000)</h5>
                        <p>Crowns, trophies, fireworks, diamonds</p>
                    </div>
                    <div class="gift-category">
                        <h5>🏆 Luxury Gifts (Rp 100,000+)</h5>
                        <p>Sports cars, mansions, private jets</p>
                    </div>
                </div>
                
                <div class="action-section">
                    <button class="btn primary" onclick="monetizationManager.activateFanSupport()">
                        Activate Fan Support
                    </button>
                </div>
            </div>
            `,
    );
    document.body.appendChild(modal);
  }

  createInfoModal(title, content) {
    const modal = document.createElement("div");
    modal.className = "modal info-modal";
    modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="modal-header">
                    <h2>${title}</h2>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

    // Add close functionality
    modal.querySelector(".close").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    return modal;
  }

  applySponsoredProgram() {
    if (!this.currentUser) return;

    const application = {
      id: "sponsored_" + Date.now(),
      userId: this.currentUser.id,
      type: "sponsored_posts",
      status: "pending",
      appliedAt: new Date().toISOString(),
    };

    const applications = JSON.parse(
      localStorage.getItem("nabila_monetization_applications") || "[]",
    );
    applications.unshift(application);
    localStorage.setItem(
      "nabila_monetization_applications",
      JSON.stringify(applications),
    );

    this.showAlert("Sponsored program application submitted!", "success");
    document.querySelector(".info-modal")?.remove();
  }

  enablePremiumContent() {
    if (!this.currentUser) return;

    const price = document.getElementById("premiumPrice").value;

    const premiumSettings = {
      enabled: true,
      subscriptionPrice: parseInt(price),
      enabledAt: new Date().toISOString(),
    };

    const userSettings = JSON.parse(
      localStorage.getItem("nabila_user_settings") || "{}",
    );
    userSettings[this.currentUser.id] = {
      ...userSettings[this.currentUser.id],
      premium: premiumSettings,
    };
    localStorage.setItem("nabila_user_settings", JSON.stringify(userSettings));

    this.showAlert(
      `Premium content enabled with Rp ${parseInt(price).toLocaleString()}/month subscription!`,
      "success",
    );
    document.querySelector(".info-modal")?.remove();
  }

  activateFanSupport() {
    if (!this.currentUser) return;

    const fanSupportSettings = {
      enabled: true,
      giftingEnabled: true,
      donationsEnabled: true,
      enabledAt: new Date().toISOString(),
    };

    const userSettings = JSON.parse(
      localStorage.getItem("nabila_user_settings") || "{}",
    );
    userSettings[this.currentUser.id] = {
      ...userSettings[this.currentUser.id],
      fanSupport: fanSupportSettings,
    };
    localStorage.setItem("nabila_user_settings", JSON.stringify(userSettings));

    this.showAlert(
      "Fan support activated! Your fans can now send you gifts and donations.",
      "success",
    );
    document.querySelector(".info-modal")?.remove();
  }

  showAlert(message, type = "info") {
    const alert = document.createElement("div");
    alert.className = `monetization-alert ${type}`;
    alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
                <span class="alert-message">${message}</span>
            </div>
        `;

    document.body.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}

// Initialize monetization manager
document.addEventListener("DOMContentLoaded", () => {
  window.monetizationManager = new MonetizationManager();
});

// Add monetization styles
const monetizationStyles = document.createElement("style");
monetizationStyles.textContent = `
    .info-modal .modal-content {
        max-width: 700px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .info-content {
        line-height: 1.6;
    }

    .info-content h4 {
        color: var(--text-light);
        margin: 20px 0 15px 0;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 8px;
    }

    .info-content ul {
        list-style: none;
        padding: 0;
        margin-bottom: 20px;
    }

    .info-content li {
        color: var(--text-dark);
        margin-bottom: 8px;
        padding-left: 25px;
        position: relative;
    }

    .gift-categories {
        display: grid;
        gap: 15px;
        margin: 20px 0;
    }

    .gift-category {
        background: var(--bg-dark);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
    }

    .gift-category h5 {
        color: var(--text-light);
        margin-bottom: 8px;
    }

    .gift-category p {
        color: var(--text-dark);
        margin: 0;
    }

    .premium-setup {
        background: var(--bg-dark);
        padding: 20px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        margin-top: 20px;
    }

    .premium-setup h4 {
        color: var(--text-light);
        margin-bottom: 15px;
        border: none;
        padding: 0;
    }

    .premium-setup select {
        width: 100%;
        padding: 10px 15px;
        margin-bottom: 15px;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        background: var(--card-bg);
        color: var(--text-light);
    }

    .action-section {
        text-align: center;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid var(--border-color);
    }

    .monetization-alert {
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

    .monetization-alert.success {
        border-color: #27ae60;
    }

    .monetization-alert.error {
        border-color: #e74c3c;
    }

    .alert-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .alert-icon {
        font-size: 1.5rem;
    }

    .alert-message {
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
`;
document.head.appendChild(monetizationStyles);
