// controllers/commentController.js
const Comment = require('../models/Comment');
const Rating = require('../models/rating');

exports.postComment = async (req, res) => {
    try {
      const { movieId, content } = req.body;
      const userId = req.user._id;
      const username = req.user.username;
  
      // נבדוק אם המשתמש דירג את הסרט הזה
      const existingRating = await Rating.findOne({ movieId, userId });
  
      const comment = new Comment({
        movieId,
        content,
        userId,
        username,
        rating: existingRating?.rating || null // אם יש דירוג – נוסיף אותו
      });
  
      await comment.save();
      res.redirect('back');
    } catch (err) {
      console.error("❌ Error saving comment:", err);
      res.status(500).send("Server error");
    }
  };
