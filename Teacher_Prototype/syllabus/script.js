document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const language = document.getElementById("language");
    const classSelect = document.getElementById("class");
    const subjectSelect = document.getElementById("subject");
    const viewSyllabusBtn = document.getElementById("viewSyllabusBtn");

    // Disable all dependent fields initially
    language.disabled = true;
    classSelect.disabled = true;
    subjectSelect.disabled = true;
    viewSyllabusBtn.disabled = true;

    // Enable language selection when board is selected
    board.addEventListener("change", enableLanguageSelection);

    // Enable class selection when language is selected
    language.addEventListener("change", enableClassSelection);

    // Enable subject selection when class is selected
    classSelect.addEventListener("change", enableSubjectSelection);

    // Enable "View Syllabus" button when subject is selected
    subjectSelect.addEventListener("change", enableViewSyllabusButton);

    // Handle form submission
    const form = document.getElementById("viewSyllabusForm");
    form.addEventListener("submit", handleFormSubmission);

    function enableLanguageSelection() {
        if (board.value) {
            language.disabled = false; // Enable language selection
        } else {
            resetSelections(); // Reset dependent fields
        }
    }

    function enableClassSelection() {
        if (language.value) {
            classSelect.disabled = false; // Enable class selection
        } else {
            classSelect.disabled = true; // Disable if no language is selected
            resetClassAndBelow(); // Reset class and dependent fields
        }
    }

    function enableSubjectSelection() {
        if (classSelect.value) {
            subjectSelect.disabled = false; // Enable subject selection
        } else {
            subjectSelect.disabled = true; // Disable if no class is selected
            viewSyllabusBtn.disabled = true; // Disable button
            subjectSelect.value = ""; // Reset subject selection
        }
    }

    function enableViewSyllabusButton() {
        viewSyllabusBtn.disabled = !subjectSelect.value; // Enable button only if subject is selected
    }

    function resetSelections() {
        language.value = ""; // Reset language selection
        language.disabled = true; // Disable language selection
        resetClassAndBelow(); // Reset class and dependent fields
    }

    function resetClassAndBelow() {
        classSelect.value = ""; // Reset class selection
        classSelect.disabled = true; // Disable class selection
        subjectSelect.value = ""; // Reset subject selection
        subjectSelect.disabled = true; // Disable subject selection
        viewSyllabusBtn.disabled = true; // Disable button
    }

    function handleFormSubmission(event) {
        event.preventDefault(); // Prevent default form submission

        if (board.value && language.value && classSelect.value && subjectSelect.value) {
            // Redirect based on the selected subject
            if (subjectSelect.value === "science") {
                window.location.href = "scienceSyllabus.html"; // Redirect to science syllabus
            } else if (subjectSelect.value === "maths") {
                window.location.href = "mathsSyllabus.html"; // Redirect to maths syllabus
            }
        } else {
            alert("Please select all fields.");
        }
    }
});