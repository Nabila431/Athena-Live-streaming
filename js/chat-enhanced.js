// Enhanced Chat System with Better UI and Real-time Features
class EnhancedChatManager {
  constructor() {
    this.messages = JSON.parse(localStorage.getItem("nabila_messages") || "{}");
    this.onlineUsers = JSON.parse(
      localStorage.getItem("nabila_online") || "[]",
    );
    this.currentRoom = "general";
    this.currentUser = null;
    this.typingUsers = new Set();
    this.lastMessageTime = {};
    this.init();
  }

  init() {
    if (!document.getElementById("messageForm")) return;

    console.log("Enhanced chat page loaded");
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
    this.addEnhancedFeatures();
  }

  addEnhancedFeatures() {
    this.addUserProfile();
    this.addFileUpload();
    this.addEmojiReactions();
    this.addTypingIndicator();
    this.addMessageSearch();
  }

  addUserProfile() {
    const chatHeader = document.querySelector(".chat-header");
    if (chatHeader && this.currentUser) {
      const userProfile = document.createElement("div");
      userProfile.className = "chat-user-profile";
      userProfile.innerHTML = `
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="user-profile-avatar">
                <div class="user-profile-info">
                    <span class="user-profile-name">${this.currentUser.displayName || this.currentUser.name}</span>
                    <span class="user-profile-status">🟢 Online</span>
                </div>
            `;
      chatHeader.appendChild(userProfile);
    }
  }

  addFileUpload() {
    const messageForm = document.getElementById("messageForm");
    if (messageForm) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "chatFileInput";
      fileInput.accept = "image/*,video/*,.pdf,.doc,.docx";
      fileInput.style.display = "none";

      messageForm.appendChild(fileInput);

      fileInput.addEventListener("change", (e) => this.handleFileUpload(e));
    }
  }

  addEmojiReactions() {
    // Will be set up when messages are rendered
  }

  addTypingIndicator() {
    const messagesContainer = document.getElementById("messagesContainer");
    if (messagesContainer) {
      const typingIndicator = document.createElement("div");
      typingIndicator.id = "typingIndicator";
      typingIndicator.className = "typing-indicator";
      typingIndicator.style.display = "none";
      messagesContainer.appendChild(typingIndicator);
    }
  }

  addMessageSearch() {
    const chatMainHeader = document.querySelector(".chat-main-header");
    if (chatMainHeader) {
      const searchContainer = document.createElement("div");
      searchContainer.className = "message-search";
      searchContainer.innerHTML = `
                <input type="text" id="messageSearchInput" placeholder="Search messages..." class="search-input">
                <button id="searchToggle" class="btn-icon">🔍</button>
            `;

      chatMainHeader.appendChild(searchContainer);

      document.getElementById("searchToggle").addEventListener("click", () => {
        this.toggleSearch();
      });

      document
        .getElementById("messageSearchInput")
        .addEventListener("input", (e) => {
          this.searchMessages(e.target.value);
        });
    }
  }

  showGuestMessage() {
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessage = document.getElementById("chatMessage");

    if (chatMessage) {
      chatMessage.innerHTML = `
                <div class="guest-welcome">
                    🔒 <strong>Login untuk bergabung dengan komunitas chat</strong><br>
                    <small>Ribuan member aktif sedang mengobrol sekarang!</small><br>
                    <a href="Auth.html" class="btn" style="margin-top: 10px;">Login Sekarang</a>
                </div>
            `;
      chatMessage.className = "alert info";
      chatMessage.style.display = "block";
    }

    if (messageInput) messageInput.placeholder = "Login untuk chat...";

    // Show demo messages for guests
    this.loadDemoMessages();
  }

  loadDemoMessages() {
    const container = document.getElementById("messagesContainer");
    if (!container) return;

    const demoMessages = [
      {
        author: {
          name: "Alex Gaming",
          avatar:
            "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=face",
        },
        content: "Ada yang main Mobile Legends? Let's team up! 🎮",
        timestamp: Date.now() - 300000,
      },
      {
        author: {
          name: "Sarah Music",
          avatar:
            "https://images.pexels.com/photos/1391487/pexels-photo-1391487.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=face",
        },
        content:
          "Baru selesai streaming acoustic session, thanks yang udah nonton! 🎵",
        timestamp: Date.now() - 180000,
      },
      {
        author: {
          name: "Tech Enthusiast",
          avatar:
            "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=face",
        },
        content:
          "Tips streaming: gunakan lighting yang bagus untuk kualitas video terbaik 💡",
        timestamp: Date.now() - 120000,
      },
    ];

    container.innerHTML =
      demoMessages
        .map(
          (msg) => `
            <div class="message other-message demo-message">
                <div class="message-content">
                    <img src="${msg.author.avatar}" alt="${msg.author.name}" class="message-avatar">
                    <div class="message-bubble">
                        <div class="message-author">${msg.author.name}</div>
                        <div class="message-text">${msg.content}</div>
                        <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                    </div>
                </div>
            </div>
        `,
        )
        .join("") +
      `
            <div class="demo-overlay">
                <div class="demo-message-overlay">
                    <h3>💬 Bergabunglah dengan percakapan!</h3>
                    <p>Login untuk mulai chatting dengan komunitas</p>
                    <a href="Auth.html" class="btn">Login Sekarang</a>
                </div>
            </div>
        `;
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
      room: this.currentRoom,
    });

    localStorage.setItem("nabila_online", JSON.stringify(this.onlineUsers));
  }

  setupEventListeners() {
    // Message form
    const messageForm = document.getElementById("messageForm");
    if (messageForm) {
      messageForm.addEventListener("submit", (e) => this.handleSendMessage(e));
    }

    // Room switching
    document.querySelectorAll(".room-item").forEach((room) => {
      room.addEventListener("click", (e) => this.switchRoom(e));
    });

    // Enhanced emoji button
    const emojiBtn = document.getElementById("emojiBtn");
    if (emojiBtn) {
      emojiBtn.addEventListener("click", () => this.showEmojiPicker());
    }

    // Enhanced attach button
    const attachBtn = document.getElementById("attachBtn");
    if (attachBtn) {
      attachBtn.addEventListener("click", () => this.showAttachMenu());
    }

    // Typing indicator
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
      messageInput.addEventListener("input", () => this.handleTyping());
      messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          messageForm.dispatchEvent(new Event("submit"));
        }
      });
    }

    // Message reactions
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("reaction-btn")) {
        this.handleReaction(e);
      }
    });
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
    this.addUserOnline(); // Update user's current room
  }

  updateChatHeader() {
    const roomInfo = {
      general: {
        title: "🌟 General Chat",
        desc: "Chat umum untuk semua member",
        members: this.getOnlineUsersInRoom("general").length,
      },
      gaming: {
        title: "🎮 Gaming Chat",
        desc: "Diskusi tentang game favorit",
        members: this.getOnlineUsersInRoom("gaming").length,
      },
      music: {
        title: "🎵 Music Chat",
        desc: "Berbagi musik dan playlist",
        members: this.getOnlineUsersInRoom("music").length,
      },
      tech: {
        title: "💻 Tech Talk",
        desc: "Teknologi dan streaming tips",
        members: this.getOnlineUsersInRoom("tech").length,
      },
    };

    const info = roomInfo[this.currentRoom] || roomInfo.general;

    document.getElementById("currentChatTitle").textContent = info.title;
    document.getElementById("currentChatDescription").textContent =
      `${info.desc} • ${info.members} online`;
  }

  getOnlineUsersInRoom(room) {
    const now = Date.now();
    return this.onlineUsers.filter(
      (user) => user.room === room && now - user.lastSeen < 5 * 60 * 1000,
    );
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
        name: this.currentUser.displayName || this.currentUser.name,
        avatar: this.currentUser.avatar,
      },
      room: this.currentRoom,
      timestamp: Date.now(),
      type: "text",
      reactions: {},
      edited: false,
    };

    this.addMessage(message);
    messageInput.value = "";
    this.loadMessages();

    // Show sent animation
    this.showSentAnimation();
  }

  handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      this.showAlert("File terlalu besar! Maksimal 10MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const message = {
        id: Date.now().toString(),
        content: `Shared a file: ${file.name}`,
        author: {
          id: this.currentUser.id,
          name: this.currentUser.displayName || this.currentUser.name,
          avatar: this.currentUser.avatar,
        },
        room: this.currentRoom,
        timestamp: Date.now(),
        type: "file",
        fileData: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
        },
        reactions: {},
      };

      this.addMessage(message);
      this.loadMessages();
    };

    reader.readAsDataURL(file);
    e.target.value = ""; // Clear input
  }

  showSentAnimation() {
    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn) {
      sendBtn.innerHTML = "✓";
      sendBtn.style.background = "#4CAF50";

      setTimeout(() => {
        sendBtn.innerHTML = "Kirim";
        sendBtn.style.background = "";
      }, 1000);
    }
  }

  addMessage(message) {
    if (!this.messages[message.room]) {
      this.messages[message.room] = [];
    }

    this.messages[message.room].push(message);

    // Keep only last 200 messages per room
    if (this.messages[message.room].length > 200) {
      this.messages[message.room] = this.messages[message.room].slice(-200);
    }

    localStorage.setItem("nabila_messages", JSON.stringify(this.messages));
    this.lastMessageTime[message.room] = message.timestamp;
  }

  loadMessages() {
    const container = document.getElementById("messagesContainer");
    if (!container) return;

    const roomMessages = this.messages[this.currentRoom] || [];

    if (roomMessages.length === 0) {
      container.innerHTML = `
                <div class="empty-chat">
                    <div class="empty-chat-content">
                        <h3>💬 Selamat datang di ${this.currentRoom} chat!</h3>
                        <p>Mulai percakapan dengan mengirim pesan pertama!</p>
                        <div class="chat-tips">
                            <p><strong>Tips:</strong></p>
                            <ul>
                                <li>📎 Klik attach untuk kirim file</li>
                                <li>😀 Gunakan emoji untuk ekspresi</li>
                                <li>👍 React ke pesan dengan klik reaction</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
      return;
    }

    container.innerHTML = roomMessages
      .map((msg) => this.renderMessage(msg))
      .join("");

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Update typing indicator position
    this.updateTypingIndicator();
  }

  renderMessage(message) {
    const isOwn = this.currentUser && message.author.id === this.currentUser.id;
    const timeStr = this.formatTime(message.timestamp);

    let messageContent = "";
    if (message.type === "file") {
      messageContent = this.renderFileMessage(message);
    } else {
      messageContent = this.formatMessageContent(message.content);
    }

    const reactions = this.renderReactions(message.reactions);

    return `
            <div class="message ${isOwn ? "own-message" : "other-message"}" data-message-id="${message.id}">
                <div class="message-content">
                    ${
                      !isOwn
                        ? `
                        <img src="${message.author.avatar}" alt="${message.author.name}" class="message-avatar" loading="lazy">
                    `
                        : ""
                    }
                    <div class="message-bubble">
                        ${!isOwn ? `<div class="message-author">${message.author.name}</div>` : ""}
                        <div class="message-text">${messageContent}</div>
                        <div class="message-meta">
                            <span class="message-time">${timeStr}</span>
                            ${message.edited ? '<span class="edited-indicator">edited</span>' : ""}
                        </div>
                        ${reactions}
                    </div>
                    ${
                      isOwn
                        ? `
                        <img src="${message.author.avatar}" alt="${message.author.name}" class="message-avatar" loading="lazy">
                    `
                        : ""
                    }
                </div>
                <div class="message-actions">
                    <button class="react-btn" data-message-id="${message.id}" title="React">👍</button>
                    <button class="reply-btn" data-message-id="${message.id}" title="Reply">↩️</button>
                    ${isOwn ? `<button class="delete-msg-btn" data-message-id="${message.id}" title="Delete">🗑️</button>` : ""}
                </div>
            </div>
        `;
  }

  renderFileMessage(message) {
    const file = message.fileData;

    if (file.type.startsWith("image/")) {
      return `
                <div class="file-message image-file">
                    <img src="${file.data}" alt="${file.name}" class="chat-image" onclick="openChatImageModal('${file.data}')">
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                </div>
            `;
    } else if (file.type.startsWith("video/")) {
      return `
                <div class="file-message video-file">
                    <video controls class="chat-video">
                        <source src="${file.data}" type="${file.type}">
                    </video>
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                </div>
            `;
    } else {
      return `
                <div class="file-message document-file">
                    <div class="file-icon">📄</div>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                        <button class="download-btn" onclick="downloadChatFile('${file.data}', '${file.name}')">Download</button>
                    </div>
                </div>
            `;
    }
  }

  renderReactions(reactions) {
    if (!reactions || Object.keys(reactions).length === 0) return "";

    return `
            <div class="message-reactions">
                ${Object.entries(reactions)
                  .map(
                    ([emoji, users]) => `
                    <span class="reaction ${users.includes(this.currentUser?.id) ? "user-reacted" : ""}" 
                          onclick="toggleReaction('${emoji}', '${this.currentMessage?.id}')">
                        ${emoji} ${users.length}
                    </span>
                `,
                  )
                  .join("")}
            </div>
        `;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  formatMessageContent(content) {
    // Enhanced text formatting
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    content = content.replace(/\*(.*?)\*/g, "<em>$1</em>");
    content = content.replace(/`(.*?)`/g, "<code>$1</code>");
    content = content.replace(/\n/g, "<br>");

    // Auto-link URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(
      urlRegex,
      '<a href="$1" target="_blank" rel="noopener">$1</a>',
    );

    // Enhanced emoji support
    const emojiMap = {
      ":)": "😊",
      ":(": "😢",
      ":D": "😃",
      ":P": "😛",
      "<3": "❤️",
      ":heart:": "❤️",
      ":fire:": "🔥",
      ":thumbs_up:": "👍",
      ":laugh:": "😂",
      ":wink:": "😉",
      ":cool:": "😎",
      ":party:": "🎉",
    };

    Object.keys(emojiMap).forEach((shortcut) => {
      const regex = new RegExp(
        shortcut.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g",
      );
      content = content.replace(regex, emojiMap[shortcut]);
    });

    return content;
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
      "🚀",
      "⭐",
      "🌟",
      "💫",
      "✨",
      "🎮",
      "🎵",
      "💻",
      "📱",
      "🍕",
      "☕",
      "🌈",
      "🦄",
      "👑",
      "💎",
    ];

    const messageInput = document.getElementById("messageInput");

    // Remove existing picker
    const existingPicker = document.getElementById("enhancedEmojiPicker");
    if (existingPicker) {
      existingPicker.remove();
      return;
    }

    const picker = document.createElement("div");
    picker.id = "enhancedEmojiPicker";
    picker.className = "enhanced-emoji-picker";
    picker.innerHTML = `
            <div class="emoji-picker-header">
                <span>Pilih Emoji</span>
                <button onclick="document.getElementById('enhancedEmojiPicker').remove()">×</button>
            </div>
            <div class="emoji-grid">
                ${emojis
                  .map(
                    (emoji) =>
                      `<button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`,
                  )
                  .join("")}
            </div>
        `;

    document.body.appendChild(picker);

    // Position picker
    const rect = messageInput.getBoundingClientRect();
    picker.style.position = "fixed";
    picker.style.bottom = window.innerHeight - rect.top + 10 + "px";
    picker.style.right = "20px";
    picker.style.zIndex = "10000";

    // Add emoji to text
    picker.addEventListener("click", (e) => {
      if (e.target.classList.contains("emoji-btn")) {
        const emoji = e.target.dataset.emoji;
        const cursorPos = messageInput.selectionStart;
        const text = messageInput.value;
        messageInput.value =
          text.substring(0, cursorPos) + emoji + text.substring(cursorPos);
        picker.remove();
        messageInput.focus();
      }
    });
  }

  showAttachMenu() {
    const attachMenu = document.createElement("div");
    attachMenu.className = "enhanced-attach-menu";
    attachMenu.innerHTML = `
            <div class="attach-menu-header">File & Media</div>
            <div class="attach-options">
                <button class="attach-option" onclick="document.getElementById('chatFileInput').click()">
                    <span class="option-icon">📷</span>
                    <span class="option-text">Photo/Video</span>
                </button>
                <button class="attach-option" onclick="document.getElementById('chatFileInput').click()">
                    <span class="option-icon">📄</span>
                    <span class="option-text">Document</span>
                </button>
                <button class="attach-option" onclick="shareLocation()">
                    <span class="option-icon">📍</span>
                    <span class="option-text">Location</span>
                </button>
                <button class="attach-option" onclick="shareContact()">
                    <span class="option-icon">👤</span>
                    <span class="option-text">Contact</span>
                </button>
            </div>
        `;

    document.body.appendChild(attachMenu);

    // Position menu
    const attachBtn = document.getElementById("attachBtn");
    const rect = attachBtn.getBoundingClientRect();
    attachMenu.style.position = "fixed";
    attachMenu.style.bottom = window.innerHeight - rect.top + 10 + "px";
    attachMenu.style.left = rect.left + "px";
    attachMenu.style.zIndex = "10000";

    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", function closeAttach(e) {
        if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
          attachMenu.remove();
          document.removeEventListener("click", closeAttach);
        }
      });
    }, 100);
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
      container.innerHTML = '<div class="no-users">Tidak ada user online</div>';
      return;
    }

    container.innerHTML = onlineUsers
      .map(
        (user) => `
            <div class="user-item ${user.id === this.currentUser?.id ? "current-user" : ""}" data-user-id="${user.id}">
                <img src="${user.avatar}" alt="${user.name}" class="user-avatar" loading="lazy">
                <div class="user-info">
                    <div class="user-name">${user.displayName || user.name}</div>
                    <div class="user-status">🟢 ${user.room || "general"}</div>
                </div>
                ${
                  user.id !== this.currentUser?.id
                    ? `
                    <button class="dm-btn" onclick="startDM('${user.id}')" title="Direct Message">💬</button>
                `
                    : ""
                }
            </div>
        `,
      )
      .join("");
  }

  updateTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    if (!indicator) return;

    if (this.typingUsers.size > 0) {
      const users = Array.from(this.typingUsers);
      const names = users.slice(0, 3).join(", ");
      const more = users.length > 3 ? ` and ${users.length - 3} more` : "";

      indicator.innerHTML = `
                <div class="typing-animation">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
                <span class="typing-text">${names}${more} is typing...</span>
            `;
      indicator.style.display = "block";
    } else {
      indicator.style.display = "none";
    }
  }

  handleTyping() {
    // Simulate typing indicator (in real app, this would be sent to server)
    if (Math.random() > 0.7) {
      this.typingUsers.add("Someone");
      this.updateTypingIndicator();

      setTimeout(() => {
        this.typingUsers.delete("Someone");
        this.updateTypingIndicator();
      }, 3000);
    }
  }

  startHeartbeat() {
    // Update user online status every minute
    setInterval(() => {
      if (this.currentUser) {
        this.addUserOnline();
        this.loadOnlineUsers();
        this.updateChatHeader();
      }
    }, 60000);

    // Simulate new messages every 30 seconds for demo
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.simulateIncomingMessage();
      }
    }, 30000);
  }

  simulateIncomingMessage() {
    if (!this.currentUser) return;

    const demoMessages = [
      "Hey everyone! 👋",
      "Anyone up for a gaming session? 🎮",
      "Just finished my stream, thanks for watching! 📺",
      "Check out this cool feature I found! 💡",
      "Good morning chat! ☀️",
    ];

    const demoUsers = [
      {
        name: "StreamerPro",
        avatar:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "GamerGirl",
        avatar:
          "https://images.pexels.com/photos/1391487/pexels-photo-1391487.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "MusicMaker",
        avatar:
          "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=face",
      },
    ];

    const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    const randomMessage =
      demoMessages[Math.floor(Math.random() * demoMessages.length)];

    const message = {
      id: Date.now().toString(),
      content: randomMessage,
      author: {
        id: "demo_" + Date.now(),
        name: randomUser.name,
        avatar: randomUser.avatar,
      },
      room: this.currentRoom,
      timestamp: Date.now(),
      type: "text",
      reactions: {},
    };

    this.addMessage(message);
    this.loadMessages();

    // Show notification
    this.showNotification(`${randomUser.name}: ${randomMessage}`);
  }

  showNotification(message) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Nabila Stream Chat", {
        body: message,
        icon: "/assets/logo.svg",
      });
    }
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
    window.authSystem?.showAlert(message, type);
  }

  toggleSearch() {
    const searchInput = document.getElementById("messageSearchInput");
    if (searchInput.style.display === "none" || !searchInput.style.display) {
      searchInput.style.display = "block";
      searchInput.focus();
    } else {
      searchInput.style.display = "none";
      searchInput.value = "";
      this.loadMessages(); // Reset messages
    }
  }

  searchMessages(query) {
    if (!query.trim()) {
      this.loadMessages();
      return;
    }

    const container = document.getElementById("messagesContainer");
    const roomMessages = this.messages[this.currentRoom] || [];

    const filteredMessages = roomMessages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(query.toLowerCase()) ||
        msg.author.name.toLowerCase().includes(query.toLowerCase()),
    );

    if (filteredMessages.length === 0) {
      container.innerHTML = `
                <div class="no-search-results">
                    <h3>🔍 No messages found</h3>
                    <p>Try different keywords</p>
                </div>
            `;
    } else {
      container.innerHTML = filteredMessages
        .map((msg) => this.renderMessage(msg))
        .join("");
    }
  }
}

// Global functions for chat features
window.openChatImageModal = function (src) {
  const modal = document.createElement("div");
  modal.className = "chat-image-modal";
  modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()">
            <img src="${src}" alt="Chat image" onclick="event.stopPropagation()">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
  document.body.appendChild(modal);
};

window.downloadChatFile = function (data, filename) {
  const link = document.createElement("a");
  link.href = data;
  link.download = filename;
  link.click();
};

window.shareLocation = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const message = `📍 My location: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
      document.getElementById("messageInput").value = message;
    });
  } else {
    alert("Geolocation not supported");
  }
};

window.shareContact = function () {
  const user = window.authSystem?.getCurrentUser();
  if (user) {
    const message = `👤 Contact: ${user.displayName || user.name} (${user.email})`;
    document.getElementById("messageInput").value = message;
  }
};

window.startDM = function (userId) {
  alert(`Starting DM with user ${userId} - Feature coming soon!`);
};

// Initialize enhanced chat manager
document.addEventListener("DOMContentLoaded", () => {
  window.chatManager = new EnhancedChatManager();

  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});
