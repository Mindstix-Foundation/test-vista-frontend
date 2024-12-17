document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const classSelect = document.getElementById("class");
    const subjectSelect = document.getElementById("subject");
    const viewSyllabusBtn = document.getElementById("viewSyllabusBtn");

    // Disable all dependent fields initially
    classSelect.disabled = true;
    subjectSelect.disabled = true;
    viewSyllabusBtn.disabled = true;

    // Enable class selection when board is selected
    board.addEventListener("change", () => {
        if (board.value) {
            classSelect.disabled = false; // Enable class selection
        } else {
            classSelect.disabled = true; // Disable if no board is selected
            subjectSelect.disabled = true; // Reset subject selection
            viewSyllabusBtn.disabled = true; // Disable button
            classSelect.value = ""; // Reset class selection
            subjectSelect.value = ""; // Reset subject selection
        }
    });

    // Enable subject selection when class is selected
    classSelect.addEventListener("change", () => {
        if (classSelect.value) {
            subjectSelect.disabled = false; // Enable subject selection
        } else {
            subjectSelect.disabled = true; // Disable if no class is selected
            viewSyllabusBtn.disabled = true; // Disable button
            subjectSelect.value = ""; // Reset subject selection
        }
    });

    // Enable "View Syllabus" button when subject is selected
    subjectSelect.addEventListener("change", () => {
        if (subjectSelect.value) {
            viewSyllabusBtn.disabled = false; // Enable button
        } else {
            viewSyllabusBtn.disabled = true; // Disable button if no subject is selected
        }
    });

    // Handle form submission
    const form = document.getElementById("viewSyllabusForm");
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission

        if (board.value && classSelect.value && subjectSelect.value) {
            // Redirect based on the selected subject
            if (subjectSelect.value === "science") {
                window.location.href = "scienceSyllabus.html"; // Redirect to science syllabus
            } else if (subjectSelect.value === "maths") {
                window.location.href = "mathsSyllabus.html"; // Redirect to maths syllabus
            }
        } else {
            alert("Please select all fields.");
        }
    });
});
