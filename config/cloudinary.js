// מייבא את המודול של Cloudinary ומשתמש בגרסה v2 של ה-API
const cloudinary = require('cloudinary').v2;

// מגדיר את פרטי ההתחברות לחשבון Cloudinary לפי משתני סביבה
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // שם הענן  ב-Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY,       // מפתח ה-API שמאפשר גישה לחשבון
  api_secret: process.env.CLOUDINARY_API_SECRET, // הסיסמה הסודית שמאשרת גישה לחשבון
});

// מייצא את המודול כדי שאפשר יהיה להשתמש בו בקבצים אחרים בפרויקט
module.exports = cloudinary;
