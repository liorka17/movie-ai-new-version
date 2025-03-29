const User = require("../models/user"); // מייבא את מודל המשתמשים מתוך תיקיית מודלס
const axios = require('axios'); // מייבא את axios לשליחת בקשות ל-API של TMDB

exports.getProfile = async (req, res) => {
    console.log("🔹 GET /profile called");
    try {
        if (!req.user || !req.user._id) return res.redirect("/login");

        const user = await User.findById(req.user._id).select(
            "username email fullName birthday favoriteGenre phone profileImage"
        );

        if (!user) {
            return res.status(404).render("profile", {
                error: "User not found",
                user: null,
                genreMovies: [],
                genres: []
            });
        }

        const genreList = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: "he"
            }
        });

        const genres = genreList.data.genres || [];

        let genreMovies = [];
        if (user.favoriteGenre) {
            const foundGenre = genres.find(
                g => g.name.trim().toLowerCase() === user.favoriteGenre.trim().toLowerCase()
            );

            if (foundGenre) {
                const moviesRes = await axios.get("https://api.themoviedb.org/3/discover/movie", {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        with_genres: foundGenre.id,
                        language: "he",
                        sort_by: "popularity.desc"
                    }
                });

                genreMovies = moviesRes.data.results.slice(0, 6);
            }
        }

        res.render("profile", { user, genreMovies, genres });
    } catch (error) {
        console.error("❌ Error loading profile:", error.message);
        res.status(500).render("profile", {
            error: "Server error",
            user: null,
            genreMovies: [],
            genres: []
        });
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

        // ✅ תמונת פרופיל מ־Cloudinary
        if (req.file && req.file.path) {
            if (req.file.cloudinary && req.file.cloudinary.secure_url) {
                user.profileImage = req.file.cloudinary.secure_url;
            } else if (req.file.path.startsWith("http")) {
                user.profileImage = req.file.path;
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





exports.updateFavoriteGenreAjax = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(401).json({ success: false });
  
      user.favoriteGenre = req.body.favoriteGenre;
      await user.save();
  
      // שליפת סרטים מהז'אנר החדש
      const genreList = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "he"
        }
      });
  
      const foundGenre = genreList.data.genres.find(g =>
        g.name.trim().toLowerCase() === req.body.favoriteGenre.trim().toLowerCase()
      );
  
      let movies = [];
      if (foundGenre) {
        const resMovies = await axios.get("https://api.themoviedb.org/3/discover/movie", {
          params: {
            api_key: process.env.TMDB_API_KEY,
            with_genres: foundGenre.id,
            language: "he",
            sort_by: "popularity.desc"
          }
        });
        movies = resMovies.data.results.slice(0, 6);
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
      `).join("");
  
      res.json({ success: true, updatedMoviesHtml: html });
  
    } catch (err) {
      console.error("❌ updateFavoriteGenreAjax:", err);
      res.status(500).json({ success: false });
    }
  };
  