// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://vgchzuqtrmohyzojvngw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnY2h6dXF0cm1vaHl6b2p2bmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzE1NzAsImV4cCI6MjA2Njg0NzU3MH0.WKcSXto5EXcS1fdScAKf6atW7tcXM9AB9jObapii_2g";

// Initialize Supabase client
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global authentication state
let currentUser = null;
let authInitialized = false;

// Wait for Supabase to be available
function waitForSupabase() {
  return new Promise((resolve) => {
    if (typeof Supabase !== "undefined") {
      resolve();
    } else {
      setTimeout(() => waitForSupabase().then(resolve), 100);
    }
  });
}

// Initialize authentication system
async function initializeAuth() {
  try {
    await waitForSupabase();
    console.log("Supabase client initialized");

    // Check current auth status
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth initialization error:", error);
      currentUser = null;
    } else {
      currentUser = user;
      console.log("Current user:", user ? user.email : "None");
    }

    // Update UI based on auth status
    updateAuthUI();

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "Auth state changed:",
        event,
        session?.user?.email || "No user",
      );
      currentUser = session?.user || null;
      updateAuthUI();
    });

    authInitialized = true;
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    authInitialized = false;
  }
}

// Check authentication status and update UI
async function checkAuthStatus() {
  if (!authInitialized) {
    await initializeAuth();
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error);
      currentUser = null;
    } else {
      currentUser = user;
    }

    updateAuthUI();
    return currentUser;
  } catch (error) {
    console.error("Error checking auth status:", error);
    currentUser = null;
    updateAuthUI();
    return null;
  }
}

// Update authentication UI elements
function updateAuthUI() {
  const loginRegisterBtn = document.getElementById("loginRegisterBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    // User is logged in
    if (loginRegisterBtn) {
      loginRegisterBtn.style.display = "none";
    }
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
    }
    console.log("UI updated - User logged in:", currentUser.email);
  } else {
    // User is not logged in
    if (loginRegisterBtn) {
      loginRegisterBtn.style.display = "inline-block";
    }
    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }
    console.log("UI updated - User not logged in");
  }
}

// Handle user logout
async function handleLogout() {
  try {
    console.log("Attempting logout...");

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      alert("Logout gagal: " + error.message);
      return;
    }

    console.log("User logged out successfully");
    currentUser = null;
    updateAuthUI();

    // Redirect to home page
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout exception:", error);
    alert("Logout gagal: " + error.message);
  }
}

// Require authentication for protected pages
async function requireAuth() {
  const user = await checkAuthStatus();

  if (!user) {
    alert("Anda harus login terlebih dahulu untuk mengakses halaman ini.");
    window.location.href = "Auth.html";
    return false;
  }

  return true;
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Main script loaded");

  // Initialize authentication
  await initializeAuth();

  // Set up logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Test connection on load (for debugging)
  if (window.location.search.includes("debug=true")) {
    setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("Debug - Supabase connection test:", { data, error });
      } catch (e) {
        console.error("Debug - Supabase connection failed:", e);
      }
    }, 1000);
  }
});

// Utility function to get current user
function getCurrentUser() {
  return currentUser;
}

// Export functions for use in other scripts
window.checkAuthStatus = checkAuthStatus;
window.handleLogout = handleLogout;
window.requireAuth = requireAuth;
window.getCurrentUser = getCurrentUser;
window.supabase = supabase;
