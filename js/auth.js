// Mendapatkan elemen form dan container
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authSwitchLogin = document.getElementById("authSwitchLogin");
const authSwitchRegister = document.getElementById("authSwitchRegister");
const authContainer = document.querySelector(".auth-container");

// Event listener untuk beralih antara login dan register
authSwitchLogin.addEventListener("click", () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

authSwitchRegister.addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

// Fungsi untuk menampilkan pesan alert
function showAlert(message, type = "error") {
  // Hapus alert yang sudah ada jika ada
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Buat elemen alert baru
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;

  // Sisipkan alert di awal container
  authContainer.insertBefore(alertDiv, authContainer.firstChild);

  // Hapus alert setelah 5 detik
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
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
