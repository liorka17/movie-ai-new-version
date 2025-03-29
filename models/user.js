const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String },
  birthday: { type: Date },
  favoriteGenre: { type: String },
  phone: { type: String },
  profileImage: { type: String }, // שם הקובץ
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
