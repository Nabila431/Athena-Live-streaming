// Admin Panel Management System
class AdminPanel {
  constructor() {
    this.isLoggedIn = false;
    this.currentSection = "dashboard";
    this.adminCredentials = {
      email: "jesikamahjong@gmail.com",
      password: "axis2019",
    };
    this.currentOrderId = null;
    this.currentUserId = null;
    this.init();
  }

  init() {
    this.checkAdminAuth();
    this.setupEventListeners();
    if (this.isLoggedIn) {
      this.loadDashboard();
    }
  }

  checkAdminAuth() {
    const adminSession = localStorage.getItem("nabila_admin_session");
    if (adminSession) {
      const session = JSON.parse(adminSession);
      const now = new Date().getTime();

      // Check if session is valid (24 hours)
      if (now - session.timestamp < 24 * 60 * 60 * 1000) {
        this.isLoggedIn = true;
        this.showAdminPanel();
        return;
      } else {
        localStorage.removeItem("nabila_admin_session");
      }
    }

    this.showLoginForm();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Navigation
    document
      .getElementById("ordersTab")
      ?.addEventListener("click", () => this.switchSection("orders"));
    document
      .getElementById("usersTab")
      ?.addEventListener("click", () => this.switchSection("users"));
    document
      .getElementById("campaignsTab")
      ?.addEventListener("click", () => this.switchSection("campaigns"));
    document
      .getElementById("creatorsTab")
      ?.addEventListener("click", () => this.switchSection("creators"));
    document
      .getElementById("withdrawalsTab")
      ?.addEventListener("click", () => this.switchSection("withdrawals"));
    document
      .getElementById("managementTab")
      ?.addEventListener("click", () => this.switchSection("management"));
    document
      .getElementById("analyticsTab")
      ?.addEventListener("click", () => this.switchSection("analytics"));

    // Quick actions
    document
      .getElementById("refreshData")
      ?.addEventListener("click", () => this.refreshData());
    document
      .getElementById("exportOrders")
      ?.addEventListener("click", () => this.exportOrders());
    document
      .getElementById("viewUsers")
      ?.addEventListener("click", () => this.switchSection("users"));
    document
      .getElementById("viewAnalytics")
      ?.addEventListener("click", () => this.switchSection("analytics"));

    // Logout
    document
      .getElementById("adminLogout")
      ?.addEventListener("click", () => this.logout());

    // Filters
    document
      .getElementById("statusFilter")
      ?.addEventListener("change", () => this.applyFilters());
    document
      .getElementById("paymentFilter")
      ?.addEventListener("change", () => this.applyFilters());
    document
      .getElementById("dateFilter")
      ?.addEventListener("change", () => this.applyFilters());

    // Modal close buttons
    document.querySelectorAll(".modal .close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none";
      });
    });

    // Order actions
    document
      .getElementById("approveOrder")
      ?.addEventListener("click", () => this.approveOrder());
    document
      .getElementById("rejectOrder")
      ?.addEventListener("click", () => this.rejectOrder());
    document
      .getElementById("closeOrderModal")
      ?.addEventListener("click", () => {
        document.getElementById("orderDetailModal").style.display = "none";
      });

    // User actions
    document
      .getElementById("adjustBalance")
      ?.addEventListener("click", () => this.showBalanceAdjustment());
    document.getElementById("closeUserModal")?.addEventListener("click", () => {
      document.getElementById("userDetailModal").style.display = "none";
    });

    // Click outside to close modals
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  handleLogin() {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if (
      email === this.adminCredentials.email &&
      password === this.adminCredentials.password
    ) {
      this.isLoggedIn = true;

      // Create session
      const session = {
        email: email,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("nabila_admin_session", JSON.stringify(session));

      this.showAdminPanel();
      this.loadDashboard();
      this.showNotification("Login berhasil! Selamat datang Admin.", "success");
    } else {
      this.showNotification("Email atau password salah!", "error");
    }
  }

  logout() {
    localStorage.removeItem("nabila_admin_session");
    this.isLoggedIn = false;
    this.showLoginForm();
    this.showNotification("Logout berhasil!", "success");
  }

  showLoginForm() {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("ordersSection").style.display = "none";
    document.getElementById("usersSection").style.display = "none";
    document.getElementById("analyticsSection").style.display = "none";
    document.getElementById("adminLogin").style.display = "block";
    document.getElementById("adminInfo").style.display = "none";
  }

  showAdminPanel() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminInfo").style.display = "flex";
    document.getElementById("adminName").textContent = "Admin Panel";
    this.switchSection("dashboard");
  }

  switchSection(section) {
    // Hide all sections
    document.querySelectorAll(".admin-section").forEach((sec) => {
      sec.style.display = "none";
    });

    // Show selected section
    document.getElementById(`${section}Section`).style.display = "block";

    // Update navigation
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.remove("active");
    });

    if (section === "dashboard") {
      document.querySelector('a[href="admin.html"]').classList.add("active");
    } else {
      document.getElementById(`${section}Tab`).classList.add("active");
    }

    this.currentSection = section;

    // Load section data
    switch (section) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "orders":
        this.loadOrders();
        break;
      case "users":
        this.loadUsers();
        break;
      case "campaigns":
        this.loadCampaigns();
        break;
      case "creators":
        this.loadCreators();
        break;
      case "withdrawals":
        this.loadWithdrawals();
        break;
      case "management":
        this.loadManagement();
        break;
      case "analytics":
        this.loadAnalytics();
        break;
    }
  }

  loadDashboard() {
    const orders = this.getAllOrders();
    const users = this.getAllUsers();

    // Update stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const approvedOrders = orders.filter((o) => o.status === "approved").length;
    const totalRevenue = this.calculateTotalRevenue(orders);

    document.getElementById("totalOrders").textContent = totalOrders;
    document.getElementById("pendingOrders").textContent = pendingOrders;
    document.getElementById("approvedOrders").textContent = approvedOrders;
    document.getElementById("totalRevenue").textContent =
      this.formatCurrency(totalRevenue);

    // Load recent orders
    this.loadRecentOrders();
  }

  loadRecentOrders() {
    const orders = this.getAllOrders().slice(0, 10);
    const tableBody = document.getElementById("recentOrdersTable");

    if (orders.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align: center; color: var(--text-dark);">Belum ada order</td></tr>';
      return;
    }

    tableBody.innerHTML = orders
      .map(
        (order) => `
            <tr class="order-row ${order.status}" data-order-id="${order.orderRef}">
                <td class="order-id">${order.orderRef}</td>
                <td class="customer-info">
                    <div class="customer-name">${order.user.name}</div>
                    <div class="customer-email">${order.user.email}</div>
                </td>
                <td class="item-info">
                    <div class="item-name">${order.item.icon} ${order.item.name}</div>
                    <div class="item-qty">Qty: ${order.quantity}</div>
                </td>
                <td class="amount">${this.formatCurrency(order.totalPrice)}</td>
                <td class="payment-method">
                    ${this.getPaymentMethodIcon(order.paymentMethod)} ${this.formatPaymentMethod(order.paymentMethod)}
                </td>
                <td class="status">
                    <span class="status-badge status-${order.status}">${this.formatStatus(order.status)}</span>
                </td>
                <td class="date">${new Date(order.createdAt).toLocaleDateString("id-ID")}</td>
                <td class="actions">
                    <button class="action-btn view" onclick="adminPanel.viewOrderDetail('${order.orderRef}')">👁️</button>
                    ${
                      order.status === "pending"
                        ? `
                        <button class="action-btn approve" onclick="adminPanel.quickApprove('${order.orderRef}')">✅</button>
                        <button class="action-btn reject" onclick="adminPanel.quickReject('${order.orderRef}')">❌</button>
                    `
                        : ""
                    }
                </td>
            </tr>
        `,
      )
      .join("");
  }

  loadOrders() {
    const orders = this.getAllOrders();
    const container = document.getElementById("ordersGrid");

    if (orders.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; color: var(--text-dark); padding: 40px;">Belum ada order</div>';
      return;
    }

    container.innerHTML = orders
      .map((order) => this.createOrderCard(order))
      .join("");
  }

  createOrderCard(order) {
    return `
            <div class="order-card ${order.status}" data-order-id="${order.orderRef}">
                <div class="order-header">
                    <div class="order-id">#${order.orderRef}</div>
                    <div class="order-status">
                        <span class="status-badge status-${order.status}">${this.formatStatus(order.status)}</span>
                    </div>
                </div>

                <div class="order-customer">
                    <div class="customer-avatar">
                        <img src="${order.user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(order.user.name)}" alt="${order.user.name}">
                    </div>
                    <div class="customer-details">
                        <div class="customer-name">${order.user.name}</div>
                        <div class="customer-email">${order.user.email}</div>
                    </div>
                </div>

                <div class="order-item">
                    <div class="item-icon">${order.item.icon}</div>
                    <div class="item-details">
                        <div class="item-name">${order.item.name}</div>
                        <div class="item-description">${order.item.description}</div>
                        <div class="item-quantity">Quantity: ${order.quantity}</div>
                    </div>
                </div>

                <div class="order-payment">
                    <div class="payment-method">
                        ${this.getPaymentMethodIcon(order.paymentMethod)} ${this.formatPaymentMethod(order.paymentMethod)}
                    </div>
                    <div class="payment-amount">${this.formatCurrency(order.totalPrice)}</div>
                </div>

                <div class="order-date">
                    <div class="created-date">Created: ${new Date(order.createdAt).toLocaleString("id-ID")}</div>
                    ${order.updatedAt !== order.createdAt ? `<div class="updated-date">Updated: ${new Date(order.updatedAt).toLocaleString("id-ID")}</div>` : ""}
                </div>

                <div class="order-actions">
                    <button class="btn small primary" onclick="adminPanel.viewOrderDetail('${order.orderRef}')">
                        👁️ View Details
                    </button>
                    ${
                      order.status === "pending"
                        ? `
                        <button class="btn small success" onclick="adminPanel.quickApprove('${order.orderRef}')">
                            ✅ Approve
                        </button>
                        <button class="btn small danger" onclick="adminPanel.quickReject('${order.orderRef}')">
                            ❌ Reject
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  loadUsers() {
    const users = this.getAllUsers();
    const balances = JSON.parse(
      localStorage.getItem("nabila_balances") || "{}",
    );
    const orders = this.getAllOrders();

    // Update user stats
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => {
      const lastSeen = new Date(u.lastSeen || u.created_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastSeen > dayAgo;
    }).length;
    const payingUsers = users.filter((u) =>
      orders.some((o) => o.user.id === u.id),
    ).length;

    document.getElementById("totalUsers").textContent = totalUsers;
    document.getElementById("activeUsers").textContent = activeUsers;
    document.getElementById("payingUsers").textContent = payingUsers;

    // Load users table
    const tableBody = document.getElementById("usersTable");

    if (users.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align: center; color: var(--text-dark);">Belum ada user terdaftar</td></tr>';
      return;
    }

    tableBody.innerHTML = users
      .map((user) => {
        const userBalance = balances[user.id] || { coins: 0, diamonds: 0 };
        const userOrders = orders.filter((o) => o.user.id === user.id);

        return `
                <tr class="user-row" data-user-id="${user.id}">
                    <td class="user-avatar">
                        <img src="${user.avatar}" alt="${user.name}">
                    </td>
                    <td class="user-name">${user.name}</td>
                    <td class="user-email">${user.email}</td>
                    <td class="user-balance">
                        <div>💎 ${userBalance.coins.toLocaleString()}</div>
                        <div>💍 ${userBalance.diamonds.toLocaleString()}</div>
                    </td>
                    <td class="user-orders">${userOrders.length}</td>
                    <td class="user-joined">${new Date(user.created_at).toLocaleDateString("id-ID")}</td>
                    <td class="user-actions">
                        <button class="action-btn view" onclick="adminPanel.viewUserDetail('${user.id}')">👁️</button>
                        <button class="action-btn edit" onclick="adminPanel.adjustUserBalance('${user.id}')">💰</button>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  loadCampaigns() {
    const campaigns = this.getAllCampaigns();

    // Update campaign stats
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

    document.getElementById("totalCampaigns").textContent = totalCampaigns;
    document.getElementById("pendingCampaigns").textContent = pendingCampaigns;
    document.getElementById("activeCampaigns").textContent = activeCampaigns;
    document.getElementById("campaignRevenue").textContent =
      this.formatCurrency(campaignRevenue);

    // Load campaigns table
    this.loadCampaignsTable(campaigns);
  }

  loadCampaignsTable(campaigns) {
    const tableBody = document.getElementById("campaignsTable");

    if (campaigns.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align: center; color: var(--text-dark);">No campaigns yet</td></tr>';
      return;
    }

    tableBody.innerHTML = campaigns
      .map(
        (campaign) => `
            <tr class="campaign-row ${campaign.status}" data-campaign-id="${campaign.orderRef}">
                <td class="campaign-id">${campaign.orderRef}</td>
                <td class="campaign-user">
                    <div class="user-name">${campaign.user.name}</div>
                    <div class="user-email">${campaign.user.email}</div>
                </td>
                <td class="campaign-package">${campaign.packageInfo.name}</td>
                <td class="campaign-post">${campaign.postTitle}</td>
                <td class="campaign-amount">${this.formatCurrency(campaign.price)}</td>
                <td class="campaign-status">
                    <span class="status-badge status-${campaign.status}">${this.formatStatus(campaign.status)}</span>
                </td>
                <td class="campaign-date">${new Date(campaign.createdAt).toLocaleDateString("id-ID")}</td>
                <td class="campaign-actions">
                    <button class="action-btn view" onclick="adminPanel.viewCampaignDetail('${campaign.orderRef}')">👁️</button>
                    ${
                      campaign.status === "pending" ||
                      campaign.status === "pending_payment"
                        ? `
                        <button class="action-btn approve" onclick="adminPanel.approveCampaign('${campaign.orderRef}')">✅</button>
                        <button class="action-btn reject" onclick="adminPanel.rejectCampaign('${campaign.orderRef}')">❌</button>
                    `
                        : ""
                    }
                </td>
            </tr>
        `,
      )
      .join("");
  }

  loadCreators() {
    const applications = this.getCreatorApplications();
    const creators = applications.filter((app) => app.status === "approved");

    // Update stats
    document.getElementById("totalCreators").textContent = creators.length;
    document.getElementById("pendingApplications").textContent =
      applications.filter((app) => app.status === "pending").length;
    document.getElementById("approvedCreators").textContent = creators.length;

    // Load applications
    this.loadCreatorApplications(applications);
  }

  loadCreatorApplications(applications) {
    const container = document.getElementById("creatorApplicationsList");

    if (applications.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; color: var(--text-dark); padding: 40px;">No creator applications yet</div>';
      return;
    }

    container.innerHTML = applications
      .map(
        (app) => `
            <div class="application-card ${app.status}">
                <div class="application-header">
                    <div class="applicant-info">
                        <h4>${app.name}</h4>
                        <span class="application-category">${app.category}</span>
                    </div>
                    <span class="status-badge status-${app.status}">${this.formatStatus(app.status)}</span>
                </div>
                <div class="application-content">
                    <p><strong>Why join:</strong> ${app.reason}</p>
                    ${app.social ? `<p><strong>Social:</strong> ${app.social}</p>` : ""}
                    <p><strong>Applied:</strong> ${new Date(app.appliedAt).toLocaleDateString("id-ID")}</p>
                </div>
                ${
                  app.status === "pending"
                    ? `
                    <div class="application-actions">
                        <button class="btn success" onclick="adminPanel.approveCreator('${app.id}')">✅ Approve</button>
                        <button class="btn danger" onclick="adminPanel.rejectCreator('${app.id}')">❌ Reject</button>
                    </div>
                `
                    : ""
                }
            </div>
        `,
      )
      .join("");
  }

  loadWithdrawals() {
    const withdrawals = this.getAllWithdrawals();

    // Update stats
    const totalWithdrawals = withdrawals.length;
    const pendingWithdrawals = withdrawals.filter(
      (w) => w.status === "pending",
    ).length;
    const approvedAmount = withdrawals
      .filter((w) => w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);

    document.getElementById("totalWithdrawals").textContent = totalWithdrawals;
    document.getElementById("pendingWithdrawals").textContent =
      pendingWithdrawals;
    document.getElementById("approvedWithdrawals").textContent =
      this.formatCurrency(approvedAmount);

    // Load withdrawals table
    this.loadWithdrawalsTable(withdrawals);
  }

  loadWithdrawalsTable(withdrawals) {
    const tableBody = document.getElementById("withdrawalsTable");

    if (withdrawals.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align: center; color: var(--text-dark);">No withdrawal requests yet</td></tr>';
      return;
    }

    tableBody.innerHTML = withdrawals
      .map(
        (withdrawal) => `
            <tr class="withdrawal-row ${withdrawal.status}" data-withdrawal-id="${withdrawal.id}">
                <td class="withdrawal-id">${withdrawal.id}</td>
                <td class="withdrawal-user">
                    <div class="user-name">${this.getUserById(withdrawal.userId)?.name || "Unknown"}</div>
                    <div class="user-email">${this.getUserById(withdrawal.userId)?.email || "Unknown"}</div>
                </td>
                <td class="withdrawal-amount">${this.formatCurrency(withdrawal.amount)}</td>
                <td class="withdrawal-method">${withdrawal.method.toUpperCase()}</td>
                <td class="withdrawal-status">
                    <span class="status-badge status-${withdrawal.status}">${this.formatStatus(withdrawal.status)}</span>
                </td>
                <td class="withdrawal-date">${new Date(withdrawal.requestedAt).toLocaleDateString("id-ID")}</td>
                <td class="withdrawal-actions">
                    <button class="action-btn view" onclick="adminPanel.viewWithdrawalDetail('${withdrawal.id}')">👁️</button>
                    ${
                      withdrawal.status === "pending"
                        ? `
                        <button class="action-btn approve" onclick="adminPanel.approveWithdrawal('${withdrawal.id}')">✅</button>
                        <button class="action-btn reject" onclick="adminPanel.rejectWithdrawal('${withdrawal.id}')">❌</button>
                    `
                        : ""
                    }
                </td>
            </tr>
        `,
      )
      .join("");
  }

  loadManagement() {
    // Setup management team buttons
    document
      .getElementById("viewAiBot")
      ?.addEventListener("click", () => this.showAiBotManagement());
    document
      .getElementById("viewReports")
      ?.addEventListener("click", () => this.showReportsManagement());
    document
      .getElementById("viewRegistrations")
      ?.addEventListener("click", () => this.showRegistrationsManagement());
    document
      .getElementById("viewFinance")
      ?.addEventListener("click", () => this.showFinanceManagement());
    document
      .getElementById("viewPolicies")
      ?.addEventListener("click", () => this.showPoliciesManagement());
    document
      .getElementById("viewCampaignDivision")
      ?.addEventListener("click", () => this.showCampaignDivision());
  }

  loadAnalytics() {
    const orders = this.getAllOrders();

    // Payment methods stats
    const paymentStats = this.calculatePaymentMethodStats(orders);
    document.getElementById("gopayPercentage").textContent =
      paymentStats.gopay + "%";
    document.getElementById("bankPercentage").textContent =
      paymentStats.bank + "%";
    document.getElementById("virtualPercentage").textContent =
      paymentStats.virtual + "%";

    // Top items
    this.loadTopItems(orders);
  }

  // New action methods
  approveCampaign(campaignRef) {
    if (confirm("Approve this campaign?")) {
      const campaigns = this.getAllCampaigns();
      const campaignIndex = campaigns.findIndex(
        (c) => c.orderRef === campaignRef,
      );

      if (campaignIndex !== -1) {
        campaigns[campaignIndex].status = "active";
        campaigns[campaignIndex].approvedAt = new Date().toISOString();
        localStorage.setItem("nabila_campaigns", JSON.stringify(campaigns));

        this.loadCampaigns();
        this.showNotification("Campaign approved and activated!", "success");
      }
    }
  }

  rejectCampaign(campaignRef) {
    const reason = prompt("Reason for rejection (optional):");
    if (reason !== null) {
      const campaigns = this.getAllCampaigns();
      const campaignIndex = campaigns.findIndex(
        (c) => c.orderRef === campaignRef,
      );

      if (campaignIndex !== -1) {
        campaigns[campaignIndex].status = "rejected";
        campaigns[campaignIndex].rejectionReason = reason;
        campaigns[campaignIndex].rejectedAt = new Date().toISOString();
        localStorage.setItem("nabila_campaigns", JSON.stringify(campaigns));

        this.loadCampaigns();
        this.showNotification("Campaign rejected!", "success");
      }
    }
  }

  approveCreator(applicationId) {
    if (confirm("Approve this creator application?")) {
      const applications = this.getCreatorApplications();
      const appIndex = applications.findIndex(
        (app) => app.id === applicationId,
      );

      if (appIndex !== -1) {
        applications[appIndex].status = "approved";
        applications[appIndex].approvedAt = new Date().toISOString();
        localStorage.setItem(
          "nabila_creator_applications",
          JSON.stringify(applications),
        );

        this.loadCreators();
        this.showNotification("Creator application approved!", "success");
      }
    }
  }

  rejectCreator(applicationId) {
    const reason = prompt("Reason for rejection (optional):");
    if (reason !== null) {
      const applications = this.getCreatorApplications();
      const appIndex = applications.findIndex(
        (app) => app.id === applicationId,
      );

      if (appIndex !== -1) {
        applications[appIndex].status = "rejected";
        applications[appIndex].rejectionReason = reason;
        applications[appIndex].rejectedAt = new Date().toISOString();
        localStorage.setItem(
          "nabila_creator_applications",
          JSON.stringify(applications),
        );

        this.loadCreators();
        this.showNotification("Creator application rejected!", "success");
      }
    }
  }

  approveWithdrawal(withdrawalId) {
    if (confirm("Approve this withdrawal request?")) {
      const withdrawals = this.getAllWithdrawals();
      const withdrawalIndex = withdrawals.findIndex(
        (w) => w.id === withdrawalId,
      );

      if (withdrawalIndex !== -1) {
        withdrawals[withdrawalIndex].status = "approved";
        withdrawals[withdrawalIndex].approvedAt = new Date().toISOString();
        localStorage.setItem("nabila_withdrawals", JSON.stringify(withdrawals));

        this.loadWithdrawals();
        this.showNotification("Withdrawal approved!", "success");
      }
    }
  }

  rejectWithdrawal(withdrawalId) {
    const reason = prompt("Reason for rejection (optional):");
    if (reason !== null) {
      const withdrawals = this.getAllWithdrawals();
      const withdrawalIndex = withdrawals.findIndex(
        (w) => w.id === withdrawalId,
      );

      if (withdrawalIndex !== -1) {
        withdrawals[withdrawalIndex].status = "rejected";
        withdrawals[withdrawalIndex].rejectionReason = reason;
        withdrawals[withdrawalIndex].rejectedAt = new Date().toISOString();
        localStorage.setItem("nabila_withdrawals", JSON.stringify(withdrawals));

        this.loadWithdrawals();
        this.showNotification("Withdrawal rejected!", "success");
      }
    }
  }

  // Data getters
  getAllCampaigns() {
    return JSON.parse(localStorage.getItem("nabila_campaigns") || "[]");
  }

  getCreatorApplications() {
    return JSON.parse(
      localStorage.getItem("nabila_creator_applications") || "[]",
    );
  }

  getAllWithdrawals() {
    return JSON.parse(localStorage.getItem("nabila_withdrawals") || "[]");
  }

  calculatePaymentMethodStats(orders) {
    const total = orders.length;
    if (total === 0) return { gopay: 0, bank: 0, virtual: 0 };

    const gopay = orders.filter((o) => o.paymentMethod === "gopay").length;
    const bank = orders.filter((o) => o.paymentMethod === "bank").length;
    const virtual = orders.filter((o) => o.paymentMethod === "virtual").length;

    return {
      gopay: Math.round((gopay / total) * 100),
      bank: Math.round((bank / total) * 100),
      virtual: Math.round((virtual / total) * 100),
    };
  }

  loadTopItems(orders) {
    const itemStats = {};

    orders.forEach((order) => {
      const itemId = order.item.id;
      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          item: order.item,
          totalSold: 0,
          totalRevenue: 0,
        };
      }
      itemStats[itemId].totalSold += order.quantity;
      itemStats[itemId].totalRevenue += order.totalPrice;
    });

    const sortedItems = Object.values(itemStats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    const container = document.getElementById("topItemsList");

    if (sortedItems.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; color: var(--text-dark);">Belum ada data penjualan</div>';
      return;
    }

    container.innerHTML = sortedItems
      .map(
        (stat, index) => `
            <div class="top-item">
                <div class="item-rank">#${index + 1}</div>
                <div class="item-info">
                    <div class="item-name">${stat.item.icon} ${stat.item.name}</div>
                    <div class="item-stats">
                        Sold: ${stat.totalSold} | Revenue: ${this.formatCurrency(stat.totalRevenue)}
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  viewOrderDetail(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) return;

    this.currentOrderId = orderId;
    const modal = document.getElementById("orderDetailModal");
    const content = document.getElementById("orderDetailContent");

    content.innerHTML = `
            <div class="order-detail-content">
                <div class="detail-section">
                    <h4>📋 Order Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Order ID:</label>
                            <span>${order.orderRef}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge status-${order.status}">${this.formatStatus(order.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Created:</label>
                            <span>${new Date(order.createdAt).toLocaleString("id-ID")}</span>
                        </div>
                        <div class="detail-item">
                            <label>Updated:</label>
                            <span>${new Date(order.updatedAt).toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>👤 Customer Information</h4>
                    <div class="customer-detail">
                        <img src="${order.user.avatar}" alt="${order.user.name}" class="customer-avatar-large">
                        <div class="customer-info">
                            <div><strong>Name:</strong> ${order.user.name}</div>
                            <div><strong>Email:</strong> ${order.user.email}</div>
                            <div><strong>Username:</strong> ${order.user.username || "N/A"}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>📦 Item Details</h4>
                    <div class="item-detail">
                        <div class="item-icon-large">${order.item.icon}</div>
                        <div class="item-info">
                            <div class="item-name">${order.item.name}</div>
                            <div class="item-description">${order.item.description}</div>
                            <div class="item-quantity">Quantity: ${order.quantity}</div>
                            ${
                              order.item.features
                                ? `
                                <div class="item-features">
                                    <strong>Features:</strong>
                                    <ul>${order.item.features.map((f) => `<li>${f}</li>`).join("")}</ul>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>💳 Payment Information</h4>
                    <div class="payment-detail">
                        <div><strong>Method:</strong> ${this.getPaymentMethodIcon(order.paymentMethod)} ${this.formatPaymentMethod(order.paymentMethod)}</div>
                        <div><strong>Total Amount:</strong> ${this.formatCurrency(order.totalPrice)}</div>
                        ${order.paymentMethod === "gopay" ? "<div><strong>GoPay Number:</strong> 0895340205302</div>" : ""}
                        ${order.paymentMethod === "bank" ? "<div><strong>Bank Account:</strong> BCA 1234567890</div>" : ""}
                    </div>
                </div>

                ${
                  order.adminNotes
                    ? `
                    <div class="detail-section">
                        <h4>📝 Admin Notes</h4>
                        <div class="admin-notes">${order.adminNotes}</div>
                    </div>
                `
                    : ""
                }
            </div>
        `;

    modal.style.display = "block";
  }

  viewUserDetail(userId) {
    const user = this.getUserById(userId);
    if (!user) return;

    this.currentUserId = userId;
    const modal = document.getElementById("userDetailModal");
    const content = document.getElementById("userDetailContent");

    const userBalance = this.getUserBalance(userId);
    const userOrders = this.getAllOrders().filter((o) => o.user.id === userId);
    const totalSpent = userOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );

    content.innerHTML = `
            <div class="user-detail-content">
                <div class="user-profile">
                    <img src="${user.avatar}" alt="${user.name}" class="user-avatar-large">
                    <div class="user-info">
                        <h3>${user.name}</h3>
                        <p>${user.email}</p>
                        <p>Joined: ${new Date(user.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                </div>

                <div class="user-stats-grid">
                    <div class="user-stat-card">
                        <div class="stat-icon">💎</div>
                        <div class="stat-value">${userBalance.coins.toLocaleString()}</div>
                        <div class="stat-label">Coins</div>
                    </div>
                    <div class="user-stat-card">
                        <div class="stat-icon">💍</div>
                        <div class="stat-value">${userBalance.diamonds.toLocaleString()}</div>
                        <div class="stat-label">Diamonds</div>
                    </div>
                    <div class="user-stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-value">${userOrders.length}</div>
                        <div class="stat-label">Orders</div>
                    </div>
                    <div class="user-stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${this.formatCurrency(totalSpent)}</div>
                        <div class="stat-label">Total Spent</div>
                    </div>
                </div>

                <div class="user-orders-history">
                    <h4>📋 Order History</h4>
                    ${
                      userOrders.length > 0
                        ? `
                        <div class="orders-list">
                            ${userOrders
                              .slice(0, 5)
                              .map(
                                (order) => `
                                <div class="order-item">
                                    <div class="order-info">
                                        <span class="order-name">${order.item.icon} ${order.item.name}</span>
                                        <span class="order-date">${new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
                                    </div>
                                    <div class="order-amount">${this.formatCurrency(order.totalPrice)}</div>
                                    <div class="order-status">
                                        <span class="status-badge status-${order.status}">${this.formatStatus(order.status)}</span>
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    `
                        : '<p style="text-align: center; color: var(--text-dark);">No orders yet</p>'
                    }
                </div>
            </div>
        `;

    modal.style.display = "block";
  }

  quickApprove(orderId) {
    if (confirm("Approve order ini?")) {
      this.updateOrderStatus(orderId, "approved");
      this.refreshCurrentSection();
      this.showNotification("Order berhasil di-approve!", "success");
    }
  }

  quickReject(orderId) {
    const reason = prompt("Alasan reject (opsional):");
    if (reason !== null) {
      this.updateOrderStatus(orderId, "rejected", reason);
      this.refreshCurrentSection();
      this.showNotification("Order berhasil di-reject!", "success");
    }
  }

  approveOrder() {
    if (this.currentOrderId) {
      this.updateOrderStatus(this.currentOrderId, "approved");
      document.getElementById("orderDetailModal").style.display = "none";
      this.refreshCurrentSection();
      this.showNotification("Order berhasil di-approve!", "success");
    }
  }

  rejectOrder() {
    if (this.currentOrderId) {
      const reason = prompt("Alasan reject (opsional):");
      if (reason !== null) {
        this.updateOrderStatus(this.currentOrderId, "rejected", reason);
        document.getElementById("orderDetailModal").style.display = "none";
        this.refreshCurrentSection();
        this.showNotification("Order berhasil di-reject!", "success");
      }
    }
  }

  updateOrderStatus(orderId, status, notes = "") {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex((o) => o.orderRef === orderId);

    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date().toISOString();
      orders[orderIndex].adminNotes = notes;

      localStorage.setItem("nabila_orders", JSON.stringify(orders));

      // Update purchase history for compatibility
      const purchases = JSON.parse(
        localStorage.getItem("nabila_purchases") || "[]",
      );
      const purchaseIndex = purchases.findIndex((p) => p.id === orderId);
      if (purchaseIndex !== -1) {
        purchases[purchaseIndex].status = status;
        localStorage.setItem("nabila_purchases", JSON.stringify(purchases));
      }

      // Process top-up if approved
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
  }

  showBalanceAdjustment() {
    if (!this.currentUserId) return;

    const user = this.getUserById(this.currentUserId);
    const currentBalance = this.getUserBalance(this.currentUserId);

    const newCoins = prompt(
      `Adjust Coins untuk ${user.name}\nCurrent: ${currentBalance.coins.toLocaleString()}`,
      currentBalance.coins,
    );
    if (newCoins === null) return;

    const newDiamonds = prompt(
      `Adjust Diamonds untuk ${user.name}\nCurrent: ${currentBalance.diamonds.toLocaleString()}`,
      currentBalance.diamonds,
    );
    if (newDiamonds === null) return;

    const balances = JSON.parse(
      localStorage.getItem("nabila_balances") || "{}",
    );
    balances[this.currentUserId] = {
      coins: parseInt(newCoins) || 0,
      diamonds: parseInt(newDiamonds) || 0,
    };

    localStorage.setItem("nabila_balances", JSON.stringify(balances));

    document.getElementById("userDetailModal").style.display = "none";
    this.refreshCurrentSection();
    this.showNotification("Balance berhasil di-update!", "success");
  }

  refreshData() {
    this.refreshCurrentSection();
    this.showNotification("Data berhasil di-refresh!", "success");
  }

  refreshCurrentSection() {
    switch (this.currentSection) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "orders":
        this.loadOrders();
        break;
      case "users":
        this.loadUsers();
        break;
      case "analytics":
        this.loadAnalytics();
        break;
    }
  }

  exportOrders() {
    const orders = this.getAllOrders();
    const csvContent = this.convertToCSV(orders);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nabila_orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.showNotification("Orders berhasil di-export!", "success");
  }

  convertToCSV(orders) {
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Item",
      "Quantity",
      "Total",
      "Payment Method",
      "Status",
      "Created Date",
    ];
    const rows = orders.map((order) => [
      order.orderRef,
      order.user.name,
      order.user.email,
      order.item.name,
      order.quantity,
      order.totalPrice,
      order.paymentMethod,
      order.status,
      new Date(order.createdAt).toLocaleDateString("id-ID"),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  applyFilters() {
    const statusFilter = document.getElementById("statusFilter")?.value;
    const paymentFilter = document.getElementById("paymentFilter")?.value;
    const dateFilter = document.getElementById("dateFilter")?.value;

    let orders = this.getAllOrders();

    if (statusFilter) {
      orders = orders.filter((o) => o.status === statusFilter);
    }

    if (paymentFilter) {
      orders = orders.filter((o) => o.paymentMethod === paymentFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      orders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === filterDate.toDateString();
      });
    }

    // Update orders display
    const container = document.getElementById("ordersGrid");
    if (container) {
      container.innerHTML = orders
        .map((order) => this.createOrderCard(order))
        .join("");
    }
  }

  // Utility methods
  getAllOrders() {
    return JSON.parse(localStorage.getItem("nabila_orders") || "[]");
  }

  getAllUsers() {
    return JSON.parse(localStorage.getItem("nabila_users") || "[]");
  }

  getOrderById(orderId) {
    return this.getAllOrders().find((o) => o.orderRef === orderId);
  }

  getUserById(userId) {
    return this.getAllUsers().find((u) => u.id === userId);
  }

  getUserBalance(userId) {
    const balances = JSON.parse(
      localStorage.getItem("nabila_balances") || "{}",
    );
    return balances[userId] || { coins: 0, diamonds: 0 };
  }

  calculateTotalRevenue(orders) {
    return orders
      .filter((o) => o.status === "approved")
      .reduce((total, order) => total + order.totalPrice, 0);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  formatStatus(status) {
    const statusMap = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };
    return statusMap[status] || status;
  }

  formatPaymentMethod(method) {
    const methodMap = {
      gopay: "GoPay",
      bank: "Bank Transfer",
      virtual: "Virtual Currency",
    };
    return methodMap[method] || method;
  }

  getPaymentMethodIcon(method) {
    const iconMap = {
      gopay: "💳",
      bank: "🏦",
      virtual: "💎",
    };
    return iconMap[method] || "💳";
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize admin panel
document.addEventListener("DOMContentLoaded", () => {
  window.adminPanel = new AdminPanel();
});

// Add admin-specific styles
const adminStyles = document.createElement("style");
adminStyles.textContent = `
    .admin-main {
        min-height: calc(100vh - 140px);
        padding: 40px 0;
    }

    .admin-login-section {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
    }

    .login-form-container {
        max-width: 500px;
        width: 100%;
    }

    .login-card {
        background: var(--card-bg);
        padding: 40px;
        border-radius: 20px;
        border: 2px solid var(--border-color);
        text-align: center;
    }

    .login-card h2 {
        color: var(--text-light);
        margin-bottom: 10px;
    }

    .login-card p {
        color: var(--text-dark);
        margin-bottom: 30px;
    }

    .admin-form {
        text-align: left;
    }

    .input-group {
        margin-bottom: 20px;
    }

    .input-group label {
        display: block;
        color: var(--text-light);
        margin-bottom: 8px;
        font-weight: bold;
    }

    .input-group input {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        background: var(--bg-dark);
        color: var(--text-light);
        font-size: 1rem;
    }

    .input-group input:focus {
        border-color: var(--secondary-color);
        outline: none;
    }

    .full-width {
        width: 100%;
        margin-top: 10px;
    }

    .login-help {
        margin-top: 30px;
        padding: 20px;
        background: var(--bg-dark);
        border-radius: 12px;
        font-size: 0.9rem;
        color: var(--text-dark);
    }

    .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
        margin-bottom: 40px;
    }

    .stat-card {
        background: var(--card-bg);
        padding: 30px;
        border-radius: 15px;
        border: 2px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s ease;
    }

    .stat-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-5px);
    }

    .stat-card.pending {
        border-color: #f39c12;
    }

    .stat-card.approved {
        border-color: #27ae60;
    }

    .stat-card.revenue {
        border-color: var(--accent-color);
    }

    .stat-icon {
        font-size: 3rem;
    }

    .stat-number {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--text-light);
        margin-bottom: 5px;
    }

    .stat-label {
        color: var(--text-dark);
        font-size: 1rem;
    }

    .quick-actions {
        background: var(--card-bg);
        padding: 30px;
        border-radius: 15px;
        border: 2px solid var(--border-color);
        margin-bottom: 40px;
    }

    .quick-actions h3 {
        color: var(--text-light);
        margin-bottom: 20px;
    }

    .action-buttons {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }

    .action-btn {
        background: var(--secondary-color);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .action-btn:hover {
        background: var(--primary-color);
        transform: translateY(-2px);
    }

    .action-btn.view {
        background: var(--primary-color);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        padding: 0;
    }

    .action-btn.approve {
        background: #27ae60;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        padding: 0;
    }

    .action-btn.reject {
        background: #e74c3c;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        padding: 0;
    }

    .action-btn.edit {
        background: var(--accent-color);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        padding: 0;
    }

    .recent-orders {
        background: var(--card-bg);
        padding: 30px;
        border-radius: 15px;
        border: 2px solid var(--border-color);
    }

    .recent-orders h3 {
        color: var(--text-light);
        margin-bottom: 25px;
    }

    .orders-table-container {
        overflow-x: auto;
    }

    .orders-table, .users-table {
        width: 100%;
        border-collapse: collapse;
        background: var(--bg-dark);
        border-radius: 12px;
        overflow: hidden;
    }

    .orders-table th, .orders-table td,
    .users-table th, .users-table td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }

    .orders-table th, .users-table th {
        background: var(--secondary-color);
        color: white;
        font-weight: bold;
    }

    .orders-table td, .users-table td {
        color: var(--text-light);
    }

    .customer-name {
        font-weight: bold;
        color: var(--text-light);
    }

    .customer-email {
        font-size: 0.9rem;
        color: var(--text-dark);
    }

    .item-name {
        font-weight: bold;
    }

    .item-qty {
        font-size: 0.9rem;
        color: var(--text-dark);
    }

    .status-badge {
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    .status-pending {
        background: #f39c12;
        color: white;
    }

    .status-approved {
        background: #27ae60;
        color: white;
    }

    .status-rejected {
        background: #e74c3c;
        color: white;
    }

    .orders-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 25px;
    }

    .order-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
        transition: all 0.3s ease;
    }

    .order-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-5px);
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .order-id {
        font-weight: bold;
        color: var(--text-light);
        font-family: monospace;
    }

    .order-customer {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
    }

    .customer-avatar img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
    }

    .customer-name {
        font-weight: bold;
        color: var(--text-light);
    }

    .customer-email {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .order-item {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding: 15px;
        background: var(--bg-dark);
        border-radius: 12px;
    }

    .item-icon {
        font-size: 2rem;
    }

    .item-name {
        font-weight: bold;
        color: var(--text-light);
        margin-bottom: 5px;
    }

    .item-description {
        color: var(--text-dark);
        font-size: 0.9rem;
        margin-bottom: 5px;
    }

    .item-quantity {
        color: var(--accent-color);
        font-weight: bold;
        font-size: 0.9rem;
    }

    .order-payment {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .payment-method {
        color: var(--text-dark);
    }

    .payment-amount {
        font-weight: bold;
        color: var(--accent-color);
        font-size: 1.2rem;
    }

    .order-date {
        margin-bottom: 20px;
        font-size: 0.9rem;
        color: var(--text-dark);
    }

    .order-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .btn.small {
        padding: 8px 15px;
        font-size: 0.9rem;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 20px;
    }

    .filters {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }

    .filters select, .filters input {
        padding: 10px 15px;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        background: var(--card-bg);
        color: var(--text-light);
    }

    .users-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .user-avatar img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
    }

    .analytics-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
    }

    .analytics-card h3 {
        color: var(--text-light);
        margin-bottom: 20px;
    }

    .payment-methods-stats {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .payment-stat {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px;
        background: var(--bg-dark);
        border-radius: 12px;
    }

    .payment-icon {
        font-size: 1.5rem;
    }

    .payment-name {
        color: var(--text-light);
        font-weight: bold;
    }

    .payment-percentage {
        color: var(--accent-color);
        font-weight: bold;
        font-size: 1.2rem;
    }

    .top-items-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .top-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: var(--bg-dark);
        border-radius: 12px;
        margin-bottom: 10px;
    }

    .item-rank {
        font-weight: bold;
        color: var(--accent-color);
        font-size: 1.2rem;
        min-width: 30px;
    }

    .item-stats {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .order-detail-modal, .user-detail-modal {
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .detail-section {
        margin-bottom: 30px;
        padding: 20px;
        background: var(--bg-dark);
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }

    .detail-section h4 {
        color: var(--text-light);
        margin-bottom: 15px;
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

    .customer-detail, .item-detail {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .customer-avatar-large, .user-avatar-large {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
    }

    .item-icon-large {
        font-size: 4rem;
        text-align: center;
        min-width: 80px;
    }

    .item-features ul {
        margin: 10px 0 0 20px;
        color: var(--text-dark);
    }

    .payment-detail div {
        margin-bottom: 8px;
        color: var(--text-light);
    }

    .admin-notes {
        background: var(--card-bg);
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid var(--accent-color);
        color: var(--text-light);
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 25px;
        margin-bottom: 30px;
        padding: 25px;
        background: var(--bg-dark);
        border-radius: 15px;
    }

    .user-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .user-stat-card {
        background: var(--bg-dark);
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid var(--border-color);
    }

    .user-stat-card .stat-icon {
        font-size: 2rem;
        margin-bottom: 10px;
    }

    .user-stat-card .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--text-light);
        margin-bottom: 5px;
    }

    .user-stat-card .stat-label {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .user-orders-history {
        background: var(--bg-dark);
        padding: 20px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }

    .user-orders-history h4 {
        color: var(--text-light);
        margin-bottom: 15px;
    }

    .orders-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: var(--card-bg);
        border-radius: 8px;
        margin-bottom: 10px;
        border: 1px solid var(--border-color);
    }

    .order-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .order-name {
        color: var(--text-light);
        font-weight: bold;
    }

    .order-date {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .order-amount {
        color: var(--accent-color);
        font-weight: bold;
    }

    .admin-notification {
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

    .admin-notification.success {
        border-color: #27ae60;
    }

    .admin-notification.error {
        border-color: #e74c3c;
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

    /* New Management Team Styles */
    .teams-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 25px;
        margin-top: 30px;
    }

    .team-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 25px;
        transition: all 0.3s ease;
    }

    .team-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .team-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .team-header h3 {
        color: var(--text-light);
        margin: 0;
    }

    .team-status {
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }

    .team-status.online {
        background: #27ae60;
        color: white;
    }

    .team-status.active {
        background: var(--secondary-color);
        color: white;
    }

    .team-description p {
        color: var(--text-dark);
        margin-bottom: 15px;
        line-height: 1.5;
    }

    .team-description ul {
        list-style: none;
        padding: 0;
        margin-bottom: 20px;
    }

    .team-description li {
        color: var(--text-dark);
        margin-bottom: 8px;
        padding-left: 20px;
        position: relative;
    }

    /* Campaign/Creator/Withdrawal Tables */
    .campaigns-table-container, .withdrawals-table-container {
        overflow-x: auto;
        margin-top: 30px;
    }

    .campaigns-table, .withdrawals-table {
        width: 100%;
        border-collapse: collapse;
        background: var(--bg-dark);
        border-radius: 12px;
        overflow: hidden;
    }

    .campaigns-table th, .campaigns-table td,
    .withdrawals-table th, .withdrawals-table td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }

    .campaigns-table th, .withdrawals-table th {
        background: var(--secondary-color);
        color: white;
        font-weight: bold;
    }

    .application-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }

    .application-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-3px);
    }

    .application-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }

    .applicant-info h4 {
        color: var(--text-light);
        margin-bottom: 5px;
    }

    .application-category {
        background: var(--secondary-color);
        color: white;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
    }

    .application-content {
        color: var(--text-dark);
        line-height: 1.5;
        margin-bottom: 15px;
    }

    .application-content p {
        margin-bottom: 10px;
    }

    .application-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .admin-stats {
            grid-template-columns: 1fr;
        }

        .action-buttons {
            justify-content: center;
        }

        .orders-grid {
            grid-template-columns: 1fr;
        }

        .section-header {
            flex-direction: column;
            align-items: stretch;
        }

        .filters {
            justify-content: center;
        }

        .analytics-grid {
            grid-template-columns: 1fr;
        }

        .user-profile {
            flex-direction: column;
            text-align: center;
        }

        .customer-detail, .item-detail {
            flex-direction: column;
            text-align: center;
        }

        .teams-overview {
            grid-template-columns: 1fr;
        }

        .team-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
        }

        .application-header {
            flex-direction: column;
            gap: 10px;
        }

        .application-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(adminStyles);
