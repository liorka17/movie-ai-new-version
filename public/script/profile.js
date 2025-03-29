document.addEventListener("DOMContentLoaded", () => {
    const deleteForm = document.getElementById("deleteForm");

    if (!deleteForm) return;

    deleteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        Swal.fire({
            title: 'אתה בטוח?',
            text: "⚠️ פעולה זו תמחק את החשבון שלך לצמיתות!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'כן, מחק אותי!',
            cancelButtonText: 'ביטול'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteForm.submit();
            }
        });
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const genreSelect = document.getElementById("genreSelect");
    const statusSpan = document.getElementById("genre-update-status");
  
    genreSelect?.addEventListener("change", async () => {
      const selectedGenre = genreSelect.value;
      try {
        statusSpan.innerText = "🔄";
        const res = await fetch("/profile/updateGenre", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ favoriteGenre: selectedGenre })
        });
  
        const data = await res.json();
        statusSpan.innerText = data.success ? "✅" : "❌";
        if (data.updatedMoviesHtml) {
          document.querySelector(".movies-grid").innerHTML = data.updatedMoviesHtml;
        }
      } catch (err) {
        console.error("Genre update failed:", err);
        statusSpan.innerText = "❌";
      }
    });
  });
  