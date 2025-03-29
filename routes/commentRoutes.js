// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { postComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware'); // אם יש לך

router.post('/comment', authMiddleware, postComment);

module.exports = router;
