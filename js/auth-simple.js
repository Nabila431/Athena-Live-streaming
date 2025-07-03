// Simple Authentication System with Local Storage (fallback)
// This ensures login/register works even if Supabase has issues

class SimpleAuth {
  constructor() {
    this.currentUser = null;
    this.users = JSON.parse(localStorage.getItem("nabila_users") || "[]");
    this.sessionKey = "nabila_session";
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

  // Register new user
  async register(email, password, confirmPassword) {
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

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: this.hashPassword(password),
      name: email.split("@")[0],
      created_at: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split("@")[0])}&background=6a11cb&color=fff`,
    };

    // Save user
    this.users.push(newUser);
    localStorage.setItem("nabila_users", JSON.stringify(this.users));

    console.log("User registered:", email);
    return { user: newUser, message: "Registrasi berhasil!" };
  }

  // Login user
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

    // Create session
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      created_at: user.created_at,
    };

    this.currentUser = sessionUser;
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));

    console.log("User logged in:", email);
    this.updateUI();
    return { user: sessionUser, message: "Login berhasil!" };
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    console.log("User logged out");
    this.updateUI();
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Update UI elements
  updateUI() {
    const loginBtn = document.getElementById("loginRegisterBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (this.currentUser) {
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }

  // Utility functions
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  hashPassword(password) {
    // Simple hash for demo purposes
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  // Require authentication (for protected pages)
  requireAuth() {
    if (!this.isLoggedIn()) {
      alert("Anda harus login terlebih dahulu!");
      window.location.href = "Auth.html";
      return false;
    }
    return true;
  }

  // Get all users (for testing)
  getAllUsers() {
    return this.users.map((u) => ({ id: u.id, email: u.email, name: u.name }));
  }
}

// Create global auth instance
window.authSystem = new SimpleAuth();

// Authentication functions for forms
document.addEventListener("DOMContentLoaded", () => {
  // Only run on auth page
  if (!document.getElementById("loginForm")) return;

  console.log("Auth page loaded");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const switchToRegister = document.getElementById("authSwitchRegister");
  const switchToLogin = document.getElementById("authSwitchLogin");

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
    showAlert("Anda sudah login! Mengarahkan...", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
});

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
  submitBtn.textContent = "Login...";
  submitBtn.disabled = true;

  try {
    const result = await window.authSystem.login(email, password);
    showAlert(result.message, "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    submitBtn.textContent = "Login";
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
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Show loading
  submitBtn.textContent = "Mendaftar...";
  submitBtn.disabled = true;

  try {
    const result = await window.authSystem.register(
      email,
      password,
      confirmPassword,
    );
    showAlert(result.message + " Silakan login.", "success");

    setTimeout(() => {
      showLoginForm();
    }, 2000);
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    submitBtn.textContent = "Daftar";
    submitBtn.disabled = false;
  }
}

function showAlert(message, type = "error") {
  const authMessage = document.getElementById("authMessage");
  if (authMessage) {
    authMessage.textContent = message;
    authMessage.className = `alert ${type}`;
    authMessage.style.display = "block";

    if (type === "success") {
      setTimeout(() => hideAlert(), 4000);
    }
  }
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
