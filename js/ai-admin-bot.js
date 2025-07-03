// AI Admin Bot System
class AIAdminBot {
  constructor() {
    this.isOpen = false;
    this.notifications = [];
    this.botResponses = {
      revenue: {
        keywords: [
          "revenue",
          "income",
          "money",
          "earning",
          "profit",
          "pendapatan",
        ],
        response: this.generateRevenueReport.bind(this),
      },
      users: {
        keywords: ["user", "member", "customer", "pengguna", "member"],
        response: this.generateUserStats.bind(this),
      },
      campaigns: {
        keywords: ["campaign", "boost", "promotion", "marketing", "kampanye"],
        response: this.generateCampaignReport.bind(this),
      },
      orders: {
        keywords: ["order", "purchase", "transaction", "pesanan", "pembelian"],
        response: this.generateOrderReport.bind(this),
      },
      alerts: {
        keywords: [
          "alert",
          "notification",
          "warning",
          "peringatan",
          "notifikasi",
        ],
        response: this.generateAlertsReport.bind(this),
      },
      help: {
        keywords: ["help", "bantuan", "assist", "support"],
        response: this.generateHelpResponse.bind(this),
      },
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadNotifications();
    this.startAutoUpdates();
  }

  setupEventListeners() {
    // Bot toggle
    document.getElementById("botToggle")?.addEventListener("click", () => {
      this.toggleBot();
    });

    // Close bot
    document.getElementById("closeBotChat")?.addEventListener("click", () => {
      this.closeBot();
    });

    // Send message
    document.getElementById("sendBotMessage")?.addEventListener("click", () => {
      this.sendMessage();
    });

    // Input enter key
    document.getElementById("botInput")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });

    // Quick actions
    document.querySelectorAll(".quick-action-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      const botElement = document.getElementById("aiAdminBot");
      if (botElement && !botElement.contains(e.target) && this.isOpen) {
        this.closeBot();
      }
    });
  }

  toggleBot() {
    if (this.isOpen) {
      this.closeBot();
    } else {
      this.openBot();
    }
  }

  openBot() {
    const botChat = document.getElementById("botChat");
    if (botChat) {
      botChat.style.display = "flex";
      this.isOpen = true;

      // Clear notification badge
      const notification = document.getElementById("botNotification");
      if (notification) {
        notification.style.display = "none";
      }

      // Focus input
      const input = document.getElementById("botInput");
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }

  closeBot() {
    const botChat = document.getElementById("botChat");
    if (botChat) {
      botChat.style.display = "none";
      this.isOpen = false;
    }
  }

  sendMessage() {
    const input = document.getElementById("botInput");
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    this.addUserMessage(message);
    input.value = "";

    // Process and respond
    setTimeout(() => {
      this.processMessage(message);
    }, 500);
  }

  addUserMessage(message) {
    const messagesContainer = document.getElementById("botMessages");
    const messageElement = document.createElement("div");
    messageElement.className = "user-message";
    messageElement.innerHTML = `
            <div class="message-content user-msg">
                ${this.escapeHtml(message)}
            </div>
            <div class="message-avatar">
                <span>👤</span>
            </div>
        `;

    messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  addBotMessage(message) {
    const messagesContainer = document.getElementById("botMessages");
    const messageElement = document.createElement("div");
    messageElement.className = "bot-message";
    messageElement.innerHTML = `
            <div class="message-avatar">
                <img src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop&crop=face" alt="AI Admin">
            </div>
            <div class="message-content">
                ${message}
            </div>
        `;

    messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  processMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Find matching response category
    for (const [category, config] of Object.entries(this.botResponses)) {
      if (config.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        const response = config.response();
        this.addBotMessage(response);
        return;
      }
    }

    // Default response
    this.addBotMessage(this.getDefaultResponse());
  }

  handleQuickAction(action) {
    const responses = {
      revenue: this.generateRevenueReport.bind(this),
      users: this.generateUserStats.bind(this),
      campaigns: this.generateCampaignReport.bind(this),
      alerts: this.generateAlertsReport.bind(this),
    };

    if (responses[action]) {
      const response = responses[action]();
      this.addBotMessage(response);
    }
  }

  generateRevenueReport() {
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");
    const campaigns = JSON.parse(
      localStorage.getItem("nabila_campaigns") || "[]",
    );

    const orderRevenue = orders
      .filter((o) => o.status === "approved")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const campaignRevenue = campaigns
      .filter((c) => c.status === "approved" || c.status === "active")
      .reduce((sum, c) => sum + c.price, 0);

    const totalRevenue = orderRevenue + campaignRevenue;
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length;

    return `
            <div class="ai-report">
                <h4>💰 Revenue Analytics</h4>
                <div class="report-stats">
                    <div class="report-stat">
                        <span class="stat-label">Total Revenue:</span>
                        <span class="stat-value">${this.formatCurrency(totalRevenue)}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Shop Revenue:</span>
                        <span class="stat-value">${this.formatCurrency(orderRevenue)}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Campaign Revenue:</span>
                        <span class="stat-value">${this.formatCurrency(campaignRevenue)}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Today's Orders:</span>
                        <span class="stat-value">${todayOrders}</span>
                    </div>
                </div>
                <div class="report-insights">
                    <p><strong>💡 Insights:</strong></p>
                    <ul>
                        <li>Revenue is ${totalRevenue > 1000000 ? "performing excellently" : "showing steady growth"}</li>
                        <li>Campaign revenue accounts for ${Math.round((campaignRevenue / totalRevenue) * 100) || 0}% of total</li>
                        <li>${todayOrders > 5 ? "High activity today!" : "Consider promotional campaigns"}</li>
                    </ul>
                </div>
            </div>
        `;
  }

  generateUserStats() {
    const users = JSON.parse(localStorage.getItem("nabila_users") || "[]");
    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");

    const totalUsers = users.length;
    const newUsersToday = users.filter((u) => {
      const userDate = new Date(u.created_at);
      const today = new Date();
      return userDate.toDateString() === today.toDateString();
    }).length;

    const activeUsers = users.filter((u) => {
      return (
        posts.some((p) => p.author.id === u.id) ||
        orders.some((o) => o.user.id === u.id)
      );
    }).length;

    return `
            <div class="ai-report">
                <h4>👥 User Analytics</h4>
                <div class="report-stats">
                    <div class="report-stat">
                        <span class="stat-label">Total Users:</span>
                        <span class="stat-value">${totalUsers.toLocaleString()}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">New Today:</span>
                        <span class="stat-value">${newUsersToday}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Active Users:</span>
                        <span class="stat-value">${activeUsers}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Engagement Rate:</span>
                        <span class="stat-value">${Math.round((activeUsers / totalUsers) * 100) || 0}%</span>
                    </div>
                </div>
                <div class="report-insights">
                    <p><strong>💡 Insights:</strong></p>
                    <ul>
                        <li>User growth is ${newUsersToday > 2 ? "accelerating" : "steady"}</li>
                        <li>${activeUsers / totalUsers > 0.3 ? "High engagement platform" : "Focus on user activation"}</li>
                        <li>Consider creator programs to boost content creation</li>
                    </ul>
                </div>
            </div>
        `;
  }

  generateCampaignReport() {
    const campaigns = JSON.parse(
      localStorage.getItem("nabila_campaigns") || "[]",
    );

    const totalCampaigns = campaigns.length;
    const pendingCampaigns = campaigns.filter(
      (c) => c.status === "pending" || c.status === "pending_payment",
    ).length;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === "active",
    ).length;
    const campaignRevenue = campaigns
      .filter((c) => c.status === "approved" || c.status === "active")
      .reduce((sum, c) => sum + c.price, 0);

    return `
            <div class="ai-report">
                <h4>📢 Campaign Analytics</h4>
                <div class="report-stats">
                    <div class="report-stat">
                        <span class="stat-label">Total Campaigns:</span>
                        <span class="stat-value">${totalCampaigns}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Pending Approval:</span>
                        <span class="stat-value">${pendingCampaigns}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Currently Active:</span>
                        <span class="stat-value">${activeCampaigns}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Campaign Revenue:</span>
                        <span class="stat-value">${this.formatCurrency(campaignRevenue)}</span>
                    </div>
                </div>
                <div class="report-insights">
                    <p><strong>💡 Insights:</strong></p>
                    <ul>
                        <li>${pendingCampaigns > 0 ? `${pendingCampaigns} campaigns need your approval` : "All campaigns processed"}</li>
                        <li>Campaign program is ${totalCampaigns > 10 ? "very popular" : "gaining traction"}</li>
                        <li>Average campaign value: ${this.formatCurrency(campaignRevenue / totalCampaigns || 0)}</li>
                    </ul>
                </div>
                <div class="quick-actions-section">
                    <p><strong>⚡ Quick Actions:</strong></p>
                    <button class="ai-action-btn" onclick="adminPanel.switchSection('campaigns')">
                        📢 Manage Campaigns
                    </button>
                </div>
            </div>
        `;
  }

  generateOrderReport() {
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const approvedOrders = orders.filter((o) => o.status === "approved").length;
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length;

    return `
            <div class="ai-report">
                <h4>📦 Order Analytics</h4>
                <div class="report-stats">
                    <div class="report-stat">
                        <span class="stat-label">Total Orders:</span>
                        <span class="stat-value">${totalOrders}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Pending Orders:</span>
                        <span class="stat-value">${pendingOrders}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Approved Orders:</span>
                        <span class="stat-value">${approvedOrders}</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-label">Today's Orders:</span>
                        <span class="stat-value">${todayOrders}</span>
                    </div>
                </div>
                <div class="report-insights">
                    <p><strong>💡 Insights:</strong></p>
                    <ul>
                        <li>${pendingOrders > 0 ? `${pendingOrders} orders awaiting approval` : "All orders processed"}</li>
                        <li>Approval rate: ${Math.round((approvedOrders / totalOrders) * 100) || 0}%</li>
                        <li>${todayOrders > 0 ? `Active day with ${todayOrders} new orders` : "Quiet day for orders"}</li>
                    </ul>
                </div>
                <div class="quick-actions-section">
                    <p><strong>⚡ Quick Actions:</strong></p>
                    <button class="ai-action-btn" onclick="adminPanel.switchSection('orders')">
                        📦 Manage Orders
                    </button>
                </div>
            </div>
        `;
  }

  generateAlertsReport() {
    const alerts = this.generateSystemAlerts();

    return `
            <div class="ai-report">
                <h4>🔔 System Alerts</h4>
                <div class="alerts-list">
                    ${alerts
                      .map(
                        (alert) => `
                        <div class="alert-item ${alert.type}">
                            <span class="alert-icon">${alert.icon}</span>
                            <div class="alert-content">
                                <div class="alert-title">${alert.title}</div>
                                <div class="alert-message">${alert.message}</div>
                            </div>
                            <div class="alert-time">${alert.time}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                ${alerts.length === 0 ? '<p style="text-align: center; color: var(--text-dark);">🎉 All systems running smoothly!</p>' : ""}
            </div>
        `;
  }

  generateSystemAlerts() {
    const alerts = [];
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");
    const campaigns = JSON.parse(
      localStorage.getItem("nabila_campaigns") || "[]",
    );
    const withdrawals = JSON.parse(
      localStorage.getItem("nabila_withdrawals") || "[]",
    );

    // Check pending orders
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    if (pendingOrders > 0) {
      alerts.push({
        type: "warning",
        icon: "📦",
        title: "Pending Orders",
        message: `${pendingOrders} orders require approval`,
        time: "Now",
      });
    }

    // Check pending campaigns
    const pendingCampaigns = campaigns.filter(
      (c) => c.status === "pending" || c.status === "pending_payment",
    ).length;
    if (pendingCampaigns > 0) {
      alerts.push({
        type: "info",
        icon: "📢",
        title: "Pending Campaigns",
        message: `${pendingCampaigns} campaigns awaiting approval`,
        time: "Now",
      });
    }

    // Check pending withdrawals
    const pendingWithdrawals = withdrawals.filter(
      (w) => w.status === "pending",
    ).length;
    if (pendingWithdrawals > 0) {
      alerts.push({
        type: "urgent",
        icon: "💳",
        title: "Withdrawal Requests",
        message: `${pendingWithdrawals} withdrawal requests pending`,
        time: "Now",
      });
    }

    return alerts;
  }

  generateHelpResponse() {
    return `
            <div class="ai-help">
                <h4>🤖 AI Admin Assistant Help</h4>
                <p>I can help you with various admin tasks. Here's what I can do:</p>
                
                <div class="help-categories">
                    <div class="help-category">
                        <h5>📊 Analytics & Reports</h5>
                        <ul>
                            <li>Revenue analysis and trends</li>
                            <li>User statistics and growth</li>
                            <li>Campaign performance metrics</li>
                            <li>Order processing insights</li>
                        </ul>
                    </div>
                    
                    <div class="help-category">
                        <h5>🔔 System Monitoring</h5>
                        <ul>
                            <li>Real-time alerts and notifications</li>
                            <li>Pending task summaries</li>
                            <li>System health checks</li>
                            <li>Performance warnings</li>
                        </ul>
                    </div>
                    
                    <div class="help-category">
                        <h5>⚡ Quick Actions</h5>
                        <ul>
                            <li>Navigate to specific sections</li>
                            <li>Generate instant reports</li>
                            <li>Provide management insights</li>
                            <li>Suggest optimization strategies</li>
                        </ul>
                    </div>
                </div>
                
                <div class="help-commands">
                    <p><strong>Try asking me:</strong></p>
                    <div class="command-examples">
                        <span class="command">"Show revenue report"</span>
                        <span class="command">"How many users today?"</span>
                        <span class="command">"Campaign status"</span>
                        <span class="command">"Any alerts?"</span>
                    </div>
                </div>
            </div>
        `;
  }

  getDefaultResponse() {
    const responses = [
      "I'm here to help with admin tasks! Try asking about revenue, users, campaigns, or alerts.",
      "I can generate reports and provide insights. What would you like to know?",
      "Ask me about revenue analytics, user statistics, or system alerts!",
      "I'm your AI assistant for platform management. How can I help you today?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  loadNotifications() {
    // Generate notification count
    const orders = JSON.parse(localStorage.getItem("nabila_orders") || "[]");
    const campaigns = JSON.parse(
      localStorage.getItem("nabila_campaigns") || "[]",
    );
    const withdrawals = JSON.parse(
      localStorage.getItem("nabila_withdrawals") || "[]",
    );

    const pendingCount =
      orders.filter((o) => o.status === "pending").length +
      campaigns.filter(
        (c) => c.status === "pending" || c.status === "pending_payment",
      ).length +
      withdrawals.filter((w) => w.status === "pending").length;

    const notification = document.getElementById("botNotification");
    if (notification) {
      if (pendingCount > 0) {
        notification.textContent = pendingCount;
        notification.style.display = "block";
      } else {
        notification.style.display = "none";
      }
    }
  }

  startAutoUpdates() {
    // Update notifications every 30 seconds
    setInterval(() => {
      this.loadNotifications();
    }, 30000);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById("botMessages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

// Initialize AI Admin Bot
document.addEventListener("DOMContentLoaded", () => {
  window.aiAdminBot = new AIAdminBot();
});

// Add AI Admin Bot styles
const aiAdminBotStyles = document.createElement("style");
aiAdminBotStyles.textContent = `
    .ai-admin-bot {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    }

    .bot-toggle {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 15px 20px;
        border-radius: 50px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        position: relative;
        min-width: 280px;
    }

    .bot-toggle:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
    }

    .bot-avatar {
        flex-shrink: 0;
    }

    .bot-photo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .bot-info {
        flex: 1;
    }

    .bot-name {
        display: block;
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 3px;
    }

    .bot-status {
        font-size: 0.9rem;
        opacity: 0.9;
    }

    .bot-notification {
        position: absolute;
        top: -5px;
        right: 15px;
        background: #e74c3c;
        color: white;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
        animation: pulse 2s infinite;
    }

    .bot-chat {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 450px;
        height: 500px;
        background: var(--card-bg);
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        border: 2px solid var(--border-color);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .bot-chat-header {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .bot-header-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .bot-header-photo {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .bot-chat-header h4 {
        margin: 0;
        font-size: 1.2rem;
    }

    .bot-subtitle {
        font-size: 0.9rem;
        opacity: 0.9;
    }

    #closeBotChat {
        background: none;
        border: none;
        color: white;
        font-size: 1.8rem;
        cursor: pointer;
        padding: 5px;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    #closeBotChat:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .bot-chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .bot-message, .user-message {
        display: flex;
        gap: 12px;
        align-items: flex-start;
    }

    .user-message {
        flex-direction: row-reverse;
    }

    .message-avatar {
        flex-shrink: 0;
    }

    .message-avatar img {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        object-fit: cover;
    }

    .message-avatar span {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }

    .message-content {
        background: var(--bg-dark);
        padding: 12px 16px;
        border-radius: 18px;
        color: var(--text-light);
        max-width: 80%;
        line-height: 1.5;
    }

    .user-msg {
        background: var(--primary-color);
        color: white;
    }

    .ai-report {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 15px;
        margin: 5px 0;
    }

    .ai-report h4 {
        color: var(--text-light);
        margin-bottom: 15px;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 8px;
    }

    .report-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
    }

    .report-stat {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
    }

    .stat-label {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .stat-value {
        color: var(--text-light);
        font-weight: bold;
    }

    .report-insights {
        background: var(--bg-dark);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 10px;
    }

    .report-insights ul {
        margin: 8px 0 0 20px;
        color: var(--text-dark);
    }

    .report-insights li {
        margin-bottom: 5px;
    }

    .quick-actions-section {
        text-align: center;
        margin-top: 10px;
    }

    .ai-action-btn {
        background: var(--secondary-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 15px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        margin: 5px;
    }

    .ai-action-btn:hover {
        background: var(--primary-color);
        transform: scale(1.05);
    }

    .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .alert-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--bg-dark);
        border-radius: 8px;
        border-left: 4px solid;
    }

    .alert-item.warning {
        border-left-color: #f39c12;
    }

    .alert-item.info {
        border-left-color: #3498db;
    }

    .alert-item.urgent {
        border-left-color: #e74c3c;
    }

    .alert-icon {
        font-size: 1.5rem;
    }

    .alert-content {
        flex: 1;
    }

    .alert-title {
        font-weight: bold;
        color: var(--text-light);
        margin-bottom: 3px;
    }

    .alert-message {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .alert-time {
        color: var(--text-dark);
        font-size: 0.8rem;
    }

    .ai-help {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 15px;
    }

    .ai-help h4 {
        color: var(--text-light);
        margin-bottom: 10px;
    }

    .help-categories {
        display: grid;
        gap: 15px;
        margin: 15px 0;
    }

    .help-category {
        background: var(--bg-dark);
        padding: 12px;
        border-radius: 8px;
    }

    .help-category h5 {
        color: var(--text-light);
        margin-bottom: 8px;
    }

    .help-category ul {
        margin-left: 20px;
        color: var(--text-dark);
    }

    .help-category li {
        margin-bottom: 3px;
        font-size: 0.9rem;
    }

    .help-commands {
        margin-top: 15px;
        text-align: center;
    }

    .command-examples {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-top: 10px;
    }

    .command {
        background: var(--secondary-color);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .command:hover {
        background: var(--primary-color);
        transform: scale(1.05);
    }

    .bot-quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 15px 20px;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
    }

    .quick-action-btn {
        background: var(--bg-dark);
        color: var(--text-light);
        border: 1px solid var(--border-color);
        padding: 8px 12px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
        flex: 1;
        min-width: 80px;
    }

    .quick-action-btn:hover {
        background: var(--secondary-color);
        border-color: var(--secondary-color);
        color: white;
    }

    .bot-chat-input {
        padding: 20px;
        display: flex;
        gap: 10px;
        background: var(--bg-dark);
    }

    #botInput {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid var(--border-color);
        border-radius: 20px;
        background: var(--card-bg);
        color: var(--text-light);
        outline: none;
    }

    #botInput:focus {
        border-color: var(--secondary-color);
    }

    #sendBotMessage {
        background: var(--secondary-color);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    #sendBotMessage:hover {
        background: var(--primary-color);
        transform: scale(1.05);
    }

    .bot-chat-messages::-webkit-scrollbar {
        width: 6px;
    }

    .bot-chat-messages::-webkit-scrollbar-track {
        background: var(--bg-dark);
        border-radius: 3px;
    }

    .bot-chat-messages::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;
    }

    .bot-chat-messages::-webkit-scrollbar-thumb:hover {
        background: var(--text-dark);
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    @media (max-width: 768px) {
        .bot-chat {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
            height: 450px;
        }

        .bot-toggle {
            min-width: 200px;
            padding: 12px 16px;
        }

        .bot-name {
            font-size: 1rem;
        }

        .bot-quick-actions {
            flex-direction: column;
        }

        .quick-action-btn {
            min-width: auto;
        }

        .report-stats {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(aiAdminBotStyles);
