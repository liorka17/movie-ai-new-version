const mongoose = require('mongoose'); // מייבא את mongoose לעבודה מול MongoDB

const UserSchema = new mongoose.Schema({ // יצירת סכמת משתמשים
  username: { type: String, required: true, unique: true }, // שם משתמש – חובה וייחודי
  fullName: { type: String }, // שם מלא
  birthday: { type: Date }, // תאריך לידה
  favoriteGenre: { type: String }, // שמירת הז'אנר המועדף של המשתמש
  phone: { type: String }, // מספר טלפון
  profileImage: { type: String }, // כתובת/שם קובץ של תמונת פרופיל
  email: { type: String, required: true, unique: true }, // כתובת אימייל – חובה וייחודית
  password: { type: String, required: true }, // סיסמה מוצפנת – חובה
  token: { type: String }, // טוקן JWT שנשמר (לא חובה)
  createdAt: { type: Date, default: Date.now } // תאריך יצירה – ברירת מחדל: עכשיו
});

module.exports = mongoose.model('User', UserSchema); // מייצא את מודל המשתמש לשימוש בפרויקט
