// AI Support Chat System
class AISupportSystem {
  constructor() {
    this.isOpen = false;
    this.responses = {
      greeting: [
        "Halo! Selamat datang di Nabila Stream! 👋 Ada yang bisa saya bantu?",
        "Hi! Saya AI Assistant Nabila Stream. Bagaimana saya bisa membantu Anda hari ini?",
        "Halo! Terima kasih sudah menggunakan Nabila Stream. Ada pertanyaan tentang platform kami?",
      ],
      payment: {
        gopay:
          "Untuk pembayaran GoPay:\n💳 Nomor: 0895340205302\n👤 A.n: Admin Nabila Stream\n\nSetelah transfer, konfirmasi via WhatsApp admin di 085810526151",
        bank: "Untuk transfer bank:\n🏦 Bank: BCA\n💳 No. Rek: 1234567890\n👤 A.n: Admin Nabila Stream\n\nSetelah transfer, konfirmasi via WhatsApp admin di 085810526151",
        general:
          "Kami menerima pembayaran via:\n💳 GoPay: 0895340205302\n🏦 Transfer Bank BCA: 1234567890\n\nSemua atas nama Admin Nabila Stream. Konfirmasi via WhatsApp: 085810526151",
      },
      shop: {
        coins:
          "💎 Coins digunakan untuk:\n• Membeli virtual gifts\n• Membeli emotes custom\n• Memberikan tip ke streamer\n\nRate: 1 Coin = Rp 10",
        diamonds:
          "💍 Diamonds adalah mata uang premium untuk:\n• Membeli VIP features\n• Membeli gifts eksklusif\n• Akses konten premium\n\nRate: 1 Diamond = Rp 500",
        topup:
          "Untuk top up balance:\n1. Klik tombol 'Top Up' di navigation\n2. Pilih package yang diinginkan\n3. Transfer ke admin\n4. Konfirmasi via WhatsApp\n5. Balance akan ditambahkan setelah konfirmasi",
      },
      streaming: {
        howto:
          "Cara mulai live streaming:\n1. Login ke akun Anda\n2. Klik menu 'Studio'\n3. Setup kamera dan mic\n4. Masukkan judul stream\n5. Klik 'Start Streaming'\n6. Share link ke audience!",
        requirements:
          "Syarat live streaming:\n✅ Akun terdaftar\n✅ Browser dengan akses kamera/mic\n✅ Koneksi internet stabil min 5 Mbps\n✅ Konten sesuai community guidelines",
        monetization:
          "Cara monetisasi streaming:\n💰 Terima virtual gifts dari viewers\n💎 Konversi gifts ke balance\n🏆 Program partnership untuk streamer populer\n📊 Analytics untuk tracking performa",
      },
      technical: {
        camera:
          "Masalah kamera tidak terdeteksi:\n1. Pastikan browser mendapat izin kamera\n2. Check apakah kamera digunakan aplikasi lain\n3. Restart browser atau device\n4. Gunakan browser Chrome/Firefox terbaru",
        audio:
          "Masalah audio:\n1. Periksa izin microphone di browser\n2. Check volume sistem dan mic\n3. Test mic di aplikasi lain\n4. Gunakan headset jika ada echo",
        connection:
          "Masalah koneksi:\n1. Check koneksi internet (min 5 Mbps)\n2. Tutup aplikasi lain yang konsumsi bandwidth\n3. Gunakan koneksi WiFi yang stabil\n4. Restart router jika perlu",
      },
      account: {
        register:
          "Cara daftar akun:\n1. Klik 'Login/Daftar' di navigation\n2. Pilih tab 'Daftar'\n3. Isi data yang diperlukan\n4. Pilih avatar professional\n5. Verifikasi email jika diminta",
        login:
          "Masalah login:\n1. Pastikan email/password benar\n2. Check caps lock\n3. Reset password jika lupa\n4. Clear browser cache\n5. Coba browser lain",
        profile:
          "Update profile:\n1. Login ke akun\n2. Klik menu 'Profile'\n3. Klik tombol 'Edit Profile'\n4. Update informasi yang diinginkan\n5. Save changes",
      },
      contact: {
        admin:
          "Kontak Admin:\n📱 WhatsApp: 085810526151\n💳 GoPay: 0895340205302\n📧 Email: jesikamahjong@gmail.com\n\nAdmin online 24/7 untuk support!",
        support:
          "Tim support Nabila Stream siap membantu 24/7!\n\n🤖 AI Support: Tersedia setiap saat\n👤 Human Support: Via WhatsApp admin\n📧 Email Support: Response dalam 2-4 jam",
      },
    };

    this.quickReplies = [
      { text: "💳 Cara Pembayaran", key: "payment.general" },
      { text: "🎥 Cara Live Streaming", key: "streaming.howto" },
      { text: "💎 Tentang Coins & Diamonds", key: "shop.coins" },
      { text: "👤 Kontak Admin", key: "contact.admin" },
      { text: "🔧 Masalah Teknis", key: "technical.camera" },
      { text: "👥 Daftar Akun", key: "account.register" },
    ];

    this.keywords = {
      payment: [
        "bayar",
        "pembayaran",
        "gopay",
        "transfer",
        "bank",
        "top up",
        "topup",
      ],
      shop: ["coins", "diamond", "beli", "shop", "toko", "virtual", "gift"],
      streaming: ["live", "streaming", "stream", "siaran", "broadcast"],
      technical: [
        "error",
        "masalah",
        "tidak bisa",
        "gagal",
        "kamera",
        "audio",
        "mic",
      ],
      account: ["daftar", "register", "login", "akun", "profile", "profil"],
      contact: ["admin", "kontak", "bantuan", "help", "support"],
    };

    this.conversationHistory = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.addInitialMessage();
  }

  setupEventListeners() {
    const supportToggle = document.getElementById("supportToggle");
    const closeSupportChat = document.getElementById("closeSupportChat");
    const sendButton = document.getElementById("sendSupportMessage");
    const inputField = document.getElementById("supportInput");

    if (supportToggle) {
      supportToggle.addEventListener("click", () => {
        this.toggleChat();
      });
    }

    if (closeSupportChat) {
      closeSupportChat.addEventListener("click", () => {
        this.closeChat();
      });
    }

    if (sendButton) {
      sendButton.addEventListener("click", () => {
        this.sendMessage();
      });
    }

    if (inputField) {
      inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage();
        }
      });
    }

    // Click outside to close
    document.addEventListener("click", (e) => {
      const widget = document.getElementById("aiSupportWidget");
      const chat = document.getElementById("supportChat");

      if (widget && !widget.contains(e.target) && this.isOpen) {
        this.closeChat();
      }
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    const chat = document.getElementById("supportChat");
    if (chat) {
      chat.style.display = "flex";
      this.isOpen = true;

      // Focus input
      const input = document.getElementById("supportInput");
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }

  closeChat() {
    const chat = document.getElementById("supportChat");
    if (chat) {
      chat.style.display = "none";
      this.isOpen = false;
    }
  }

  addInitialMessage() {
    const welcomeMessage =
      this.responses.greeting[
        Math.floor(Math.random() * this.responses.greeting.length)
      ];
    this.addBotMessage(welcomeMessage);
    this.addQuickReplies();
  }

  sendMessage() {
    const input = document.getElementById("supportInput");
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    this.addUserMessage(message);
    input.value = "";

    // Process and respond
    setTimeout(() => {
      this.processUserMessage(message);
    }, 500);
  }

  addUserMessage(message) {
    const messagesContainer = document.getElementById("supportMessages");
    const messageElement = document.createElement("div");
    messageElement.className = "user-message";
    messageElement.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">${this.escapeHtml(message)}</div>
        `;

    messagesContainer.appendChild(messageElement);
    this.scrollToBottom();

    // Save to conversation history
    this.conversationHistory.push({
      type: "user",
      message: message,
      timestamp: new Date().toISOString(),
    });
  }

  addBotMessage(message, showQuickReplies = false) {
    const messagesContainer = document.getElementById("supportMessages");
    const messageElement = document.createElement("div");
    messageElement.className = "bot-message";
    messageElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${this.formatMessage(message)}</div>
        `;

    messagesContainer.appendChild(messageElement);
    this.scrollToBottom();

    // Save to conversation history
    this.conversationHistory.push({
      type: "bot",
      message: message,
      timestamp: new Date().toISOString(),
    });

    if (showQuickReplies) {
      setTimeout(() => {
        this.addQuickReplies();
      }, 1000);
    }
  }

  addQuickReplies() {
    const messagesContainer = document.getElementById("supportMessages");
    const quickRepliesElement = document.createElement("div");
    quickRepliesElement.className = "quick-replies";
    quickRepliesElement.innerHTML = `
            <div class="quick-replies-header">💡 Pertanyaan Populer:</div>
            <div class="quick-replies-buttons">
                ${this.quickReplies
                  .map(
                    (reply) =>
                      `<button class="quick-reply-btn" data-key="${reply.key}">${reply.text}</button>`,
                  )
                  .join("")}
            </div>
        `;

    messagesContainer.appendChild(quickRepliesElement);

    // Add event listeners to quick reply buttons
    quickRepliesElement.querySelectorAll(".quick-reply-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const key = e.target.dataset.key;
        const response = this.getResponseByKey(key);

        // Remove quick replies
        quickRepliesElement.remove();

        // Add user message
        this.addUserMessage(e.target.textContent);

        // Add bot response
        setTimeout(() => {
          this.addBotMessage(response);
        }, 500);
      });
    });

    this.scrollToBottom();
  }

  processUserMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Check for greeting
    if (this.isGreeting(lowerMessage)) {
      const greeting =
        this.responses.greeting[
          Math.floor(Math.random() * this.responses.greeting.length)
        ];
      this.addBotMessage(greeting, true);
      return;
    }

    // Check for specific keywords
    const category = this.detectCategory(lowerMessage);
    const response = this.generateResponse(category, lowerMessage);

    this.addBotMessage(response);

    // Offer additional help
    setTimeout(() => {
      this.addBotMessage("❓ Ada pertanyaan lain yang bisa saya bantu?", true);
    }, 2000);
  }

  isGreeting(message) {
    const greetings = [
      "hai",
      "halo",
      "hello",
      "hi",
      "selamat",
      "pagi",
      "siang",
      "sore",
      "malam",
    ];
    return greetings.some((greeting) => message.includes(greeting));
  }

  detectCategory(message) {
    for (const [category, keywords] of Object.entries(this.keywords)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        return category;
      }
    }
    return "general";
  }

  generateResponse(category, message) {
    switch (category) {
      case "payment":
        if (message.includes("gopay")) return this.responses.payment.gopay;
        if (message.includes("bank")) return this.responses.payment.bank;
        return this.responses.payment.general;

      case "shop":
        if (message.includes("diamond")) return this.responses.shop.diamonds;
        if (message.includes("topup") || message.includes("top up"))
          return this.responses.shop.topup;
        return this.responses.shop.coins;

      case "streaming":
        if (message.includes("syarat") || message.includes("requirement"))
          return this.responses.streaming.requirements;
        if (message.includes("monetiz") || message.includes("uang"))
          return this.responses.streaming.monetization;
        return this.responses.streaming.howto;

      case "technical":
        if (
          message.includes("audio") ||
          message.includes("mic") ||
          message.includes("suara")
        )
          return this.responses.technical.audio;
        if (message.includes("koneksi") || message.includes("internet"))
          return this.responses.technical.connection;
        return this.responses.technical.camera;

      case "account":
        if (message.includes("login") || message.includes("masuk"))
          return this.responses.account.login;
        if (message.includes("profile") || message.includes("profil"))
          return this.responses.account.profile;
        return this.responses.account.register;

      case "contact":
        if (message.includes("admin")) return this.responses.contact.admin;
        return this.responses.contact.support;

      default:
        return this.getDefaultResponse(message);
    }
  }

  getDefaultResponse(message) {
    const defaultResponses = [
      "Maaf, saya belum memahami pertanyaan Anda. Bisa dijelaskan lebih detail? 🤔",
      "Untuk bantuan lebih lanjut, Anda bisa menghubungi admin kami di WhatsApp: 085810526151 📱",
      "Saya sedang belajar untuk memberikan jawaban yang lebih baik. Coba tanyakan tentang:\n• Pembayaran & Top Up\n• Live Streaming\n• Shop & Virtual Items\n• Masalah Teknis",
      "Apakah Anda mencari informasi tentang:\n💳 Pembayaran\n🎥 Live Streaming\n💎 Virtual Shop\n🔧 Bantuan Teknis\n👤 Kontak Admin",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  }

  getResponseByKey(key) {
    const keyParts = key.split(".");
    let response = this.responses;

    for (const part of keyParts) {
      if (response[part]) {
        response = response[part];
      } else {
        return "Maaf, informasi tidak ditemukan.";
      }
    }

    return response;
  }

  formatMessage(message) {
    // Convert newlines to <br>
    message = message.replace(/\n/g, "<br>");

    // Make phone numbers clickable
    message = message.replace(
      /(\d{10,15})/g,
      '<a href="tel:$1" style="color: var(--accent-color);">$1</a>',
    );

    // Make email addresses clickable
    message = message.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" style="color: var(--accent-color);">$1</a>',
    );

    return message;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById("supportMessages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  exportConversation() {
    return {
      timestamp: new Date().toISOString(),
      history: this.conversationHistory,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  // Analytics methods
  trackInteraction(action, details = {}) {
    const interactions = JSON.parse(
      localStorage.getItem("nabila_support_analytics") || "[]",
    );

    interactions.push({
      action,
      details,
      timestamp: new Date().toISOString(),
      session: this.getSessionId(),
    });

    // Keep only last 1000 interactions
    if (interactions.length > 1000) {
      interactions.splice(0, interactions.length - 1000);
    }

    localStorage.setItem(
      "nabila_support_analytics",
      JSON.stringify(interactions),
    );
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem("nabila_support_session");
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("nabila_support_session", sessionId);
    }
    return sessionId;
  }
}

// Initialize AI Support System
document.addEventListener("DOMContentLoaded", () => {
  window.aiSupport = new AISupportSystem();
});

// Add styles for quick replies and enhanced chat
const aiSupportStyles = document.createElement("style");
aiSupportStyles.textContent = `
    .quick-replies {
        margin: 15px 0;
        animation: fadeInUp 0.5s ease;
    }
    
    .quick-replies-header {
        color: var(--text-dark);
        font-size: 0.9rem;
        margin-bottom: 10px;
        font-weight: bold;
    }
    
    .quick-replies-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .quick-reply-btn {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        color: var(--text-light);
        padding: 10px 15px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        text-align: left;
    }
    
    .quick-reply-btn:hover {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
        transform: translateX(5px);
    }
    
    .message-content {
        line-height: 1.5;
    }
    
    .message-content br {
        margin-bottom: 5px;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .support-chat::-webkit-scrollbar {
        width: 6px;
    }
    
    .support-chat::-webkit-scrollbar-track {
        background: var(--bg-dark);
        border-radius: 3px;
    }
    
    .support-chat::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;
    }
    
    .support-chat::-webkit-scrollbar-thumb:hover {
        background: var(--text-dark);
    }
    
    .chat-messages::-webkit-scrollbar {
        width: 6px;
    }
    
    .chat-messages::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb:hover {
        background: var(--text-dark);
    }
`;
document.head.appendChild(aiSupportStyles);
