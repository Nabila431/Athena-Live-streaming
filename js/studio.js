// Studio page functionality
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Studio page loading...");

  // Wait for auth to be initialized
  if (typeof checkAuthStatus === "undefined") {
    console.log("Waiting for main.js to load...");
    setTimeout(() => window.location.reload(), 1000);
    return;
  }

  // Check if user is logged in
  const user = await checkAuthStatus();

  if (!user) {
    alert("Anda harus login terlebih dahulu untuk mengakses studio");
    window.location.href = "Auth.html";
    return;
  }

  console.log("Studio page loaded for user:", user.email);

  // Initialize studio functionality
  initializeStudioControls(user);
});

function initializeStudioControls(user) {
  const streamForm = document.getElementById("streamForm");
  const streamInfo = document.getElementById("streamInfo");
  const studioMessage = document.getElementById("studioMessage");

  if (streamForm) {
    streamForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await createLiveStream(user);
    });
  }

  const endStreamBtn = document.getElementById("endStreamBtn");
  if (endStreamBtn) {
    endStreamBtn.addEventListener("click", endLiveStream);
  }
}

async function createLiveStream(user) {
  const title = document.getElementById("streamTitleInput").value;
  const description = document.getElementById("streamDescriptionInput").value;
  const thumbnail = document.getElementById("streamThumbnailInput").value;

  if (!title.trim()) {
    showStudioMessage("Judul stream tidak boleh kosong", "error");
    return;
  }

  try {
    // Generate stream key and RTMP URL
    const streamKey = generateStreamKey();
    const rtmpUrl = "rtmp://live.nabila-stream.com/live";

    // Show stream information
    document.getElementById("streamKey").textContent = streamKey;
    document.getElementById("rtmpUrl").textContent = rtmpUrl;
    document.getElementById("streamInfo").style.display = "block";

    showStudioMessage(
      "Stream berhasil dibuat! Gunakan informasi di bawah untuk mulai live.",
      "success",
    );

    // Here you would normally save to database
    console.log("Stream created:", {
      title,
      description,
      thumbnail,
      streamKey,
      user: user.email,
    });
  } catch (error) {
    console.error("Error creating stream:", error);
    showStudioMessage("Gagal membuat stream: " + error.message, "error");
  }
}

function generateStreamKey() {
  return (
    "stream_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function endLiveStream() {
  document.getElementById("streamInfo").style.display = "none";
  showStudioMessage("Live stream telah diakhiri", "success");

  // Reset form
  document.getElementById("streamForm").reset();
}

function showStudioMessage(message, type = "error") {
  const messageElement = document.getElementById("studioMessage");
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `alert ${type}`;
    messageElement.style.display = "block";

    setTimeout(() => {
      messageElement.style.display = "none";
    }, 5000);
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    navigator.clipboard
      .writeText(element.textContent)
      .then(() => {
        alert("Berhasil disalin ke clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Gagal menyalin ke clipboard");
      });
  }
}
