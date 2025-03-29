const bcrypt = require("bcryptjs"); // מייבא את bcryptjs לצורך הצפנת סיסמאות
const jwt = require("jsonwebtoken"); // מייבא את jsonwebtoken לצורך יצירת אסימוני זיהוי (JWT)
const User = require('../models/user'); // מייבא את מודל המשתמשים ממסד הנתונים
const sendEmail = require("../services/sendEmail"); // מייבא את פונקציית שליחת המיילים מתוך הקובץ sendEmail.js שבתוך תיקיית services
const axios = require('axios'); // מייבא את axios לשליחת בקשות ל-API של TMDB

const sendWelcomeEmail = require("../services/sendEmail"); // מייבא את הפונקציה לשליחת מיילים
// פונקציה זו מבצעת רישום משתמש חדש, מצפינה את הסיסמה, שומרת את המשתמש ויוצרת עבורו אסימון זיהוי (JWT).

exports.register = async (req, res) => {
    try {
        const { username, email, password, fullName, birthday, favoriteGenre, phone } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).render("register", { error: "User already exists", user: null });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ קישור אמיתי מהענן
        let profileImageUrl = null;
        if (req.file && req.file.path && req.file.filename && req.file.destination !== undefined) {
            if (req.file.cloudinary && req.file.cloudinary.secure_url) {
                profileImageUrl = req.file.cloudinary.secure_url;
            } else if (req.file.path.startsWith("http")) {
                profileImageUrl = req.file.path; // אם הוא כבר קישור תקף
            }
        }

        user = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            birthday,
            favoriteGenre,
            phone,
            profileImage: profileImageUrl
        });

        await user.save();

        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });
        user.token = token;
        await user.save();

        res.cookie("token", token, { httpOnly: true });

        await sendWelcomeEmail(user.email, user.username);

        const userAgent = req.get("User-Agent");
        if (userAgent && userAgent.includes("PostmanRuntime")) {
            return res.status(201).json({ message: `user name ${username} and mail ${email}`, token });
        }

        res.redirect("/");

    } catch (error) {
        console.error("❌ Error in register:", error);
        const userAgent = req.get("User-Agent");
        if (userAgent && userAgent.includes("PostmanRuntime")) {
            return res.status(500).json({ error: "Server error" });
        }
        res.status(500).render("register", { error: "Server error", user: null });
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
    
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });// יצירת טוקן

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
        console.log("🔹 מחיקת משתמש - התחלה:", req.user);

        if (!req.user) {
            return res.status(401).json({ error: "❌ לא מורשה" });
        }

        // מחיקת המשתמש ממסד הנתונים
        await User.findByIdAndDelete(req.user.userId);

        // מחיקת ה-Token מהעוגיות כדי לנתק את המשתמש
        res.clearCookie("token");

        console.log("✅ משתמש נמחק בהצלחה");

        // זיהוי סוג הבקשה - אם זה API (Postman) נחזיר JSON, אחרת נבצע הפניה
        if (req.headers["content-type"] === "application/json" || req.xhr) {
            return res.json({ success: true, message: "✅ החשבון נמחק בהצלחה" });
        } else {
            return res.redirect('/register'); // הפניית המשתמש לדף ההרשמה לאחר מחיקה
        }
    } catch (error) {
        console.error("❌ שגיאה במחיקת המשתמש:", error);
        return res.status(500).json({ error: "❌ שגיאת שרת" });
    }
};
