// Enhanced Profile Management System
class EnhancedProfileManager {
  constructor() {
    this.currentUser = null;
    this.currentTab = "posts";
    this.userPosts = [];
    this.userGallery = [];
    this.userVideos = [];
    this.userStreams = [];
    this.init();
  }

  init() {
    this.checkAuthStatus();
    this.setupEventListeners();
    this.loadProfileData();
    this.setupTabNavigation();
  }

  checkAuthStatus() {
    const userData = localStorage.getItem("nabila_user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.loadUserProfile();
    } else {
      window.location.href = "Auth.html";
    }
  }

  setupEventListeners() {
    // Profile editing
    document
      .getElementById("editProfileBtn")
      ?.addEventListener("click", () => this.showEditProfileModal());
    document
      .getElementById("editAvatarBtn")
      ?.addEventListener("click", () => this.editAvatar());
    document
      .getElementById("editCoverBtn")
      ?.addEventListener("click", () => this.editCover());

    // Post creation
    document
      .getElementById("createPostBtn")
      ?.addEventListener("click", () => this.showCreatePostModal());
    document
      .getElementById("newPostBtn")
      ?.addEventListener("click", () => this.showCreatePostModal());

    // Media uploads
    document
      .getElementById("uploadPhotoBtn")
      ?.addEventListener("click", () => this.showUploadPhotoModal());
    document
      .getElementById("uploadVideoBtn")
      ?.addEventListener("click", () => this.showUploadVideoModal());

    // Share profile
    document
      .getElementById("shareProfileBtn")
      ?.addEventListener("click", () => this.shareProfile());

    // Modal event listeners
    this.setupModalEventListeners();

    // Form submissions
    this.setupFormSubmissions();

    // File upload handling
    this.setupFileUploads();
  }

  setupModalEventListeners() {
    // Close modals
    document.querySelectorAll(".modal .close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none";
      });
    });

    // Cancel buttons
    document
      .getElementById("cancelEditProfile")
      ?.addEventListener("click", () => {
        document.getElementById("editProfileModal").style.display = "none";
      });

    document
      .getElementById("cancelCreatePost")
      ?.addEventListener("click", () => {
        document.getElementById("createPostModal").style.display = "none";
      });

    document
      .getElementById("cancelPhotoUpload")
      ?.addEventListener("click", () => {
        document.getElementById("uploadPhotoModal").style.display = "none";
      });

    document
      .getElementById("cancelVideoUpload")
      ?.addEventListener("click", () => {
        document.getElementById("uploadVideoModal").style.display = "none";
      });

    // Click outside to close
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  setupFormSubmissions() {
    // Edit profile form
    document
      .getElementById("editProfileForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveProfileChanges();
      });

    // Create post form
    document
      .getElementById("createPostForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.createNewPost();
      });

    // Upload video form
    document
      .getElementById("uploadVideoForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.uploadVideo();
      });

    // Character counters
    this.setupCharacterCounters();
  }

  setupCharacterCounters() {
    const textareas = [
      { id: "editBio", max: 160 },
      { id: "postContent", max: 1000 },
    ];

    textareas.forEach(({ id, max }) => {
      const textarea = document.getElementById(id);
      if (textarea) {
        textarea.addEventListener("input", () => {
          const count = textarea.value.length;
          const counter = textarea.parentNode.querySelector(".char-count");
          if (counter) {
            counter.textContent = `${count}/${max} characters`;
            counter.style.color =
              count > max * 0.9 ? "#e74c3c" : "var(--text-dark)";
          }
        });
      }
    });
  }

  setupFileUploads() {
    // Post media upload
    const postMedia = document.getElementById("postMedia");
    const postUploadArea = document.getElementById("postUploadArea");

    if (postUploadArea) {
      postUploadArea.addEventListener("click", () => postMedia?.click());
      postUploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        postUploadArea.classList.add("drag-over");
      });
      postUploadArea.addEventListener("dragleave", () => {
        postUploadArea.classList.remove("drag-over");
      });
      postUploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        postUploadArea.classList.remove("drag-over");
        this.handleFileUpload(e.dataTransfer.files, "post");
      });
    }

    if (postMedia) {
      postMedia.addEventListener("change", (e) => {
        this.handleFileUpload(e.target.files, "post");
      });
    }

    // Gallery photo upload
    const galleryPhotos = document.getElementById("galleryPhotos");
    const photoUploadArea = document.getElementById("photoUploadArea");

    if (photoUploadArea) {
      photoUploadArea.addEventListener("click", () => galleryPhotos?.click());
    }

    if (galleryPhotos) {
      galleryPhotos.addEventListener("change", (e) => {
        this.handleFileUpload(e.target.files, "gallery");
      });
    }

    // Video upload
    const videoFile = document.getElementById("videoFile");
    const videoUploadArea = document.getElementById("videoUploadArea");

    if (videoUploadArea) {
      videoUploadArea.addEventListener("click", () => videoFile?.click());
    }

    if (videoFile) {
      videoFile.addEventListener("change", (e) => {
        this.handleFileUpload(e.target.files, "video");
      });
    }

    // Confirm upload buttons
    document
      .getElementById("confirmPhotoUpload")
      ?.addEventListener("click", () => {
        this.confirmPhotoUpload();
      });
  }

  setupTabNavigation() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Update sections
    document.querySelectorAll(".profile-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${tabName}-tab`).classList.add("active");

    this.currentTab = tabName;
    this.loadTabContent(tabName);
  }

  loadTabContent(tabName) {
    switch (tabName) {
      case "posts":
        this.loadUserPosts();
        break;
      case "gallery":
        this.loadUserGallery();
        break;
      case "videos":
        this.loadUserVideos();
        break;
      case "streams":
        this.loadUserStreams();
        break;
      case "about":
        this.loadAboutInfo();
        break;
    }
  }

  loadUserProfile() {
    if (!this.currentUser) return;

    // Update profile header
    document.getElementById("profileName").textContent = this.currentUser.name;
    document.getElementById("profileAvatar").src = this.currentUser.avatar;

    // Load user data
    const userData = this.getUserData();

    document.getElementById("profileBio").textContent =
      userData.bio || "No bio yet. Click Edit Profile to add one!";

    // Update cover photo
    const coverPhoto = document.getElementById("profileCover");
    if (coverPhoto) {
      coverPhoto.src =
        userData.coverPhoto ||
        "https://via.placeholder.com/1200x300/6a11cb/ffffff?text=Cover+Photo";
    }

    // Update stats
    this.updateProfileStats();
  }

  updateProfileStats() {
    const userData = this.getUserData();

    document.getElementById("profilePostsCount").textContent = (
      userData.posts || []
    ).length;
    document.getElementById("profileFollowersCount").textContent =
      userData.followers || 0;
    document.getElementById("profileFollowingCount").textContent =
      userData.following || 0;
    document.getElementById("profileStreamsCount").textContent = (
      userData.streams || []
    ).length;
  }

  getUserData() {
    const allUserData = JSON.parse(
      localStorage.getItem("nabila_user_data") || "{}",
    );
    return allUserData[this.currentUser.id] || {};
  }

  saveUserData(data) {
    const allUserData = JSON.parse(
      localStorage.getItem("nabila_user_data") || "{}",
    );
    allUserData[this.currentUser.id] = {
      ...allUserData[this.currentUser.id],
      ...data,
    };
    localStorage.setItem("nabila_user_data", JSON.stringify(allUserData));
  }

  loadProfileData() {
    this.loadTabContent(this.currentTab);
  }

  showEditProfileModal() {
    const userData = this.getUserData();

    // Populate form with current data
    document.getElementById("editName").value = this.currentUser.name;
    document.getElementById("editBio").value = userData.bio || "";
    document.getElementById("editPhone").value = userData.phone || "";
    document.getElementById("editWebsite").value = userData.website || "";
    document.getElementById("editLocation").value = userData.location || "";

    // Set interests
    const interests = userData.interests || [];
    document
      .querySelectorAll('.interests-selector input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = interests.includes(checkbox.value);
      });

    document.getElementById("editProfileModal").style.display = "block";
  }

  saveProfileChanges() {
    const formData = {
      name: document.getElementById("editName").value,
      bio: document.getElementById("editBio").value,
      phone: document.getElementById("editPhone").value,
      website: document.getElementById("editWebsite").value,
      location: document.getElementById("editLocation").value,
      interests: Array.from(
        document.querySelectorAll(".interests-selector input:checked"),
      ).map((cb) => cb.value),
    };

    // Update current user
    this.currentUser.name = formData.name;
    localStorage.setItem("nabila_user", JSON.stringify(this.currentUser));

    // Update user data
    this.saveUserData(formData);

    // Update UI
    this.loadUserProfile();

    document.getElementById("editProfileModal").style.display = "none";
    this.showNotification("Profile updated successfully!", "success");
  }

  editAvatar() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.uploadProfileImage(file, "avatar");
      }
    });
    input.click();
  }

  editCover() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.uploadProfileImage(file, "cover");
      }
    });
    input.click();
  }

  uploadProfileImage(file, type) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;

      if (type === "avatar") {
        this.currentUser.avatar = imageUrl;
        localStorage.setItem("nabila_user", JSON.stringify(this.currentUser));
        document.getElementById("profileAvatar").src = imageUrl;

        // Update nav avatar if exists
        const navAvatar = document.getElementById("userAvatar");
        if (navAvatar) navAvatar.src = imageUrl;
      } else if (type === "cover") {
        this.saveUserData({ coverPhoto: imageUrl });
        document.getElementById("profileCover").src = imageUrl;
      }

      this.showNotification(
        `${type === "avatar" ? "Profile photo" : "Cover photo"} updated!`,
        "success",
      );
    };
    reader.readAsDataURL(file);
  }

  showCreatePostModal() {
    document.getElementById("createPostModal").style.display = "block";
  }

  createNewPost() {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;
    const tags = document
      .getElementById("postTags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const post = {
      id: "post_" + Date.now(),
      title: title,
      content: content,
      tags: tags,
      author: {
        id: this.currentUser.id,
        name: this.currentUser.name,
        avatar: this.currentUser.avatar,
      },
      created_at: new Date().toISOString(),
      likes: 0,
      comments: [],
      media: this.getSelectedMedia("post"),
    };

    // Save to user posts
    const userData = this.getUserData();
    userData.posts = userData.posts || [];
    userData.posts.unshift(post);
    this.saveUserData(userData);

    // Save to global posts
    const allPosts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
    allPosts.unshift(post);
    localStorage.setItem("nabila_posts", JSON.stringify(allPosts));

    // Reset form and close modal
    document.getElementById("createPostForm").reset();
    document.getElementById("postMediaPreview").innerHTML = "";
    document.getElementById("createPostModal").style.display = "none";

    // Reload posts
    this.loadUserPosts();
    this.updateProfileStats();

    this.showNotification("Post created successfully!", "success");
  }

  showUploadPhotoModal() {
    document.getElementById("uploadPhotoModal").style.display = "block";
  }

  confirmPhotoUpload() {
    const photos = this.getSelectedMedia("gallery");

    if (photos.length === 0) {
      this.showNotification("Please select photos to upload", "error");
      return;
    }

    const userData = this.getUserData();
    userData.gallery = userData.gallery || [];

    photos.forEach((photo) => {
      userData.gallery.unshift({
        id: "photo_" + Date.now() + "_" + Math.random(),
        url: photo.url,
        type: photo.type,
        name: photo.name,
        uploadedAt: new Date().toISOString(),
      });
    });

    this.saveUserData(userData);

    document.getElementById("uploadPhotoModal").style.display = "none";
    document.getElementById("photosPreview").innerHTML = "";
    document.getElementById("galleryPhotos").value = "";

    this.loadUserGallery();
    this.showNotification(
      `${photos.length} photo(s) uploaded successfully!`,
      "success",
    );
  }

  showUploadVideoModal() {
    document.getElementById("uploadVideoModal").style.display = "block";
  }

  uploadVideo() {
    const title = document.getElementById("videoTitle").value;
    const description = document.getElementById("videoDescription").value;
    const videoFiles = this.getSelectedMedia("video");

    if (videoFiles.length === 0) {
      this.showNotification("Please select a video file", "error");
      return;
    }

    const video = {
      id: "video_" + Date.now(),
      title: title,
      description: description,
      url: videoFiles[0].url,
      thumbnail: this.getVideoThumbnail(),
      uploadedAt: new Date().toISOString(),
      views: 0,
      duration: "00:00", // Would be calculated in real implementation
    };

    const userData = this.getUserData();
    userData.videos = userData.videos || [];
    userData.videos.unshift(video);
    this.saveUserData(userData);

    document.getElementById("uploadVideoForm").reset();
    document.getElementById("videoPreview").innerHTML = "";
    document.getElementById("thumbnailPreview").innerHTML = "";
    document.getElementById("uploadVideoModal").style.display = "none";

    this.loadUserVideos();
    this.showNotification("Video uploaded successfully!", "success");
  }

  getVideoThumbnail() {
    const thumbnailInput = document.getElementById("videoThumbnail");
    if (thumbnailInput.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(thumbnailInput.files[0]);
      return reader.result;
    }
    return "https://via.placeholder.com/320x180/333/fff?text=Video";
  }

  handleFileUpload(files, type) {
    Array.from(files).forEach((file) => {
      if (this.validateFile(file, type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.displayFilePreview(e.target.result, file, type);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  validateFile(file, type) {
    const maxSizes = {
      post: 10 * 1024 * 1024, // 10MB
      gallery: 5 * 1024 * 1024, // 5MB
      video: 100 * 1024 * 1024, // 100MB
    };

    if (file.size > maxSizes[type]) {
      this.showNotification(
        `File too large. Maximum size: ${maxSizes[type] / (1024 * 1024)}MB`,
        "error",
      );
      return false;
    }

    const allowedTypes = {
      post: ["image", "video"],
      gallery: ["image"],
      video: ["video"],
    };

    const fileType = file.type.split("/")[0];
    if (!allowedTypes[type].includes(fileType)) {
      this.showNotification("Invalid file type", "error");
      return false;
    }

    return true;
  }

  displayFilePreview(dataUrl, file, type) {
    const previewContainers = {
      post: "postMediaPreview",
      gallery: "photosPreview",
      video: "videoPreview",
    };

    const container = document.getElementById(previewContainers[type]);
    if (!container) return;

    const fileElement = document.createElement("div");
    fileElement.className = "file-preview";
    fileElement.dataset.fileData = JSON.stringify({
      url: dataUrl,
      type: file.type,
      name: file.name,
    });

    if (file.type.startsWith("image/")) {
      fileElement.innerHTML = `
                <img src="${dataUrl}" alt="Preview">
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
    } else if (file.type.startsWith("video/")) {
      fileElement.innerHTML = `
                <video src="${dataUrl}" controls></video>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
    }

    container.appendChild(fileElement);
  }

  getSelectedMedia(type) {
    const previewContainers = {
      post: "postMediaPreview",
      gallery: "photosPreview",
      video: "videoPreview",
    };

    const container = document.getElementById(previewContainers[type]);
    if (!container) return [];

    return Array.from(container.querySelectorAll(".file-preview")).map(
      (element) => {
        return JSON.parse(element.dataset.fileData);
      },
    );
  }

  loadUserPosts() {
    const userData = this.getUserData();
    const posts = userData.posts || [];
    const container = document.getElementById("userPostsContainer");

    if (posts.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No posts yet</h3>
                    <p>Share your thoughts with the community!</p>
                    <button class="btn primary" onclick="profileManager.showCreatePostModal()">Create First Post</button>
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
                  .map((media) =>
                    media.type.startsWith("image/")
                      ? `<img src="${media.url}" alt="${media.name}" onclick="profileManager.viewMedia('${media.url}', 'image')">`
                      : `<video src="${media.url}" controls onclick="profileManager.viewMedia('${media.url}', 'video')"></video>`,
                  )
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

    return `
            <div class="post-card">
                <div class="post-header">
                    <h3>${post.title}</h3>
                    <span class="post-date">${new Date(post.created_at).toLocaleDateString("id-ID")}</span>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${mediaHtml}
                    ${tagsHtml}
                </div>
                <div class="post-stats">
                    <span>❤️ ${post.likes}</span>
                    <span>💬 ${post.comments.length}</span>
                </div>
            </div>
        `;
  }

  loadUserGallery() {
    const userData = this.getUserData();
    const gallery = userData.gallery || [];
    const container = document.getElementById("userGalleryContainer");

    if (gallery.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🖼️</div>
                    <h3>No photos yet</h3>
                    <p>Start building your photo gallery!</p>
                    <button class="btn primary" onclick="profileManager.showUploadPhotoModal()">Upload Photos</button>
                </div>
            `;
      return;
    }

    container.innerHTML = gallery
      .map(
        (photo) => `
            <div class="gallery-item" onclick="profileManager.viewMedia('${photo.url}', 'image')">
                <img src="${photo.url}" alt="${photo.name}">
                <div class="gallery-overlay">
                    <span class="view-icon">👁️</span>
                </div>
            </div>
        `,
      )
      .join("");
  }

  loadUserVideos() {
    const userData = this.getUserData();
    const videos = userData.videos || [];
    const container = document.getElementById("userVideosContainer");

    if (videos.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎥</div>
                    <h3>No videos yet</h3>
                    <p>Share your video content with the world!</p>
                    <button class="btn primary" onclick="profileManager.showUploadVideoModal()">Upload Video</button>
                </div>
            `;
      return;
    }

    container.innerHTML = videos
      .map(
        (video) => `
            <div class="video-card" onclick="profileManager.viewMedia('${video.url}', 'video')">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="play-overlay">▶️</div>
                </div>
                <div class="video-info">
                    <h4>${video.title}</h4>
                    <p>${video.description}</p>
                    <div class="video-stats">
                        <span>👁️ ${video.views}</span>
                        <span>📅 ${new Date(video.uploadedAt).toLocaleDateString("id-ID")}</span>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  loadUserStreams() {
    const container = document.getElementById("userStreamsContainer");

    // For now, show empty state
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔴</div>
                <h3>No live streams yet</h3>
                <p>Start your first live stream to build your audience!</p>
                <a href="studio.html" class="btn primary">Start Live Stream</a>
            </div>
        `;
  }

  loadAboutInfo() {
    const userData = this.getUserData();

    document.getElementById("aboutEmail").textContent = this.currentUser.email;
    document.getElementById("aboutPhone").textContent =
      userData.phone || "Not provided";
    document.getElementById("aboutWebsite").textContent =
      userData.website || "Not provided";
    document.getElementById("aboutJoinedDate").textContent = new Date(
      this.currentUser.created_at,
    ).toLocaleDateString("id-ID");
    document.getElementById("aboutLastActive").textContent = "Online now";

    // Load interests
    const interestsContainer = document.getElementById("userInterests");
    const interests = userData.interests || [];

    if (interests.length > 0) {
      interestsContainer.innerHTML = interests
        .map(
          (interest) => `
                <span class="interest-tag">${this.getInterestIcon(interest)} ${interest}</span>
            `,
        )
        .join("");
    } else {
      interestsContainer.innerHTML = "<p>No interests added yet</p>";
    }

    // Load achievements
    const achievementsContainer = document.getElementById("userAchievements");
    achievementsContainer.innerHTML = `
            <div class="achievement">🎉 Welcome to Nabila Stream!</div>
            <div class="achievement">📝 First Post Creator</div>
            <div class="achievement">🖼️ Photo Enthusiast</div>
        `;
  }

  getInterestIcon(interest) {
    const icons = {
      gaming: "🎮",
      music: "🎵",
      art: "🎨",
      technology: "💻",
      cooking: "🍳",
      sports: "⚽",
      travel: "✈️",
      photography: "📷",
    };
    return icons[interest] || "🏷️";
  }

  viewMedia(url, type) {
    const modal = document.getElementById("mediaViewerModal");
    const container = document.getElementById("mediaContainer");

    if (type === "image") {
      container.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 80vh;">`;
    } else if (type === "video") {
      container.innerHTML = `<video src="${url}" controls style="max-width: 100%; max-height: 80vh;">`;
    }

    modal.style.display = "block";
  }

  shareProfile() {
    const profileUrl = `${window.location.origin}/profile.html?user=${this.currentUser.id}`;

    if (navigator.share) {
      navigator.share({
        title: `${this.currentUser.name}'s Profile - Nabila Stream`,
        text: `Check out ${this.currentUser.name}'s profile on Nabila Stream!`,
        url: profileUrl,
      });
    } else {
      navigator.clipboard.writeText(profileUrl).then(() => {
        this.showNotification("Profile link copied to clipboard!", "success");
      });
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `profile-notification ${type}`;
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

// Initialize profile manager
document.addEventListener("DOMContentLoaded", () => {
  window.profileManager = new EnhancedProfileManager();
});

// Add enhanced profile styles
const profileStyles = document.createElement("style");
profileStyles.textContent = `
    .profile-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .profile-header-enhanced {
        background: var(--card-bg);
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 30px;
        border: 2px solid var(--border-color);
    }

    .profile-cover {
        position: relative;
        height: 300px;
        overflow: hidden;
    }

    .cover-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .edit-cover-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .edit-cover-btn:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    .profile-info-main {
        padding: 20px 30px 30px;
        display: flex;
        align-items: flex-start;
        gap: 30px;
        position: relative;
        margin-top: -80px;
    }

    .profile-avatar-section {
        position: relative;
        flex-shrink: 0;
    }

    .profile-avatar-large {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        border: 5px solid var(--card-bg);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .edit-avatar-btn {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: var(--secondary-color);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        transition: all 0.3s ease;
    }

    .edit-avatar-btn:hover {
        background: var(--primary-color);
        transform: scale(1.1);
    }

    .profile-details-main {
        flex: 1;
        margin-top: 80px;
    }

    .profile-details-main h1 {
        color: var(--text-light);
        margin-bottom: 10px;
        font-size: 2.5rem;
    }

    .profile-details-main p {
        color: var(--text-dark);
        margin-bottom: 20px;
        font-size: 1.1rem;
        line-height: 1.5;
    }

    .profile-stats {
        display: flex;
        gap: 30px;
        margin-bottom: 25px;
        flex-wrap: wrap;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .stat-number {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--secondary-color);
        margin-bottom: 5px;
    }

    .stat-label {
        color: var(--text-dark);
        font-size: 0.9rem;
        font-weight: 500;
    }

    .profile-actions {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }

    .profile-tabs {
        display: flex;
        background: var(--card-bg);
        border-radius: 15px;
        padding: 5px;
        margin-bottom: 30px;
        border: 2px solid var(--border-color);
        overflow-x: auto;
        gap: 5px;
    }

    .tab-btn {
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

    .tab-btn:hover {
        background: var(--bg-dark);
        color: var(--text-light);
    }

    .tab-btn.active {
        background: var(--secondary-color);
        color: white;
        box-shadow: 0 3px 10px rgba(37, 117, 252, 0.3);
    }

    .profile-section {
        display: none;
    }

    .profile-section.active {
        display: block;
        animation: fadeIn 0.3s ease;
    }

    .posts-header, .gallery-header, .videos-header, .streams-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        flex-wrap: wrap;
        gap: 15px;
    }

    .posts-grid, .gallery-grid, .videos-grid, .streams-grid {
        display: grid;
        gap: 25px;
    }

    .posts-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }

    .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }

    .videos-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .post-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
        transition: all 0.3s ease;
    }

    .post-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-5px);
    }

    .post-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }

    .post-header h3 {
        color: var(--text-light);
        margin: 0;
        flex: 1;
    }

    .post-date {
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .post-content p {
        color: var(--text-dark);
        line-height: 1.6;
        margin-bottom: 15px;
    }

    .post-media {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        margin-bottom: 15px;
    }

    .post-media img, .post-media video {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .post-media img:hover, .post-media video:hover {
        transform: scale(1.05);
    }

    .post-tags {
        margin-bottom: 15px;
    }

    .tag {
        background: var(--secondary-color);
        color: white;
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 0.8rem;
        margin-right: 8px;
        margin-bottom: 5px;
        display: inline-block;
    }

    .post-stats {
        display: flex;
        gap: 20px;
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .gallery-item {
        position: relative;
        aspect-ratio: 1;
        overflow: hidden;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .gallery-item:hover {
        transform: scale(1.05);
    }

    .gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gallery-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .gallery-item:hover .gallery-overlay {
        opacity: 1;
    }

    .view-icon {
        color: white;
        font-size: 1.5rem;
    }

    .video-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .video-card:hover {
        border-color: var(--secondary-color);
        transform: translateY(-5px);
    }

    .video-thumbnail {
        position: relative;
        aspect-ratio: 16/9;
        overflow: hidden;
    }

    .video-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .play-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 15px;
        border-radius: 50%;
        font-size: 1.5rem;
    }

    .video-info {
        padding: 20px;
    }

    .video-info h4 {
        color: var(--text-light);
        margin-bottom: 10px;
    }

    .video-info p {
        color: var(--text-dark);
        margin-bottom: 10px;
        line-height: 1.5;
    }

    .video-stats {
        display: flex;
        gap: 15px;
        color: var(--text-dark);
        font-size: 0.9rem;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-dark);
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

    .about-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
    }

    .about-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 25px;
    }

    .about-card h3 {
        color: var(--text-light);
        margin-bottom: 20px;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 10px;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color);
    }

    .info-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    .info-item label {
        color: var(--text-dark);
        font-weight: bold;
    }

    .info-item span {
        color: var(--text-light);
    }

    .interest-tag {
        background: var(--secondary-color);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        margin: 5px;
        display: inline-block;
        font-size: 0.9rem;
    }

    .achievement {
        background: var(--bg-dark);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
        color: var(--text-light);
    }

    /* Modal Styles */
    .edit-profile-modal, .create-post-modal, .upload-modal {
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .profile-form, .post-form, .upload-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label {
        color: var(--text-light);
        font-weight: bold;
    }

    .form-group input, .form-group textarea {
        padding: 12px 15px;
        border: 2px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-dark);
        color: var(--text-light);
        font-family: inherit;
    }

    .form-group input:focus, .form-group textarea:focus {
        border-color: var(--secondary-color);
        outline: none;
    }

    .char-count {
        color: var(--text-dark);
        font-size: 0.8rem;
        text-align: right;
    }

    .interests-selector {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-light);
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: background 0.3s ease;
    }

    .checkbox-label:hover {
        background: var(--bg-dark);
    }

    .form-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .upload-area {
        border: 2px dashed var(--border-color);
        border-radius: 12px;
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

    .media-preview, .photos-preview, .video-preview {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }

    .file-preview {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        background: var(--bg-dark);
        border: 1px solid var(--border-color);
    }

    .file-preview img, .file-preview video {
        width: 100%;
        height: 100px;
        object-fit: cover;
    }

    .file-info {
        padding: 8px;
        position: relative;
    }

    .file-name {
        font-size: 0.8rem;
        color: var(--text-dark);
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .remove-file {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #e74c3c;
        color: white;
        border: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.8rem;
        line-height: 1;
    }

    .media-viewer {
        max-width: 90vw;
        max-height: 90vh;
        background: transparent;
        border: none;
    }

    .media-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
    }

    .profile-notification {
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

    .profile-notification.success {
        border-color: #27ae60;
    }

    .profile-notification.error {
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
        .profile-info-main {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 20px;
        }

        .profile-details-main {
            margin-top: 20px;
        }

        .profile-stats {
            justify-content: center;
        }

        .profile-actions {
            justify-content: center;
        }

        .posts-grid, .gallery-grid, .videos-grid {
            grid-template-columns: 1fr;
        }

        .about-grid {
            grid-template-columns: 1fr;
        }

        .interests-selector {
            grid-template-columns: 1fr;
        }

        .form-actions {
            flex-direction: column;
        }

        .profile-tabs {
            overflow-x: auto;
        }

        .tab-btn {
            min-width: 100px;
            padding: 10px 15px;
        }
    }
`;
document.head.appendChild(profileStyles);
