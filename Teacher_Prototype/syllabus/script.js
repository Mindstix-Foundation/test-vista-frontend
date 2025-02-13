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

    // Restore selections from localStorage
    restoreSelections();

    // Add event listeners
    board.addEventListener("change", () => {
        handleBoardChange();
        saveSelections();
    });

    language.addEventListener("change", () => {
        handleLanguageChange();
        saveSelections();
    });

    classSelect.addEventListener("change", () => {
        handleClassChange();
        saveSelections();
    });

    subjectSelect.addEventListener("change", () => {
        enableViewSyllabusButton();
        saveSelections();
    });

    // Handle form submission
    const form = document.getElementById("viewSyllabusForm");
    form.addEventListener("submit", handleFormSubmission);

    function handleBoardChange() {
        if (board.value) {
            language.disabled = false; // Enable language
        } else {
            language.disabled = true; // Disable language if board is not selected
        }
        language.value = ""; // Reset language selection
        resetClassAndBelow(); // Reset class and all fields below it
    }

    function handleLanguageChange() {
        if (language.value) {
            classSelect.disabled = false; // Enable class
        } else {
            classSelect.disabled = true; // Disable class if language is not selected
        }
        classSelect.value = ""; // Reset class selection
        resetSubjectAndBelow(); // Reset subject and all fields below it
    }

    function handleClassChange() {
        if (classSelect.value) {
            subjectSelect.disabled = false; // Enable subject
        } else {
            subjectSelect.disabled = true; // Disable subject if class is not selected
        }
        subjectSelect.value = ""; // Reset subject selection
        viewSyllabusBtn.disabled = true; // Disable "View Syllabus" button
    }

    function enableViewSyllabusButton() {
        viewSyllabusBtn.disabled = !subjectSelect.value; // Enable button only if subject is selected
    }

    function resetClassAndBelow() {
        classSelect.value = ""; // Reset class selection
        classSelect.disabled = true; // Disable class selection
        resetSubjectAndBelow(); // Reset subject and dependent fields
    }

    function resetSubjectAndBelow() {
        subjectSelect.value = ""; // Reset subject selection
        subjectSelect.disabled = true; // Disable subject selection
        viewSyllabusBtn.disabled = true; // Disable button
    }

    function saveSelections() {
        // Save current selections to localStorage
        const state = {
            board: board.value,
            language: language.value,
            classSelect: classSelect.value,
            subjectSelect: subjectSelect.value,
        };
        localStorage.setItem("syllabusFormState", JSON.stringify(state));
    }

    function restoreSelections() {
        // Restore selections from localStorage
        const savedState = JSON.parse(localStorage.getItem("syllabusFormState"));
        if (savedState) {
            board.value = savedState.board || "";
            if (board.value) {
                language.disabled = false;
            }
            language.value = savedState.language || "";
            if (language.value) {
                classSelect.disabled = false;
            }
            classSelect.value = savedState.classSelect || "";
            if (classSelect.value) {
                subjectSelect.disabled = false;
            }
            subjectSelect.value = savedState.subjectSelect || "";
            viewSyllabusBtn.disabled = !subjectSelect.value; // Enable button if subject is selected
        }
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
