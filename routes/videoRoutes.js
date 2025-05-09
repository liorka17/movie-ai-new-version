const express = require("express"); // מייבא את אקספרס לצורך ניתוב
const router = express.Router(); // יוצר אובייקט ניתוב
const Comment = require('../models/Comment'); // מייבא את מודל התגובות (כרגע לא בשימוש בקובץ הזה)

const { 
  getGallery, // טוען את עמוד הגלריה עם סרטים פופולריים
  getMovieDetails, // טוען עמוד פרטי סרט לפי מזהה
  searchMovies, // מחפש סרטים לפי מחרוזת חיפוש
  SearchPage, // מציג את עמוד החיפוש
  getSiteStats, // מחזיר סטטיסטיקות כלליות מה-TMDB
  galleryByGenre // מציג סרטים לפי ז'אנר
} = require('../controllers/videoController'); // מייבא את פונקציות הקונטרולר של סרטים

// נתיב לטעינת גלריית הסרטים
router.get('/gallery', getGallery); 

// נתיב להצגת פרטי סרט ספציפי לפי מזהה
router.get('/movie/:id', getMovieDetails); 

// נתיב להצגת דף החיפוש
router.get('/search', SearchPage); 

// נתיב לביצוע חיפוש סרטים מה-איי.פי.אי
router.get('/search/movies', searchMovies); 

// נתיב לקבלת סטטיסטיקות כלליות על הסרטים
router.get("/stats", getSiteStats); 

// נתיב לטעינת סרטים לפי ז'אנר מה-TMDB
router.get("/genre/:genreName", galleryByGenre); 

module.exports = router; // מייצא את הנתיבים לשימוש בקובצי ניתוב אחרים
