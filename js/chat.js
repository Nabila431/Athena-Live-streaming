// Chat and Messaging System
class ChatManager {
  constructor() {
    this.messages = JSON.parse(localStorage.getItem("nabila_messages") || "{}");
    this.onlineUsers = JSON.parse(
      localStorage.getItem("nabila_online") || "[]",
    );
    this.currentRoom = "general";
    this.currentUser = null;
    this.init();
  }

  init() {
    if (!document.getElementById("messageForm")) return;

    console.log("Chat page loaded");
    this.currentUser = window.authSystem?.getCurrentUser();

    if (!this.currentUser) {
      this.showGuestMessage();
      return;
    }

    this.addUserOnline();
    this.setupEventListeners();
    this.loadMessages();
    this.loadOnlineUsers();
    this.startHeartbeat();
  }

  showGuestMessage() {
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessage = document.getElementById("chatMessage");

    if (chatMessage) {
      chatMessage.textContent =
        "🔒 Login untuk mulai chatting dengan komunitas";
      chatMessage.className = "alert info";
      chatMessage.style.display = "block";
    }

    // Keep inputs disabled
    if (messageInput) messageInput.placeholder = "Login untuk chat...";
  }

  addUserOnline() {
    if (!this.currentUser) return;

    // Remove user if already online
    this.onlineUsers = this.onlineUsers.filter(
      (u) => u.id !== this.currentUser.id,
    );

    // Add user with timestamp
    this.onlineUsers.push({
      ...this.currentUser,
      lastSeen: Date.now(),
    });

    localStorage.setItem("nabila_online", JSON.stringify(this.onlineUsers));
  }

  setupEventListeners() {
    // Message form
    const messageForm = document.getElementById("messageForm");
    if (messageForm) {
      messageForm.addEventListener("submit", (e) => this.handleSendMessage(e));

      // Enable inputs for logged in users
      const messageInput = document.getElementById("messageInput");
      const sendBtn = document.getElementById("sendBtn");
      if (messageInput && sendBtn) {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.placeholder = "Ketik pesan Anda...";
      }
    }

    // Room switching
    document.querySelectorAll(".room-item").forEach((room) => {
      room.addEventListener("click", (e) => this.switchRoom(e));
    });

    // Emoji button
    const emojiBtn = document.getElementById("emojiBtn");
    if (emojiBtn) {
      emojiBtn.addEventListener("click", () => this.showEmojiPicker());
    }

    // Attach button
    const attachBtn = document.getElementById("attachBtn");
    if (attachBtn) {
      attachBtn.addEventListener("click", () => this.showAttachMenu());
    }

    // Auto-resize input
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
      messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          messageForm.dispatchEvent(new Event("submit"));
        }
      });
    }
  }

  switchRoom(e) {
    const roomElement = e.currentTarget;
    const roomId = roomElement.dataset.room;

    // Update active room
    document
      .querySelectorAll(".room-item")
      .forEach((r) => r.classList.remove("active"));
    roomElement.classList.add("active");

    this.currentRoom = roomId;
    this.updateChatHeader();
    this.loadMessages();
  }

  updateChatHeader() {
    const roomInfo = {
      general: {
        title: "🌟 General Chat",
        desc: "Chat umum untuk semua member",
      },
      gaming: { title: "🎮 Gaming Chat", desc: "Diskusi tentang game favorit" },
      music: { title: "🎵 Music Chat", desc: "Berbagi musik dan playlist" },
      tech: { title: "💻 Tech Talk", desc: "Teknologi dan streaming tips" },
    };

    const info = roomInfo[this.currentRoom] || roomInfo.general;

    document.getElementById("currentChatTitle").textContent = info.title;
    document.getElementById("currentChatDescription").textContent = info.desc;
  }

  handleSendMessage(e) {
    e.preventDefault();

    if (!this.currentUser) return;

    const messageInput = document.getElementById("messageInput");
    const content = messageInput.value.trim();

    if (!content) return;

    const message = {
      id: Date.now().toString(),
      content,
      author: {
        id: this.currentUser.id,
        name: this.currentUser.name,
        avatar: this.currentUser.avatar,
      },
      room: this.currentRoom,
      timestamp: Date.now(),
      type: "text",
    };

    this.addMessage(message);
    messageInput.value = "";
    this.loadMessages();
  }

  addMessage(message) {
    if (!this.messages[message.room]) {
      this.messages[message.room] = [];
    }

    this.messages[message.room].push(message);

    // Keep only last 100 messages per room
    if (this.messages[message.room].length > 100) {
      this.messages[message.room] = this.messages[message.room].slice(-100);
    }

    localStorage.setItem("nabila_messages", JSON.stringify(this.messages));
  }

  loadMessages() {
    const container = document.getElementById("messagesContainer");
    if (!container) return;

    const roomMessages = this.messages[this.currentRoom] || [];

    if (roomMessages.length === 0) {
      container.innerHTML = `
                <div class="empty-chat">
                    <h3>💬 Belum ada pesan di room ini</h3>
                    <p>Mulai percakapan dengan mengirim pesan pertama!</p>
                </div>
            `;
      return;
    }

    container.innerHTML = roomMessages
      .map((msg) => this.renderMessage(msg))
      .join("");

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Add message interactions
    this.setupMessageInteractions();
  }

  renderMessage(message) {
    const isOwn = this.currentUser && message.author.id === this.currentUser.id;
    const timeStr = this.formatTime(message.timestamp);

    return `
            <div class="message ${isOwn ? "own-message" : "other-message"}" data-message-id="${message.id}">
                <div class="message-content">
                    ${
                      !isOwn
                        ? `
                        <img src="${message.author.avatar}" alt="${message.author.name}" class="message-avatar">
                    `
                        : ""
                    }
                    <div class="message-bubble">
                        ${!isOwn ? `<div class="message-author">${message.author.name}</div>` : ""}
                        <div class="message-text">${this.formatMessageContent(message.content)}</div>
                        <div class="message-time">${timeStr}</div>
                    </div>
                    ${
                      isOwn
                        ? `
                        <img src="${message.author.avatar}" alt="${message.author.name}" class="message-avatar">
                    `
                        : ""
                    }
                </div>
                <div class="message-actions">
                    <button class="react-btn" data-message-id="${message.id}">👍</button>
                    <button class="reply-btn" data-message-id="${message.id}">↩️</button>
                    ${isOwn ? `<button class="delete-msg-btn" data-message-id="${message.id}">🗑️</button>` : ""}
                </div>
            </div>
        `;
  }

  formatMessageContent(content) {
    // Simple text formatting
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Bold
    content = content.replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italic
    content = content.replace(/`(.*?)`/g, "<code>$1</code>"); // Code

    // Auto-link URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

    // Emoji shortcuts
    const emojiMap = {
      ":)": "😊",
      ":(": "😢",
      ":D": "😃",
      ":P": "😛",
      "<3": "❤️",
      ":heart:": "❤️",
      ":fire:": "🔥",
      ":thumbs_up:": "👍",
    };

    Object.keys(emojiMap).forEach((shortcut) => {
      content = content.replace(
        new RegExp(shortcut.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        emojiMap[shortcut],
      );
    });

    return content;
  }

  setupMessageInteractions() {
    // React buttons
    document.querySelectorAll(".react-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleReaction(e));
    });

    // Reply buttons
    document.querySelectorAll(".reply-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleReply(e));
    });

    // Delete buttons
    document.querySelectorAll(".delete-msg-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleDeleteMessage(e));
    });
  }

  handleReaction(e) {
    const messageId = e.target.dataset.messageId;
    console.log("React to message:", messageId);
    // In a real app, this would send a reaction to the server
    this.showAlert("Reaksi dikirim! 👍", "success");
  }

  handleReply(e) {
    const messageId = e.target.dataset.messageId;
    const messageInput = document.getElementById("messageInput");

    if (messageInput) {
      messageInput.focus();
      messageInput.placeholder = "Membalas pesan...";
    }
  }

  handleDeleteMessage(e) {
    if (!confirm("Hapus pesan ini?")) return;

    const messageId = e.target.dataset.messageId;

    if (this.messages[this.currentRoom]) {
      this.messages[this.currentRoom] = this.messages[this.currentRoom].filter(
        (msg) => msg.id !== messageId,
      );
      localStorage.setItem("nabila_messages", JSON.stringify(this.messages));
      this.loadMessages();
    }
  }

  showEmojiPicker() {
    const emojis = [
      "😀",
      "😂",
      "❤️",
      "👍",
      "👎",
      "🔥",
      "💯",
      "🎉",
      "👏",
      "🙏",
      "🤔",
      "😭",
      "😍",
      "🤗",
      "😎",
    ];
    const messageInput = document.getElementById("messageInput");

    // Simple emoji picker (in real app, use a proper emoji picker library)
    const emojiMenu = document.createElement("div");
    emojiMenu.className = "emoji-picker";
    emojiMenu.innerHTML = emojis
      .map((emoji) => `<button class="emoji-btn">${emoji}</button>`)
      .join("");

    emojiMenu.style.cssText = `
            position: absolute;
            bottom: 60px;
            right: 50px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 5px;
            z-index: 1000;
        `;

    document.body.appendChild(emojiMenu);

    // Add emoji to input
    emojiMenu.addEventListener("click", (e) => {
      if (e.target.classList.contains("emoji-btn")) {
        messageInput.value += e.target.textContent;
        document.body.removeChild(emojiMenu);
        messageInput.focus();
      }
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", function closeEmoji(e) {
        if (!emojiMenu.contains(e.target)) {
          if (document.body.contains(emojiMenu)) {
            document.body.removeChild(emojiMenu);
          }
          document.removeEventListener("click", closeEmoji);
        }
      });
    }, 100);
  }

  showAttachMenu() {
    // Simple attachment menu
    const attachMenu = `
            <div class="attach-menu" style="
                position: absolute;
                bottom: 60px;
                left: 10px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 10px;
                z-index: 1000;
            ">
                <button class="attach-option">📷 Foto</button>
                <button class="attach-option">🎵 Audio</button>
                <button class="attach-option">📄 File</button>
                <button class="attach-option">📍 Lokasi</button>
            </div>
        `;

    // In a real app, this would handle file uploads
    this.showAlert("Fitur upload akan segera hadir! 📎", "info");
  }

  loadOnlineUsers() {
    const container = document.getElementById("onlineUsersList");
    if (!container) return;

    // Filter users online in last 5 minutes
    const now = Date.now();
    const onlineUsers = this.onlineUsers.filter(
      (user) => now - user.lastSeen < 5 * 60 * 1000,
    );

    if (onlineUsers.length === 0) {
      container.innerHTML = '<p class="no-users">Tidak ada user online</p>';
      return;
    }

    container.innerHTML = onlineUsers
      .map(
        (user) => `
            <div class="user-item ${user.id === this.currentUser?.id ? "current-user" : ""}" data-user-id="${user.id}">
                <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-status">🟢 Online</div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  startHeartbeat() {
    // Update user online status every minute
    setInterval(() => {
      if (this.currentUser) {
        this.addUserOnline();
        this.loadOnlineUsers();
      }
    }, 60000);

    // Auto-refresh messages every 10 seconds
    setInterval(() => {
      this.loadMessages();
    }, 10000);
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  showAlert(message, type = "info") {
    const alertDiv = document.getElementById("chatMessage");
    if (alertDiv) {
      alertDiv.textContent = message;
      alertDiv.className = `alert ${type}`;
      alertDiv.style.display = "block";

      setTimeout(() => {
        alertDiv.style.display = "none";
      }, 3000);
    }
  }
}

// Initialize chat manager
document.addEventListener("DOMContentLoaded", () => {
  window.chatManager = new ChatManager();
});
