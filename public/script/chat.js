document.addEventListener("DOMContentLoaded", function () {
    const chatContainer = document.getElementById("chatContainer");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
    const sendButton = document.getElementById("chat-send");

    // אם אין צ'אט בדף – לא עושים כלום
    if (!chatContainer || !chatForm || !chatInput || !chatMessages || !sendButton) return;

    chatContainer.style.display = "none";

    window.toggleChat = function () {
        const isVisible = chatContainer.style.display === "block";
        chatContainer.style.display = isVisible ? "none" : "block";
    };

    document.addEventListener("click", function (e) {
        if (chatContainer.style.display === "block" &&
            !chatContainer.contains(e.target) &&
            !e.target.closest(".chat-toggle")) {
            chatContainer.style.display = "none";
        }
    });

    chatForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        appendMessage("user", `👤 ${userMessage}`);
        chatInput.value = "";

        try {
            const res = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await res.json();
            appendMessage("bot", `🤖 ${data.reply}`);
        } catch (err) {
            appendMessage("bot", "❌ שגיאה בשליחת ההודעה");
        }
    });

    function appendMessage(type, content) {
        const div = document.createElement("div");
        div.className = `chat-message ${type}`;
        div.innerHTML = content;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    window.sendQuickMessage = function (text) {
        chatInput.value = text;
        chatForm.dispatchEvent(new Event("submit"));
    };
});
