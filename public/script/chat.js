document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ chat.js נטען בהצלחה!");

    const chatContainer = document.getElementById("chatContainer");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("chat-send");
    const chatForm = document.getElementById("chat-form");

    // ✅ סגירת הצ'אט בלחיצה מחוץ לאזור הצ'אט
    document.addEventListener("click", function (event) {
        if (chatContainer.style.display === "block" && !chatContainer.contains(event.target) && !event.target.closest(".chat-bot-button")) {
            toggleChat();
        }
    });

    sendButton.addEventListener("click", function () {
        sendMessage();
    });

    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        sendMessage();
    });

    function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatMessages.innerHTML += `<div class="chat-message user animate">👤 ${userMessage}</div>`;
        chatInput.value = "";

        fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        })
        .then(response => response.json())
        .then(data => {
            chatMessages.innerHTML += `<div class="chat-message bot animate">🤖 ${data.reply}</div>`;
        })
        .catch(error => {
            console.error("❌ שגיאה בשליחת ההודעה:", error);
            chatMessages.innerHTML += `<div class="chat-message bot error">❌ שגיאה בשליחת הודעה</div>`;
        });
    }
});

// ✅ הופך את הפונקציה לגלובלית
window.toggleChat = function () {
    const chat = document.getElementById("chatContainer");
    chat.style.display = chat.style.display === "none" ? "block" : "none";
    console.log("🔹 מצב הצ'אט שונה ל:", chat.style.display);
};
