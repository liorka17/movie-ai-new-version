const multer = require("multer"); // מייבא את הספרייה multer לטיפול בהעלאות קבצים
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // מייבא את מחלקת האחסון בענן של Cloudinary
const cloudinary = require("../config/cloudinary"); // מייבא את הגדרת Cloudinary מתוך קובץ config

const storage = new CloudinaryStorage({ // הגדרת מנגנון האחסון של התמונות בענן
  cloudinary: cloudinary, // משתמש בהגדרת Cloudinary הקיימת
  params: {
    folder: "profile_images", // התמונות יישמרו בתיקייה בשם זה בענן
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // פורמטים מותרים להעלאה
    transformation: [{ width: 300, height: 300, crop: "limit" }] // שינוי גודל אוטומטי לתמונה עד 300x300 (לא חיתוך קשיח)
  },
});

const upload = multer({ storage }); // יוצר מופע של multer עם האחסון שהגדרנו

module.exports = upload; // מייצא את המשתנה upload כדי להשתמש בו בקבצים אחרים (למשל ב־routes)
