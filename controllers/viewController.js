const express = require('express'); // מייבא את אקספרס לצורך ניתוב
const router = express.Router(); // יוצר אובייקט ניתוב חדש
const authMiddleware = require('../middleware/authMiddleware'); // מייבא את המידלוור לאימות משתמשים
const axios = require('axios'); // מייבא את אקסיוס לביצוע בקשות HTTP
const videoController = require("../controllers/videoController"); // מייבא את בקרת הווידאו

// פונקציה זו אחראית על טעינת דף הבית ושליפת סטטיסטיקות על סרטים מהבקר של הסרטים
exports.HomePage = async (req, res) => {
    try {
        // שליפת סטטיסטיקות על הסרטים
        const stats = await videoController.getSiteStats();

        res.render("home", {
            totalMovies: stats.totalMovies || 0, // כמות הסרטים הפופולריים
            topTrendingMovie: stats.topTrendingMovie || null, // הסרט הכי נצפה השבוע
            mostPopularGenre: stats.mostPopularGenre || "לא ידוע", // הז'אנר הפופולרי ביותר
        });
    } catch (error) { 
        console.error("❌ שגיאה בטעינת דף הבית:", error.message); // מציג שגיאה במקרה של כישלון בטעינת הנתונים
        res.render("home", { totalMovies: 0, topTrendingMovie: null, mostPopularGenre: "לא ידוע" }); // מציג ערכים ריקים במקרה של שגיאה
    }
};

// פונקציה זו מציגה את עמוד ההרשמה למשתמש
exports.RegisterPage = (req, res) => {
    res.render("register"); // מציג את תבנית עמוד ההרשמה
};

// פונקציה זו מציגה את עמוד ההתחברות למשתמש
exports.LoginPage = (req, res) => {
    res.render("login"); // מציג את תבנית עמוד ההתחברות
};


exports.RegisterPage = async (req, res) => { // פונקציה שמציגה את עמוד ההרשמה עם ז'אנרים מה-TMDB
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, { // שולח בקשה ל-TMDB לקבלת רשימת ז'אנרים
      params: {
        api_key: process.env.TMDB_API_KEY, // משתמש במפתח API מהסביבה
        language: 'he' // מקבל תוצאות בעברית
      }
    });

    const genres = response.data.genres || []; // שומר את רשימת הז'אנרים או מערך ריק אם אין
    res.render("register", { genres }); // 👈 שולח את רשימת הז'אנרים לעמוד register.ejs

  } catch (err) {
    console.error("❌ Error loading genres:", err.message); // מדפיס שגיאה במקרה של כשלון
    res.render("register", { genres: [] }); // 👈 שולח מערך ריק לעמוד אם יש שגיאה
  }
};

