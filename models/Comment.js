const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 }, // ⭐️ דירוג אם קיים
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
