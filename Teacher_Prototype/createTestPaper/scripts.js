// Show chapters only when a subject is selected
document.getElementById('subject').addEventListener('change', function() {
    const chapterSection = document.getElementById('chapterSelection');
    if (this.value) {
        chapterSection.style.display = 'block';
    } else {
        chapterSection.style.display = 'none';
    }
});

// Toggle chapter selection on click using event delegation
document.getElementById('chapterSelection').addEventListener('click', function(event) {
    if (event.target.classList.contains('chapter-option')) {
        event.target.classList.toggle('bg-success');
        event.target.classList.toggle('text-white');
    }
});

// Function to filter patterns based on search query
function filterPatterns() {
    const searchQuery = document.getElementById("patternSearch").value.toLowerCase();
    const patternCards = document.querySelectorAll(".pattern-card");

    patternCards.forEach(card => {
        const title = card.querySelector(".card-title").textContent.toLowerCase();
        const description = card.querySelector(".card-text").textContent.toLowerCase();

        if (title.includes(searchQuery) || description.includes(searchQuery)) {
            card.parentElement.style.display = "block";
        } else {
            card.parentElement.style.display = "none";
        }
    });
}

// Function to select pattern, close modal, and update the button text
function selectPattern(patternName, element) {
    // Update the button text to the selected pattern name
    document.getElementById("selectPatternBtn").textContent = patternName;

    // Hide the modal after selection
    const modal = bootstrap.Modal.getInstance(element.closest('.modal'));
    modal.hide();
}
// Function to create the test paper based on the selected pattern and question type
function createTestPaper() {
    // Get the selected question type
    const selectedOption = document.querySelector('input[name="questionType"]:checked');

    // Check if a radio button is selected
    if (!selectedOption) {
        alert("Please select a question type to generate the test paper.");
        return;
    }

    // Determine the target URL based on the selected option
    let targetUrl = "";
    if (selectedOption.value === "boardOnly") {
        targetUrl = "../testPaper/testPaper2.html";
    } else if (selectedOption.value === "otherOnly" || selectedOption.value === "both") {
        targetUrl = "../testPaper/testPaper.html";
    }

    // Navigate to the target URL
    window.location.href = targetUrl;
}

document.addEventListener('DOMContentLoaded', function() {
    // Enable class selection once a board is selected
    document.getElementById('board').addEventListener('change', enableClassSelection);
    document.getElementById('class').addEventListener('change', enableSubjectSelection);
    document.getElementById('subject').addEventListener('change', enableTotalMarksSelection);
    
    // Disable all elements initially
    document.getElementById('class').disabled = true;
    document.getElementById('subject').disabled = true;
    document.getElementById('totalMarks').disabled = true;
    document.getElementById('selectPatternBtn').disabled = true;

    function enableClassSelection() {
        const board = document.getElementById('board').value;
        const classSelect = document.getElementById('class');
        if (board) {
            classSelect.disabled = false; // Enable class select
        } else {
            classSelect.disabled = true; // Disable class select if no board is selected
            resetSelections(); // Reset selections when the board is changed
        }
    }

    function enableSubjectSelection() {
        const selectedClass = document.getElementById('class').value;
        const subjectSelect = document.getElementById('subject');
        if (selectedClass) {
            subjectSelect.disabled = false; // Enable subject select
        } else {
            subjectSelect.disabled = true; // Disable subject select if no class is selected
            resetSelections(); // Reset selections when class is changed
        }
    }

    function enableTotalMarksSelection() {
        const selectedSubject = document.getElementById('subject').value;
        const totalMarksSelect = document.getElementById('totalMarks');
        if (selectedSubject) {
            totalMarksSelect.disabled = false; // Enable total marks select
        } else {
            totalMarksSelect.disabled = true; // Disable total marks select if no subject is selected
            document.getElementById('selectPatternBtn').disabled = true; // Disable pattern button
        }
    }

    // Reset selections if required
    function resetSelections() {
        document.getElementById('subject').disabled = true;
        document.getElementById('totalMarks').disabled = true;
        document.getElementById('selectPatternBtn').disabled = true;
    }

    // Enable the "Select Pattern" button only when total marks are selected
    document.getElementById('totalMarks').addEventListener('change', function() {
        const totalMarks = document.getElementById('totalMarks').value;
        const selectPatternBtn = document.getElementById('selectPatternBtn');
        if (totalMarks) {
            selectPatternBtn.disabled = false; // Enable pattern button
        } else {
            selectPatternBtn.disabled = true; // Disable pattern button if no total marks selected
        }
    });
});
