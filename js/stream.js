// Stream page functionality
document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication status
  const user = await checkAuthStatus();

  // Get stream ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const streamId = urlParams.get("id");

  if (streamId) {
    console.log("Loading stream:", streamId);
    loadStream(streamId);
  } else {
    // Redirect to home if no stream ID
    window.location.href = "index.html";
    return;
  }

  // Initialize chat functionality
  initializeChat(user);
});

function loadStream(streamId) {
  // Sample stream data
  const streamData = {
    example1: {
      title: "Live Gaming Session - Adventure Time!",
      streamer: "StreamerName123",
      description:
        "Bermain game petualangan seru dan mengobrol dengan viewers!",
    },
    example2: {
      title: "Music & Chill Stream",
      streamer: "GamerPro",
      description: "Mendengarkan musik sambil ngobrol santai",
    },
  };

  const stream = streamData[streamId] || {
    title: "Live Stream",
    streamer: "Unknown Streamer",
    description: "Live streaming content",
  };

  // Update page title and elements
  const streamTitle = document.getElementById("streamTitle");
  if (streamTitle) {
    streamTitle.textContent = `${stream.title} - Nabila Stream`;
  }

  const streamHeaderTitle = document.querySelector(".stream-header h1");
  if (streamHeaderTitle) {
    streamHeaderTitle.textContent = stream.title;
  }

  const streamerName = document.querySelector(".streamer-details span");
  if (streamerName) {
    streamerName.textContent = stream.streamer;
  }

  console.log("Stream loaded:", streamId, stream);
}

function initializeChat(user) {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  // Add some sample chat messages
  if (chatMessages) {
    addChatMessage(
      "StreamerName123",
      "Halo semua! Selamat datang di stream saya!",
    );
    addChatMessage("Viewer1", "Halo streamer! 👋");
    addChatMessage("Viewer2", "Game apa yang akan dimainkan hari ini?");
  }

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (message) {
        const username = user ? user.email.split("@")[0] : "Guest";
        addChatMessage(username, message);
        chatInput.value = "";
      }
    });
  }

  // Enable chat input only if user is logged in
  if (chatInput) {
    if (user) {
      chatInput.placeholder = "Ketik pesan Anda...";
    } else {
      chatInput.placeholder = "Login untuk mengirim pesan";
      chatInput.disabled = true;
    }
  }
}

function addChatMessage(username, message) {
  const chatMessages = document.getElementById("chatMessages");
  if (chatMessages) {
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message";
    messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}
