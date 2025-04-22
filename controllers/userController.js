const bcrypt = require("bcryptjs"); // מייבא את bcryptjs לצורך הצפנת סיסמאות
const jwt = require("jsonwebtoken"); // מייבא את jsonwebtoken לצורך יצירת אסימוני זיהוי (JWT)
const User = require('../models/user'); // מייבא את מודל המשתמשים ממסד הנתונים
const sendEmail = require("../services/sendEmail"); // מייבא את פונקציית שליחת המיילים מתוך הקובץ sendEmail.js שבתוך תיקיית services
const axios = require('axios'); // מייבא את axios לשליחת בקשות ל-API של TMDB

const sendWelcomeEmail = require("../services/sendEmail"); // מייבא את הפונקציה לשליחת מיילים
// פונקציה זו מבצעת רישום משתמש חדש, מצפינה את הסיסמה, שומרת את המשתמש ויוצרת עבורו אסימון זיהוי (JWT).

exports.register = async (req, res) => {
    try {
        const { username, email, password, fullName, birthday, favoriteGenre, phone } = req.body; // מקבל את הנתונים מגוף הבקשה

        let user = await User.findOne({ email }); // בודק אם כבר קיים משתמש עם אותו אימייל
        if (user) {
            return res.status(400).render("register", { error: "User already exists", user: null }); // אם כן – מציג שגיאה
        }

        const hashedPassword = await bcrypt.hash(password, 10); // מצפין את הסיסמה

        // ✅ קישור אמיתי מהענן
        let profileImageUrl = null; // משתנה שיחזיק את כתובת תמונת הפרופיל
        if (req.file && req.file.path && req.file.filename && req.file.destination !== undefined) { // בדיקה אם יש קובץ
            if (req.file.cloudinary && req.file.cloudinary.secure_url) { // אם הועלה ל־Cloudinary
                profileImageUrl = req.file.cloudinary.secure_url; // שמירה של הכתובת המאובטחת
            } else if (req.file.path.startsWith("http")) { // אם זו כתובת רגילה
                profileImageUrl = req.file.path; // שמירה של כתובת התמונה
            }
        }

        user = new User({ // יצירת אובייקט משתמש חדש
            username,
            email,
            password: hashedPassword,
            fullName,
            birthday,
            favoriteGenre,
            phone,
            profileImage: profileImageUrl
        });

        await user.save(); // שמירה במסד הנתונים

        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" }); // יצירת טוקן JWT
        user.token = token; // שמירה של הטוקן בשדה של המשתמש
        await user.save(); // עדכון במסד

        res.cookie("token", token, { httpOnly: true }); // שמירה של הטוקן בעוגיה

        await sendWelcomeEmail(user.email, user.username); // שליחת מייל ברוך הבא

        const userAgent = req.get("User-Agent"); // בודק אם הבקשה הגיעה מ-Postman
        if (userAgent && userAgent.includes("PostmanRuntime")) {
            return res.status(201).json({ message: `user name ${username} and mail ${email}`, token }); // מחזיר תשובה ב-JSON
        }

        res.redirect("/"); // הפניה לעמוד הבית

    } catch (error) {
        console.error("❌ Error in register:", error); // הדפסת שגיאה לשרת
        const userAgent = req.get("User-Agent"); // בדיקה האם בקשה מ-Postman
        if (userAgent && userAgent.includes("PostmanRuntime")) {
            return res.status(500).json({ error: "Server error" }); // מחזיר שגיאה ב-JSON
        }
        res.status(500).render("register", { error: "Server error", user: null }); // מציג שגיאה בדף ההרשמה
    }
};



// פונקציה זו מטפלת בתהליך ההתחברות של המשתמש. היא בודקת אם כתובת האימייל והסיסמה תקינים
// ואם כן, היא יוצרת אסימון זיהוי (ג'יידבליוטי) ושומרת אותו בעוגיה
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // מקבל את האימייל והסיסמה מגוף הבקשה

        const user = await User.findOne({ email }); // מחפש את המשתמש במסד הנתונים לפי האימייל
        if (!user) { // אם המשתמש לא נמצא
            return res.render("login", { errorMessage: "❌ כתובת אימייל או סיסמה אינם נכונים" }); // מחזיר הודעת שגיאה
        }

        const isMatch = await bcrypt.compare(password, user.password); // משווה את הסיסמה שהוזנה לסיסמה המוצפנת במסד הנתונים
        if (!isMatch) { // אם הסיסמה שגויה
            return res.render("login", { errorMessage: "❌ כתובת אימייל או סיסמה אינם נכונים" }); // מחזיר הודעת שגיאה
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // יצירת טוקן

        res.cookie("token", token, { httpOnly: true, secure: false }); // שומר את האסימון בעוגיה

        //  הפניה לעמוד הבית
        res.redirect("/"); // מעביר את המשתמש לדף הבית לאחר התחברות מוצלחת

    } catch (error) { 
        console.error("❌ Login Error:", error); // מציג שגיאה במקרה של בעיה בתהליך ההתחברות
        res.render("login", { errorMessage: "❌ Server error - please try again later" }); // מציג שגיאת שרת למשתמש
    }
};


// פונקציה זו מטפלת בהתנתקות המשתמש.  מוחקת את העוגיה המכילה את הטוקן ומפנה לעמוד הבית
exports.logout = (req, res) => {
    res.clearCookie("token"); // מוחק את העוגיה שמכילה את הטוקן
    res.redirect("/"); // מפנה את המשתמש לדף הבית לאחר ההתנתקות
};

exports.deleteUser = async (req, res) => {
    try {
        console.log("🔹 מחיקת משתמש - התחלה:", req.user); // לוג לתחילת התהליך

        if (!req.user) { // בדיקה אם המשתמש מחובר
            return res.status(401).json({ error: "❌ לא מורשה" }); // אם לא – מחזיר שגיאה
        }

        // מחיקת המשתמש ממסד הנתונים
        await User.findByIdAndDelete(req.user.userId); // מחיקה לפי ID

        // מחיקת ה-Token מהעוגיות כדי לנתק את המשתמש
        res.clearCookie("token"); // מוחק את הטוקן

        console.log("✅ משתמש נמחק בהצלחה"); // לוג להצלחה

        // זיהוי סוג הבקשה - אם זה API (Postman) נחזיר JSON, אחרת נבצע הפניה
        if (req.headers["content-type"] === "application/json" || req.xhr) {
            return res.json({ success: true, message: "✅ החשבון נמחק בהצלחה" }); // תשובת JSON
        } else {
            return res.redirect('/register'); // הפניית המשתמש לדף ההרשמה לאחר מחיקה
        }
    } catch (error) {
        console.error("❌ שגיאה במחיקת המשתמש:", error); // לוג שגיאה
        return res.status(500).json({ error: "❌ שגיאת שרת" }); // שגיאה בצד שרת
    }
};
