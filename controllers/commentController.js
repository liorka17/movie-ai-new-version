const Comment = require('../models/Comment'); // ייבוא מודל התגובות
const Rating = require('../models/rating');   // ייבוא מודל הדירוגים

exports.postComment = async (req, res) => { // פונקציה שמטפלת בהוספת תגובה
  try {
    const { movieId, content } = req.body;             // קבלת מזהה הסרט ותוכן התגובה מהבקשה
    const userId = req.user._id;                       // קבלת מזהה המשתמש מתוך ה-token
    const username = req.user.username;                // קבלת שם המשתמש מתוך ה-token

    const existingRating = await Rating.findOne({ movieId, userId }); // בדיקה אם המשתמש דירג את הסרט הזה

    const comment = new Comment({                      // יצירת תגובה חדשה עם הנתונים הרלוונטיים
      movieId,                                          // מזהה הסרט
      content,                                          // תוכן התגובה
      userId,                                           // מזהה המשתמש
      username,                                         // שם המשתמש
      rating: existingRating?.rating || null           // אם קיים דירוג – שים אותו, אחרת null
    });

    await comment.save();                              // שמירה של התגובה למסד הנתונים
    res.redirect('back');                              // החזרה לעמוד הקודם אחרי ההוספה
  } catch (err) {
    console.error("❌ Error saving comment:", err);     // הדפסת שגיאה אם משהו נכשל
    res.status(500).send("Server error");              // שליחת שגיאת שרת ללקוח
  }
};

exports.deleteComment = async (req, res) => {          // פונקציה למחיקת תגובה
  try {
    const comment = await Comment.findById(req.params.id); // שליפת תגובה לפי מזהה מה-URL

    if (!comment || !comment.userId.equals(req.user._id)) { // בדיקה אם המשתמש הוא הבעלים של התגובה
      return res.status(403).send("❌ אין הרשאה למחוק תגובה"); // אם לא – מחזירים שגיאה
    }

    await Comment.findByIdAndDelete(req.params.id);    // מחיקת התגובה מהמסד
    res.redirect('back');                              // הפניה חזרה לעמוד הקודם
  } catch (err) {
    console.error("❌ Error deleting comment:", err);   // הדפסת שגיאה אם משהו נכשל
    res.status(500).send("Server error");              // שליחת שגיאת שרת ללקוח
  }
};

exports.editCommentForm = async (req, res) => {        // פונקציה להצגת טופס עריכת תגובה
  try {
    const comment = await Comment.findById(req.params.id); // שליפת תגובה לפי מזהה מה-URL

    if (!comment || !comment.userId.equals(req.user._id)) { // בדיקה אם המשתמש הוא הבעלים של התגובה
      return res.status(403).send("❌ אין הרשאה לערוך תגובה"); // אם לא – מחזירים שגיאה
    }

    res.render("editComment", { comment });            // הצגת תבנית העריכה עם הנתונים של התגובה
  } catch (err) {
    console.error("❌ Error loading comment for edit:", err); // הדפסת שגיאה אם משהו נכשל
    res.status(500).send("Server error");              // שליחת שגיאת שרת ללקוח
  }
};

exports.updateComment = async (req, res) => {          // פונקציה לעדכון תגובה אחרי עריכה
  try {
    const { content } = req.body;                      // קבלת תוכן מעודכן מהבקשה
    const comment = await Comment.findById(req.params.id); // שליפת התגובה לפי מזהה

    if (!comment || !comment.userId.equals(req.user._id)) { // בדיקה אם המשתמש הוא הבעלים של התגובה
      return res.status(403).send("❌ אין הרשאה לעדכן תגובה"); // אם לא – מחזירים שגיאה
    }

    comment.content = content;                         // עדכון תוכן התגובה
    await comment.save();                              // שמירה למסד הנתונים
    res.redirect('back');                              // הפניה חזרה לעמוד הקודם
  } catch (err) {
    console.error("❌ Error updating comment:", err);   // הדפסת שגיאה אם משהו נכשל
    res.status(500).send("Server error");              // שליחת שגיאת שרת ללקוח
  }
};
