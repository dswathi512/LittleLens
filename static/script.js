
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const uploadButton = document.getElementById("uploadButton");
  const cameraButton = document.getElementById("cameraButton");
  const changeImageButton = document.getElementById("changeImage");
  const dropZone = document.getElementById("dropZone");

  const previewPlaceholder = document.getElementById("previewPlaceholder");
  const imagePreview = document.getElementById("imagePreview");
  const previewActions = document.getElementById("previewActions");

  const questionInput = document.getElementById("questionInput");
  const explainButton = document.getElementById("explainButton");
  const buttonText = document.getElementById("buttonText");

  const resultSection = document.getElementById("resultSection");
  const resultContent = document.getElementById("resultContent");
  const errorMessage = document.getElementById("errorMessage");

  const tryAgainButton = document.getElementById("tryAgainButton");

  const cameraModal = document.getElementById("cameraModal");
  const cameraVideo = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");
  const cameraStatus = document.getElementById("cameraStatus");
  const captureButton = document.getElementById("captureButton");
  const closeCameraButton = document.getElementById("closeCamera");

  let selectedImage = null;
  let cameraStream = null;
  let isLoading = false;

  // ------------------------------
  // IMAGE SELECTION AND PREVIEW
  // ------------------------------

  function setImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("That doesn't look like a picture. Please choose an image file.");
      return;
    }

    const maxSize = 15 * 1024 * 1024;

    if (file.size > maxSize) {
      showError("This picture is too large. Please choose an image under 15 MB.");
      return;
    }

    selectedImage = file;

    const previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    imagePreview.hidden = false;

    previewPlaceholder.hidden = true;
    previewActions.hidden = false;

    explainButton.disabled = false;
    hideError();

    imagePreview.onload = () => {
      URL.revokeObjectURL(previewUrl);
    };

    imagePreview.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      showError("We couldn't display that picture. Please try another image.");
    };
  }

  uploadButton.addEventListener("click", () => {
    imageInput.click();
  });

  changeImageButton.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(file);
    }

    // Allows the same file to be selected again.
    imageInput.value = "";
  });

  // ------------------------------
  // DRAG AND DROP
  // ------------------------------

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("drag-over");
    });
  });

  dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];

    if (file) {
      setImage(file);
    }
  });

  // ------------------------------
  // QUESTION SUGGESTIONS
  // ------------------------------

  document.querySelectorAll(".question-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      questionInput.value = chip.dataset.question || "";
      questionInput.focus();
    });
  });

  // ------------------------------
  // ERROR MESSAGES
  // ------------------------------

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function hideError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
  }

  // ------------------------------
  // BASIC MARKDOWN FORMATTING
  // ------------------------------

  function escapeHTML(text) {
    return text.replace(/[&<>"']/g, (character) => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return replacements[character];
    });
  }

  function formatExplanation(markdown) {
    const lines = String(markdown || "")
      .replace(/\r\n/g, "\n")
      .split("\n");

    let html = "";
    let paragraph = [];
    let listType = null;

    function inlineFormatting(text) {
      let safe = escapeHTML(text);

      safe = safe.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
      );

      safe = safe.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );

      safe = safe.replace(
        /(^|[^*])\*([^*\n]+)\*/g,
        "$1<em>$2</em>"
      );

      return safe;
    }

    function flushParagraph() {
      if (paragraph.length) {
        html += "<p>" +
          paragraph.map(inlineFormatting).join("<br>") +
          "</p>";

        paragraph = [];
      }
    }

    function closeList() {
      if (listType) {
        html += `</${listType}>`;
        listType = null;
      }
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        closeList();
        continue;
      }

      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);

      if (headingMatch) {
        flushParagraph();
        closeList();

        const level = Math.min(headingMatch[1].length + 1, 4);
        html += `<h${level}>${inlineFormatting(headingMatch[2])}</h${level}>`;
        continue;
      }

      const unorderedMatch = line.match(/^[-*•]\s+(.+)$/);
      const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);

      if (unorderedMatch || orderedMatch) {
        flushParagraph();

        const newType = unorderedMatch ? "ul" : "ol";

        if (listType !== newType) {
          closeList();
          html += `<${newType}>`;
          listType = newType;
        }

        const item = unorderedMatch
          ? unorderedMatch[1]
          : orderedMatch[1];

        html += `<li>${inlineFormatting(item)}</li>`;
        continue;
      }

      closeList();
      paragraph.push(line);
    }

    flushParagraph();
    closeList();

    return html || "<p>No explanation was returned. Please try again.</p>";
  }

  // ------------------------------
  // SEND IMAGE TO FLASK / GEMINI
  // ------------------------------

  explainButton.addEventListener("click", explainImage);

  async function explainImage() {
    if (isLoading) return;

    if (!selectedImage) {
      showError("Choose a picture first so we can explore it together!");
      return;
    }

    isLoading = true;
    explainButton.disabled = true;
    hideError();

    buttonText.textContent = "LittleLens is thinking";
    buttonText.classList.add("loading-dots");

    resultSection.hidden = false;
    resultContent.innerHTML = `
      <div class="loading-message">
        <p>🔍 Taking a closer look at your picture...</p>
        <p>🧠 Putting together a fun explanation for you!</p>
      </div>
    `;

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    try {
      const formData = new FormData();

      // Keep these field names aligned with your Flask backend.
      formData.append("image", selectedImage);
      formData.append("question", questionInput.value.trim());

      const response = await fetch("/api/explain", {
        method: "POST",
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          `The server returned an error (${response.status}). Please try again.`
        );
      }

      // Support common response keys used by Flask APIs.
      const explanation =
        data.explanation ??
        data.result ??
        data.text ??
        data.answer;

      if (typeof explanation !== "string" || !explanation.trim()) {
        throw new Error(
          "LittleLens didn't receive an explanation. Please try again."
        );
      }

      resultContent.innerHTML = formatExplanation(explanation);

      resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } catch (error) {
      console.error("LittleLens error:", error);

      resultSection.hidden = true;

      let message = error.message || "Something went wrong.";

      if (
        error instanceof TypeError &&
        !navigator.onLine
      ) {
        message = "You're offline. Please reconnect and try again.";
      }

      showError(message);
    } finally {
      isLoading = false;
      explainButton.disabled = !selectedImage;
      buttonText.textContent = "Explain the magic!";
      buttonText.classList.remove("loading-dots");
    }
  }

  // ------------------------------
  // WEBCAM
  // ------------------------------

  cameraButton.addEventListener("click", openCamera);
  closeCameraButton.addEventListener("click", closeCamera);

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showError(
        "Your browser can't access the camera here. Try opening LittleLens in a modern browser using localhost."
      );
      return;
    }

    cameraModal.hidden = false;
    cameraStatus.textContent = "Asking permission to use your camera...";
    captureButton.disabled = true;

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });

      cameraVideo.srcObject = cameraStream;
      cameraStatus.textContent = "Ready? Smile and capture your picture!";
      captureButton.disabled = false;
    } catch (error) {
      console.error("Camera error:", error);

      cameraStatus.textContent =
        "Camera access was unavailable. Check your browser permissions.";

      showError(
        "We couldn't open your camera. Please allow camera access in your browser settings, or choose an image instead."
      );
    }
  }

  captureButton.addEventListener("click", () => {
    if (!cameraStream || !cameraVideo.videoWidth) {
      cameraStatus.textContent = "The camera isn't ready yet. Please wait a moment.";
      return;
    }

    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;

    const context = cameraCanvas.getContext("2d");
    context.drawImage(
      cameraVideo,
      0,
      0,
      cameraCanvas.width,
      cameraCanvas.height
    );

    cameraCanvas.toBlob((blob) => {
      if (!blob) {
        showError("We couldn't capture that photo. Please try again.");
        return;
      }

      const photo = new File(
        [blob],
        "littlelens-photo.jpg",
        { type: "image/jpeg" }
      );

      setImage(photo);
      closeCamera();
    }, "image/jpeg", 0.92);
  });

  function closeCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }

    cameraVideo.srcObject = null;
    cameraModal.hidden = true;
    captureButton.disabled = false;
  }

  cameraModal.addEventListener("click", (event) => {
    if (event.target === cameraModal) {
      closeCamera();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !cameraModal.hidden) {
      closeCamera();
    }
  });

  // ------------------------------
  // START ANOTHER DISCOVERY
  // ------------------------------

  tryAgainButton.addEventListener("click", () => {
    resultSection.hidden = true;
    hideError();

    selectedImage = null;
    imagePreview.removeAttribute("src");
    imagePreview.hidden = true;

    previewPlaceholder.hidden = false;
    previewActions.hidden = true;

    questionInput.value = "";
    explainButton.disabled = true;

    window.scrollTo({
      top: document.getElementById("explore").offsetTop - 20,
      behavior: "smooth"
    });
  });

  // Close the camera if the page is being hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && cameraStream) {
      closeCamera();
    }
  });
});
