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
