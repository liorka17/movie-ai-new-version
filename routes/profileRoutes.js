const express = require("express");
const router = express.Router();

const { getProfile, editProfileForm, updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // ✅ זה מוודא שגם קבצים ייטופלו

// צפייה בפרופיל
router.get("/", authMiddleware, getProfile);

// דף עריכת פרופיל
router.get("/edit", authMiddleware, editProfileForm);

// שליחת טופס עריכת פרופיל
router.post("/edit", authMiddleware, upload.single("profileImage"), updateProfile);

module.exports = router;
