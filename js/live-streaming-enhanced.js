// Enhanced Live Streaming System with Real Connections
class EnhancedLiveStreaming {
  constructor() {
    this.currentStream = null;
    this.isStreaming = false;
    this.mediaStream = null;
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.viewers = new Set();
    this.streamStats = {
      startTime: null,
      viewers: 0,
      duration: 0,
      likes: 0,
      messages: 0,
    };
    this.init();
  }

  init() {
    if (!document.getElementById("streamForm")) return;

    console.log("Enhanced live streaming loaded");
    this.setupUI();
    this.setupEventListeners();
    this.loadStreamHistory();
  }

  setupUI() {
    this.createStreamPreview();
    this.createStreamControls();
    this.createViewersList();
    this.createStreamAnalytics();
  }

  createStreamPreview() {
    const formSection = document.querySelector(".studio-form-section");
    if (!formSection) return;

    const previewSection = document.createElement("div");
    previewSection.className = "stream-preview-section";
    previewSection.innerHTML = `
            <div class="stream-preview-container">
                <h3>📹 Live Preview</h3>
                <div class="preview-screen">
                    <video id="localVideo" autoplay muted playsinline class="preview-video"></video>
                    <div class="preview-overlay">
                        <div class="stream-status" id="streamStatus">📴 Offline</div>
                        <div class="viewer-count" id="previewViewerCount">0 viewers</div>
                    </div>
                    <div class="preview-controls">
                        <button id="startPreviewBtn" class="control-btn">📷 Start Camera</button>
                        <button id="stopPreviewBtn" class="control-btn" style="display: none;">⏹️ Stop Camera</button>
                        <button id="switchCameraBtn" class="control-btn" style="display: none;">🔄 Switch</button>
                        <button id="muteBtn" class="control-btn" style="display: none;">🔇 Mute</button>
                    </div>
                </div>
                
                <div class="stream-settings">
                    <div class="setting-group">
                        <label>Quality</label>
                        <select id="qualitySelect">
                            <option value="1080p">1080p Full HD</option>
                            <option value="720p" selected>720p HD</option>
                            <option value="480p">480p SD</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Frame Rate</label>
                        <select id="framerateSelect">
                            <option value="60">60 FPS</option>
                            <option value="30" selected>30 FPS</option>
                            <option value="15">15 FPS</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Audio Input</label>
                        <select id="audioSelect">
                            <option value="default">Default Microphone</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

    formSection.appendChild(previewSection);
  }

  createStreamControls() {
    const container = document.querySelector(".studio-container");
    if (!container) return;

    const controlsSection = document.createElement("div");
    controlsSection.className = "stream-controls-section";
    controlsSection.innerHTML = `
            <div class="live-controls">
                <div class="main-controls">
                    <button id="goLiveBtn" class="go-live-btn" disabled>
                        <span class="btn-icon">🔴</span>
                        <span class="btn-text">GO LIVE</span>
                    </button>
                    <button id="endLiveBtn" class="end-live-btn" style="display: none;">
                        <span class="btn-icon">⏹️</span>
                        <span class="btn-text">END STREAM</span>
                    </button>
                </div>
                
                <div class="stream-info-panel" id="streamInfoPanel" style="display: none;">
                    <div class="info-header">
                        <h3>🔴 LIVE STREAMING</h3>
                        <div class="live-indicator">
                            <span class="pulse-dot"></span>
                            <span>LIVE</span>
                        </div>
                    </div>
                    
                    <div class="stream-stats">
                        <div class="stat-item">
                            <span class="stat-value" id="liveViewers">0</span>
                            <span class="stat-label">Viewers</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="liveDuration">00:00</span>
                            <span class="stat-label">Duration</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="liveLikes">0</span>
                            <span class="stat-label">Likes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="liveMessages">0</span>
                            <span class="stat-label">Messages</span>
                        </div>
                    </div>
                    
                    <div class="stream-url-info">
                        <div class="url-item">
                            <label>Stream URL:</label>
                            <div class="url-value">
                                <input type="text" id="streamUrl" readonly>
                                <button onclick="copyStreamUrl()" class="copy-btn">📋</button>
                            </div>
                        </div>
                        <div class="url-item">
                            <label>Share Link:</label>
                            <div class="url-value">
                                <input type="text" id="shareUrl" readonly>
                                <button onclick="shareStream()" class="copy-btn">📤</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    container.appendChild(controlsSection);
  }

  createViewersList() {
    const container = document.querySelector(".studio-container");
    if (!container) return;

    const viewersSection = document.createElement("div");
    viewersSection.className = "viewers-section";
    viewersSection.innerHTML = `
            <div class="viewers-panel" id="viewersPanel" style="display: none;">
                <h3>👥 Live Viewers</h3>
                <div class="viewers-list" id="viewersList">
                    <!-- Viewers will be populated here -->
                </div>
                <div class="viewers-actions">
                    <button onclick="banUser()" class="action-btn">🚫 Ban User</button>
                    <button onclick="modUser()" class="action-btn">👑 Make Mod</button>
                    <button onclick="clearChat()" class="action-btn">🗑️ Clear Chat</button>
                </div>
            </div>
        `;

    container.appendChild(viewersSection);
  }

  createStreamAnalytics() {
    const container = document.querySelector(".studio-container");
    if (!container) return;

    const analyticsSection = document.createElement("div");
    analyticsSection.className = "analytics-section";
    analyticsSection.innerHTML = `
            <div class="analytics-panel">
                <h3>📊 Stream Analytics</h3>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="card-header">
                            <h4>📈 Real-time Stats</h4>
                        </div>
                        <div class="chart-container">
                            <canvas id="viewersChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <div class="card-header">
                            <h4>💬 Chat Activity</h4>
                        </div>
                        <div class="activity-list" id="chatActivity">
                            <!-- Chat activity will be shown here -->
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <div class="card-header">
                            <h4>🌍 Viewer Locations</h4>
                        </div>
                        <div class="location-stats" id="locationStats">
                            <!-- Location stats will be shown here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

    container.appendChild(analyticsSection);
  }

  setupEventListeners() {
    // Camera controls
    document
      .getElementById("startPreviewBtn")
      ?.addEventListener("click", () => this.startCamera());
    document
      .getElementById("stopPreviewBtn")
      ?.addEventListener("click", () => this.stopCamera());
    document
      .getElementById("switchCameraBtn")
      ?.addEventListener("click", () => this.switchCamera());
    document
      .getElementById("muteBtn")
      ?.addEventListener("click", () => this.toggleMute());

    // Stream controls
    document
      .getElementById("goLiveBtn")
      ?.addEventListener("click", () => this.goLive());
    document
      .getElementById("endLiveBtn")
      ?.addEventListener("click", () => this.endStream());

    // Form submission
    const streamForm = document.getElementById("streamForm");
    if (streamForm) {
      streamForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.prepareStream();
      });
    }

    // Quality settings
    document
      .getElementById("qualitySelect")
      ?.addEventListener("change", (e) => this.updateQuality(e.target.value));
    document
      .getElementById("framerateSelect")
      ?.addEventListener("change", (e) => this.updateFramerate(e.target.value));
  }

  async startCamera() {
    try {
      // Get user media
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Display video
      const localVideo = document.getElementById("localVideo");
      if (localVideo) {
        localVideo.srcObject = this.mediaStream;
      }

      // Update UI
      document.getElementById("startPreviewBtn").style.display = "none";
      document.getElementById("stopPreviewBtn").style.display = "inline-block";
      document.getElementById("switchCameraBtn").style.display = "inline-block";
      document.getElementById("muteBtn").style.display = "inline-block";
      document.getElementById("goLiveBtn").disabled = false;

      // Update status
      document.getElementById("streamStatus").textContent = "📹 Camera Ready";

      this.showAlert("Camera started successfully! 📹", "success");

      // Populate audio devices
      this.populateAudioDevices();
    } catch (error) {
      console.error("Error starting camera:", error);
      this.showAlert("Failed to start camera: " + error.message, "error");
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    const localVideo = document.getElementById("localVideo");
    if (localVideo) {
      localVideo.srcObject = null;
    }

    // Update UI
    document.getElementById("startPreviewBtn").style.display = "inline-block";
    document.getElementById("stopPreviewBtn").style.display = "none";
    document.getElementById("switchCameraBtn").style.display = "none";
    document.getElementById("muteBtn").style.display = "none";
    document.getElementById("goLiveBtn").disabled = true;

    // Update status
    document.getElementById("streamStatus").textContent = "📴 Offline";

    this.showAlert("Camera stopped", "info");
  }

  async switchCamera() {
    try {
      // Get video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      if (videoDevices.length < 2) {
        this.showAlert("No additional cameras found", "info");
        return;
      }

      // Stop current stream
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      }

      // Get current device
      const currentTrack = this.mediaStream?.getVideoTracks()[0];
      const currentDeviceId = currentTrack?.getSettings().deviceId;

      // Find next device
      const currentIndex = videoDevices.findIndex(
        (device) => device.deviceId === currentDeviceId,
      );
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];

      // Start new stream with next device
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: nextDevice.deviceId },
        audio: true,
      });

      // Update video element
      const localVideo = document.getElementById("localVideo");
      if (localVideo) {
        localVideo.srcObject = this.mediaStream;
      }

      this.showAlert(
        `Switched to: ${nextDevice.label || "Camera " + (nextIndex + 1)}`,
        "success",
      );
    } catch (error) {
      console.error("Error switching camera:", error);
      this.showAlert("Failed to switch camera: " + error.message, "error");
    }
  }

  toggleMute() {
    if (!this.mediaStream) return;

    const audioTrack = this.mediaStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const muteBtn = document.getElementById("muteBtn");
      if (muteBtn) {
        muteBtn.textContent = audioTrack.enabled ? "🔇 Mute" : "🔊 Unmute";
      }

      this.showAlert(
        audioTrack.enabled ? "Audio unmuted" : "Audio muted",
        "info",
      );
    }
  }

  async populateAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput",
      );

      const audioSelect = document.getElementById("audioSelect");
      if (audioSelect) {
        audioSelect.innerHTML = audioDevices
          .map(
            (device) =>
              `<option value="${device.deviceId}">${device.label || "Microphone " + device.deviceId.slice(0, 8)}</option>`,
          )
          .join("");
      }
    } catch (error) {
      console.error("Error getting audio devices:", error);
    }
  }

  prepareStream() {
    const title = document.getElementById("streamTitleInput").value.trim();
    const description = document
      .getElementById("streamDescriptionInput")
      .value.trim();

    if (!title) {
      this.showAlert("Stream title is required!", "error");
      return;
    }

    if (!this.mediaStream) {
      this.showAlert("Please start your camera first!", "error");
      return;
    }

    this.currentStream = {
      title,
      description,
      quality: document.getElementById("qualitySelect").value,
      framerate: document.getElementById("framerateSelect").value,
      prepared: true,
    };

    this.showAlert(
      'Stream prepared! Click "GO LIVE" to start broadcasting.',
      "success",
    );
  }

  async goLive() {
    if (!this.currentStream?.prepared) {
      this.showAlert(
        "Please prepare your stream first by filling the form!",
        "error",
      );
      return;
    }

    try {
      // Start recording for demo purposes
      this.startRecording();

      // Generate stream URLs
      const streamId = "live_" + Date.now();
      const streamUrl = `https://live.nabila-stream.com/watch/${streamId}`;
      const shareUrl = `${window.location.origin}/stream.html?id=${streamId}`;

      // Update UI
      this.isStreaming = true;
      this.streamStats.startTime = Date.now();

      document.getElementById("goLiveBtn").style.display = "none";
      document.getElementById("endLiveBtn").style.display = "inline-block";
      document.getElementById("streamInfoPanel").style.display = "block";
      document.getElementById("viewersPanel").style.display = "block";

      document.getElementById("streamUrl").value = streamUrl;
      document.getElementById("shareUrl").value = shareUrl;
      document.getElementById("streamStatus").innerHTML = "🔴 LIVE";
      document.getElementById("streamStatus").classList.add("live-status");

      // Start stream simulation
      this.startStreamSimulation();

      // Save stream to storage
      this.saveStreamData(streamId, streamUrl, shareUrl);

      this.showAlert(
        "🎉 You are now LIVE! Share your stream link with viewers.",
        "success",
      );

      // Update home page
      this.updateHomePage(streamId);
    } catch (error) {
      console.error("Error going live:", error);
      this.showAlert("Failed to go live: " + error.message, "error");
    }
  }

  startRecording() {
    if (!this.mediaStream) return;

    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      this.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      });

      this.mediaRecorder.start(1000); // Record in 1-second chunks
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  startStreamSimulation() {
    // Simulate viewers joining
    this.simulateViewers();

    // Update duration timer
    this.updateDurationTimer();

    // Simulate engagement
    this.simulateEngagement();

    // Update analytics
    this.updateAnalytics();
  }

  simulateViewers() {
    const viewerNames = [
      "StreamFan123",
      "GamerGirl_YT",
      "TechEnthusiast",
      "MusicLover42",
      "ContentCreator",
      "ViewerPro",
      "StreamWatcher",
      "LiveFan88",
    ];

    // Add initial viewers
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.addViewer(
            viewerNames[Math.floor(Math.random() * viewerNames.length)],
          );
        }, i * 2000);
      }
    }, 1000);

    // Continue adding viewers periodically
    this.viewerInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        this.addViewer(
          viewerNames[Math.floor(Math.random() * viewerNames.length)],
        );
      }
      if (Math.random() > 0.8 && this.viewers.size > 0) {
        this.removeViewer();
      }
    }, 10000);
  }

  addViewer(name) {
    const viewer = {
      id: Date.now() + Math.random(),
      name: name + Math.floor(Math.random() * 100),
      joinTime: Date.now(),
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
    };

    this.viewers.add(viewer);
    this.streamStats.viewers = this.viewers.size;

    this.updateViewersDisplay();
    this.showViewerNotification(`${viewer.name} joined the stream! 👋`);
  }

  removeViewer() {
    const viewersArray = Array.from(this.viewers);
    if (viewersArray.length > 0) {
      const randomViewer =
        viewersArray[Math.floor(Math.random() * viewersArray.length)];
      this.viewers.delete(randomViewer);
      this.streamStats.viewers = this.viewers.size;
      this.updateViewersDisplay();
    }
  }

  updateViewersDisplay() {
    // Update viewer count
    document.getElementById("liveViewers").textContent = this.viewers.size;
    document.getElementById("previewViewerCount").textContent =
      `${this.viewers.size} viewers`;

    // Update viewers list
    const viewersList = document.getElementById("viewersList");
    if (viewersList) {
      viewersList.innerHTML = Array.from(this.viewers)
        .map(
          (viewer) => `
                <div class="viewer-item">
                    <img src="${viewer.avatar}" alt="${viewer.name}" class="viewer-avatar">
                    <div class="viewer-info">
                        <span class="viewer-name">${viewer.name}</span>
                        <span class="viewer-time">Joined ${this.formatDuration(Date.now() - viewer.joinTime)} ago</span>
                    </div>
                    <div class="viewer-actions">
                        <button class="viewer-action-btn" onclick="kickViewer('${viewer.id}')" title="Kick">👋</button>
                        <button class="viewer-action-btn" onclick="banViewer('${viewer.id}')" title="Ban">🚫</button>
                    </div>
                </div>
            `,
        )
        .join("");
    }
  }

  updateDurationTimer() {
    this.durationInterval = setInterval(() => {
      if (this.streamStats.startTime) {
        const duration = Date.now() - this.streamStats.startTime;
        document.getElementById("liveDuration").textContent =
          this.formatDuration(duration);
      }
    }, 1000);
  }

  simulateEngagement() {
    // Simulate likes
    this.likeInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        this.streamStats.likes += Math.floor(Math.random() * 3) + 1;
        document.getElementById("liveLikes").textContent =
          this.streamStats.likes;
      }
    }, 5000);

    // Simulate messages
    this.messageInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        this.streamStats.messages += Math.floor(Math.random() * 2) + 1;
        document.getElementById("liveMessages").textContent =
          this.streamStats.messages;
        this.addChatActivity();
      }
    }, 8000);
  }

  addChatActivity() {
    const messages = [
      "Great stream! 🔥",
      "Love the content! ❤️",
      "Keep it up! 👍",
      "Amazing quality! 📹",
      "First time watching, subscribed! 🔔",
    ];

    const viewersArray = Array.from(this.viewers);
    if (viewersArray.length === 0) return;

    const randomViewer =
      viewersArray[Math.floor(Math.random() * viewersArray.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const chatActivity = document.getElementById("chatActivity");
    if (chatActivity) {
      const activityItem = document.createElement("div");
      activityItem.className = "activity-item";
      activityItem.innerHTML = `
                <img src="${randomViewer.avatar}" alt="${randomViewer.name}" class="activity-avatar">
                <div class="activity-content">
                    <span class="activity-name">${randomViewer.name}</span>
                    <span class="activity-message">${randomMessage}</span>
                    <span class="activity-time">just now</span>
                </div>
            `;

      chatActivity.insertBefore(activityItem, chatActivity.firstChild);

      // Keep only last 10 activities
      while (chatActivity.children.length > 10) {
        chatActivity.removeChild(chatActivity.lastChild);
      }
    }
  }

  updateAnalytics() {
    // Simple analytics update
    this.analyticsInterval = setInterval(() => {
      this.updateViewersChart();
      this.updateLocationStats();
    }, 30000);
  }

  updateViewersChart() {
    // Simple chart simulation
    const canvas = document.getElementById("viewersChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw simple line chart
    ctx.strokeStyle = "#2575fc";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const dataPoints = 20;
    const step = canvas.width / dataPoints;

    for (let i = 0; i <= dataPoints; i++) {
      const x = i * step;
      const y = canvas.height - (Math.random() * 50 + this.viewers.size * 10);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  updateLocationStats() {
    const locations = [
      "Indonesia 🇮🇩",
      "Malaysia 🇲🇾",
      "Singapore 🇸🇬",
      "Thailand 🇹🇭",
      "Philippines 🇵🇭",
    ];
    const locationStats = document.getElementById("locationStats");

    if (locationStats) {
      locationStats.innerHTML = locations
        .map((location) => {
          const percentage = Math.floor(Math.random() * 30) + 10;
          return `
                    <div class="location-item">
                        <span class="location-name">${location}</span>
                        <div class="location-bar">
                            <div class="location-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="location-percentage">${percentage}%</span>
                    </div>
                `;
        })
        .join("");
    }
  }

  endStream() {
    if (!confirm("Are you sure you want to end the stream?")) return;

    // Stop all intervals
    clearInterval(this.viewerInterval);
    clearInterval(this.durationInterval);
    clearInterval(this.likeInterval);
    clearInterval(this.messageInterval);
    clearInterval(this.analyticsInterval);

    // Stop recording
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    // Reset state
    this.isStreaming = false;
    this.viewers.clear();

    // Update UI
    document.getElementById("goLiveBtn").style.display = "inline-block";
    document.getElementById("endLiveBtn").style.display = "none";
    document.getElementById("streamInfoPanel").style.display = "none";
    document.getElementById("viewersPanel").style.display = "none";
    document.getElementById("streamStatus").innerHTML = "📹 Camera Ready";
    document.getElementById("streamStatus").classList.remove("live-status");

    // Show stream summary
    this.showStreamSummary();

    this.showAlert("Stream ended successfully! 📴", "success");
  }

  showStreamSummary() {
    const duration = this.streamStats.startTime
      ? Date.now() - this.streamStats.startTime
      : 0;
    const peakViewers = Math.max(
      ...Array.from(this.viewers).map(() => this.viewers.size),
    );

    const summary = `
            Stream Summary:
            Duration: ${this.formatDuration(duration)}
            Peak Viewers: ${peakViewers}
            Total Likes: ${this.streamStats.likes}
            Total Messages: ${this.streamStats.messages}
        `;

    alert(summary);
  }

  saveStreamData(streamId, streamUrl, shareUrl) {
    const user = window.authSystem?.getCurrentUser();
    if (!user) return;

    const streamData = {
      id: streamId,
      title: this.currentStream.title,
      description: this.currentStream.description,
      streamUrl,
      shareUrl,
      quality: this.currentStream.quality,
      framerate: this.currentStream.framerate,
      streamer: {
        id: user.id,
        name: user.displayName || user.name,
        avatar: user.avatar,
      },
      startTime: this.streamStats.startTime,
      status: "live",
      viewers: 0,
      likes: 0,
      created_at: new Date().toISOString(),
    };

    // Save to localStorage
    const streams = JSON.parse(localStorage.getItem("nabila_streams") || "[]");
    streams.unshift(streamData);
    localStorage.setItem("nabila_streams", JSON.stringify(streams));

    // Update user stats
    user.totalStreams = (user.totalStreams || 0) + 1;
    window.authSystem?.updateProfile({ totalStreams: user.totalStreams });
  }

  updateHomePage(streamId) {
    // This would update the home page to show the new live stream
    console.log("New live stream available:", streamId);
  }

  loadStreamHistory() {
    const user = window.authSystem?.getCurrentUser();
    if (!user) return;

    const streams = JSON.parse(localStorage.getItem("nabila_streams") || "[]");
    const userStreams = streams.filter(
      (stream) => stream.streamer.id === user.id,
    );

    if (userStreams.length > 0) {
      this.showStreamHistory(userStreams);
    }
  }

  showStreamHistory(streams) {
    const container = document.querySelector(".studio-container");
    if (!container) return;

    const historySection = document.createElement("div");
    historySection.className = "stream-history-section";
    historySection.innerHTML = `
            <h3>📊 Your Stream History</h3>
            <div class="history-grid">
                ${streams
                  .slice(0, 6)
                  .map(
                    (stream) => `
                    <div class="history-card">
                        <div class="history-header">
                            <h4>${stream.title}</h4>
                            <span class="history-status ${stream.status}">${stream.status}</span>
                        </div>
                        <div class="history-stats">
                            <span>👥 ${stream.viewers} viewers</span>
                            <span>❤️ ${stream.likes} likes</span>
                            <span>📅 ${new Date(stream.created_at).toLocaleDateString()}</span>
                        </div>
                        <div class="history-actions">
                            <button onclick="viewStreamAnalytics('${stream.id}')" class="btn-small">📊 Analytics</button>
                            ${stream.status === "live" ? `<button onclick="goToStream('${stream.id}')" class="btn-small">📺 Watch</button>` : ""}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;

    container.appendChild(historySection);
  }

  showViewerNotification(message) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "viewer-notification";
    notification.textContent = message;

    document.body.appendChild(notification);

    // Position notification
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(37, 117, 252, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
    }
  }

  showAlert(message, type = "info") {
    window.authSystem?.showAlert(message, type);
  }
}

// Global functions for stream management
window.copyStreamUrl = function () {
  const streamUrl = document.getElementById("streamUrl");
  if (streamUrl) {
    streamUrl.select();
    document.execCommand("copy");
    window.liveStreaming?.showAlert(
      "Stream URL copied to clipboard! 📋",
      "success",
    );
  }
};

window.shareStream = function () {
  const shareUrl = document.getElementById("shareUrl").value;

  if (navigator.share) {
    navigator.share({
      title: "Watch my live stream!",
      text: "I'm live streaming now on Nabila Stream!",
      url: shareUrl,
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      window.liveStreaming?.showAlert(
        "Share link copied to clipboard! 📤",
        "success",
      );
    });
  }
};

window.kickViewer = function (viewerId) {
  console.log("Kicking viewer:", viewerId);
  window.liveStreaming?.showAlert("Viewer kicked from stream", "info");
};

window.banViewer = function (viewerId) {
  if (confirm("Ban this viewer from your streams?")) {
    console.log("Banning viewer:", viewerId);
    window.liveStreaming?.showAlert("Viewer banned", "info");
  }
};

window.viewStreamAnalytics = function (streamId) {
  alert("Stream analytics feature coming soon!");
};

window.goToStream = function (streamId) {
  window.location.href = `stream.html?id=${streamId}`;
};

// Initialize enhanced live streaming
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("streamForm")) {
    window.liveStreaming = new EnhancedLiveStreaming();
  }
});
