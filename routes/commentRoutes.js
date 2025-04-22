const express = require('express'); // מייבא את express
const router = express.Router(); // יוצר ראוטר חדש לניתוב הבקשות
const Comment = require('../models/Comment'); // מייבא את מודל התגובות מהמסד

const auth = require('../middleware/authMiddleware'); // מייבא את המידלוור לבדיקה אם המשתמש מחובר
const {
  postComment, // פונקציה להוספת תגובה
  deleteComment, // פונקציה למחיקת תגובה
  editCommentForm, // פונקציה להצגת טופס עריכה
  updateComment // פונקציה לעדכון תגובה
} = require('../controllers/commentController'); // מייבא את הפונקציות מתוך commentController

router.post('/comment', auth, postComment); // מוסיף תגובה – רק אם המשתמש מחובר
router.get('/comment/:id/edit', auth, editCommentForm); // מציג את טופס עריכת התגובה
router.post('/comment/:id/edit', auth, updateComment); // שולח את העריכה בפועל
router.post('/comment/:id/delete', auth, deleteComment); // מוחק את התגובה לפי ID

module.exports = router; // מייצא את הראוטר לשימוש באפליקציה
