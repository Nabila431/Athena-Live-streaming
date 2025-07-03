// Studio page functionality
document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "auth.html";
    return;
  }

  console.log("Studio page loaded for user:", user.email);

  // Add studio functionality here
  const startStreamBtn = document.getElementById("startStreamBtn");
  if (startStreamBtn) {
    startStreamBtn.addEventListener("click", () => {
      alert("Live streaming functionality will be implemented here");
    });
  }
});
