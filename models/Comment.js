const mongoose = require('mongoose'); // מייבא את mongoose לעבודה מול מסד נתונים MongoDB

const commentSchema = new mongoose.Schema({ // יצירת סכמת תגובות
  movieId: { type: String, required: true }, // מזהה הסרט – חובה
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // מזהה המשתמש (קישור למסמך ממשתמשים) – חובה
  username: { type: String }, // שם המשתמש שכתב את התגובה
  content: { type: String, required: true }, // תוכן התגובה – חובה
  rating: { type: Number, min: 1, max: 5 }, // ⭐️ דירוג אם קיים – מ-1 עד 5
  createdAt: { type: Date, default: Date.now } // תאריך יצירת התגובה – ברירת מחדל: עכשיו
});

module.exports = mongoose.model('Comment', commentSchema); // מייצא את המודל של תגובות לשימוש באפליקציה
