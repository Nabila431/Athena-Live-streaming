

// --- TEMPAT MENANAM AKSES SUPABASE ---
const SUPABASE_URL = 'https://vgchzuqtrmohyzojvngw.supabase.co'; // GANTI DENGAN URL SUPABASE ANDA
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnY2h6dXF0cm1vaHl6b2p2bmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzE1NzAsImV4cCI6MjA2Njg0NzU3MH0.WKcSXto5EXcS1fdScAKf6atW7tcXM9AB9jObapii_2g'; // GANTI DENGAN ANON KEY SUPABASE ANDA

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- AKHIR TEMPAT MENANAM AKSES SUPABASE ---

// Fungsi untuk memeriksa status autentikasi dan memperbarui UI navbar
async function checkAuthStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    const loginRegisterBtn = document.getElementById('loginRegisterBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        if (loginRegisterBtn) loginRegisterBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        console.log('User logged in:', user.email);
    } else {
        if (loginRegisterBtn) loginRegisterBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        console.log('User not logged in.');
    }
}

// Fungsi untuk menangani logout
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error:', error.message);
        alert('Logout gagal: ' + error.message);
    } else {
        console.log('User logged out.');
        window.location.href = 'auth.html'; // Arahkan kembali ke halaman login
    }
}

// Event listener untuk logout button (jika ada di halaman)
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus(); // Panggil saat DOM dimuat untuk semua halaman

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
