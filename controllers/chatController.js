const axios = require("axios");
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

exports.chatWithJimmy = async (req, res) => {
    try {
        const { message } = req.body;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ reply: "❌ חסר מפתח API" });
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

        const prompt = `
            אתה עוזר המלצות סרטים באתר שמבוסס על TMDB.
            כאשר מבקשים ממך להמליץ על סרטים, החזר רק רשימת שמות סרטים (בלי כוכביות ובלי הסברים).
            הפורמט צריך להיות:
            - שם הסרט: ...
            - שם הסרט: ...
            המשתמש ביקש: ${message}
        `;

        const response = await axios.post(API_URL, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "לא מצאתי תשובה.";
        const movieNames = Array.from(text.matchAll(/- שם הסרט:\s*(.*)/g)).map(m => m[1].trim());

        const movieLinks = await Promise.all(movieNames.map(async name => {
            try {
                const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        language: "he",
                        query: name
                    }
                });

                const movie = searchRes.data?.results?.[0];
                if (movie?.id) {
                    return `<a href="/video/movie/${movie.id}" class="movie-link">${movie.title}</a>`;
                }
            } catch (err) {
                console.error("🔍 שגיאה בחיפוש TMDB:", err.message);
            }
            return name;
        }));

        res.json({ reply: movieLinks.join("<br>") });

    } catch (error) {
        console.error("❌ Error chatting with Gemini:", error.message);
        res.status(500).json({ reply: "❌ שגיאה במערכת, נסה שוב מאוחר יותר!" });
    }
};
