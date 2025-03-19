const axios = require("axios");

exports.chatWithJimmy = async (req, res) => {
    try {
        const { message } = req.body;
        console.log("📩 קיבלנו הודעה מהמשתמש:", message); // 🔹 לוג לבדיקה

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error("❌ חסר מפתח API של Gemini");
            return res.status(500).json({ reply: "❌ שגיאה פנימית, נסה מאוחר יותר" });
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(API_URL, {
            contents: [{ role: "user", parts: [{ text: message }] }]
        });

        console.log("🔹 תשובה שהתקבלה מ-Gemini:", response.data); // 🔹 הדפסת התשובה ל-debugging

        const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "לא הבנתי, נסה לשאול אחרת! 🎥";

        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ Error chatting with Gemini:", error.message);
        res.status(500).json({ reply: "❌ שגיאה במערכת, נסה שוב מאוחר יותר!" });
    }
};