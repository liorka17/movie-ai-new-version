// controllers/commentController.js
const Comment = require('../models/Comment');

exports.postComment = async (req, res) => {
  try {
    const { movieId, content } = req.body;
    const userId = req.user._id;

    const comment = new Comment({
      movieId,
      content,
      userId,
      username: req.user.username // ✅ שדה חשוב להצגה
    });

    await comment.save();
    res.redirect('back');
  } catch (err) {
    console.error("❌ Error saving comment:", err);
    res.status(500).send("Server error");
  }
};
