const express = require("express"); // מייבא את express
const router = express.Router(); // יוצר מופע של ראוטר

const {
  getProfile, // פונקציה להצגת עמוד הפרופיל
  editProfileForm, // פונקציה להצגת טופס עריכת פרופיל
  updateProfile, // פונקציה ששומרת את השינויים
  updateFavoriteGenreAjax // עדכון ז'אנר מועדף דרך AJAX
} = require("../controllers/profileController"); // מייבא את הפונקציות מקונטרולר הפרופיל

const authMiddleware = require("../middleware/authMiddleware"); // מוודא שהמשתמש מחובר
const upload = require("../middleware/uploadMiddleware"); // ✅ זה מוודא שגם קבצים ייטופלו (למשל תמונת פרופיל)

// צפייה בפרופיל
router.get("/", authMiddleware, getProfile); // GET /profile – הצגת פרופיל של המשתמש המחובר

// דף עריכת פרופיל
router.get("/edit", authMiddleware, editProfileForm); // GET /profile/edit – טופס עריכת פרופיל

// שליחת טופס עריכת פרופיל
router.post("/edit", authMiddleware, upload.single("profileImage"), updateProfile); // POST עם תמונה מעודכנת

router.post("/updateGenre", authMiddleware, updateFavoriteGenreAjax); // עדכון ז'אנר מועדף ב-AJAX

module.exports = router; // מייצא את הראוטר לשימוש באפליקציה
