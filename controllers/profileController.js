const User = require("../models/user"); // מייבא את מודל המשתמשים מתוך תיקיית מודלס
const axios = require('axios'); // מייבא את axios לשליחת בקשות ל-API של TMDB

exports.getProfile = async (req, res) => { // פונקציה שמציגה את עמוד הפרופיל
    console.log("🔹 GET /profile called"); // לוג כשהפונקציה מופעלת
    try {
        if (!req.user || !req.user._id) return res.redirect("/login"); // אם אין משתמש מחובר – הפנייה להתחברות

        const user = await User.findById(req.user._id).select( // שליפת משתמש לפי מזהה
            "username email fullName birthday favoriteGenre phone profileImage" // השדות הרלוונטיים להצגה
        );

        if (!user) { // אם המשתמש לא נמצא
            return res.status(404).render("profile", { // הצגת שגיאה ועמוד ריק
                error: "User not found", // הודעת שגיאה
                user: null, // אין נתונים
                genreMovies: [], // ריק
                genres: [] // ריק
            });
        }

        const genreList = await axios.get("https://api.themoviedb.org/3/genre/movie/list", { // שליפת רשימת ז'אנרים מ-TMDB
            params: {
                api_key: process.env.TMDB_API_KEY, // מפתח ה-API מהסביבה
                language: "he" // שפה עברית
            }
        });

        const genres = genreList.data.genres || []; // שמירת רשימת הז'אנרים או מערך ריק

        let genreMovies = []; // מערך לאחסון סרטים מהז'אנר המועדף
        if (user.favoriteGenre) { // אם מוגדר ז'אנר מועדף למשתמש
            const foundGenre = genres.find( // חיפוש הז'אנר לפי שם
                g => g.name.trim().toLowerCase() === user.favoriteGenre.trim().toLowerCase() // השוואה עם טרימינג ואותיות קטנות
            );

            if (foundGenre) { // אם נמצא ז'אנר תואם
                const moviesRes = await axios.get("https://api.themoviedb.org/3/discover/movie", { // שליפת סרטים מהז'אנר
                    params: {
                        api_key: process.env.TMDB_API_KEY, // מפתח API
                        with_genres: foundGenre.id, // מזהה הז'אנר
                        language: "he", // עברית
                        sort_by: "popularity.desc" // מיון לפי פופולריות
                    }
                });

                genreMovies = moviesRes.data.results.slice(0, 6); // שמירת 6 סרטים ראשונים
            }
        }

        res.render("profile", { user, genreMovies, genres }); // הצגת דף הפרופיל עם הנתונים
    } catch (error) {
        console.error("❌ Error loading profile:", error.message); // הדפסת שגיאה לשרת
        res.status(500).render("profile", { // הצגת שגיאה למשתמש
            error: "Server error", // טקסט השגיאה
            user: null, // ריק
            genreMovies: [], // ריק
            genres: [] // ריק
        });
    }
};

  

exports.editProfileForm = async (req, res) => { // הצגת טופס עריכת פרופיל
    try {
        const user = await User.findById(req.user._id); // שליפת המשתמש
        if (!user) return res.redirect("/login"); // אם לא נמצא – העברה לדף התחברות
        res.render("editProfile", { user }); // הצגת תבנית העריכה עם פרטי המשתמש
    } catch (error) {
        console.error("❌ Error loading edit profile:", error); // הדפסת שגיאה
        res.status(500).redirect("/profile"); // הפניה חזרה לפרופיל במקרה של שגיאה
    }
};

exports.updateProfile = async (req, res) => { // שמירת עדכוני פרופיל מהטופס
    try {
        const user = await User.findById(req.user._id); // שליפת המשתמש
        if (!user) return res.redirect("/login"); // אם לא נמצא – הפניה להתחברות

        const { username, email, fullName, birthday, favoriteGenre, phone } = req.body; // קבלת שדות מהטופס

        user.username = username; // עדכון שם משתמש
        user.email = email; // עדכון אימייל
        user.fullName = fullName; // עדכון שם מלא
        user.birthday = birthday; // עדכון תאריך לידה
        user.favoriteGenre = favoriteGenre; // עדכון ז'אנר מועדף
        user.phone = phone; // עדכון טלפון

        // ✅ תמונת פרופיל מ־Cloudinary
        if (req.file && req.file.path) { // אם יש קובץ בתגובה
            if (req.file.cloudinary && req.file.cloudinary.secure_url) { // אם הועלה ל-Cloudinary
                user.profileImage = req.file.cloudinary.secure_url; // שמירת הקישור המאובטח
            } else if (req.file.path.startsWith("http")) { // אם מדובר בקישור חיצוני
                user.profileImage = req.file.path; // שמירה רגילה
            }
        }

        await user.save(); // שמירת כל העדכונים במסד
        res.redirect("/profile"); // הפניה חזרה לדף הפרופיל

    } catch (err) {
        console.error("❌ Error updating profile:", err); // הדפסת שגיאה לשרת
        res.status(500).render("editProfile", { // הצגת תבנית העריכה עם השגיאה
            error: "Server error", // טקסט השגיאה
            user: req.body // החזרת הנתונים שהוזנו בטופס
        });
    }
};






exports.updateFavoriteGenreAjax = async (req, res) => { // עדכון ז'אנר מועדף עם AJAX
    try {
      const user = await User.findById(req.user._id); // שליפת המשתמש
      if (!user) return res.status(401).json({ success: false }); // אם לא קיים – מחזיר שגיאה

      user.favoriteGenre = req.body.favoriteGenre; // עדכון הז'אנר החדש
      await user.save(); // שמירת השינוי במסד

      // שליפת סרטים מהז'אנר החדש
      const genreList = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
        params: {
          api_key: process.env.TMDB_API_KEY, // מפתח API
          language: "he" // עברית
        }
      });

      const foundGenre = genreList.data.genres.find(g => // חיפוש הז'אנר שהוזן בטופס
        g.name.trim().toLowerCase() === req.body.favoriteGenre.trim().toLowerCase()
      );

      let movies = []; // משתנה לאחסון הסרטים
      if (foundGenre) {
        const resMovies = await axios.get("https://api.themoviedb.org/3/discover/movie", {
          params: {
            api_key: process.env.TMDB_API_KEY, // מפתח API
            with_genres: foundGenre.id, // מזהה הז'אנר
            language: "he", // עברית
            sort_by: "popularity.desc" // מיון לפי פופולריות
          }
        });
        movies = resMovies.data.results.slice(0, 6); // שמירת 6 הסרטים הראשונים
      }

      // מחזיר קטע HTML חדש של הסרטים
      const html = movies.map(movie => ` 
        <div class="movie-card">
          <div class="movie-image">
            <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
          </div>
          <div class="movie-info">
            <h4>${movie.title}</h4>
            <a href="/video/movie/${movie.id}" class="btn-details">📽️ פרטים נוספים</a>
          </div>
        </div>
      `).join(""); // חיבור כל הסרטים לקטע HTML אחד

      res.json({ success: true, updatedMoviesHtml: html }); // מחזיר את הקוד המעודכן לדפדפן

    } catch (err) {
      console.error("❌ updateFavoriteGenreAjax:", err); // הדפסת שגיאה
      res.status(500).json({ success: false }); // מחזיר שגיאה ב-JSON
    }
};
