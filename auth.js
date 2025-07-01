auth.js

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleAuth = document.getElementById('toggleAuth');
    const showRegisterLink = document.getElementById('showRegister');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const authMessage = document.getElementById('authMessage');

    let isRegisterMode = false;

    // Fungsi untuk menampilkan pesan
    function displayMessage(message, type) {
        authMessage.textContent = message;
        authMessage.className = `alert ${type}`;
        authMessage.style.display = 'block';
    }

    // Toggle antara Login dan Register
    if (toggleAuth && showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            isRegisterMode = !isRegisterMode;
            authTitle.textContent = isRegisterMode ? 'Daftar' : 'Login';
            authSubmitBtn.textContent = isRegisterMode ? 'Daftar' : 'Login';
            confirmPasswordGroup.style.display = isRegisterMode ? 'block' : 'none';
            toggleAuth.innerHTML = isRegisterMode ? 'Sudah punya akun? <a href="#" id="showLogin">Login Sekarang</a>' : 'Belum punya akun? <a href="#" id="showRegister">Daftar Sekarang</a>';

            // Re-attach event listener for the new link
            const newLink = document.getElementById(isRegisterMode ? 'showLogin' : 'showRegister');
            if (newLink) {
                newLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    isRegisterMode = !isRegisterMode; // Toggle back
                    authTitle.textContent = isRegisterMode ? 'Daftar' : 'Login';
                    authSubmitBtn.textContent = isRegisterMode ? 'Daftar' : 'Login';
                    confirmPasswordGroup.style.display = isRegisterMode ? 'block' : 'none';
                    toggleAuth.innerHTML = isRegisterMode ? 'Sudah punya akun? <a href="#" id="showLogin">Login Sekarang</a>' : 'Belum punya akun? <a href="#" id="showRegister">Daftar Sekarang</a>';
                    // This creates a cycle, you might want to simplify
                    // by just toggling isRegisterMode and then calling a function to update UI
                });
            }
            authMessage.style.display = 'none'; // Sembunyikan pesan saat toggle
        });
    }


    // Handle form submission (Login or Register)
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            authMessage.style.display = 'none'; // Sembunyikan pesan sebelumnya

            if (isRegisterMode && password !== confirmPassword) {
                displayMessage('Password dan konfirmasi password tidak cocok.', 'error');
                return;
            }

            let response;
            if (isRegisterMode) {
                response = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });
            } else {
                response = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
            }

            const { data, error } = response;

            if (error) {
                displayMessage(error.message, 'error');
                console.error('Authentication Error:', error.message);
            } else {
                if (isRegisterMode && !data.user) {
                     // Supabase signUp might not return user immediately if email confirmation is required
                    displayMessage('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.', 'success');
                } else if (data.user) {
                    displayMessage(isRegisterMode ? 'Pendaftaran & Login berhasil!' : 'Login berhasil!', 'success');
                    console.log('User Data:', data.user);
                    // Redirect to home or profile page after successful login
                    setTimeout(() => {
                        window.location.href = 'profile.html'; // Redirect ke halaman profil setelah login
                    }, 1000);
                }
            }
        });
    }
});
