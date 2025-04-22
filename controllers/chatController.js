const axios = require("axios"); // מייבא את הספרייה axios לשליחת בקשות HTTP
const TMDB_API_KEY = process.env.TMDB_API_KEY; // שומר את מפתח ה-TMDB מהסביבה
const TMDB_BASE_URL = "https://api.themoviedb.org/3"; // כתובת הבסיס של API של TMDB

// פונקציה שמטפלת בבקשה לצ'אט עם ג'ימי
exports.chatWithJimmy = async (req, res) => {
    try {
        const { message } = req.body; // מקבל את ההודעה שנשלחה מהמשתמש
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // שומר את מפתח ה-Gemini מהסביבה

        if (!GEMINI_API_KEY) { // בודק אם חסר מפתח API
            return res.status(500).json({ reply: "❌ חסר מפתח API" }); // מחזיר שגיאה מתאימה
        }

        // כתובת ה-API של מודל Gemini (Google)
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

        // טקסט הפרומפט שנשלח ל-Gemini כולל ההנחיות למענה
        const prompt = `
            אתה עוזר המלצות סרטים באתר שמבוסס על TMDB.
            כאשר מבקשים ממך להמליץ על סרטים, החזר רק רשימת שמות סרטים (בלי כוכביות ובלי הסברים).
            הפורמט צריך להיות:
            - שם הסרט: ...
            - שם הסרט: ...
            המשתמש ביקש: ${message}
        `;

        // שליחת הבקשה ל-Gemini עם הפרומפט
        const response = await axios.post(API_URL, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        // שליפה של הטקסט מהמענה של Gemini, או הודעת ברירת מחדל אם אין
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "לא מצאתי תשובה.";

        // חילוץ שמות הסרטים מתוך הפורמט: "- שם הסרט: ..."
        const movieNames = Array.from(text.matchAll(/- שם הסרט:\s*(.*)/g)).map(m => m[1].trim());

        // מיפוי של כל שם סרט לקישור אמיתי לפי ה-ID ב-TMDB
        const movieLinks = await Promise.all(movieNames.map(async name => {
            try {
                // שליחת בקשה ל-TMDB כדי לחפש את הסרט לפי שם
                const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        language: "he", // עברית
                        query: name // שם הסרט
                    }
                });

                // אם נמצאה תוצאה, יוצרים קישור לעמוד הסרט באתר שלך
                const movie = searchRes.data?.results?.[0];
                if (movie?.id) {
                    return `<a href="/video/movie/${movie.id}" class="movie-link">${movie.title}</a>`;
                }
            } catch (err) {
                console.error("🔍 שגיאה בחיפוש TMDB:", err.message); // הודעת שגיאה אם החיפוש נכשל
            }
            return name; // אם לא נמצאה תוצאה – מחזיר את השם המקורי
        }));

        // מחזיר ללקוח את רשימת הקישורים כסטרינג עם שורות חדשות
        res.json({ reply: movieLinks.join("<br>") });

    } catch (error) {
        console.error("❌ Error chatting with Gemini:", error.message); // הדפסת שגיאה בשרת
        res.status(500).json({ reply: "❌ שגיאה במערכת, נסה שוב מאוחר יותר!" }); // החזרת שגיאה ללקוח
    }
};
