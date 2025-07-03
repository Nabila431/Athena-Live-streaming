// Enhanced Profile Management
document.addEventListener("DOMContentLoaded", () => {
  console.log("Profile page loading...");

  // Check authentication
  const user = window.authSystem?.getCurrentUser();
  if (!user) {
    alert("Anda harus login terlebih dahulu untuk mengakses profil");
    window.location.href = "Auth.html";
    return;
  }

  console.log("Loading profile for user:", user.email);
  loadUserProfile(user);
  setupProfileEdit();
});

function loadUserProfile(user) {
  try {
    // Update profile email
    const profileEmailElement = document.getElementById("profileEmail");
    if (profileEmailElement) {
      profileEmailElement.textContent = user.email;
    }

    // Update profile name
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) {
      profileNameElement.textContent = user.name || user.email.split("@")[0];
    }

    // Update join date
    const profileJoinedDateElement =
      document.getElementById("profileJoinedDate");
    if (profileJoinedDateElement) {
      const joinDate = new Date(
        user.created_at || Date.now(),
      ).toLocaleDateString("id-ID");
      profileJoinedDateElement.textContent = joinDate;
    }

    // Update bio
    const profileBioElement = document.getElementById("profileBio");
    if (profileBioElement) {
      profileBioElement.textContent =
        user.bio || "Selamat datang di profil saya di Nabila Stream!";
    }

    // Update avatar
    const profileAvatarElement = document.getElementById("profileAvatar");
    if (profileAvatarElement) {
      profileAvatarElement.src = user.avatar;
    }

    console.log("Profile loaded successfully");

    // Load user's activity
    loadUserActivity(user);
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

function setupProfileEdit() {
  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) {
    editBtn.addEventListener("click", showEditProfileModal);
  }
}

function showEditProfileModal() {
  const user = window.authSystem?.getCurrentUser();
  if (!user) return;

  // Create modal
  const modal = document.createElement("div");
  modal.className = "profile-edit-modal";
  modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Edit Profil</h3>
                    <button class="close-modal" onclick="closeProfileModal()">×</button>
                </div>
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="editName">Nama</label>
                        <input type="text" id="editName" value="${user.name || ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="editBio">Bio</label>
                        <textarea id="editBio" rows="3" placeholder="Ceritakan tentang diri Anda...">${user.bio || ""}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editAvatar">Avatar URL</label>
                        <input type="url" id="editAvatar" value="${user.avatar || ""}" placeholder="https://...">
                    </div>
                    <div class="modal-actions">
                        <button type="button" onclick="closeProfileModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn">💾 Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

  // Add modal styles
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    `;

  document.body.appendChild(modal);

  // Setup form handler
  const form = document.getElementById("editProfileForm");
  form.addEventListener("submit", handleProfileEdit);
}

window.closeProfileModal = function () {
  const modal = document.querySelector(".profile-edit-modal");
  if (modal) {
    document.body.removeChild(modal);
  }
};

function handleProfileEdit(e) {
  e.preventDefault();

  const user = window.authSystem?.getCurrentUser();
  if (!user) return;

  const name = document.getElementById("editName").value.trim();
  const bio = document.getElementById("editBio").value.trim();
  const avatar = document.getElementById("editAvatar").value.trim();

  // Update user data
  const updatedUser = {
    ...user,
    name: name || user.name,
    bio: bio || user.bio,
    avatar: avatar || user.avatar,
  };

  // Update in local storage
  const users = JSON.parse(localStorage.getItem("nabila_users") || "[]");
  const userIndex = users.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    };
    localStorage.setItem("nabila_users", JSON.stringify(users));
  }

  // Update session
  localStorage.setItem("nabila_session", JSON.stringify(updatedUser));
  window.authSystem.currentUser = updatedUser;

  // Reload profile
  loadUserProfile(updatedUser);
  closeProfileModal();

  // Show success message
  showProfileAlert("Profil berhasil diperbarui! ✨", "success");
}

function loadUserActivity(user) {
  // Load user's posts
  const posts = JSON.parse(localStorage.getItem("nabila_posts") || "[]");
  const userPosts = posts.filter((post) => post.author.id === user.id);

  // Load user's messages
  const messages = JSON.parse(localStorage.getItem("nabila_messages") || "{}");
  let userMessageCount = 0;
  Object.values(messages).forEach((roomMessages) => {
    userMessageCount += roomMessages.filter(
      (msg) => msg.author.id === user.id,
    ).length;
  });

  // Update activity stats
  const activityHtml = `
        <section class="profile-activity" style="margin-top: 30px;">
            <h3>📊 Aktivitas</h3>
            <div class="activity-stats">
                <div class="stat-item">
                    <div class="stat-number">${userPosts.length}</div>
                    <div class="stat-label">Posts</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${userMessageCount}</div>
                    <div class="stat-label">Messages</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${userPosts.reduce((sum, post) => sum + post.likes, 0)}</div>
                    <div class="stat-label">Likes</div>
                </div>
            </div>
        </section>
        
        <section class="recent-posts" style="margin-top: 30px;">
            <h3>📝 Post Terbaru</h3>
            <div class="recent-posts-list">
                ${
                  userPosts
                    .slice(0, 3)
                    .map(
                      (post) => `
                    <div class="recent-post-item">
                        <h4>${post.title}</h4>
                        <p>${post.content.substring(0, 100)}${post.content.length > 100 ? "..." : ""}</p>
                        <small>${new Date(post.created_at).toLocaleDateString("id-ID")}</small>
                    </div>
                `,
                    )
                    .join("") ||
                  '<p class="no-activity">Belum ada post yang dibuat</p>'
                }
            </div>
        </section>
    `;

  // Insert after profile info
  const profileInfo = document.querySelector(".profile-info");
  if (profileInfo) {
    profileInfo.insertAdjacentHTML("afterend", activityHtml);
  }
}

function showProfileAlert(message, type = "info") {
  // Create alert
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.textContent = message;
  alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        max-width: 300px;
    `;

  document.body.appendChild(alert);

  setTimeout(() => {
    if (document.body.contains(alert)) {
      document.body.removeChild(alert);
    }
  }, 3000);
}

// Add CSS for new profile elements
const profileStyles = document.createElement("style");
profileStyles.textContent = `
    .profile-edit-modal .modal-overlay {
        background: rgba(0, 0, 0, 0.8);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .profile-edit-modal .modal-content {
        background: var(--card-bg);
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .profile-edit-modal .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .profile-edit-modal .modal-header h3 {
        margin: 0;
        color: var(--text-light);
    }
    
    .profile-edit-modal .close-modal {
        background: none;
        border: none;
        color: var(--text-dark);
        cursor: pointer;
        font-size: 1.5rem;
        padding: 5px;
    }
    
    .profile-edit-modal form {
        padding: 20px;
    }
    
    .profile-edit-modal .modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    
    .btn-secondary {
        background: var(--background-dark);
        color: var(--text-light);
        border: 1px solid var(--border-color);
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
    }
    
    .activity-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }
    
    .stat-item {
        text-align: center;
        background: var(--background-dark);
        padding: 20px;
        border-radius: 8px;
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: var(--secondary-color);
        margin-bottom: 5px;
    }
    
    .stat-label {
        color: var(--text-dark);
        font-size: 0.9rem;
    }
    
    .recent-post-item {
        background: var(--background-dark);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
    }
    
    .recent-post-item h4 {
        color: var(--text-light);
        margin-bottom: 8px;
        font-size: 1.1rem;
    }
    
    .recent-post-item p {
        color: var(--text-dark);
        margin-bottom: 8px;
        line-height: 1.4;
    }
    
    .recent-post-item small {
        color: var(--text-dark);
        font-size: 0.8rem;
    }
    
    .no-activity {
        text-align: center;
        color: var(--text-dark);
        padding: 20px;
        font-style: italic;
    }
`;

document.head.appendChild(profileStyles);
