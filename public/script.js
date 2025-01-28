const socket = io(); // Connect to the WebSocket server
const joinUserBtn = document.getElementById("join-user");
const usernameInput = document.getElementById("username");
const chatScreen = document.querySelector(".chat-screen");
const messageInput = document.getElementById("send-message");
const sendBtn = document.querySelector(".send button");
const exitBtn = document.getElementById("exit");
const mediaUpload = document.getElementById("media-upload");
const messageArea = document.querySelector(".message-area");

let username = "";

// Function to display a message
function addMessage(content, sender = "user", isMedia = false) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  // Determine the message alignment
  if (sender === "user") {
    messageDiv.classList.add("user");
  } else {
    messageDiv.classList.add("other");
  }

  // Handle media or text content
  if (isMedia) {
    const media = document.createElement("img");
    media.src = content; // Media content (Base64 URL)
    media.style.maxWidth = "150px";
    media.style.borderRadius = "8px";
    messageDiv.appendChild(media);
  } else {
    messageDiv.textContent = content;
  }

  messageArea.appendChild(messageDiv);
  messageArea.scrollTop = messageArea.scrollHeight; // Auto-scroll to the latest message
}

// Function to send a message
function sendMessage() {
  const message = messageInput.value.trim();

  if (message) {
    const data = { username, message, isMedia: false };
    addMessage(message, "user"); // Add user's message
    socket.emit("message", data); // Send message to server
    messageInput.value = ""; // Clear the input field
  }
}

// Join chat event
joinUserBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();

  if (username) {
    socket.emit("join", username); // Notify server of new user
    document.querySelector(".screen").style.display = "none";
    chatScreen.style.display = "flex";
  } else {
    alert("Please enter a valid username!");
  }
});

// Send message event (button click)
sendBtn.addEventListener("click", sendMessage);

// Send message on pressing Enter
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // Prevent adding a new line
    sendMessage();
  }
});

// Listen for incoming messages
socket.on("message", (data) => {
  if (data.username !== username) {
    addMessage(
      data.isMedia ? data.message : `${data.username}: ${data.message}`,
      "other",
      data.isMedia
    );
  }
});

// Media upload event
mediaUpload.addEventListener("change", () => {
  const file = mediaUpload.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = () => {
      const base64URL = reader.result; // Get the Base64-encoded URL
      const data = { username, message: base64URL, isMedia: true };

      addMessage(base64URL, "user", true); // Display the media locally
      socket.emit("message", data); // Send the media to the server
    };

    reader.readAsDataURL(file); // Read the file as Base64
  }
});

// Exit chat event
exitBtn.addEventListener("click", () => {
  socket.emit("exit", username);
  document.querySelector(".screen").style.display = "flex";
  chatScreen.style.display = "none";
  messageArea.innerHTML = ""; // Clear chat messages
  username = "";
});
