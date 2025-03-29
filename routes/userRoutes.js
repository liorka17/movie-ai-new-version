const express = require('express'); // מייבא את אקספרס לצורך ניתוב
const { register, login, logout,deleteUser,registerPage,registerForm } = require('../controllers/userController'); // מייבא את פונקציות ניהול המשתמשים מהבקר
const router = express.Router(); // יוצר אובייקט ניתוב
const upload = require("../middleware/uploadMiddleware"); // 📷 מידלוור להעלאת תמונת פרופיל


// נתיבים לטיפול בפעולות משתמשים - הרשמה, התחברות והתנתקות

<<<<<<< HEAD

=======
>>>>>>> 5650f6e46d0c27907a3d01d5377dab9e0f25a5d4
router.post('/register', upload.single("profileImage"), register);
router.post('/login', login); // נתיב להתחברות משתמש קיים
router.get('/logout', logout); // נתיב להתנתקות מהמערכת
router.post('/delete',  deleteUser); // ✅ נתיב למחיקת חשבון משתמש

router.delete('/delete/:userId', deleteUser); // מחיקה לפי מזהה שנשלח בפוסטמן

module.exports = router; // מייצא את הנתיב לשימוש בקובצי ניתוב אחרים


