// Enhanced Posts Management with Real File Upload
class EnhancedPostsManager {
  constructor() {
    this.posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    this.currentFilter = "all";
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];
    this.init();
  }

  init() {
    if (!document.getElementById("createPostForm")) return;

    console.log("Enhanced posts page loaded");
    this.setupUI();
    this.loadPosts();
    this.setupEventListeners();

    // Check authentication
    const user = window.authSystem?.getCurrentUser();
    if (!user) {
      this.showGuestMessage();
    }
  }

  setupUI() {
    // Add enhanced UI elements
    this.addUploadPreview();
    this.addProgressBar();
    this.addEmojiPicker();
  }

  addUploadPreview() {
    const imagePreview = document.getElementById("imagePreview");
    if (imagePreview) {
      imagePreview.innerHTML = `
                <div id="uploadPreviewContainer" class="upload-preview-container" style="display: none;">
                    <div class="preview-header">
                        <span class="preview-title">Preview</span>
                        <button type="button" id="removePreview" class="remove-btn">×</button>
                    </div>
                    <div id="previewContent" class="preview-content"></div>
                    <div class="preview-info">
                        <span id="fileInfo" class="file-info"></span>
                    </div>
                </div>
            `;
    }
  }

  addProgressBar() {
    const form = document.getElementById("createPostForm");
    if (form) {
      const progressBar = document.createElement("div");
      progressBar.id = "uploadProgress";
      progressBar.className = "upload-progress";
      progressBar.style.display = "none";
      progressBar.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">Uploading...</div>
            `;
      form.insertBefore(
        progressBar,
        form.querySelector('button[type="submit"]'),
      );
    }
  }

  addEmojiPicker() {
    const contentTextarea = document.getElementById("postContent");
    if (contentTextarea) {
      const emojiBtn = document.createElement("button");
      emojiBtn.type = "button";
      emojiBtn.className = "emoji-trigger";
      emojiBtn.innerHTML = "😀";
      emojiBtn.title = "Tambah Emoji";

      contentTextarea.parentNode.appendChild(emojiBtn);

      emojiBtn.addEventListener("click", () =>
        this.showEmojiPicker(contentTextarea),
      );
    }
  }

  setupEventListeners() {
    // Create post form
    const createPostForm = document.getElementById("createPostForm");
    if (createPostForm) {
      createPostForm.addEventListener("submit", (e) =>
        this.handleCreatePost(e),
      );
    }

    // Enhanced image upload
    const postImage = document.getElementById("postImage");
    if (postImage) {
      postImage.addEventListener("change", (e) => this.handleFileSelect(e));

      // Add drag and drop
      this.setupDragAndDrop(postImage);
    }

    // Remove preview
    document.addEventListener("click", (e) => {
      if (e.target.id === "removePreview") {
        this.removeFilePreview();
      }
    });

    // Filter buttons
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e));
    });

    // Auto-save draft
    this.setupAutoSave();
  }

  setupDragAndDrop(element) {
    const dropZone = element.parentNode;

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove("drag-over");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        element.files = files;
        this.handleFileSelect({ target: element });
      }
    });
  }

  setupAutoSave() {
    const titleInput = document.getElementById("postTitle");
    const contentInput = document.getElementById("postContent");

    if (titleInput && contentInput) {
      [titleInput, contentInput].forEach((input) => {
        input.addEventListener("input", () => {
          this.saveAsDraft();
        });
      });

      // Load draft on page load
      this.loadDraft();
    }
  }

  saveAsDraft() {
    const title = document.getElementById("postTitle")?.value || "";
    const content = document.getElementById("postContent")?.value || "";

    if (title || content) {
      localStorage.setItem(
        "nabila_post_draft",
        JSON.stringify({
          title,
          content,
          timestamp: Date.now(),
        }),
      );
    }
  }

  loadDraft() {
    const draft = localStorage.getItem("nabila_post_draft");
    if (draft) {
      try {
        const { title, content, timestamp } = JSON.parse(draft);

        // Only load if draft is less than 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          if (title) document.getElementById("postTitle").value = title;
          if (content) document.getElementById("postContent").value = content;

          this.showAlert("Draft dimuat! 📝", "info");
        }
      } catch (e) {
        localStorage.removeItem("nabila_post_draft");
      }
    }
  }

  clearDraft() {
    localStorage.removeItem("nabila_post_draft");
  }

  showGuestMessage() {
    const postMessage = document.getElementById("postMessage");
    if (postMessage) {
      postMessage.innerHTML = `
                <div class="guest-message">
                    🔒 <strong>Login untuk membuat post dan upload konten</strong><br>
                    <small>Bergabunglah dengan komunitas untuk berbagi konten menarik!</small>
                </div>
            `;
      postMessage.className = "alert info";
      postMessage.style.display = "block";
    }

    // Disable form
    const form = document.getElementById("createPostForm");
    if (form) {
      form.style.opacity = "0.5";
      form.style.pointerEvents = "none";
    }
  }

  async handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!this.validateFile(file)) {
      e.target.value = "";
      return;
    }

    // Show preview
    await this.showFilePreview(file);
  }

  validateFile(file) {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      this.showAlert(
        `Tipe file tidak didukung! Yang diizinkan: ${this.allowedTypes.join(", ")}`,
        "error",
      );
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.showAlert(
        `File terlalu besar! Maksimal ${this.maxFileSize / (1024 * 1024)}MB`,
        "error",
      );
      return false;
    }

    return true;
  }

  async showFilePreview(file) {
    const container = document.getElementById("uploadPreviewContainer");
    const content = document.getElementById("previewContent");
    const fileInfo = document.getElementById("fileInfo");

    if (!container || !content || !fileInfo) return;

    // Show loading
    content.innerHTML =
      '<div class="loading-preview">📤 Memproses file...</div>';
    container.style.display = "block";

    try {
      const fileData = await this.processFile(file);

      // Update file info
      fileInfo.textContent = `${file.name} (${this.formatFileSize(file.size)})`;

      // Show preview based on file type
      if (file.type.startsWith("image/")) {
        content.innerHTML = `
                    <img src="${fileData}" alt="Preview" class="image-preview">
                `;
      } else if (file.type.startsWith("video/")) {
        content.innerHTML = `
                    <video controls class="video-preview">
                        <source src="${fileData}" type="${file.type}">
                        Browser Anda tidak mendukung video.
                    </video>
                `;
      }
    } catch (error) {
      this.showAlert("Gagal memproses file: " + error.message, "error");
      this.removeFilePreview();
    }
  }

  processFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result);
      };

      reader.onerror = () => {
        reject(new Error("Gagal membaca file"));
      };

      reader.readAsDataURL(file);
    });
  }

  removeFilePreview() {
    const container = document.getElementById("uploadPreviewContainer");
    const fileInput = document.getElementById("postImage");

    if (container) container.style.display = "none";
    if (fileInput) fileInput.value = "";
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  showUploadProgress(percent) {
    const progressBar = document.getElementById("uploadProgress");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");

    if (progressBar) {
      progressBar.style.display = "block";
      if (progressFill) progressFill.style.width = percent + "%";
      if (progressText) progressText.textContent = `Uploading... ${percent}%`;
    }
  }

  hideUploadProgress() {
    const progressBar = document.getElementById("uploadProgress");
    if (progressBar) progressBar.style.display = "none";
  }

  async handleCreatePost(e) {
    e.preventDefault();

    const user = window.authSystem?.getCurrentUser();
    if (!user) {
      this.showAlert("Anda harus login untuk membuat post!", "error");
      return;
    }

    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const tags = document.getElementById("postTags").value.trim();
    const imageFile = document.getElementById("postImage").files[0];

    if (!title || !content) {
      this.showAlert("Judul dan konten harus diisi!", "error");
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      // Show loading
      submitBtn.innerHTML =
        '<span class="loading-spinner"></span> Memposting...';
      submitBtn.disabled = true;

      // Simulate upload progress
      if (imageFile) {
        for (let i = 0; i <= 100; i += 10) {
          this.showUploadProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Process image if exists
      let mediaData = null;
      if (imageFile) {
        mediaData = await this.processFile(imageFile);
      }

      // Create post
      const newPost = {
        id: Date.now().toString(),
        title,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        media: mediaData
          ? {
              type: imageFile.type,
              data: mediaData,
              name: imageFile.name,
              size: imageFile.size,
            }
          : null,
        author: {
          id: user.id,
          name: user.displayName || user.name,
          email: user.email,
          avatar: user.avatar,
        },
        likes: 0,
        comments: [],
        shares: 0,
        views: 0,
        created_at: new Date().toISOString(),
        likedBy: [],
        sharedBy: [],
      };

      // Save post
      this.posts.unshift(newPost);
      localStorage.setItem("nabila_posts", JSON.stringify(this.posts));

      // Update user stats
      user.totalPosts = (user.totalPosts || 0) + 1;
      window.authSystem.updateProfile({ totalPosts: user.totalPosts });

      this.showAlert("Post berhasil dibuat! 🎉", "success");
      this.clearForm();
      this.clearDraft();
      this.loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      this.showAlert("Gagal membuat post: " + error.message, "error");
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      this.hideUploadProgress();
    }
  }

  clearForm() {
    document.getElementById("createPostForm").reset();
    this.removeFilePreview();
  }

  handleFilter(e) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    this.currentFilter = e.target.dataset.filter;
    this.loadPosts();
  }

  loadPosts() {
    const container = document.getElementById("postsContainer");
    if (!container) return;

    let filteredPosts = [...this.posts];
    const currentUser = window.authSystem?.getCurrentUser();

    // Apply filters
    switch (this.currentFilter) {
      case "my":
        if (!currentUser) {
          container.innerHTML =
            '<div class="no-posts">Login untuk melihat post Anda</div>';
          return;
        }
        filteredPosts = filteredPosts.filter(
          (post) => post.author.id === currentUser.id,
        );
        break;
      case "popular":
        filteredPosts = filteredPosts.sort(
          (a, b) =>
            b.likes + b.shares + b.views - (a.likes + a.shares + a.views),
        );
        break;
      default:
        filteredPosts = filteredPosts.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
    }

    if (filteredPosts.length === 0) {
      container.innerHTML = `
                <div class="no-posts">
                    <div class="no-posts-content">
                        <h3>📝 Belum ada post</h3>
                        <p>Jadilah yang pertama membuat post menarik!</p>
                        <button onclick="document.getElementById('postTitle').focus()" class="btn">Buat Post Sekarang</button>
                    </div>
                </div>
            `;
      return;
    }

    container.innerHTML = filteredPosts
      .map((post) => this.renderPost(post))
      .join("");
    this.setupPostInteractions();
  }

  renderPost(post) {
    const user = window.authSystem?.getCurrentUser();
    const isLiked = user && post.likedBy.includes(user.id);
    const isShared = user && post.sharedBy.includes(user.id);
    const isOwner = user && post.author.id === user.id;

    return `
            <article class="post-card enhanced" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar" loading="lazy">
                    <div class="author-info">
                        <h4>${post.author.name}</h4>
                        <small>${this.formatDate(post.created_at)}</small>
                    </div>
                    <div class="post-menu">
                        ${isOwner ? `<button class="menu-btn delete-post-btn" data-post-id="${post.id}" title="Hapus Post">🗑️</button>` : ""}
                        <button class="menu-btn share-btn" data-post-id="${post.id}" title="Share Post">📤</button>
                    </div>
                </div>
                
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p class="post-text">${this.formatPostContent(post.content)}</p>
                    
                    ${
                      post.media
                        ? `
                        <div class="post-media">
                            ${
                              post.media.type.startsWith("image/")
                                ? `<img src="${post.media.data}" alt="Post media" class="post-image" loading="lazy" onclick="openMediaModal('${post.media.data}', 'image')">`
                                : `<video controls class="post-video" onclick="openMediaModal('${post.media.data}', 'video')">
                                     <source src="${post.media.data}" type="${post.media.type}">
                                   </video>`
                            }
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      post.tags.length > 0
                        ? `
                        <div class="post-tags">
                            ${post.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
                
                <div class="post-stats">
                    <span class="stat">${post.views} views</span>
                    <span class="stat">${post.likes} likes</span>
                    <span class="stat">${post.comments.length} comments</span>
                    <span class="stat">${post.shares} shares</span>
                </div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn ${isLiked ? "liked" : ""}" data-post-id="${post.id}" ${!user ? "disabled" : ""}>
                        <span class="action-icon">${isLiked ? "❤️" : "🤍"}</span>
                        <span class="action-text">Like</span>
                    </button>
                    <button class="action-btn comment-btn" data-post-id="${post.id}" ${!user ? "disabled" : ""}>
                        <span class="action-icon">💬</span>
                        <span class="action-text">Comment</span>
                    </button>
                    <button class="action-btn share-btn ${isShared ? "shared" : ""}" data-post-id="${post.id}">
                        <span class="action-icon">📤</span>
                        <span class="action-text">Share</span>
                    </button>
                </div>
                
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list">
                        ${post.comments
                          .map(
                            (comment) => `
                            <div class="comment">
                                <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar" loading="lazy">
                                <div class="comment-content">
                                    <div class="comment-header">
                                        <strong>${comment.author.name}</strong>
                                        <small>${this.formatDate(comment.created_at)}</small>
                                    </div>
                                    <p>${this.formatPostContent(comment.content)}</p>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    ${
                      user
                        ? `
                        <form class="comment-form" data-post-id="${post.id}">
                            <img src="${user.avatar}" alt="${user.name}" class="comment-avatar">
                            <div class="comment-input-wrapper">
                                <input type="text" placeholder="Tulis komentar..." required>
                                <button type="submit" class="comment-submit">Kirim</button>
                            </div>
                        </form>
                    `
                        : '<p class="login-prompt">Login untuk berkomentar</p>'
                    }
                </div>
            </article>
        `;
  }

  formatPostContent(content) {
    // Enhanced text formatting
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Bold
    content = content.replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italic
    content = content.replace(/`(.*?)`/g, "<code>$1</code>"); // Code
    content = content.replace(/\n/g, "<br>"); // Line breaks

    // Auto-link URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(
      urlRegex,
      '<a href="$1" target="_blank" rel="noopener">$1</a>',
    );

    // Auto-link hashtags
    content = content.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');

    return content;
  }

  showEmojiPicker(targetElement) {
    const emojis = [
      "😀",
      "😂",
      "❤️",
      "👍",
      "👎",
      "🔥",
      "💯",
      "🎉",
      "👏",
      "🙏",
      "🤔",
      "😭",
      "😍",
      "🤗",
      "😎",
      "🚀",
      "⭐",
      "🌟",
      "💫",
      "✨",
    ];

    // Remove existing picker
    const existingPicker = document.getElementById("emojiPicker");
    if (existingPicker) {
      existingPicker.remove();
      return;
    }

    const picker = document.createElement("div");
    picker.id = "emojiPicker";
    picker.className = "emoji-picker";
    picker.innerHTML = emojis
      .map(
        (emoji) =>
          `<button type="button" class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`,
      )
      .join("");

    targetElement.parentNode.appendChild(picker);

    // Position picker
    const rect = targetElement.getBoundingClientRect();
    picker.style.position = "absolute";
    picker.style.top = rect.bottom + 5 + "px";
    picker.style.left = rect.left + "px";
    picker.style.zIndex = "1000";

    // Add emoji to text
    picker.addEventListener("click", (e) => {
      if (e.target.classList.contains("emoji-btn")) {
        const emoji = e.target.dataset.emoji;
        const cursorPos = targetElement.selectionStart;
        const text = targetElement.value;
        targetElement.value =
          text.substring(0, cursorPos) + emoji + text.substring(cursorPos);
        picker.remove();
        targetElement.focus();
      }
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", function closeEmoji(e) {
        if (
          !picker.contains(e.target) &&
          e.target !== targetElement.nextElementSibling
        ) {
          picker.remove();
          document.removeEventListener("click", closeEmoji);
        }
      });
    }, 100);
  }

  setupPostInteractions() {
    // Like buttons
    document.querySelectorAll(".like-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleLike(e));
    });

    // Comment buttons
    document.querySelectorAll(".comment-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.toggleComments(e));
    });

    // Comment forms
    document.querySelectorAll(".comment-form").forEach((form) => {
      form.addEventListener("submit", (e) => this.handleComment(e));
    });

    // Delete buttons
    document.querySelectorAll(".delete-post-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleDeletePost(e));
    });

    // Share buttons
    document.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleShare(e));
    });

    // Update view counts
    this.updateViewCounts();
  }

  // Continue with rest of the interaction methods...
  handleLike(e) {
    const user = window.authSystem?.getCurrentUser();
    if (!user) {
      this.showAlert("Login untuk like post!", "error");
      return;
    }

    const postId = e.currentTarget.dataset.postId;
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const isLiked = post.likedBy.includes(user.id);

    if (isLiked) {
      post.likes--;
      post.likedBy = post.likedBy.filter((id) => id !== user.id);
      e.currentTarget.classList.remove("liked");
      e.currentTarget.querySelector(".action-icon").textContent = "🤍";
    } else {
      post.likes++;
      post.likedBy.push(user.id);
      e.currentTarget.classList.add("liked");
      e.currentTarget.querySelector(".action-icon").textContent = "❤️";
    }

    localStorage.setItem("nabila_posts", JSON.stringify(this.posts));
    this.updatePostStats(postId);

    // Show animation
    this.showLikeAnimation(e.currentTarget);
  }

  showLikeAnimation(button) {
    button.style.transform = "scale(1.2)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 200);
  }

  toggleComments(e) {
    const postId = e.currentTarget.dataset.postId;
    const commentsSection = document.getElementById(`comments-${postId}`);

    if (commentsSection.style.display === "none") {
      commentsSection.style.display = "block";
      e.currentTarget.classList.add("active");
    } else {
      commentsSection.style.display = "none";
      e.currentTarget.classList.remove("active");
    }
  }

  handleComment(e) {
    e.preventDefault();

    const user = window.authSystem?.getCurrentUser();
    if (!user) return;

    const postId = e.target.dataset.postId;
    const content = e.target.querySelector("input").value.trim();

    if (!content) return;

    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const newComment = {
      id: Date.now().toString(),
      content,
      author: {
        id: user.id,
        name: user.displayName || user.name,
        avatar: user.avatar,
      },
      created_at: new Date().toISOString(),
    };

    post.comments.push(newComment);
    localStorage.setItem("nabila_posts", JSON.stringify(this.posts));

    e.target.querySelector("input").value = "";
    this.loadPosts();

    // Show comments section after adding comment
    setTimeout(() => {
      const commentsSection = document.getElementById(`comments-${postId}`);
      if (commentsSection) {
        commentsSection.style.display = "block";
      }
    }, 100);
  }

  handleDeletePost(e) {
    if (!confirm("Apakah Anda yakin ingin menghapus post ini?")) return;

    const postId = e.target.dataset.postId;
    this.posts = this.posts.filter((p) => p.id !== postId);
    localStorage.setItem("nabila_posts", JSON.stringify(this.posts));

    // Update user stats
    const user = window.authSystem?.getCurrentUser();
    if (user) {
      user.totalPosts = Math.max(0, (user.totalPosts || 0) - 1);
      window.authSystem.updateProfile({ totalPosts: user.totalPosts });
    }

    this.loadPosts();
    this.showAlert("Post berhasil dihapus", "success");
  }

  handleShare(e) {
    const postId = e.currentTarget.dataset.postId;
    const post = this.posts.find((p) => p.id === postId);

    if (!post) return;

    const user = window.authSystem?.getCurrentUser();
    if (user && !post.sharedBy.includes(user.id)) {
      post.shares++;
      post.sharedBy.push(user.id);
      localStorage.setItem("nabila_posts", JSON.stringify(this.posts));
      this.updatePostStats(postId);
    }

    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      });
    } else {
      const url = `${window.location.origin}/posts.html#${postId}`;
      navigator.clipboard.writeText(`${post.title} - ${url}`).then(() => {
        this.showAlert("Link post disalin ke clipboard!", "success");
      });
    }
  }

  updatePostStats(postId) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;

    const stats = postElement.querySelector(".post-stats");
    if (stats) {
      stats.innerHTML = `
                <span class="stat">${post.views} views</span>
                <span class="stat">${post.likes} likes</span>
                <span class="stat">${post.comments.length} comments</span>
                <span class="stat">${post.shares} shares</span>
            `;
    }
  }

  updateViewCounts() {
    // Simulate view counting
    this.posts.forEach((post) => {
      post.views = (post.views || 0) + Math.floor(Math.random() * 3);
    });
    localStorage.setItem("nabila_posts", JSON.stringify(this.posts));
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}j`;
    if (days < 7) return `${days}h`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  showAlert(message, type = "info") {
    window.authSystem?.showAlert(message, type);
  }
}

// Media modal functions
window.openMediaModal = function (src, type) {
  const modal = document.createElement("div");
  modal.className = "media-modal";
  modal.innerHTML = `
        <div class="modal-overlay" onclick="closeMediaModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="closeMediaModal()">×</button>
                ${
                  type === "image"
                    ? `<img src="${src}" alt="Full size image">`
                    : `<video controls autoplay><source src="${src}"></video>`
                }
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
};

window.closeMediaModal = function () {
  const modal = document.querySelector(".media-modal");
  if (modal) {
    document.body.removeChild(modal);
    document.body.style.overflow = "auto";
  }
};

// Initialize posts manager
document.addEventListener("DOMContentLoaded", () => {
  window.postsManager = new EnhancedPostsManager();
});
