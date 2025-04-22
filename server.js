const http = require('http'); // מייבא את המודול http ליצירת שרת
const app = require('./app'); // מייבא את אפליקציית האקספרס שלך מתוך הקובץ app.js

const Server = http.createServer(app); // יוצר שרת HTTP מהאפליקציה

const PORT = process.env.PORT || 5000; // מגדיר את הפורט - אם אין ב-env אז ברירת מחדל 5000

Server.listen(PORT, () => { // מאזין לפורט שהוגדר ומפעיל את השרת
    console.log(`server started on ${PORT}`); // מדפיס לקונסול כשהשרת עלה
});
