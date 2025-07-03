// Profile page functionality
document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "auth.html";
    return;
  }

  // Display user information
  const userEmailElement = document.getElementById("userEmail");
  if (userEmailElement) {
    userEmailElement.textContent = user.email;
  }

  console.log("Profile page loaded for user:", user.email);
});
