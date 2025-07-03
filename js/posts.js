// Posts Management System
class PostsManager {
  constructor() {
    this.posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    this.currentFilter = "all";
    this.init();
  }

  init() {
    if (!document.getElementById("createPostForm")) return;

    console.log("Posts page loaded");
    this.loadPosts();
    this.setupEventListeners();

    // Check if user is logged in for posting
    const user = window.authSystem?.getCurrentUser();
    if (!user) {
      this.showGuestMessage();
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

    // Image upload preview
    const postImage = document.getElementById("postImage");
    if (postImage) {
      postImage.addEventListener("change", (e) => this.handleImagePreview(e));
    }

    // Remove image
    const removeImage = document.getElementById("removeImage");
    if (removeImage) {
      removeImage.addEventListener("click", () => this.removeImagePreview());
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e));
    });
  }

  showGuestMessage() {
    const postMessage = document.getElementById("postMessage");
    if (postMessage) {
      postMessage.textContent = "🔒 Login untuk membuat post dan upload konten";
      postMessage.className = "alert info";
      postMessage.style.display = "block";
    }

    // Disable form
    const form = document.getElementById("createPostForm");
    if (form) {
      const inputs = form.querySelectorAll("input, textarea, button");
      inputs.forEach((input) => (input.disabled = true));
    }
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

    try {
      // Handle image upload
      let imageData = null;
      if (imageFile) {
        imageData = await this.processImageFile(imageFile);
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
        image: imageData,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        likes: 0,
        comments: [],
        created_at: new Date().toISOString(),
        likedBy: [],
      };

      // Save post
      this.posts.unshift(newPost); // Add to beginning
      localStorage.setItem("nabila_posts", JSON.stringify(this.posts));

      this.showAlert("Post berhasil dibuat! 🎉", "success");
      this.clearForm();
      this.loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      this.showAlert("Gagal membuat post: " + error.message, "error");
    }
  }

  async processImageFile(file) {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        reject(new Error("File terlalu besar (maksimal 5MB)"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          data: e.target.result,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      };
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsDataURL(file);
    });
  }

  handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showAlert("File terlalu besar! Maksimal 5MB.", "error");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById("imagePreview");
      const img = document.getElementById("previewImg");

      img.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  removeImagePreview() {
    document.getElementById("postImage").value = "";
    document.getElementById("imagePreview").style.display = "none";
  }

  clearForm() {
    document.getElementById("createPostForm").reset();
    this.removeImagePreview();
  }

  handleFilter(e) {
    // Update active button
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
            '<p class="no-posts">Login untuk melihat post Anda</p>';
          return;
        }
        filteredPosts = filteredPosts.filter(
          (post) => post.author.id === currentUser.id,
        );
        break;
      case "popular":
        filteredPosts = filteredPosts.sort((a, b) => b.likes - a.likes);
        break;
      default: // 'all'
        filteredPosts = filteredPosts.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
    }

    if (filteredPosts.length === 0) {
      container.innerHTML =
        '<p class="no-posts">Belum ada post untuk ditampilkan. Buat post pertama Anda!</p>';
      return;
    }

    container.innerHTML = filteredPosts
      .map((post) => this.renderPost(post))
      .join("");

    // Add event listeners for post interactions
    this.setupPostInteractions();
  }

  renderPost(post) {
    const user = window.authSystem?.getCurrentUser();
    const isLiked = user && post.likedBy.includes(user.id);
    const isOwner = user && post.author.id === user.id;

    return `
            <article class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
                    <div class="author-info">
                        <h4>${post.author.name}</h4>
                        <small>${this.formatDate(post.created_at)}</small>
                    </div>
                    ${isOwner ? `<button class="delete-post-btn" data-post-id="${post.id}">🗑️</button>` : ""}
                </div>
                
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    
                    ${
                      post.image
                        ? `
                        <div class="post-image">
                            ${
                              post.image.type.startsWith("video/")
                                ? `<video controls style="max-width: 100%; border-radius: 8px;">
                                     <source src="${post.image.data}" type="${post.image.type}">
                                   </video>`
                                : `<img src="${post.image.data}" alt="Post image" style="max-width: 100%; border-radius: 8px;">`
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
                
                <div class="post-actions">
                    <button class="like-btn ${isLiked ? "liked" : ""}" data-post-id="${post.id}" ${!user ? "disabled" : ""}>
                        ❤️ ${post.likes}
                    </button>
                    <button class="comment-btn" data-post-id="${post.id}" ${!user ? "disabled" : ""}>
                        💬 ${post.comments.length}
                    </button>
                    <button class="share-btn" data-post-id="${post.id}">
                        📤 Share
                    </button>
                </div>
                
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list">
                        ${post.comments
                          .map(
                            (comment) => `
                            <div class="comment">
                                <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
                                <div class="comment-content">
                                    <strong>${comment.author.name}</strong>
                                    <p>${comment.content}</p>
                                    <small>${this.formatDate(comment.created_at)}</small>
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
                            <input type="text" placeholder="Tulis komentar..." required>
                            <button type="submit">Kirim</button>
                        </form>
                    `
                        : '<p class="login-prompt">Login untuk berkomentar</p>'
                    }
                </div>
            </article>
        `;
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
  }

  handleLike(e) {
    const user = window.authSystem?.getCurrentUser();
    if (!user) return;

    const postId = e.target.dataset.postId;
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const isLiked = post.likedBy.includes(user.id);

    if (isLiked) {
      post.likes--;
      post.likedBy = post.likedBy.filter((id) => id !== user.id);
    } else {
      post.likes++;
      post.likedBy.push(user.id);
    }

    localStorage.setItem("nabila_posts", JSON.stringify(this.posts));
    this.loadPosts();
  }

  toggleComments(e) {
    const postId = e.target.dataset.postId;
    const commentsSection = document.getElementById(`comments-${postId}`);

    if (commentsSection.style.display === "none") {
      commentsSection.style.display = "block";
    } else {
      commentsSection.style.display = "none";
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
        name: user.name,
        avatar: user.avatar,
      },
      created_at: new Date().toISOString(),
    };

    post.comments.push(newComment);
    localStorage.setItem("nabila_posts", JSON.stringify(this.posts));

    e.target.querySelector("input").value = "";
    this.loadPosts();
  }

  handleDeletePost(e) {
    if (!confirm("Apakah Anda yakin ingin menghapus post ini?")) return;

    const postId = e.target.dataset.postId;
    this.posts = this.posts.filter((p) => p.id !== postId);
    localStorage.setItem("nabila_posts", JSON.stringify(this.posts));
    this.loadPosts();
    this.showAlert("Post berhasil dihapus", "success");
  }

  handleShare(e) {
    const postId = e.target.dataset.postId;
    const post = this.posts.find((p) => p.id === postId);

    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/posts.html#${postId}`;
      navigator.clipboard.writeText(`${post.title} - ${url}`).then(() => {
        this.showAlert("Link post disalin ke clipboard!", "success");
      });
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;

    return date.toLocaleDateString("id-ID");
  }

  showAlert(message, type = "info") {
    const alertDiv = document.getElementById("postMessage");
    if (alertDiv) {
      alertDiv.textContent = message;
      alertDiv.className = `alert ${type}`;
      alertDiv.style.display = "block";

      setTimeout(() => {
        alertDiv.style.display = "none";
      }, 3000);
    }
  }
}

// Initialize posts manager
document.addEventListener("DOMContentLoaded", () => {
  window.postsManager = new PostsManager();
});
