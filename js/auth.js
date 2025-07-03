// Authentication functionality for Nabila Stream

let isInitialized = false;

// Wait for Supabase to be available
function waitForSupabase() {
  return new Promise((resolve) => {
    if (typeof Supabase !== "undefined" && typeof supabase !== "undefined") {
      resolve();
    } else {
      setTimeout(() => waitForSupabase().then(resolve), 100);
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Auth page loaded");

  // Wait for Supabase to be available
  await waitForSupabase();
  console.log("Supabase initialized");

  // Check if user is already logged in
  await checkExistingAuth();

  // Initialize form handlers
  initializeFormHandlers();

  isInitialized = true;
});

// Check if user is already authenticated
async function checkExistingAuth() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth check error:", error);
      return;
    }

    if (user) {
      console.log("User already logged in, redirecting...");
      showAlert("Anda sudah login! Mengarahkan ke halaman utama...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    }
  } catch (error) {
    console.error("Error checking auth:", error);
  }
}

// Initialize form event handlers
function initializeFormHandlers() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const switchToRegister = document.getElementById("authSwitchRegister");
  const switchToLogin = document.getElementById("authSwitchLogin");

  // Form toggle handlers
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

  // Form submission handlers
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
}

// Show register form
function showRegisterForm() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) loginForm.style.display = "none";
  if (registerForm) registerForm.style.display = "block";
  hideAlert();
}

// Show login form
function showLoginForm() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (registerForm) registerForm.style.display = "none";
  if (loginForm) loginForm.style.display = "block";
  hideAlert();
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();

  if (!isInitialized) {
    showAlert("Sistem sedang memuat, silakan coba lagi...", "error");
    return;
  }

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Validation
  if (!email || !password) {
    showAlert("Email dan password harus diisi!", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Format email tidak valid!", "error");
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Login...";
  submitBtn.disabled = true;

  try {
    console.log("Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Login error:", error);
      handleAuthError(error);
      return;
    }

    if (data.user) {
      console.log("Login successful:", data.user.email);
      showAlert("Login berhasil! Mengarahkan ke halaman utama...", "success");

      // Redirect after success
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  } catch (error) {
    console.error("Login exception:", error);
    showAlert("Terjadi kesalahan saat login: " + error.message, "error");
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();

  if (!isInitialized) {
    showAlert("Sistem sedang memuat, silakan coba lagi...", "error");
    return;
  }

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword",
  ).value;

  // Validation
  if (!email || !password || !confirmPassword) {
    showAlert("Semua field harus diisi!", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Format email tidak valid!", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("Password harus minimal 6 karakter!", "error");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("Konfirmasi password tidak cocok!", "error");
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Mendaftar...";
  submitBtn.disabled = true;

  try {
    console.log("Attempting registration for:", email);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: email.split("@")[0],
        },
      },
    });

    if (error) {
      console.error("Registration error:", error);
      handleAuthError(error);
      return;
    }

    if (data.user) {
      console.log("Registration successful:", data.user.email);

      if (data.user.email_confirmed_at) {
        // Email already confirmed, can login immediately
        showAlert("Registrasi berhasil! Anda sudah bisa login.", "success");
        setTimeout(() => {
          showLoginForm();
        }, 2000);
      } else {
        // Need email confirmation
        showAlert(
          "Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.",
          "success",
        );
        setTimeout(() => {
          showLoginForm();
        }, 3000);
      }
    }
  } catch (error) {
    console.error("Registration exception:", error);
    showAlert("Terjadi kesalahan saat registrasi: " + error.message, "error");
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Handle authentication errors
function handleAuthError(error) {
  let message = "Terjadi kesalahan. Silakan coba lagi.";

  // Handle specific error codes
  if (error.code) {
    switch (error.code) {
      case "invalid_credentials":
        message = "Email atau password salah!";
        break;
      case "email_already_in_use":
        message =
          "Email sudah terdaftar. Silakan login atau gunakan email lain.";
        break;
      case "weak_password":
        message = "Password terlalu lemah. Gunakan minimal 6 karakter.";
        break;
      case "email_not_confirmed":
        message = "Email belum dikonfirmasi. Silakan cek email Anda.";
        break;
      case "signup_disabled":
        message = "Registrasi sedang dinonaktifkan. Silakan coba lagi nanti.";
        break;
      default:
        message = error.message || "Terjadi kesalahan pada sistem.";
    }
  } else if (error.message) {
    // Handle specific error messages
    if (error.message.includes("Invalid login credentials")) {
      message = "Email atau password salah!";
    } else if (error.message.includes("Email not confirmed")) {
      message = "Email belum dikonfirmasi. Silakan cek email Anda.";
    } else if (error.message.includes("User already registered")) {
      message = "Email sudah terdaftar. Silakan login.";
    } else {
      message = error.message;
    }
  }

  showAlert(message, "error");
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show alert message
function showAlert(message, type = "error") {
  const authMessage = document.getElementById("authMessage");
  if (authMessage) {
    authMessage.textContent = message;
    authMessage.className = `alert ${type}`;
    authMessage.style.display = "block";

    // Auto-hide success messages
    if (type === "success") {
      setTimeout(() => {
        hideAlert();
      }, 4000);
    }
  }
}

// Hide alert message
function hideAlert() {
  const authMessage = document.getElementById("authMessage");
  if (authMessage) {
    authMessage.style.display = "none";
  }
}

// Test Supabase connection
window.testSupabaseConnection = async function () {
  try {
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase connection failed:", error);
      return false;
    }

    console.log("Supabase connection successful:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection error:", error);
    return false;
  }
};
