// Stream page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get stream ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const streamId = urlParams.get("id");

  if (streamId) {
    console.log("Loading stream:", streamId);
    // Load stream data and initialize player
    loadStream(streamId);
  }

  // Initialize chat functionality
  initializeChat();
});

function loadStream(streamId) {
  // Placeholder for stream loading logic
  const streamTitle = document.getElementById("streamTitle");
  if (streamTitle) {
    streamTitle.textContent = `Live Stream ${streamId} - Nabila Stream`;
  }

  console.log("Stream loaded:", streamId);
}

function initializeChat() {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (message) {
        addChatMessage("You", message);
        chatInput.value = "";
      }
    });
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
