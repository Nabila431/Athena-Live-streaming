// Enhanced Studio with Live Streaming Features
document.addEventListener("DOMContentLoaded", () => {
  console.log("Studio page loading...");

  // Check authentication
  const user = window.authSystem?.getCurrentUser();
  if (!user) {
    alert("Anda harus login terlebih dahulu untuk mengakses studio");
    window.location.href = "Auth.html";
    return;
  }

  console.log("Studio page loaded for user:", user.email);
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

  // Add additional studio features
  addStudioEnhancements();
  loadStreamHistory(user);
}

function addStudioEnhancements() {
  // Add stream preview section
  const streamForm = document.querySelector(".studio-form-section");
  if (streamForm) {
    const enhancedFeatures = `
            <div class="studio-enhancements">
                <div class="stream-preview">
                    <h3>📹 Preview Kamera</h3>
                    <div class="camera-preview">
                        <video id="cameraPreview" autoplay muted style="width: 100%; max-width: 400px; background: #000; border-radius: 8px;"></video>
                        <div class="camera-controls">
                            <button id="startCameraBtn" class="btn-small">📷 Nyalakan Kamera</button>
                            <button id="stopCameraBtn" class="btn-small" style="display: none;">⏹️ Matikan Kamera</button>
                            <button id="switchCameraBtn" class="btn-small" style="display: none;">🔄 Ganti Kamera</button>
                        </div>
                    </div>
                </div>
                
                <div class="audio-controls">
                    <h3>🎤 Audio Settings</h3>
                    <div class="audio-settings">
                        <label for="micVolume">Volume Mikrofon</label>
                        <input type="range" id="micVolume" min="0" max="100" value="80">
                        <span id="micVolumeValue">80%</span>
                    </div>
                    <div class="audio-meter">
                        <div class="audio-level" id="audioLevel"></div>
                    </div>
                </div>
                
                <div class="stream-quality">
                    <h3>⚙️ Kualitas Stream</h3>
                    <select id="streamQuality">
                        <option value="720p">720p (HD)</option>
                        <option value="1080p">1080p (Full HD)</option>
                        <option value="480p">480p (SD)</option>
                    </select>
                </div>
            </div>
        `;

    streamForm.insertAdjacentHTML("beforeend", enhancedFeatures);
    setupCameraControls();
    setupAudioControls();
  }
}

function setupCameraControls() {
  const startCameraBtn = document.getElementById("startCameraBtn");
  const stopCameraBtn = document.getElementById("stopCameraBtn");
  const switchCameraBtn = document.getElementById("switchCameraBtn");
  const cameraPreview = document.getElementById("cameraPreview");

  let currentStream = null;
  let facingMode = "user"; // 'user' or 'environment'

  if (startCameraBtn) {
    startCameraBtn.addEventListener("click", async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: true,
        });

        cameraPreview.srcObject = currentStream;
        startCameraBtn.style.display = "none";
        stopCameraBtn.style.display = "inline-block";
        switchCameraBtn.style.display = "inline-block";

        showStudioMessage("Kamera berhasil dinyalakan! 📹", "success");
      } catch (error) {
        console.error("Camera error:", error);
        showStudioMessage("Gagal mengakses kamera: " + error.message, "error");
      }
    });
  }

  if (stopCameraBtn) {
    stopCameraBtn.addEventListener("click", () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        cameraPreview.srcObject = null;
        currentStream = null;
      }

      startCameraBtn.style.display = "inline-block";
      stopCameraBtn.style.display = "none";
      switchCameraBtn.style.display = "none";

      showStudioMessage("Kamera dimatikan", "info");
    });
  }

  if (switchCameraBtn) {
    switchCameraBtn.addEventListener("click", async () => {
      try {
        // Stop current stream
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }

        // Switch camera
        facingMode = facingMode === "user" ? "environment" : "user";

        // Start new stream
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: true,
        });

        cameraPreview.srcObject = currentStream;
        showStudioMessage("Kamera berhasil diganti! 🔄", "success");
      } catch (error) {
        console.error("Camera switch error:", error);
        showStudioMessage("Gagal mengganti kamera: " + error.message, "error");
      }
    });
  }
}

function setupAudioControls() {
  const micVolume = document.getElementById("micVolume");
  const micVolumeValue = document.getElementById("micVolumeValue");

  if (micVolume && micVolumeValue) {
    micVolume.addEventListener("input", (e) => {
      micVolumeValue.textContent = e.target.value + "%";
    });
  }

  // Simulate audio level meter
  const audioLevel = document.getElementById("audioLevel");
  if (audioLevel) {
    setInterval(() => {
      const level = Math.random() * 100;
      audioLevel.style.width = level + "%";
      audioLevel.style.backgroundColor =
        level > 80 ? "#e74c3c" : level > 50 ? "#f39c12" : "#27ae60";
    }, 100);
  }
}

async function createLiveStream(user) {
  const title = document.getElementById("streamTitleInput").value;
  const description = document.getElementById("streamDescriptionInput").value;
  const thumbnail = document.getElementById("streamThumbnailInput").value;
  const quality = document.getElementById("streamQuality")?.value || "720p";

  if (!title.trim()) {
    showStudioMessage("Judul stream tidak boleh kosong", "error");
    return;
  }

  try {
    // Generate stream data
    const streamKey = generateStreamKey();
    const rtmpUrl = "rtmp://live.nabila-stream.com/live";
    const streamUrl = `https://live.nabila-stream.com/watch/${streamKey}`;

    // Create stream record
    const streamData = {
      id: streamKey,
      title,
      description,
      thumbnail:
        thumbnail || "https://via.placeholder.com/350x200?text=Live+Stream",
      quality,
      streamer: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      rtmpUrl,
      streamUrl,
      status: "live",
      viewers: Math.floor(Math.random() * 50) + 1, // Simulate viewers
      created_at: new Date().toISOString(),
      chat_enabled: true,
    };

    // Save stream to localStorage
    const streams = JSON.parse(localStorage.getItem("nabila_streams") || "[]");
    streams.unshift(streamData);
    localStorage.setItem("nabila_streams", JSON.stringify(streams));

    // Show stream information
    document.getElementById("streamKey").textContent = streamKey;
    document.getElementById("rtmpUrl").textContent = rtmpUrl;
    document.getElementById("streamInfo").style.display = "block";

    showStudioMessage(
      "🎉 Stream berhasil dibuat! Gunakan informasi di bawah untuk mulai live.",
      "success",
    );

    // Update home page with new stream
    updateLiveStreams();

    console.log("Stream created:", streamData);
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
  if (confirm("Yakin ingin mengakhiri live stream?")) {
    document.getElementById("streamInfo").style.display = "none";
    showStudioMessage("Live stream telah diakhiri", "success");

    // Reset form
    document.getElementById("streamForm").reset();

    // Stop camera if running
    const stopCameraBtn = document.getElementById("stopCameraBtn");
    if (stopCameraBtn && stopCameraBtn.style.display !== "none") {
      stopCameraBtn.click();
    }

    // Update stream status
    const streams = JSON.parse(localStorage.getItem("nabila_streams") || "[]");
    if (streams.length > 0) {
      streams[0].status = "ended";
      streams[0].ended_at = new Date().toISOString();
      localStorage.setItem("nabila_streams", JSON.stringify(streams));
    }
  }
}

function loadStreamHistory(user) {
  const streams = JSON.parse(localStorage.getItem("nabila_streams") || "[]");
  const userStreams = streams.filter(
    (stream) => stream.streamer.id === user.id,
  );

  if (userStreams.length === 0) return;

  const historyHtml = `
        <section class="stream-history" style="margin-top: 40px;">
            <h3>📊 Riwayat Stream</h3>
            <div class="stream-history-list">
                ${userStreams
                  .slice(0, 5)
                  .map(
                    (stream) => `
                    <div class="history-item">
                        <div class="history-info">
                            <h4>${stream.title}</h4>
                            <p>${stream.description || "Tidak ada deskripsi"}</p>
                            <small>
                                ${new Date(stream.created_at).toLocaleDateString("id-ID")} 
                                • ${stream.status === "live" ? "🔴 Live" : "⏹️ Selesai"}
                                • ${stream.viewers} viewers
                            </small>
                        </div>
                        <div class="history-actions">
                            <button class="btn-small" onclick="viewStreamDetails('${stream.id}')">👁️ Detail</button>
                            ${stream.status === "live" ? `<button class="btn-small" onclick="goToStream('${stream.id}')">📺 Tonton</button>` : ""}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </section>
    `;

  document
    .querySelector(".studio-container")
    .insertAdjacentHTML("beforeend", historyHtml);
}

function updateLiveStreams() {
  // Update the home page live streams
  const streams = JSON.parse(localStorage.getItem("nabila_streams") || "[]");
  const liveStreams = streams.filter((stream) => stream.status === "live");

  // This would update the home page in a real app
  console.log("Live streams updated:", liveStreams.length);
}

window.viewStreamDetails = function (streamId) {
  const streams = JSON.parse(localStorage.getItem("nabila_streams") || "[]");
  const stream = streams.find((s) => s.id === streamId);

  if (stream) {
    alert(`
Stream Details:
Title: ${stream.title}
Status: ${stream.status}
Viewers: ${stream.viewers}
Created: ${new Date(stream.created_at).toLocaleString("id-ID")}
        `);
  }
};

window.goToStream = function (streamId) {
  window.location.href = `stream.html?id=${streamId}`;
};

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
        showStudioMessage("✅ Berhasil disalin ke clipboard!", "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        showStudioMessage("❌ Gagal menyalin ke clipboard", "error");
      });
  }
}

// Add CSS for studio enhancements
const studioStyles = document.createElement("style");
studioStyles.textContent = `
    .studio-enhancements {
        margin-top: 30px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    .stream-preview, .audio-controls, .stream-quality {
        background: var(--background-dark);
        padding: 20px;
        border-radius: 8px;
    }
    
    .stream-preview h3, .audio-controls h3, .stream-quality h3 {
        color: var(--text-light);
        margin-bottom: 15px;
        font-size: 1.1rem;
    }
    
    .camera-controls {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        flex-wrap: wrap;
    }
    
    .audio-settings {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .audio-settings label {
        color: var(--text-light);
        font-size: 0.9rem;
    }
    
    .audio-settings input[type="range"] {
        flex: 1;
    }
    
    .audio-settings span {
        color: var(--secondary-color);
        font-weight: 500;
    }
    
    .audio-meter {
        width: 100%;
        height: 10px;
        background: var(--background-light);
        border-radius: 5px;
        overflow: hidden;
    }
    
    .audio-level {
        height: 100%;
        width: 0%;
        background: #27ae60;
        transition: width 0.1s ease;
    }
    
    .stream-quality select {
        width: 100%;
        padding: 8px 12px;
        background: var(--background-light);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-light);
    }
    
    .stream-history-list {
        margin-top: 15px;
    }
    
    .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--background-dark);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
    }
    
    .history-info h4 {
        color: var(--text-light);
        margin-bottom: 5px;
    }
    
    .history-info p {
        color: var(--text-dark);
        margin-bottom: 5px;
        font-size: 0.9rem;
    }
    
    .history-info small {
        color: var(--text-dark);
        font-size: 0.8rem;
    }
    
    .history-actions {
        display: flex;
        gap: 8px;
    }
    
    @media (max-width: 768px) {
        .studio-enhancements {
            grid-template-columns: 1fr;
        }
        
        .history-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
    }
`;

document.head.appendChild(studioStyles);
