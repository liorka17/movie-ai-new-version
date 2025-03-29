const geminiAiService = require("../services/geminiAiService"); // מייבא את השירות לקבלת המלצות מ-ג'מיני
const Rating = require("../models/rating"); // מייבא את מודל הדירוגים ממסד הנתונים
const User = require("../models/user"); // מייבא את מודל המשתמשים ממסד הנתונים
const axios = require('axios'); // מייבא את axios לשליחת בקשות ל-API של TMDB


// פונקציה זו מקבלת את דירוגי המשתמש ומבקשת המלצות מסרטים מבוססות עליהם מ-ג'מיני.
exports.getRecommendations = async (req, res) => {
    try {
        if (!req.user) { // אם אין משתמש מחובר
            return res.redirect("/login"); // מפנה אותו לדף ההתחברות
        }

        console.log("🔹user login", req.user._id); // מציג את מזהה המשתמש המחובר

        // שולף את הדירוגים של המשתמש לפי ה-איידי הנכון
        const userRatings = await Rating.find({ userId: req.user._id });

        console.log("🔹 Existing ratings", userRatings); // מציג את הדירוגים שנמצאו עבור המשתמש

        if (!userRatings.length) { // אם אין דירוגים קודמים למשתמש
            return res.render("recommendations", { 
                recommendations: [], 
                message: "🔴 לא נמצאו דירוגים קודמים, דרג סרטים כדי לקבל המלצות" 
            });
        }

        // רשימת מזהי הסרטים שהמשתמש דירג
        const ratedMovies = userRatings.map(r => r.movieId);
        
        console.log("🔹 Rated Movie IDs:", ratedMovies); // מציג את מזהי הסרטים שהמשתמש דירג

        // קבלת המלצות מ-ג'מיני
        const recommendationsFromGemini = await geminiAiService.getRecommendations(ratedMovies);

        console.log("🔹 Received Gemini Recommendations:", recommendationsFromGemini); // מציג את ההמלצות שהתקבלו

        // אם למשתמש יש ז'אנר מועדף, נשלוף גם סרטים מהז'אנר הזה מ-API של TMDB
        let genreRecommendations = [];
        const user = await User.findById(req.user._id); // שולפים את פרטי המשתמש
        if (user.favoriteGenre) {
            const genreResponse = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    with_genres: user.favoriteGenre, // שולח את הז'אנר המועדף
                    language: 'he',
                    sort_by: 'popularity.desc'
                }
            });
            genreRecommendations = genreResponse.data.results; // סרטים מהז'אנר המועדף
            console.log("🔹 Genre Recommendations:", genreRecommendations);
        }

        // משלב את המלצות ג'מיני עם המלצות הז'אנר
        const recommendations = [...recommendationsFromGemini, ...genreRecommendations];

        // אם יש תוצאות המלצות, מציג את הסרטים בעמוד
        res.render("recommendations", { 
            recommendations, 
            message: recommendations.length ? "🎬 הנה הסרטים המומלצים עבורך" : "⚠️ לא נמצאו המלצות מתאימות" 
        });

    } catch (error) { 
        console.error("❌Error retrieving recommendations", error); // מדפיס שגיאה במקרה של כישלון
        res.status(500).render("recommendations", { 
            recommendations: [], 
            message: "❌ Server error - please try again later" // מציג שגיאה למשתמש במקרה של בעיית שרת
        });
    }
};