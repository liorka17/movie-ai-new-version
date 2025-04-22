require("dotenv").config(); // טעינת משתני סביבה מתוך קובץ .env

const setSocialLinks = (req, res, next) => { // פונקציה שמוסיפה קישורים לרשתות חברתיות ל- locals של התצוגה
    res.locals.socialLinks = { // הגדרת האובייקט עם הקישורים
        facebook: process.env.FACEBOOK_URL, // קישור לפייסבוק מתוך משתני הסביבה
        instagram: process.env.INSTAGRAM_URL, // קישור לאינסטגרם מתוך משתני הסביבה
        discord: process.env.DISCORD_URL, // קישור לדיסקורד מתוך משתני הסביבה
        linkedin: process.env.LINKEDIN_URL // קישור ללינקדאין מתוך משתני הסביבה
    };
    next(); // ממשיך לבקשה הבאה בשרשרת (middleware הבא)
};

module.exports = setSocialLinks; // מייצא את הפונקציה כדי להשתמש בה באפליקציה
