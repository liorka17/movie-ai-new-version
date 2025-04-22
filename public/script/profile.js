document.addEventListener("DOMContentLoaded", () => { // מפעיל את הקוד לאחר טעינת ה-DOM
  const deleteForm = document.getElementById("deleteForm"); // תופס את טופס המחיקה לפי ID

  if (!deleteForm) return; // אם לא קיים טופס מחיקה – יוצא מהפונקציה

  deleteForm.addEventListener("submit", (event) => { // מאזין לשליחת הטופס
      event.preventDefault(); // מונע שליחה רגילה של הטופס

      Swal.fire({ // מציג חלון אישור עם SweetAlert
          title: 'אתה בטוח?', // כותרת
          text: "⚠️ פעולה זו תמחק את החשבון שלך לצמיתות!", // טקסט אזהרה
          icon: 'warning', // אייקון אזהרה
          showCancelButton: true, // מציג כפתור ביטול
          confirmButtonColor: '#d33', // צבע כפתור אישור
          cancelButtonColor: '#3085d6', // צבע כפתור ביטול
          confirmButtonText: 'כן, מחק אותי!', // טקסט כפתור אישור
          cancelButtonText: 'ביטול' // טקסט כפתור ביטול
      }).then((result) => { // פעולה לאחר בחירת המשתמש
          if (result.isConfirmed) { // אם המשתמש אישר
              deleteForm.submit(); // שליחת הטופס למחיקה
          }
      });
  });
});



document.addEventListener("DOMContentLoaded", () => { // מאזין לטעינת הדף
  const genreSelect = document.getElementById("genreSelect"); // תופס את dropdown של הז'אנרים
  const statusSpan = document.getElementById("genre-update-status"); // אלמנט להצגת סטטוס

  genreSelect?.addEventListener("change", async () => { // מאזין לשינוי בז'אנר
      const selectedGenre = genreSelect.value; // לוקח את הערך הנבחר
      try {
          statusSpan.innerText = "🔄"; // מציג חיווי של טעינה
          const res = await fetch("/profile/updateGenre", { // שולח בקשה לשרת עם הז'אנר הנבחר
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ favoriteGenre: selectedGenre }) // שולח את הז'אנר בפורמט JSON
          });

          const data = await res.json(); // קורא את התשובה
          statusSpan.innerText = data.success ? "✅" : "❌"; // מעדכן סטטוס בהתאם לתוצאה
          if (data.updatedMoviesHtml) { // אם התקבל HTML מעודכן
              document.querySelector(".movies-grid").innerHTML = data.updatedMoviesHtml; // מחליף את הסרטים בצפייה חדשה
          }
      } catch (err) {
          console.error("Genre update failed:", err); // שגיאה אם משהו נכשל
          statusSpan.innerText = "❌"; // מציג סטטוס של שגיאה
      }
  });
});
