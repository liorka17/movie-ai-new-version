const express = require("express"); // מייבא את express
const router = express.Router(); // יוצר ראוטר חדש עבור ניתובים (routes)
const {chatWithJimmy} = require("../controllers/chatController"); // מייבא את הפונקציה chatWithJimmy מהקונטרולר

router.post("/chat", chatWithJimmy); // מגדיר נתיב POST ל־/chat שמעביר את הבקשה לפונקציה chatWithJimmy

module.exports = router; // מייצא את הראוטר לשימוש בקובץ הראשי של האפליקציה
