// Mendapatkan elemen form dan container
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authSwitchLogin = document.getElementById("authSwitchLogin");
const authSwitchRegister = document.getElementById("authSwitchRegister");
const authMessage = document.getElementById("authMessage");

// Event listener untuk beralih antara login dan register
document.addEventListener("DOMContentLoaded", () => {
  // Toggle ke register
  const switchToRegister = document.getElementById("authSwitchRegister");
  if (switchToRegister) {
    switchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.style.display = "none";
      registerForm.style.display = "block";
      hideAlert();
    });
  }

  // Toggle ke login
  const switchToLogin = document.getElementById("authSwitchLogin");
  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      registerForm.style.display = "none";
      loginForm.style.display = "block";
      hideAlert();
    });
  }
});

// Fungsi untuk menampilkan pesan alert
function showAlert(message, type = "error") {
  authMessage.textContent = message;
  authMessage.className = `alert ${type}`;
  authMessage.style.display = "block";
}

// Fungsi untuk menyembunyikan alert
function hideAlert() {
  authMessage.style.display = "none";
}

// Handle login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    showAlert("Login berhasil! Mengarahkan...", "success");
    setTimeout(() => {
      window.location.href = "index.html"; // Arahkan ke halaman utama
    }, 1500);
  } catch (error) {
    console.error("Login error:", error.message);
    showAlert("Login gagal: " + error.message);
  }
});

// Handle register form submission
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword",
  ).value;

  // Validasi password
  if (password !== confirmPassword) {
    showAlert("Konfirmasi password tidak cocok!");
    return;
  }

  if (password.length < 6) {
    showAlert("Password harus memiliki minimal 6 karakter!");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    showAlert(
      "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
      "success",
    );

    // Beralih ke form login setelah registrasi berhasil
    setTimeout(() => {
      registerForm.style.display = "none";
      loginForm.style.display = "block";
    }, 2000);
  } catch (error) {
    console.error("Register error:", error.message);
    showAlert("Registrasi gagal: " + error.message);
  }
});

// Cek apakah user sudah login, jika ya redirect ke halaman utama
document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    window.location.href = "index.html";
  }
});
