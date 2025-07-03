// Profile page functionality
document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is logged in
  const user = await checkAuthStatus();

  if (!user) {
    alert("Anda harus login terlebih dahulu");
    window.location.href = "Auth.html";
    return;
  }

  // Display user information
  loadUserProfile(user);
});

async function loadUserProfile(user) {
  try {
    // Update profile email
    const profileEmailElement = document.getElementById("profileEmail");
    if (profileEmailElement) {
      profileEmailElement.textContent = user.email;
    }

    // Update profile name (use part of email as name if no display name)
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) {
      const displayName =
        user.user_metadata?.full_name || user.email.split("@")[0];
      profileNameElement.textContent = displayName;
    }

    // Update join date
    const profileJoinedDateElement =
      document.getElementById("profileJoinedDate");
    if (profileJoinedDateElement) {
      const joinDate = new Date(user.created_at).toLocaleDateString("id-ID");
      profileJoinedDateElement.textContent = joinDate;
    }

    // Update bio
    const profileBioElement = document.getElementById("profileBio");
    if (profileBioElement) {
      profileBioElement.textContent =
        user.user_metadata?.bio || "Selamat datang di profil saya!";
    }

    console.log("Profile loaded for user:", user.email);
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}
