document.addEventListener("DOMContentLoaded", function () { // מאזין לטעינת הדף כדי להריץ את הקוד רק כשהכול מוכן
    const chatContainer = document.getElementById("chatContainer"); // תופס את הקונטיינר של הצ'אט
    const chatForm = document.getElementById("chat-form"); // תופס את הטופס של הצ'אט
    const chatInput = document.getElementById("chat-input"); // תופס את שדה הטקסט של המשתמש
    const chatMessages = document.getElementById("chat-messages"); // תופס את הקונטיינר של ההודעות
    const sendButton = document.getElementById("chat-send"); // תופס את כפתור השליחה

    // אם אין צ'אט בדף – לא עושים כלום
    if (!chatContainer || !chatForm || !chatInput || !chatMessages || !sendButton) return;

    chatContainer.style.display = "none"; // בהתחלה הצ'אט מוסתר

    window.toggleChat = function () { // פונקציה לפתיחה/סגירה של הצ'אט
        const isVisible = chatContainer.style.display === "block"; // בודק אם הצ'אט כבר פתוח
        chatContainer.style.display = isVisible ? "none" : "block"; // הופך את הסטטוס
    };

    document.addEventListener("click", function (e) { // סגירת הצ'אט בלחיצה מחוץ לו
        if (chatContainer.style.display === "block" &&
            !chatContainer.contains(e.target) && // אם הלחיצה לא הייתה בתוך הצ'אט
            !e.target.closest(".chat-toggle")) { // וגם לא על כפתור ההפעלה
            chatContainer.style.display = "none"; // אז נסגור את הצ'אט
        }
    });

    chatForm.addEventListener("submit", async function (e) { // מאזין לשליחה של ההודעה
        e.preventDefault(); // מבטל שליחה רגילה של טופס
        const userMessage = chatInput.value.trim(); // לוקח את ההודעה של המשתמש
        if (!userMessage) return; // אם ההודעה ריקה – לא שולח

        appendMessage("user", `👤 ${userMessage}`); // מוסיף את ההודעה של המשתמש לצ'אט
        chatInput.value = ""; // מנקה את שדה הטקסט

        try {
            const res = await fetch("/chat", { // שולח בקשת POST לשרת עם ההודעה
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }) // שולח את ההודעה בפורמט JSON
            });

            const data = await res.json(); // מקבל את התשובה מהשרת
            appendMessage("bot", `🤖 ${data.reply}`); // מציג את התשובה של הבוט
        } catch (err) {
            appendMessage("bot", "❌ שגיאה בשליחת ההודעה"); // אם יש שגיאה – מציג הודעה מתאימה
        }
    });

    function appendMessage(type, content) { // פונקציה להוספת הודעה לצ'אט
        const div = document.createElement("div"); // יוצר אלמנט חדש
        div.className = `chat-message ${type}`; // נותן לו מחלקה מתאימה לפי הסוג (user/bot)
        div.innerHTML = content; // מכניס את התוכן
        chatMessages.appendChild(div); // מוסיף לצ'אט
        chatMessages.scrollTop = chatMessages.scrollHeight; // גולל אוטומטית לסוף
    }

    window.sendQuickMessage = function (text) { // פונקציה לכפתורי קיצור בצ'אט
        chatInput.value = text; // מכניס את הטקסט לשדה
        chatForm.dispatchEvent(new Event("submit")); // מדמה לחיצה על שליחה
    };
});
