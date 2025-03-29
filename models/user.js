const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String },
  birthday: { type: Date },
<<<<<<< HEAD
  favoriteGenre: { type: String }, // שמירת הז'אנר המועדף של המשתמש
=======
  favoriteGenre: { type: String },
>>>>>>> 5650f6e46d0c27907a3d01d5377dab9e0f25a5d4
  phone: { type: String },
  profileImage: { type: String }, // שם הקובץ
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
