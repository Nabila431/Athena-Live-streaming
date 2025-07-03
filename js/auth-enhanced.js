// Enhanced Authentication System with Profile Photos and Better UI
class EnhancedAuth {
  constructor() {
    this.currentUser = null;
    this.users = JSON.parse(localStorage.getItem("nabila_users") || "[]");
    this.sessionKey = "nabila_session";
    this.defaultAvatars = [
      "https://images.pexels.com/photos/10648919/pexels-photo-10648919.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face",
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face",
      "https://images.pexels.com/photos/1391487/pexels-photo-1391487.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face",
      "https://images.pexels.com/photos/8647814/pexels-photo-8647814.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face",
      "https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face",
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face",
    ];
    this.init();
  }

  init() {
    // Check for existing session
    const savedSession = localStorage.getItem(this.sessionKey);
    if (savedSession) {
      try {
        this.currentUser = JSON.parse(savedSession);
        console.log("Session restored:", this.currentUser.email);
      } catch (e) {
        localStorage.removeItem(this.sessionKey);
      }
    }
    this.updateUI();
  }

  getRandomAvatar() {
    return this.defaultAvatars[
      Math.floor(Math.random() * this.defaultAvatars.length)
    ];
  }

  async register(email, password, confirmPassword, selectedAvatar = null) {
    // Validation
    if (!email || !password || !confirmPassword) {
      throw new Error("Semua field harus diisi!");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Format email tidak valid!");
    }

    if (password.length < 6) {
      throw new Error("Password harus minimal 6 karakter!");
    }

    if (password !== confirmPassword) {
      throw new Error("Konfirmasi password tidak cocok!");
    }

    // Check if user already exists
    const existingUser = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existingUser) {
      throw new Error("Email sudah terdaftar! Silakan login.");
    }

    // Create new user with better data
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: this.hashPassword(password),
      name: email.split("@")[0],
      displayName: email.split("@")[0],
      bio: "✨ Baru bergabung di Nabila Stream!",
      avatar: selectedAvatar || this.getRandomAvatar(),
      created_at: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      totalStreams: 0,
      totalPosts: 0,
      totalLikes: 0,
      followers: 0,
      following: 0,
      isOnline: true,
    };

    // Save user
    this.users.push(newUser);
    localStorage.setItem("nabila_users", JSON.stringify(this.users));

    console.log("User registered:", email);
    return { user: newUser, message: "Registrasi berhasil!" };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email dan password harus diisi!");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Format email tidak valid!");
    }

    // Find user
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) {
      throw new Error("Email tidak terdaftar!");
    }

    // Check password
    if (!this.verifyPassword(password, user.password)) {
      throw new Error("Password salah!");
    }

    // Update last active and online status
    user.lastActive = new Date().toISOString();
    user.isOnline = true;

    // Update users array
    const userIndex = this.users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      this.users[userIndex] = user;
      localStorage.setItem("nabila_users", JSON.stringify(this.users));
    }

    // Create session
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      created_at: user.created_at,
      lastActive: user.lastActive,
      totalStreams: user.totalStreams,
      totalPosts: user.totalPosts,
      totalLikes: user.totalLikes,
      followers: user.followers,
      following: user.following,
      isOnline: true,
    };

    this.currentUser = sessionUser;
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));

    console.log("User logged in:", email);
    this.updateUI();
    return { user: sessionUser, message: "Login berhasil!" };
  }

  logout() {
    if (this.currentUser) {
      // Update user offline status
      const userIndex = this.users.findIndex(
        (u) => u.id === this.currentUser.id,
      );
      if (userIndex !== -1) {
        this.users[userIndex].isOnline = false;
        this.users[userIndex].lastActive = new Date().toISOString();
        localStorage.setItem("nabila_users", JSON.stringify(this.users));
      }
    }

    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    console.log("User logged out");
    this.updateUI();
  }

  updateProfile(updates) {
    if (!this.currentUser) return false;

    // Update current user
    this.currentUser = { ...this.currentUser, ...updates };

    // Update in users array
    const userIndex = this.users.findIndex((u) => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      localStorage.setItem("nabila_users", JSON.stringify(this.users));
    }

    // Update session
    localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));

    this.updateUI();
    return true;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  updateUI() {
    const loginBtn = document.getElementById("loginRegisterBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");

    if (this.currentUser) {
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";

      // Show user info in navbar
      if (userAvatar) {
        userAvatar.src = this.currentUser.avatar;
        userAvatar.style.display = "inline-block";
      }
      if (userName) {
        userName.textContent =
          this.currentUser.displayName || this.currentUser.name;
        userName.style.display = "inline-block";
      }
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (userAvatar) userAvatar.style.display = "none";
      if (userName) userName.style.display = "none";
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  requireAuth() {
    if (!this.isLoggedIn()) {
      this.showAlert("Anda harus login terlebih dahulu!", "error");
      setTimeout(() => {
        window.location.href = "Auth.html";
      }, 1500);
      return false;
    }
    return true;
  }

  getOnlineUsers() {
    return this.users.filter((user) => user.isOnline);
  }

  getAllUsers() {
    return this.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      displayName: u.displayName,
      avatar: u.avatar,
      isOnline: u.isOnline,
      lastActive: u.lastActive,
    }));
  }

  showAlert(message, type = "info") {
    // Create floating alert
    const alert = document.createElement("div");
    alert.className = `floating-alert alert-${type}`;
    alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
                <span class="alert-message">${message}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

    alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(alert);

    setTimeout(() => {
      if (document.body.contains(alert)) {
        alert.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (document.body.contains(alert)) {
            document.body.removeChild(alert);
          }
        }, 300);
      }
    }, 4000);
  }
}

// Create global auth instance
window.authSystem = new EnhancedAuth();

// Enhanced authentication for forms
document.addEventListener("DOMContentLoaded", () => {
  // Only run on auth page
  if (!document.getElementById("loginForm")) return;

  console.log("Enhanced auth page loaded");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const switchToRegister = document.getElementById("authSwitchRegister");
  const switchToLogin = document.getElementById("authSwitchLogin");

  // Add avatar selection to register form
  addAvatarSelection();

  // Form switching
  if (switchToRegister) {
    switchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      showRegisterForm();
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }

  // Form submissions
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  // Check if already logged in
  if (window.authSystem.isLoggedIn()) {
    window.authSystem.showAlert("Anda sudah login! Mengarahkan...", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
});

function addAvatarSelection() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  const avatarSelection = document.createElement("div");
  avatarSelection.className = "form-group avatar-selection";
  avatarSelection.innerHTML = `
        <label>Pilih Avatar Profil</label>
        <div class="avatar-options">
            ${window.authSystem.defaultAvatars
              .map(
                (avatar, index) => `
                <div class="avatar-option ${index === 0 ? "selected" : ""}" data-avatar="${avatar}">
                    <img src="${avatar}" alt="Avatar ${index + 1}">
                </div>
            `,
              )
              .join("")}
        </div>
        <input type="hidden" id="selectedAvatar" value="${window.authSystem.defaultAvatars[0]}">
    `;

  // Insert before submit button
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  registerForm.insertBefore(avatarSelection, submitBtn);

  // Add selection functionality
  avatarSelection.querySelectorAll(".avatar-option").forEach((option) => {
    option.addEventListener("click", () => {
      avatarSelection
        .querySelectorAll(".avatar-option")
        .forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      document.getElementById("selectedAvatar").value = option.dataset.avatar;
    });
  });
}

function showRegisterForm() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
  hideAlert();
}

function showLoginForm() {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
  hideAlert();
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Show loading
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Login...';
  submitBtn.disabled = true;

  try {
    const result = await window.authSystem.login(email, password);
    window.authSystem.showAlert(result.message, "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    window.authSystem.showAlert(error.message, "error");
  } finally {
    submitBtn.innerHTML = "Login";
    submitBtn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword",
  ).value;
  const selectedAvatar = document.getElementById("selectedAvatar")?.value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Show loading
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Mendaftar...';
  submitBtn.disabled = true;

  try {
    const result = await window.authSystem.register(
      email,
      password,
      confirmPassword,
      selectedAvatar,
    );
    window.authSystem.showAlert(result.message + " Silakan login.", "success");

    setTimeout(() => {
      showLoginForm();
    }, 2000);
  } catch (error) {
    window.authSystem.showAlert(error.message, "error");
  } finally {
    submitBtn.innerHTML = "Daftar";
    submitBtn.disabled = false;
  }
}

function showAlert(message, type = "error") {
  window.authSystem.showAlert(message, type);
}

function hideAlert() {
  const authMessage = document.getElementById("authMessage");
  if (authMessage) {
    authMessage.style.display = "none";
  }
}

// Global logout function
window.handleLogout = function () {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    window.authSystem.logout();
    window.location.href = "index.html";
  }
};

// Export for other scripts
window.checkAuthStatus = () => window.authSystem.getCurrentUser();
window.requireAuth = () => window.authSystem.requireAuth();

// Add enhanced styles
const authStyles = document.createElement("style");
authStyles.textContent = `
    .avatar-selection {
        margin: 20px 0;
    }
    
    .avatar-options {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 10px;
    }
    
    .avatar-option {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        border: 3px solid transparent;
        transition: all 0.3s ease;
    }
    
    .avatar-option:hover {
        border-color: var(--secondary-color);
        transform: scale(1.1);
    }
    
    .avatar-option.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 10px rgba(106, 17, 203, 0.5);
    }
    
    .avatar-option img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .loading-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .floating-alert .alert-content {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        gap: 10px;
    }
    
    .alert-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        margin-left: auto;
    }
`;

document.head.appendChild(authStyles);
