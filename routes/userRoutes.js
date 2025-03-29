const express = require('express'); // מייבא את אקספרס לצורך ניתוב
const { register, login, logout,deleteUser } = require('../controllers/userController'); // מייבא את פונקציות ניהול המשתמשים מהבקר
const router = express.Router(); // יוצר אובייקט ניתוב
const upload = require("../middleware/uploadMiddleware"); // 📷 מידלוור להעלאת תמונת פרופיל


// נתיבים לטיפול בפעולות משתמשים - הרשמה, התחברות והתנתקות

router.post('/register', upload.single("profileImage"), register);
router.post('/login', login); // נתיב להתחברות משתמש קיים
router.get('/logout', logout); // נתיב להתנתקות מהמערכת
router.post('/delete',  deleteUser); // ✅ נתיב למחיקת חשבון משתמש

router.delete('/delete/:userId', deleteUser); // מחיקה לפי מזהה שנשלח בפוסטמן

module.exports = router; // מייצא את הנתיב לשימוש בקובצי ניתוב אחרים


