// Campaign Management System
class CampaignManager {
  constructor() {
    this.currentUser = null;
    this.activeCampaigns = [];
    this.campaignPackages = {
      basic: {
        name: "🚀 Basic Boost",
        price: 500,
        duration: "24 hours",
        impressions: 100,
        features: [
          "24-hour boost duration",
          "+100 guaranteed impressions",
          "Featured in timeline",
          "Basic analytics",
        ],
      },
      popular: {
        name: "⭐ Popular Boost",
        price: 2500,
        duration: "7 days",
        impressions: 1000,
        features: [
          "7-day boost duration",
          "+1,000 guaranteed impressions",
          "Featured in trending section",
          "Cross-platform promotion",
          "Detailed analytics",
        ],
      },
      premium: {
        name: "💎 Premium Boost",
        price: 10000,
        duration: "30 days",
        impressions: 10000,
        features: [
          "30-day boost duration",
          "+10,000 guaranteed impressions",
          "Priority placement",
          "Homepage feature",
          "Advanced analytics dashboard",
          "Dedicated support manager",
        ],
      },
      ultimate: {
        name: "🏆 Ultimate Boost",
        price: 100000,
        duration: "90 days",
        impressions: 100000,
        features: [
          "90-day boost duration",
          "+100,000 guaranteed impressions",
          "Homepage banner placement",
          "Influencer program access",
          "Personal account manager",
          "Custom campaign strategy",
          "Media kit creation",
          "Brand partnership opportunities",
        ],
      },
    };
    this.init();
  }

  init() {
    this.checkAuthStatus();
    this.setupEventListeners();
    this.loadUserCampaigns();
  }

  checkAuthStatus() {
    const userData = localStorage.getItem("nabila_user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  setupEventListeners() {
    // Package selection buttons
    document.querySelectorAll("[data-package]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const packageType = e.target.dataset.package;
        const price = parseInt(e.target.dataset.price);
        this.selectCampaignPackage(packageType, price);
      });
    });

    // Campaign modal events
    document.getElementById("cancelCampaign")?.addEventListener("click", () => {
      this.closeCampaignModal();
    });

    document
      .getElementById("confirmCampaign")
      ?.addEventListener("click", () => {
        this.processCampaignPayment();
      });
  }

  selectCampaignPackage(packageType, price) {
    if (!this.currentUser) {
      this.showAlert("Please login to purchase campaign boosts.", "error");
      return;
    }

    const packageInfo = this.campaignPackages[packageType];
    if (!packageInfo) {
      this.showAlert("Invalid package selected.", "error");
      return;
    }

    this.currentCampaign = {
      package: packageType,
      packageInfo: packageInfo,
      price: price,
      user: this.currentUser,
      selectedAt: new Date().toISOString(),
    };

    this.showCampaignModal();
  }

  showCampaignModal() {
    const modal = document.getElementById("campaignModal");
    const summary = document.getElementById("campaignSummary");

    if (!modal || !summary || !this.currentCampaign) return;

    const { packageInfo, price } = this.currentCampaign;

    summary.innerHTML = `
            <div class="campaign-details">
                <div class="campaign-header">
                    <h3>${packageInfo.name}</h3>
                    <div class="campaign-price">Rp ${price.toLocaleString()}</div>
                </div>
                
                <div class="campaign-specs">
                    <div class="spec-row">
                        <span class="spec-label">Duration:</span>
                        <span class="spec-value">${packageInfo.duration}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">Guaranteed Impressions:</span>
                        <span class="spec-value">${packageInfo.impressions.toLocaleString()}+</span>
                    </div>
                </div>
                
                <div class="campaign-features">
                    <h4>✨ What You Get:</h4>
                    <ul>
                        ${packageInfo.features.map((feature) => `<li>✅ ${feature}</li>`).join("")}
                    </ul>
                </div>
                
                <div class="post-selection">
                    <h4>📝 Select Post to Boost:</h4>
                    <select id="postToBoost">
                        <option value="">Choose a post...</option>
                        ${this.getUserPosts()
                          .map(
                            (post) =>
                              `<option value="${post.id}">${post.title}</option>`,
                          )
                          .join("")}
                    </select>
                </div>
                
                <div class="campaign-total">
                    <div class="total-breakdown">
                        <div class="breakdown-row">
                            <span>Package Price:</span>
                            <span>Rp ${price.toLocaleString()}</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Admin Fee:</span>
                            <span>Rp 0</span>
                        </div>
                        <div class="breakdown-row total-row">
                            <span><strong>Total Amount:</strong></span>
                            <span><strong>Rp ${price.toLocaleString()}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

    modal.style.display = "block";
  }

  closeCampaignModal() {
    const modal = document.getElementById("campaignModal");
    if (modal) {
      modal.style.display = "none";
    }
    this.currentCampaign = null;
  }

  getUserPosts() {
    if (!this.currentUser) return [];

    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    return posts.filter((post) => post.author.id === this.currentUser.id);
  }

  processCampaignPayment() {
    const postSelect = document.getElementById("postToBoost");
    const selectedPostId = postSelect?.value;

    if (!selectedPostId) {
      this.showAlert("Please select a post to boost.", "error");
      return;
    }

    const selectedPost = this.getUserPosts().find(
      (post) => post.id === selectedPostId,
    );
    if (!selectedPost) {
      this.showAlert("Selected post not found.", "error");
      return;
    }

    const orderRef = "CAMPAIGN_" + Date.now();
    const campaign = {
      ...this.currentCampaign,
      orderRef: orderRef,
      postId: selectedPostId,
      postTitle: selectedPost.title,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };

    // Create detailed WhatsApp message
    let message = this.createCampaignWhatsAppMessage(campaign);

    // Save campaign order
    this.saveCampaignOrder(campaign);

    // Redirect to WhatsApp
    const whatsappUrl = `https://wa.me/6285810526151?text=${encodeURIComponent(message)}`;

    this.closeCampaignModal();
    window.open(whatsappUrl, "_blank");

    this.showAlert(
      "Campaign order created! Please complete payment via WhatsApp.",
      "success",
    );
    this.loadUserCampaigns();
  }

  createCampaignWhatsAppMessage(campaign) {
    const { orderRef, packageInfo, price, user, postTitle } = campaign;

    let message = `📢 *CAMPAIGN BOOST ORDER - NABILA STREAM*\n\n`;
    message += `📋 *Order Reference:* ${orderRef}\n`;
    message += `⏰ *Order Time:* ${new Date().toLocaleString("id-ID")}\n\n`;

    message += `👤 *CUSTOMER DETAILS:*\n`;
    message += `• Name: ${user.name}\n`;
    message += `• Email: ${user.email}\n`;
    message += `• User ID: ${user.id}\n\n`;

    message += `📦 *CAMPAIGN PACKAGE:*\n`;
    message += `• Package: ${packageInfo.name}\n`;
    message += `• Duration: ${packageInfo.duration}\n`;
    message += `• Impressions: ${packageInfo.impressions.toLocaleString()}+\n`;
    message += `• Price: Rp ${price.toLocaleString()}\n\n`;

    message += `📝 *POST TO BOOST:*\n`;
    message += `• Post Title: "${postTitle}"\n`;
    message += `• Post ID: ${campaign.postId}\n\n`;

    message += `✨ *PACKAGE FEATURES:*\n`;
    packageInfo.features.forEach((feature) => {
      message += `• ${feature}\n`;
    });
    message += `\n`;

    message += `💳 *PAYMENT DETAILS:*\n`;
    message += `• Total Amount: Rp ${price.toLocaleString()}\n`;
    message += `• Payment Method: GoPay\n`;
    message += `• GoPay Number: 0895340205302\n`;
    message += `• Payment Status: ✅ COMPLETED\n\n`;

    message += `📎 *PROOF OF PAYMENT:*\n`;
    message += `I will send the payment screenshot after this message.\n\n`;

    message += `🙏 *Please approve this campaign boost order and start the promotion.*\n`;
    message += `Thank you for your service!`;

    return message;
  }

  saveCampaignOrder(campaign) {
    const campaigns = JSON.parse(
      localStorage.getItem("nabila_campaigns") || "[]",
    );
    campaigns.unshift(campaign);
    localStorage.setItem("nabila_campaigns", JSON.stringify(campaigns));
  }

  loadUserCampaigns() {
    if (!this.currentUser) return;

    const campaigns = JSON.parse(
      localStorage.getItem("nabila_campaigns") || "[]",
    );
    this.activeCampaigns = campaigns.filter(
      (c) => c.user.id === this.currentUser.id,
    );

    this.displayUserCampaigns();
  }

  displayUserCampaigns() {
    // Create campaigns status section if it doesn't exist
    let campaignsStatus = document.getElementById("campaignsStatus");
    if (!campaignsStatus) {
      const campaignSection = document.querySelector(
        "#campaign-tab .campaign-center",
      );
      if (campaignSection) {
        campaignsStatus = document.createElement("div");
        campaignsStatus.id = "campaignsStatus";
        campaignsStatus.innerHTML = `
                    <div class="campaigns-status-section">
                        <h3>📊 My Campaign Status</h3>
                        <div id="campaignsList" class="campaigns-list"></div>
                    </div>
                `;
        campaignSection.appendChild(campaignsStatus);
      }
    }

    const campaignsList = document.getElementById("campaignsList");
    if (!campaignsList) return;

    if (this.activeCampaigns.length === 0) {
      campaignsList.innerHTML = `
                <div class="no-campaigns">
                    <p>📢 No active campaigns yet. Boost your content to reach more audience!</p>
                </div>
            `;
      return;
    }

    campaignsList.innerHTML = this.activeCampaigns
      .map((campaign) => this.createCampaignStatusCard(campaign))
      .join("");
  }

  createCampaignStatusCard(campaign) {
    const statusIcons = {
      pending_payment: "⏳",
      pending: "🔄",
      active: "🟢",
      completed: "✅",
      rejected: "❌",
    };

    const statusColors = {
      pending_payment: "#f39c12",
      pending: "#3498db",
      active: "#27ae60",
      completed: "#95a5a6",
      rejected: "#e74c3c",
    };

    const statusText = {
      pending_payment: "Waiting for Payment Confirmation",
      pending: "Pending Admin Approval",
      active: "Campaign Running",
      completed: "Campaign Completed",
      rejected: "Payment Rejected",
    };

    const progress = this.calculateCampaignProgress(campaign);

    return `
            <div class="campaign-status-card">
                <div class="campaign-card-header">
                    <div class="campaign-info">
                        <h4>${campaign.packageInfo.name}</h4>
                        <p class="campaign-post">Post: "${campaign.postTitle}"</p>
                    </div>
                    <div class="campaign-status" style="color: ${statusColors[campaign.status]}">
                        ${statusIcons[campaign.status]} ${statusText[campaign.status]}
                    </div>
                </div>
                
                <div class="campaign-metrics">
                    <div class="metric">
                        <span class="metric-label">Duration:</span>
                        <span class="metric-value">${campaign.packageInfo.duration}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Target Impressions:</span>
                        <span class="metric-value">${campaign.packageInfo.impressions.toLocaleString()}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Investment:</span>
                        <span class="metric-value">Rp ${campaign.price.toLocaleString()}</span>
                    </div>
                </div>
                
                ${
                  campaign.status === "active"
                    ? `
                    <div class="campaign-progress">
                        <div class="progress-info">
                            <span>Progress: ${progress.percentage}%</span>
                            <span>${progress.currentImpressions.toLocaleString()} / ${campaign.packageInfo.impressions.toLocaleString()}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                        </div>
                        <div class="time-remaining">
                            ⏱️ ${progress.timeRemaining} remaining
                        </div>
                    </div>
                `
                    : ""
                }
                
                <div class="campaign-actions">
                    <button class="btn small secondary" onclick="campaignManager.viewCampaignDetails('${campaign.orderRef}')">
                        📊 View Details
                    </button>
                    ${
                      campaign.status === "pending_payment"
                        ? `
                        <button class="btn small primary" onclick="campaignManager.resendPaymentProof('${campaign.orderRef}')">
                            📱 Resend Payment
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  calculateCampaignProgress(campaign) {
    // Simulate campaign progress
    const now = new Date();
    const startDate = new Date(campaign.createdAt);
    const durationHours =
      {
        "24 hours": 24,
        "7 days": 168,
        "30 days": 720,
        "90 days": 2160,
      }[campaign.packageInfo.duration] || 24;

    const elapsedHours = Math.max(0, (now - startDate) / (1000 * 60 * 60));
    const percentage = Math.min(
      100,
      Math.round((elapsedHours / durationHours) * 100),
    );
    const currentImpressions = Math.round(
      (percentage / 100) * campaign.packageInfo.impressions,
    );

    const remainingHours = Math.max(0, durationHours - elapsedHours);
    const timeRemaining =
      remainingHours < 24
        ? `${Math.round(remainingHours)}h`
        : `${Math.round(remainingHours / 24)}d`;

    return {
      percentage,
      currentImpressions,
      timeRemaining,
    };
  }

  viewCampaignDetails(orderRef) {
    const campaign = this.activeCampaigns.find((c) => c.orderRef === orderRef);
    if (!campaign) return;

    const modal = this.createDetailModal(campaign);
    document.body.appendChild(modal);
  }

  createDetailModal(campaign) {
    const progress = this.calculateCampaignProgress(campaign);

    const modal = document.createElement("div");
    modal.className = "modal campaign-detail-modal";
    modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="modal-header">
                    <h2>📊 Campaign Details</h2>
                </div>
                <div class="modal-body">
                    <div class="campaign-detail-content">
                        <div class="detail-section">
                            <h3>📋 Order Information</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Order Reference:</label>
                                    <span>${campaign.orderRef}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Package:</label>
                                    <span>${campaign.packageInfo.name}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Status:</label>
                                    <span class="status-${campaign.status}">${campaign.status.toUpperCase()}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Created:</label>
                                    <span>${new Date(campaign.createdAt).toLocaleString("id-ID")}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>📦 Package Details</h3>
                            <div class="package-details">
                                <div class="detail-row">
                                    <span>Duration:</span>
                                    <span>${campaign.packageInfo.duration}</span>
                                </div>
                                <div class="detail-row">
                                    <span>Target Impressions:</span>
                                    <span>${campaign.packageInfo.impressions.toLocaleString()}</span>
                                </div>
                                <div class="detail-row">
                                    <span>Investment:</span>
                                    <span>Rp ${campaign.price.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div class="features-list">
                                <h4>Features Included:</h4>
                                <ul>
                                    ${campaign.packageInfo.features.map((feature) => `<li>✅ ${feature}</li>`).join("")}
                                </ul>
                            </div>
                        </div>
                        
                        ${
                          campaign.status === "active" ||
                          campaign.status === "completed"
                            ? `
                            <div class="detail-section">
                                <h3>📈 Performance Metrics</h3>
                                <div class="metrics-grid">
                                    <div class="metric-card">
                                        <div class="metric-number">${progress.currentImpressions.toLocaleString()}</div>
                                        <div class="metric-label">Current Impressions</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-number">${progress.percentage}%</div>
                                        <div class="metric-label">Progress</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-number">${progress.timeRemaining}</div>
                                        <div class="metric-label">Time Remaining</div>
                                    </div>
                                </div>
                            </div>
                        `
                            : ""
                        }
                    </div>
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

  resendPaymentProof(orderRef) {
    const campaign = this.activeCampaigns.find((c) => c.orderRef === orderRef);
    if (!campaign) return;

    const message = this.createCampaignWhatsAppMessage(campaign);
    const whatsappUrl = `https://wa.me/6285810526151?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    this.showAlert("Payment reminder sent to admin!", "success");
  }

  showAlert(message, type = "info") {
    const alert = document.createElement("div");
    alert.className = `campaign-alert ${type}`;
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

// Initialize campaign manager
document.addEventListener("DOMContentLoaded", () => {
  window.campaignManager = new CampaignManager();
});

// Add campaign styles
const campaignStyles = document.createElement("style");
campaignStyles.textContent = `
    .campaigns-status-section {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 30px;
        margin-top: 30px;
    }

    .campaigns-status-section h3 {
        color: var(--text-light);
        margin-bottom: 25px;
        text-align: center;
    }

    .campaigns-list {
        display: grid;
        gap: 20px;
    }

    .campaign-status-card {
        background: var(--bg-dark);
        border: 1px solid var(--border-color);
        border-radius: 15px;
        padding: 20px;
        transition: all 0.3s ease;
    }

    .campaign-status-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-2px);
    }

    .campaign-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
    }

    .campaign-info h4 {
        color: var(--text-light);
        margin-bottom: 5px;
    }

    .campaign-post {
        color: var(--text-dark);
        font-size: 0.9rem;
        margin: 0;
    }

    .campaign-status {
        font-weight: bold;
        font-size: 0.9rem;
    }

    .campaign-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .metric {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .metric-label {
        color: var(--text-dark);
        font-size: 0.8rem;
        margin-bottom: 5px;
    }

    .metric-value {
        color: var(--text-light);
        font-weight: bold;
    }

    .campaign-progress {
        margin-bottom: 20px;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: var(--text-dark);
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--border-color);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        transition: width 0.3s ease;
    }

    .time-remaining {
        text-align: center;
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .campaign-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .btn.small {
        padding: 8px 16px;
        font-size: 0.9rem;
    }

    .no-campaigns {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-dark);
    }

    .campaign-detail-modal .modal-content {
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .campaign-detail-content {
        display: grid;
        gap: 25px;
    }

    .detail-section {
        background: var(--bg-dark);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
    }

    .detail-section h3 {
        color: var(--text-light);
        margin-bottom: 20px;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 10px;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .detail-item label {
        color: var(--text-dark);
        font-weight: bold;
        font-size: 0.9rem;
    }

    .detail-item span {
        color: var(--text-light);
    }

    .package-details {
        margin-bottom: 20px;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
    }

    .detail-row:last-child {
        border-bottom: none;
    }

    .features-list h4 {
        color: var(--text-light);
        margin-bottom: 15px;
    }

    .features-list ul {
        list-style: none;
        padding: 0;
    }

    .features-list li {
        color: var(--text-dark);
        margin-bottom: 8px;
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
    }

    .metric-card {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 20px;
        text-align: center;
    }

    .metric-number {
        font-size: 2rem;
        font-weight: bold;
        color: var(--secondary-color);
        margin-bottom: 8px;
    }

    .metric-label {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .campaign-alert {
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

    .campaign-alert.success {
        border-color: #27ae60;
    }

    .campaign-alert.error {
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

    .campaign-details {
        display: grid;
        gap: 20px;
    }

    .campaign-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .campaign-price {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--secondary-color);
    }

    .campaign-specs {
        background: var(--bg-dark);
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
    }

    .spec-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
    }

    .spec-row:last-child {
        border-bottom: none;
    }

    .spec-label {
        color: var(--text-dark);
    }

    .spec-value {
        color: var(--text-light);
        font-weight: bold;
    }

    .campaign-features h4 {
        color: var(--text-light);
        margin-bottom: 15px;
    }

    .campaign-features ul {
        list-style: none;
        padding: 0;
    }

    .campaign-features li {
        color: var(--text-dark);
        margin-bottom: 8px;
    }

    .post-selection {
        margin: 20px 0;
    }

    .post-selection h4 {
        color: var(--text-light);
        margin-bottom: 15px;
    }

    .post-selection select {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-dark);
        color: var(--text-light);
    }

    .campaign-total {
        background: var(--bg-dark);
        padding: 20px;
        border-radius: 10px;
        border: 2px solid var(--secondary-color);
    }

    .total-breakdown {
        display: grid;
        gap: 10px;
    }

    .breakdown-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
    }

    .total-row {
        border-top: 2px solid var(--border-color);
        padding-top: 15px;
        margin-top: 10px;
        font-size: 1.2rem;
    }

    @media (max-width: 768px) {
        .campaign-card-header {
            flex-direction: column;
            gap: 10px;
        }

        .campaign-metrics {
            grid-template-columns: 1fr;
        }

        .campaign-actions {
            flex-direction: column;
        }

        .metrics-grid {
            grid-template-columns: 1fr;
        }

        .detail-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(campaignStyles);
