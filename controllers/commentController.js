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


  // מחיקת תגובה
exports.deleteComment = async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
  
      if (!comment || !comment.userId.equals(req.user._id)) {
        return res.status(403).send("❌ אין הרשאה למחוק תגובה");
      }
  
      await Comment.findByIdAndDelete(req.params.id);
      res.redirect('back');
    } catch (err) {
      console.error("❌ Error deleting comment:", err);
      res.status(500).send("Server error");
    }
  };
  
  // עריכת תגובה (GET טופס)
  exports.editCommentForm = async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment || !comment.userId.equals(req.user._id)) {
        return res.status(403).send("❌ אין הרשאה לערוך תגובה");
      }
  
      res.render("editComment", { comment });
    } catch (err) {
      console.error("❌ Error loading comment for edit:", err);
      res.status(500).send("Server error");
    }
  };
  
  // עדכון תגובה (POST)
  exports.updateComment = async (req, res) => {
    try {
      const { content } = req.body;
      const comment = await Comment.findById(req.params.id);
  
      if (!comment || !comment.userId.equals(req.user._id)) {
        return res.status(403).send("❌ אין הרשאה לעדכן תגובה");
      }
  
      comment.content = content;
      await comment.save();
  
      res.redirect('back');
    } catch (err) {
      console.error("❌ Error updating comment:", err);
      res.status(500).send("Server error");
    }
  };