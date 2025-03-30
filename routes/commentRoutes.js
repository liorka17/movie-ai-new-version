const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');


const auth = require('../middleware/authMiddleware');
const {postComment,deleteComment,editCommentForm,updateComment
} = require('../controllers/commentController');

router.post('/comment', auth, postComment);
router.get('/comment/:id/edit', auth, editCommentForm);
router.post('/comment/:id/edit', auth, updateComment);
router.post('/comment/:id/delete', auth, deleteComment);

module.exports = router;


