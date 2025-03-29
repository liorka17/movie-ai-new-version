const User = require("../models/user"); // מייבא את מודל המשתמשים מתוך תיקיית מודלס
const axios = require('axios'); // מייבא את axios לשליחת בקשות ל-API של TMDB

exports.getProfile = async (req, res) => {
    console.log("🔹 GET /profile called");
    try {
        if (!req.user || !req.user._id) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.user._id).select(
            "username email fullName birthday favoriteGenre phone profileImage"
        );

        if (!user) {
            return res.status(404).render("profile", { error: "User not found", user: null, genreMovies: [] });
        }

        let genreMovies = [];

        // אם יש למשתמש ז'אנר מועדף - נחפש סרטים שקשורים אליו ב-TMDB
        if (user.favoriteGenre) {
            // קודם שולף את רשימת הז'אנרים כדי להמיר שם ל-ID
            const genreList = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "he"
                }
            });

            const foundGenre = genreList.data.genres.find(
                (g) => g.name.trim().toLowerCase() === user.favoriteGenre.trim().toLowerCase()
            );

            if (foundGenre) {
                const moviesRes = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        with_genres: foundGenre.id,
                        language: "he",
                        sort_by: "popularity.desc",
                    }
                });

                genreMovies = moviesRes.data.results.slice(0, 6); // נגביל ל-6 תוצאות
            }
        }

        res.render("profile", { user, genreMovies });

    } catch (error) {
        console.error("❌ Error loading profile:", error.message);
        res.status(500).render("profile", { error: "Server error", user: null, genreMovies: [] });
    }
};

exports.editProfileForm = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.redirect("/login");
        res.render("editProfile", { user });
    } catch (error) {
        console.error("❌ Error loading edit profile:", error);
        res.status(500).redirect("/profile");
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.redirect("/login");

        const { username, email, fullName, birthday, favoriteGenre, phone } = req.body;

        user.username = username;
        user.email = email;
        user.fullName = fullName;
        user.birthday = birthday;
        user.favoriteGenre = favoriteGenre;
        user.phone = phone;

        // אם הועלתה תמונה חדשה, שמור את הנתיב שלה (מהענן או מקומי)
        if (req.file) {
            // אם הועלתה ל-Cloudinary ונשמר כתובת path אמיתית (url)
            if (req.file.path) {
                user.profileImage = req.file.path;
            } else if (req.file.filename) {
                user.profileImage = "/uploads/" + req.file.filename;
            }
        }

        await user.save();
        res.redirect("/profile");

    } catch (err) {
        console.error("❌ Error updating profile:", err);
        res.status(500).render("editProfile", {
            error: "Server error",
            user: req.body
        });
    }
};
