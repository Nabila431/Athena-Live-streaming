// Enhanced Posts Management System
class EnhancedPostsManager {
  constructor() {
    this.currentUser = null;
    this.currentTab = "feed";
    this.uploadedMedia = [];
    this.drafts = [];
    this.init();
  }

  init() {
    this.checkAuthStatus();
    this.setupEventListeners();
    this.setupTabNavigation();
    this.loadPosts();
  }

  checkAuthStatus() {
    const userData = localStorage.getItem("nabila_user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  setupEventListeners() {
    // Form submission
    document
      .getElementById("createPostForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.createPost();
      });

    // Media upload
    const mediaInput = document.getElementById("postMedia");
    const uploadArea = document.getElementById("uploadArea");

    if (uploadArea) {
      uploadArea.addEventListener("click", () => mediaInput?.click());
      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("drag-over");
      });
      uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("drag-over");
      });
      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("drag-over");
        this.handleFileUpload(e.dataTransfer.files);
      });
    }

    if (mediaInput) {
      mediaInput.addEventListener("change", (e) => {
        this.handleFileUpload(e.target.files);
      });
    }

    // Character counters
    this.setupCharacterCounters();

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setActiveFilter(e.target);
        this.filterPosts(e.target.dataset.filter);
      });
    });

    // Action buttons
    document.getElementById("createPostBtn")?.addEventListener("click", () => {
      this.switchTab("create");
    });

    document.getElementById("monetizeBtn")?.addEventListener("click", () => {
      this.switchTab("monetize");
    });

    document
      .getElementById("creatorProgramBtn")
      ?.addEventListener("click", () => {
        this.showCreatorProgramModal();
      });

    // Draft save
    document.getElementById("saveDraft")?.addEventListener("click", () => {
      this.saveDraft();
    });

    // Campaign buttons
    document.querySelectorAll("[data-package]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectCampaignPackage(
          e.target.dataset.package,
          e.target.dataset.price,
        );
      });
    });

    // Modals
    this.setupModalEventListeners();
  }

  setupModalEventListeners() {
    // Close modals
    document.querySelectorAll(".modal .close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none";
      });
    });

    // Campaign modal
    document.getElementById("cancelCampaign")?.addEventListener("click", () => {
      document.getElementById("campaignModal").style.display = "none";
    });

    document
      .getElementById("confirmCampaign")
      ?.addEventListener("click", () => {
        this.processCampaignPayment();
      });

    // Creator modal
    document.getElementById("cancelCreator")?.addEventListener("click", () => {
      document.getElementById("creatorModal").style.display = "none";
    });

    document.getElementById("submitCreator")?.addEventListener("click", () => {
      this.submitCreatorApplication();
    });

    // Click outside to close
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  setupCharacterCounters() {
    const inputs = [
      { id: "postTitle", max: 100 },
      { id: "postContent", max: 2000 },
    ];

    inputs.forEach(({ id, max }) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", () => {
          const count = input.value.length;
          const counter = input.parentNode.querySelector(".char-count");
          if (counter) {
            counter.textContent = `${count}/${max} characters`;
            counter.style.color =
              count > max * 0.9 ? "#e74c3c" : "var(--text-dark)";
          }
        });
      }
    });
  }

  setupTabNavigation() {
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Update sections
    document.querySelectorAll(".posts-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${tabName}-tab`).classList.add("active");

    this.currentTab = tabName;

    // Load tab-specific content
    this.loadTabContent(tabName);
  }

  loadTabContent(tabName) {
    switch (tabName) {
      case "feed":
        this.loadPosts();
        break;
      case "monetize":
        this.loadMonetizationData();
        break;
      case "analytics":
        this.loadAnalytics();
        break;
    }
  }

  handleFileUpload(files) {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (this.validateFile(file)) {
        this.processFile(file);
      }
    });
  }

  validateFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ["image/", "video/"];

    if (file.size > maxSize) {
      this.showAlert("File size too large. Maximum 50MB allowed.", "error");
      return false;
    }

    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      this.showAlert(
        "Invalid file type. Only images and videos allowed.",
        "error",
      );
      return false;
    }

    return true;
  }

  processFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const mediaData = {
        id: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: e.target.result,
        uploadedAt: new Date().toISOString(),
      };

      this.uploadedMedia.push(mediaData);
      this.displayMediaPreview(mediaData);
    };

    reader.onerror = () => {
      this.showAlert("Error reading file. Please try again.", "error");
    };

    reader.readAsDataURL(file);
  }

  displayMediaPreview(mediaData) {
    const container = document.getElementById("mediaPreviewContainer");
    if (!container) return;

    const preview = document.createElement("div");
    preview.className = "media-preview-item";
    preview.dataset.mediaId = mediaData.id;

    if (mediaData.type.startsWith("image/")) {
      preview.innerHTML = `
                <img src="${mediaData.url}" alt="${mediaData.name}">
                <div class="media-info">
                    <span class="media-name">${mediaData.name}</span>
                    <span class="media-size">${this.formatFileSize(mediaData.size)}</span>
                </div>
                <button class="remove-media" onclick="postsManager.removeMedia('${mediaData.id}')">×</button>
            `;
    } else if (mediaData.type.startsWith("video/")) {
      preview.innerHTML = `
                <video src="${mediaData.url}" controls muted>
                    Your browser does not support video playback.
                </video>
                <div class="media-info">
                    <span class="media-name">${mediaData.name}</span>
                    <span class="media-size">${this.formatFileSize(mediaData.size)}</span>
                </div>
                <button class="remove-media" onclick="postsManager.removeMedia('${mediaData.id}')">×</button>
            `;
    }

    container.appendChild(preview);
  }

  removeMedia(mediaId) {
    this.uploadedMedia = this.uploadedMedia.filter(
      (media) => media.id !== mediaId,
    );
    const previewElement = document.querySelector(
      `[data-media-id="${mediaId}"]`,
    );
    if (previewElement) {
      previewElement.remove();
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  createPost() {
    if (!this.currentUser) {
      this.showAlert("Please login to create posts.", "error");
      return;
    }

    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const category = document.getElementById("postCategory").value;
    const tags = document
      .getElementById("postTags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    const enableMonetization =
      document.getElementById("enableMonetization").checked;

    if (!title || !content) {
      this.showAlert("Title and content are required.", "error");
      return;
    }

    const post = {
      id: "post_" + Date.now(),
      title: title,
      content: content,
      category: category,
      tags: tags,
      media: [...this.uploadedMedia],
      author: {
        id: this.currentUser.id,
        name: this.currentUser.name,
        avatar: this.currentUser.avatar,
      },
      created_at: new Date().toISOString(),
      likes: 0,
      comments: [],
      views: 0,
      shares: 0,
      monetized: enableMonetization,
      earnings: 0,
      status: "published",
    };

    // Save post
    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    posts.unshift(post);
    localStorage.setItem("nabila_posts", JSON.stringify(posts));

    // Reset form
    this.resetForm();

    this.showAlert("Post created successfully!", "success");
    this.switchTab("feed");
    this.loadPosts();
  }

  resetForm() {
    document.getElementById("createPostForm").reset();
    this.uploadedMedia = [];
    document.getElementById("mediaPreviewContainer").innerHTML = "";

    // Reset character counters
    document.querySelectorAll(".char-count").forEach((counter) => {
      counter.textContent = counter.textContent.replace(/^\d+/, "0");
    });
  }

  saveDraft() {
    if (!this.currentUser) {
      this.showAlert("Please login to save drafts.", "error");
      return;
    }

    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();

    if (!title && !content) {
      this.showAlert("Nothing to save as draft.", "warning");
      return;
    }

    const draft = {
      id: "draft_" + Date.now(),
      title: title,
      content: content,
      category: document.getElementById("postCategory").value,
      tags: document.getElementById("postTags").value,
      media: [...this.uploadedMedia],
      userId: this.currentUser.id,
      savedAt: new Date().toISOString(),
    };

    const drafts = JSON.parse(localStorage.getItem("nabila_drafts") || "[]");
    drafts.unshift(draft);
    localStorage.setItem("nabila_drafts", JSON.stringify(drafts));

    this.showAlert("Draft saved successfully!", "success");
  }

  loadPosts() {
    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    this.displayPosts(posts);
  }

  filterPosts(filter) {
    const allPosts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    let filteredPosts = [];

    switch (filter) {
      case "all":
        filteredPosts = allPosts;
        break;
      case "my":
        filteredPosts = this.currentUser
          ? allPosts.filter((post) => post.author.id === this.currentUser.id)
          : [];
        break;
      case "popular":
        filteredPosts = allPosts
          .filter((post) => post.likes > 10)
          .sort((a, b) => b.likes - a.likes);
        break;
      case "trending":
        filteredPosts = allPosts
          .filter((post) => {
            const hours24Ago = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return new Date(post.created_at) > hours24Ago;
          })
          .sort((a, b) => b.likes + b.views - (a.likes + a.views));
        break;
      case "monetized":
        filteredPosts = allPosts.filter((post) => post.monetized);
        break;
      default:
        filteredPosts = allPosts;
    }

    this.displayPosts(filteredPosts);
  }

  displayPosts(posts) {
    const container = document.getElementById("postsContainer");
    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No posts found</h3>
                    <p>Be the first to create amazing content!</p>
                    <button class="btn primary" onclick="postsManager.switchTab('create')">Create Post</button>
                </div>
            `;
      return;
    }

    container.innerHTML = posts
      .map((post) => this.createPostCard(post))
      .join("");
  }

  createPostCard(post) {
    const mediaHtml =
      post.media && post.media.length > 0
        ? `
            <div class="post-media">
                ${post.media
                  .map((media) => {
                    if (media.type.startsWith("image/")) {
                      return `<img src="${media.url}" alt="${media.name}" onclick="postsManager.viewMedia('${media.url}', 'image')">`;
                    } else if (media.type.startsWith("video/")) {
                      return `<video src="${media.url}" controls poster="" onclick="postsManager.viewMedia('${media.url}', 'video')"></video>`;
                    }
                    return "";
                  })
                  .join("")}
            </div>
        `
        : "";

    const tagsHtml =
      post.tags && post.tags.length > 0
        ? `
            <div class="post-tags">
                ${post.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
            </div>
        `
        : "";

    const monetizedBadge = post.monetized
      ? '<span class="monetized-badge">💰 Monetized</span>'
      : "";

    return `
            <div class="post-card enhanced" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="author-info">
                        <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
                        <div class="author-details">
                            <h4>${post.author.name}</h4>
                            <span class="post-date">${new Date(post.created_at).toLocaleDateString("id-ID")}</span>
                        </div>
                    </div>
                    <div class="post-options">
                        ${monetizedBadge}
                        <button class="options-btn">⋯</button>
                    </div>
                </div>
                
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    ${mediaHtml}
                    ${tagsHtml}
                </div>
                
                <div class="post-stats">
                    <div class="stats-left">
                        <span class="stat-item">❤️ ${post.likes}</span>
                        <span class="stat-item">💬 ${post.comments.length}</span>
                        <span class="stat-item">👁️ ${post.views}</span>
                        <span class="stat-item">🔄 ${post.shares}</span>
                    </div>
                    ${post.monetized ? `<div class="earnings">💰 Rp ${post.earnings.toLocaleString()}</div>` : ""}
                </div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn" onclick="postsManager.likePost('${post.id}')">
                        ❤️ Like
                    </button>
                    <button class="action-btn comment-btn" onclick="postsManager.showComments('${post.id}')">
                        💬 Comment
                    </button>
                    <button class="action-btn share-btn" onclick="postsManager.sharePost('${post.id}')">
                        🔄 Share
                    </button>
                    ${
                      post.monetized
                        ? `
                        <button class="action-btn gift-btn" onclick="postsManager.sendGift('${post.id}')">
                            🎁 Send Gift
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  setActiveFilter(activeBtn) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    activeBtn.classList.add("active");
  }

  viewMedia(url, type) {
    // Create a modal to view media in full screen
    const modal = document.createElement("div");
    modal.className = "media-viewer-modal";
    modal.innerHTML = `
            <div class="media-viewer-content">
                <span class="close-viewer">&times;</span>
                ${
                  type === "image"
                    ? `<img src="${url}" style="max-width: 90vw; max-height: 90vh;">`
                    : `<video src="${url}" controls style="max-width: 90vw; max-height: 90vh;"></video>`
                }
            </div>
        `;

    document.body.appendChild(modal);

    // Close functionality
    modal.querySelector(".close-viewer").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  likePost(postId) {
    if (!this.currentUser) {
      this.showAlert("Please login to like posts.", "error");
      return;
    }

    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex !== -1) {
      posts[postIndex].likes += 1;
      localStorage.setItem("nabila_posts", JSON.stringify(posts));
      this.loadPosts();
    }
  }

  sharePost(postId) {
    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    const post = posts.find((p) => p.id === postId);

    if (post) {
      const shareUrl = `${window.location.origin}/posts.html?post=${postId}`;

      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + "...",
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
          this.showAlert("Post link copied to clipboard!", "success");
        });
      }

      // Increment share count
      post.shares += 1;
      localStorage.setItem("nabila_posts", JSON.stringify(posts));
      this.loadPosts();
    }
  }

  selectCampaignPackage(packageType, price) {
    if (!this.currentUser) {
      this.showAlert("Please login to purchase campaign boosts.", "error");
      return;
    }

    this.currentCampaign = {
      package: packageType,
      price: parseInt(price),
      user: this.currentUser,
    };

    // Show campaign modal
    const modal = document.getElementById("campaignModal");
    const summary = document.getElementById("campaignSummary");

    const packageDetails = {
      basic: {
        name: "🚀 Basic Boost",
        duration: "24 hours",
        impressions: "100+",
      },
      popular: {
        name: "⭐ Popular Boost",
        duration: "7 days",
        impressions: "1,000+",
      },
      premium: {
        name: "💎 Premium Boost",
        duration: "30 days",
        impressions: "10,000+",
      },
      ultimate: {
        name: "🏆 Ultimate Boost",
        duration: "90 days",
        impressions: "100,000+",
      },
    };

    const details = packageDetails[packageType];

    summary.innerHTML = `
            <div class="campaign-details">
                <h3>${details.name}</h3>
                <div class="detail-row">
                    <span>Duration:</span>
                    <span>${details.duration}</span>
                </div>
                <div class="detail-row">
                    <span>Impressions:</span>
                    <span>${details.impressions}</span>
                </div>
                <div class="detail-row total-row">
                    <span><strong>Total:</strong></span>
                    <span><strong>Rp ${price.toLocaleString()}</strong></span>
                </div>
            </div>
        `;

    modal.style.display = "block";
  }

  processCampaignPayment() {
    const orderRef = "CAMPAIGN_" + Date.now();
    const campaign = this.currentCampaign;

    let message = `📢 *CAMPAIGN BOOST - NABILA STREAM*\n\n`;
    message += `📋 *Order ID:* ${orderRef}\n`;
    message += `📦 *Package:* ${campaign.package}\n`;
    message += `💰 *Total:* Rp ${campaign.price.toLocaleString()}\n`;
    message += `👤 *Username:* ${campaign.user.name}\n`;
    message += `📧 *Email:* ${campaign.user.email}\n\n`;
    message += `💳 *Payment Method:* GoPay\n`;
    message += `📱 *GoPay Number:* 0895340205302\n\n`;
    message += `Saya sudah transfer ke GoPay admin. Mohon approve campaign boost saya. Terima kasih! 🙏`;

    const whatsappUrl = `https://wa.me/6285810526151?text=${encodeURIComponent(message)}`;

    // Save campaign order
    const campaigns = JSON.parse(
      localStorage.getItem("nabila_campaigns") || "[]",
    );
    campaigns.unshift({
      id: orderRef,
      ...campaign,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("nabila_campaigns", JSON.stringify(campaigns));

    // Close modal and redirect
    document.getElementById("campaignModal").style.display = "none";
    window.open(whatsappUrl, "_blank");

    this.showAlert(
      "Campaign order created! You will be redirected to WhatsApp.",
      "success",
    );
  }

  showCreatorProgramModal() {
    document.getElementById("creatorModal").style.display = "block";
  }

  submitCreatorApplication() {
    if (!this.currentUser) {
      this.showAlert("Please login to apply for creator program.", "error");
      return;
    }

    const name = document.getElementById("creatorName").value.trim();
    const category = document.getElementById("creatorCategory").value;
    const reason = document.getElementById("creatorReason").value.trim();
    const social = document.getElementById("creatorSocial").value.trim();

    if (!name || !category || !reason) {
      this.showAlert("Please fill in all required fields.", "error");
      return;
    }

    const application = {
      id: "creator_" + Date.now(),
      userId: this.currentUser.id,
      name: name,
      category: category,
      reason: reason,
      social: social,
      status: "pending",
      appliedAt: new Date().toISOString(),
    };

    const applications = JSON.parse(
      localStorage.getItem("nabila_creator_applications") || "[]",
    );
    applications.unshift(application);
    localStorage.setItem(
      "nabila_creator_applications",
      JSON.stringify(applications),
    );

    document.getElementById("creatorModal").style.display = "none";
    document.getElementById("creatorApplicationForm").reset();

    this.showAlert(
      "Creator program application submitted! We will review and contact you soon.",
      "success",
    );
  }

  loadMonetizationData() {
    if (!this.currentUser) return;

    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    const userPosts = posts.filter(
      (post) => post.author.id === this.currentUser.id,
    );

    const totalEarnings = userPosts.reduce(
      (sum, post) => sum + (post.earnings || 0),
      0,
    );
    const totalViews = userPosts.reduce(
      (sum, post) => sum + (post.views || 0),
      0,
    );
    const totalLikes = userPosts.reduce(
      (sum, post) => sum + (post.likes || 0),
      0,
    );

    document.getElementById("totalEarnings").textContent =
      `Rp ${totalEarnings.toLocaleString()}`;
    document.getElementById("totalViews").textContent =
      totalViews.toLocaleString();
    document.getElementById("totalLikes").textContent =
      totalLikes.toLocaleString();
  }

  loadAnalytics() {
    // Load analytics data and create charts
    this.createPerformanceChart();
    this.createAudienceChart();
    this.loadTopPosts();
  }

  createPerformanceChart() {
    // Simple chart implementation
    const canvas = document.getElementById("performanceChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // Draw a simple performance chart placeholder
    ctx.fillStyle = "#6a11cb";
    ctx.fillRect(50, 50, 200, 100);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Performance Chart", 100, 110);
  }

  createAudienceChart() {
    // Simple chart implementation
    const canvas = document.getElementById("audienceChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // Draw a simple audience chart placeholder
    ctx.fillStyle = "#2575fc";
    ctx.fillRect(50, 50, 200, 100);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Audience Chart", 100, 110);
  }

  loadTopPosts() {
    const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    const userPosts = this.currentUser
      ? posts.filter((post) => post.author.id === this.currentUser.id)
      : [];

    const topPosts = userPosts
      .sort((a, b) => b.likes + b.views - (a.likes + a.views))
      .slice(0, 5);

    const container = document.getElementById("topPostsList");
    if (!container) return;

    if (topPosts.length === 0) {
      container.innerHTML =
        "<p>No posts yet. Create your first post to see analytics!</p>";
      return;
    }

    container.innerHTML = topPosts
      .map(
        (post, index) => `
            <div class="top-post-item">
                <div class="post-rank">#${index + 1}</div>
                <div class="post-info">
                    <h5>${post.title}</h5>
                    <div class="post-metrics">
                        ❤️ ${post.likes} • 👁️ ${post.views} • 💰 Rp ${(post.earnings || 0).toLocaleString()}
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  showAlert(message, type = "info") {
    const alertElement = document.getElementById("postMessage");
    if (!alertElement) return;

    alertElement.textContent = message;
    alertElement.className = `alert ${type}`;
    alertElement.style.display = "block";

    setTimeout(() => {
      alertElement.style.display = "none";
    }, 5000);
  }
}

// Initialize posts manager
document.addEventListener("DOMContentLoaded", () => {
  window.postsManager = new EnhancedPostsManager();
});

// Add enhanced styles for posts
const postsStyles = document.createElement("style");
postsStyles.textContent = `
    .posts-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .posts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 20px;
    }

    .posts-actions {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }

    .posts-navigation {
        display: flex;
        background: var(--card-bg);
        border-radius: 15px;
        padding: 5px;
        margin-bottom: 30px;
        border: 2px solid var(--border-color);
        overflow-x: auto;
        gap: 5px;
    }

    .nav-tab {
        background: transparent;
        color: var(--text-dark);
        border: none;
        padding: 15px 20px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        white-space: nowrap;
        min-width: 120px;
    }

    .nav-tab:hover {
        background: var(--bg-dark);
        color: var(--text-light);
    }

    .nav-tab.active {
        background: var(--secondary-color);
        color: white;
        box-shadow: 0 3px 10px rgba(37, 117, 252, 0.3);
    }

    .posts-section {
        display: none;
    }

    .posts-section.active {
        display: block;
        animation: fadeIn 0.3s ease;
    }

    .create-post-enhanced {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 30px;
        margin-bottom: 30px;
    }

    .create-post-enhanced h3 {
        color: var(--text-light);
        margin-bottom: 25px;
        text-align: center;
        font-size: 1.8rem;
    }

    .form-group {
        margin-bottom: 25px;
    }

    .form-group label {
        display: block;
        color: var(--text-light);
        font-weight: bold;
        margin-bottom: 8px;
    }

    .required {
        color: #e74c3c;
    }

    .form-group input, .form-group textarea, .form-group select {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-dark);
        color: var(--text-light);
        font-family: inherit;
        font-size: 1rem;
    }

    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
        border-color: var(--secondary-color);
        outline: none;
        box-shadow: 0 0 10px rgba(37, 117, 252, 0.2);
    }

    .char-count {
        display: block;
        text-align: right;
        font-size: 0.8rem;
        color: var(--text-dark);
        margin-top: 5px;
    }

    .media-upload-enhanced {
        border: 2px dashed var(--border-color);
        border-radius: 15px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .upload-area {
        padding: 40px 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: var(--bg-dark);
    }

    .upload-area:hover, .upload-area.drag-over {
        border-color: var(--secondary-color);
        background: rgba(37, 117, 252, 0.1);
    }

    .upload-icon {
        font-size: 3rem;
        margin-bottom: 15px;
    }

    .upload-text {
        color: var(--text-light);
        font-weight: bold;
        margin-bottom: 5px;
    }

    .upload-hint {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .media-preview-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        padding: 20px;
        background: var(--card-bg);
    }

    .media-preview-item {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: var(--bg-dark);
        border: 1px solid var(--border-color);
    }

    .media-preview-item img, .media-preview-item video {
        width: 100%;
        height: 120px;
        object-fit: cover;
    }

    .media-info {
        padding: 10px;
    }

    .media-name {
        display: block;
        font-size: 0.8rem;
        color: var(--text-light);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 5px;
    }

    .media-size {
        font-size: 0.7rem;
        color: var(--text-dark);
    }

    .remove-media {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #e74c3c;
        color: white;
        border: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.9rem;
        line-height: 1;
        font-weight: bold;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-light);
        cursor: pointer;
        font-weight: normal;
    }

    .form-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        margin-top: 30px;
    }

    .posts-filter {
        display: flex;
        gap: 15px;
        margin-bottom: 25px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .filter-btn {
        background: var(--card-bg);
        color: var(--text-dark);
        border: 2px solid var(--border-color);
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .filter-btn:hover {
        background: var(--secondary-color);
        border-color: var(--secondary-color);
        color: white;
    }

    .filter-btn.active {
        background: var(--secondary-color);
        border-color: var(--secondary-color);
        color: white;
    }

    .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 25px;
    }

    .post-card.enhanced {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 25px;
        transition: all 0.3s ease;
    }

    .post-card.enhanced:hover {
        border-color: var(--secondary-color);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .post-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
    }

    .author-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .author-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
    }

    .author-details h4 {
        color: var(--text-light);
        margin: 0 0 5px 0;
    }

    .post-date {
        font-size: 0.9rem;
        color: var(--text-dark);
    }

    .monetized-badge {
        background: var(--accent-color);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
    }

    .post-content h3 {
        color: var(--text-light);
        margin-bottom: 15px;
        font-size: 1.4rem;
    }

    .post-content p {
        color: var(--text-dark);
        line-height: 1.6;
        margin-bottom: 20px;
    }

    .post-media {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .post-media img, .post-media video {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .post-media img:hover, .post-media video:hover {
        transform: scale(1.02);
    }

    .post-tags {
        margin-bottom: 20px;
    }

    .tag {
        background: var(--secondary-color);
        color: white;
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 0.8rem;
        margin-right: 8px;
        margin-bottom: 8px;
        display: inline-block;
    }

    .post-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 15px;
    }

    .stats-left {
        display: flex;
        gap: 20px;
    }

    .stat-item {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .earnings {
        color: var(--accent-color);
        font-weight: bold;
    }

    .post-actions {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }

    .action-btn {
        background: var(--bg-dark);
        color: var(--text-light);
        border: 1px solid var(--border-color);
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    .action-btn:hover {
        background: var(--secondary-color);
        border-color: var(--secondary-color);
        color: white;
    }

    .gift-btn {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: white;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-dark);
        grid-column: 1 / -1;
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 20px;
    }

    .empty-state h3 {
        color: var(--text-light);
        margin-bottom: 10px;
    }

    .empty-state p {
        margin-bottom: 25px;
    }

    /* Campaign Packages */
    .campaign-packages {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
        margin-top: 30px;
    }

    .package-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 25px;
        text-align: center;
        transition: all 0.3s ease;
    }

    .package-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-5px);
    }

    .package-card.popular {
        border-color: var(--accent-color);
        position: relative;
    }

    .package-card.popular::before {
        content: "MOST POPULAR";
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-color);
        color: white;
        padding: 5px 15px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
    }

    .package-header h4 {
        color: var(--text-light);
        margin-bottom: 15px;
        font-size: 1.4rem;
    }

    .package-price {
        font-size: 2rem;
        font-weight: bold;
        color: var(--secondary-color);
        margin-bottom: 20px;
    }

    .package-features {
        list-style: none;
        padding: 0;
        margin-bottom: 25px;
        text-align: left;
    }

    .package-features li {
        color: var(--text-dark);
        margin-bottom: 10px;
        padding-left: 25px;
        position: relative;
    }

    /* Monetization Stats */
    .monetization-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .monetization-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .option-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
        text-align: center;
    }

    .option-card h4 {
        color: var(--text-light);
        margin-bottom: 15px;
    }

    .option-card p {
        color: var(--text-dark);
        margin-bottom: 20px;
    }

    .withdrawal-section {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
    }

    .withdrawal-form {
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
    }

    .withdrawal-form input, .withdrawal-form select {
        padding: 10px 15px;
        border: 2px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-dark);
        color: var(--text-light);
    }

    /* Media Viewer */
    .media-viewer-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .media-viewer-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
    }

    .close-viewer {
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.5);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Analytics */
    .analytics-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
        margin-bottom: 30px;
    }

    .metric-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
        text-align: center;
    }

    .metric-card h4 {
        color: var(--text-light);
        margin-bottom: 20px;
    }

    .top-posts {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
    }

    .top-post-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: var(--bg-dark);
        border-radius: 10px;
        margin-bottom: 10px;
    }

    .post-rank {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--accent-color);
        min-width: 40px;
    }

    .post-info h5 {
        color: var(--text-light);
        margin-bottom: 5px;
    }

    .post-metrics {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        .posts-header {
            flex-direction: column;
            align-items: stretch;
        }

        .posts-actions {
            justify-content: center;
        }

        .posts-grid {
            grid-template-columns: 1fr;
        }

        .campaign-packages {
            grid-template-columns: 1fr;
        }

        .withdrawal-form {
            flex-direction: column;
            align-items: stretch;
        }

        .analytics-overview {
            grid-template-columns: 1fr;
        }

        .nav-tab {
            min-width: 100px;
            padding: 10px 15px;
        }
    }
`;
document.head.appendChild(postsStyles);
