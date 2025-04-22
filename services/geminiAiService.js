const axios = require("axios"); // מייבא את אקסיוס לצורך ביצוע בקשות HTTP

// משתני הסביבה עבור מפתחות ה-איי.פי.אי והשירותים החיצוניים
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // מפתח איי.פי.אי לשירות ג'מיני
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"; // כתובת ה-API של ג'מיני
const TMDB_API_KEY = process.env.TMDB_API_KEY; // מפתח איי.פי.אי לשירות TMDB
const TMDB_API_URL = "https://api.themoviedb.org/3/movie/"; // כתובת בסיס ל-TMDB לשליפת פרטי סרטים

// פונקציה זו מקבלת רשימת סרטים שהמשתמש דירג ושולחת בקשה ל-Gemini לקבלת המלצות
exports.getRecommendations = async (ratedMovies) => {
    try {
        if (!GEMINI_API_KEY || !TMDB_API_KEY) { // בדיקה אם יש מפתחות API זמינים
            console.error("❌ מפתחות API חסרים");
            return [];
        }

        const prompt = ` // יוצר טקסט בקשה עבור ג'מיני עם רשימת סרטים
            אני רוצה שתמליץ לי על 5 סרטים דומים לסרטים הבאים בהתבסס על הדירוגים שלהם: ${ratedMovies.join(", ")}.
            החזר JSON תקף עם **ID הסרט** מ-TMDB, שם הסרט והתיאור.
            
            פורמט תקין לדוגמה:
            {
                "movies": [
                    {"id": "123", "title": "שם הסרט", "overview": "תקציר קצר"}
                ]
            }
        `;

        // שליחת הבקשה ל-Gemini עם הפרומפט
        const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        console.log("🔹 תשובת Gemini API:", response.data); // מדפיס את תגובת Gemini לקונסול

        const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text; // ניגש לטקסט של התשובה
        if (!textResponse || textResponse.trim() === "") { // בדיקה אם יש תשובה
            console.error("❌ empty gemini res");
            return [];
        }

        const cleanedResponse = textResponse.replace(/```json|```/g, "").trim(); // מסיר סימוני ```json מהתשובה

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedResponse); // מנסה להמיר את התשובה ל-JSON
        } catch (error) {
            console.error("❌ Error parsing JSON", error.message); // מדפיס שגיאה אם הפורמט לא תקין
            console.error("🔹 Response received ", cleanedResponse);
            return [];
        }

        if (!parsedResponse.movies || !Array.isArray(parsedResponse.movies)) { // בדיקה אם המערך חוקי
            console.error("❌ Invalid JSON format");
            return [];
        }

        // בקשה לכל סרט מתוך הרשימה כדי לקבל את הפוסטר מה-TMDB
        const moviesWithImages = await Promise.all(parsedResponse.movies.slice(0, 5).map(async (movie) => {
            try {
                const tmdbResponse = await axios.get(`${TMDB_API_URL}${movie.id}?api_key=${TMDB_API_KEY}&language=he`); // בקשת פרטי סרט
                return {
                    id: movie.id, // מזהה הסרט
                    title: movie.title, // שם הסרט
                    overview: movie.overview, // תקציר הסרט
                    poster: `https://image.tmdb.org/t/p/w500${tmdbResponse.data.poster_path}` // קישור לפוסטר בגודל בינוני
                };
            } catch (err) {
                console.error(`❌ Error fetching image-${movie.title}:`, err.message); // שגיאה בשליפת פוסטר
                return { ...movie, poster: "/assets/default_poster.jpg" }; // ברירת מחדל במקרה של שגיאה
            }
        }));

        return moviesWithImages; // מחזיר את רשימת הסרטים עם הפוסטרים

    } catch (error) {
        console.error("❌ Error calling Gemini or TMDB API:", error.message); // שגיאה כללית במקרה של כשל
        return [];
    }
};
