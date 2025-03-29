const User = require("../models/user"); // מייבא את מודל המשתמשים מתוך תיקיית מודלס

exports.getProfile = async (req, res) => {
    console.log("🔹 GET /profile called");
    console.log("🔹 User from JWT:", req.user);

    try {
        if (!req.user || !req.user._id) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.user._id).select(
            "username email fullName birthday favoriteGenre phone profileImage"
        );

        if (!user) {
            return res.status(404).render("profile", { error: "User not found", user: null });
        }

        res.render("profile", { user });
    } catch (error) {
        console.error("❌ Error loading profile:", error);
        res.status(500).render("profile", { error: "Server error", user: null });
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

        if (req.file) {
            user.profileImage = "/uploads/" + req.file.filename;
        }

        await user.save();
        res.redirect("/profile");
    } catch (err) {
        console.error("❌ Error updating profile:", err);
        res.status(500).render("editProfile", { error: "Server error", user: req.body });
    }
};