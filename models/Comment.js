const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  movieId: { type: String, required: true }, // מזהה הסרט מ-TMDB
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String }, // אופציונלי להצגה מהירה בלי חיפוש נוסף
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
