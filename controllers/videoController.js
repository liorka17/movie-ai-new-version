const tmdbService = require("../services/tmdbbApiService"); // מייבא את השירות לתקשורת עם TMDB API
const axios = require('axios'); // מייבא את אקסיוס לביצוע בקשות HTTP
const Comment = require('../models/Comment'); // מייבא את מודל התגובות מהמסד

// פונקציה זו טוענת את גלריית הסרטים, שולפת את רשימת הסרטים הפופולריים מה-איי.פי.אי ומעבירה אותם לתצוגה
exports.getGallery = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // מקבל את מספר העמוד מהבקשה, ברירת מחדל: עמוד 1
        const movies = await tmdbService.getPopularMovies(page); // שולף את רשימת הסרטים הפופולריים מה-API

        res.render("gallery", { movies, page }); // מציג את עמוד הגלריה עם הסרטים והעמוד הנוכחי
    } catch (error) { 
        console.error("❌ Error loading gallery:", error); // מדפיס שגיאה אם יש כשלון
        res.status(500).render("gallery", { movies: [], page: 1 }); // טוען עמוד ריק עם עמוד 1 במקרה של שגיאה
    }
};


// פונקציה זו שולפת את פרטי הסרט מה-איי.פי.אי של טי.מי.די.בי, כולל הטריילר, ומציגה אותם בעמוד ייעודי
exports.getMovieDetails = async (req, res) => {
    try {
      const movieId = req.params.id; // מקבל את מזהה הסרט מהפרמטרים של הבקשה
      console.log("🔍 movieId:", movieId); // מדפיס את המזהה לבדיקה

      const movie = await tmdbService.getMovieById(movieId); // שולף את פרטי הסרט לפי מזהה
      console.log("🎬 movie found:", movie?.title || "לא נמצא"); // מציג את שם הסרט או הודעה אם לא נמצא

      const trailer = await tmdbService.getMovieTrailer(movieId); // שולף את הטריילר של הסרט
      console.log("🎞️ trailer:", trailer ? "נמצא" : "אין"); // מדפיס אם נמצא טריילר

      if (!movie) {
        return res.status(404).send("הסרט לא נמצא במערכת"); // אם לא נמצא – מחזיר שגיאה
      }

      const comments = await Comment.find({ movieId }).sort({ createdAt: -1 }).lean(); // שולף תגובות לפי מזהה הסרט, בסדר יורד

      // הפוך את userId למחרוזת
      comments.forEach(comment => {
        comment.userId = comment.userId?.toString(); // ממיר את מזהה המשתמש למחרוזת
      });

      console.log("💬 comments loaded:", comments.length); // מציג כמה תגובות נטענו

      res.render("movieDetails", { // מציג את עמוד פרטי הסרט עם כל הנתונים
        movie,
        trailer,
        user: req.user,
        success: req.query.success || false,
        comments
      });
    } catch (error) {
      console.error("❌ Error fetching movie details:", error); // הדפסת שגיאה
      res.status(500).send("שגיאה בטעינת פרטי הסרט"); // מחזיר שגיאה כללית
    }
};


// פונקציה זו מציגה את עמוד החיפוש למשתמש
exports.SearchPage = (req, res) => {
    res.render("search"); // מציג את תבנית עמוד החיפוש
};


// פונקציה זו מבצעת חיפוש סרטים ב-איי.פי.אי של טי.אמ.די.בי על פי מונח חיפוש שהוזן על ידי המשתמש
exports.searchMovies = async (req, res) => {
    try {
        const query = req.query.query; // מקבל את מונח החיפוש מתוך הפרמטרים ב-URL
        if (!query) {
            return res.status(400).json({ message: "❌ חייב להזין מונח חיפוש" }); // מחזיר הודעת שגיאה אם אין מונח
        }

        const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, { // שולח בקשת חיפוש ל-TMDB
            params: {
                api_key: process.env.TMDB_API_KEY, // מפתח API
                query: query, // מונח החיפוש
                language: "he-IL" // תוצאות בעברית
            }
        });

        res.json(response.data); // מחזיר את תוצאות החיפוש כ-JSON
    } catch (error) { 
        console.error("❌ שגיאה בחיפוש סרטים:", error); // מדפיס שגיאה
        res.status(500).json({ message: "שגיאת שרת." }); // מחזיר שגיאה ללקוח
    }
};


// פונקציה זו שולפת סטטיסטיקות כלליות על סרטים מה-API של TMDB, כולל כמות הסרטים הפופולריים, הסרט הכי נצפה השבוע, והז'אנר הפופולרי ביותר
exports.getSiteStats = async () => {
    try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY; // מפתח ה-API

        // 🔹 קבלת כמות הסרטים הפופולריים
        const moviesResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=he-IL&page=1`
        );
        const totalMovies = moviesResponse.data.total_results || 0; // כמות הסרטים הפופולריים

        // 🔹 הסרט הכי נצפה השבוע
        const trendingResponse = await axios.get(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=he-IL`
        );
        const topTrendingMovie = trendingResponse.data.results[0] || null; // הסרט הכי נצפה השבוע

        // 🔹 הז'אנר הפופולרי ביותר
        const genresResponse = await axios.get(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=he-IL`
        );
        const genres = genresResponse.data.genres; // רשימת ז'אנרים
        const genreCounts = {}; // אובייקט לספירת כמות הופעות של כל ז'אנר

        moviesResponse.data.results.forEach(movie => { // עובר על כל הסרטים
            movie.genre_ids.forEach(genreId => { // עובר על כל ז'אנר של הסרט
                genreCounts[genreId] = (genreCounts[genreId] || 0) + 1; // סופר כמה פעמים כל ז'אנר מופיע
            });
        });

        const mostPopularGenreId = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b); // מוצא את הז'אנר הפופולרי ביותר
        const mostPopularGenre = genres.find(g => g.id == mostPopularGenreId)?.name || "לא ידוע"; // מחפש את שם הז'אנר לפי ID

        return {
            totalMovies, // כמות סרטים
            topTrendingMovie, // הסרט הכי נצפה
            mostPopularGenre // הז'אנר הכי נפוץ
        };

    } catch (error) { 
        console.error("❌ שגיאה בקבלת סטטיסטיקות:", error.message); // הדפסת שגיאה
        return { totalMovies: 0, topTrendingMovie: null, mostPopularGenre: "לא ידוע" }; // מחזיר ערכים ברירת מחדל
    }
};


exports.galleryByGenre = async (req, res) => {
    try {
        const { genreName } = req.params; // מקבל את שם הז'אנר מה-URL

        // שליפת כל הז'אנרים מה-TMDB
        const genresRes = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'he'
            }
        });

        const genres = genresRes.data.genres || []; // שמירת רשימת הז'אנרים
        const genre = genres.find(g => g.name === genreName); // חיפוש הז'אנר הרצוי לפי שם

        if (!genre) {
            return res.render("gallery", { movies: [], page: 1, error: "⚠️ הז'אנר לא נמצא" }); // אם לא נמצא – מחזיר דף ריק עם הודעה
        }

        // שליפת סרטים לפי ז'אנר
        const moviesRes = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                with_genres: genre.id,
                language: 'he',
                sort_by: 'popularity.desc'
            }
        });

        const movies = moviesRes.data.results || []; // שמירת הסרטים

        res.render("gallery", { movies, page: 1 }); // הצגת עמוד הגלריה עם הסרטים מהז'אנר

    } catch (err) {
        console.error("❌ Error loading genre gallery:", err.message); // הדפסת שגיאה
        res.render("gallery", { movies: [], page: 1, error: "❌ שגיאה בטעינת סרטים מהז'אנר" }); // טוען עמוד ריק עם הודעת שגיאה
    }
};
