// Show weightage section after selecting total marks
document.getElementById('totalMarks').addEventListener('change', function () {
    const totalMarks = parseInt(this.value);
    const chapterOptions = document.querySelectorAll('.chapter-option.active');

    if (totalMarks && chapterOptions.length > 0) {
        document.getElementById('weightageSection').style.display = 'block';
        updateWeightageInputs(chapterOptions, totalMarks);
    } else {
        document.getElementById('weightageSection').style.display = 'none';
    }
});

// Function to update weightage input fields based on selected chapters
function updateWeightageInputs(chapterOptions, totalMarks) {
    const weightageInputs = document.getElementById('weightageInputs');
    weightageInputs.innerHTML = '';

    if (chapterOptions.length > 0) {
        // Calculate marks per chapter (divide total marks equally)
        const marksPerChapter = Math.floor(totalMarks / chapterOptions.length);
        const remainder = totalMarks % chapterOptions.length;

        chapterOptions.forEach((chapter, index) => {
            const chapterName = chapter.getAttribute('data-chapter');
            const inputGroup = document.createElement('div');
            inputGroup.classList.add('input-group', 'mb-2');

            const label = document.createElement('span');
            label.classList.add('input-group-text');
            label.innerText = chapterName;

            const input = document.createElement('input');
            input.type = 'number';
            input.classList.add('form-control');
            input.min = 0;
            input.value = marksPerChapter + (index < remainder ? 1 : 0); // Distribute remaining marks
            input.placeholder = `Enter marks for ${chapterName}`;
            input.setAttribute('data-chapter', chapterName);  // Add data attribute for identification
            input.addEventListener('input', () => onChapterMarksChange());

            inputGroup.appendChild(label);
            inputGroup.appendChild(input);
            weightageInputs.appendChild(inputGroup);
        });
    }
}
function initializeTotalDisplay() {
    const totalMarks = parseInt(document.getElementById('totalMarks').value) || 0;
    const totalBox = document.getElementById('enteredTotal');

    // Set initial total to match totalMarks
    totalBox.innerText = totalMarks;

    // Set color based on whether we have a matching total
    if (totalMarks === 0) {
        totalBox.classList.remove('text-success');
        totalBox.classList.add('text-danger');
    } else {
        totalBox.classList.add('text-success');
        totalBox.classList.remove('text-danger');
    }
}
// Call initializeTotalDisplay on page load
initializeTotalDisplay();

// Also update it whenever totalMarks changes
document.getElementById('totalMarks').addEventListener('input', initializeTotalDisplay);

// Other related functions remain the same

// When a user changes marks for any chapter, recalculate the total and adjust the feedback
function onChapterMarksChange() {
    const totalMarks = parseInt(document.getElementById('totalMarks').value);
    const inputs = document.querySelectorAll('#weightageInputs input');

    let totalEntered = 0;

    // Calculate the total entered marks
    inputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        totalEntered += value;
    });

    // Update the total marks entered and display it
    const totalBox = document.getElementById('enteredTotal');
    totalBox.innerText = totalEntered;

    // Change color based on the total entered
    if (totalEntered < totalMarks) {
        totalBox.classList.add('text-danger');
        totalBox.classList.remove('text-success');
    } else if (totalEntered > totalMarks) {
        totalBox.classList.add('text-danger');
        totalBox.classList.remove('text-success');
    } else {
        totalBox.classList.add('text-success');
        totalBox.classList.remove('text-danger');
    }
}

// Toggle active class on selected chapters and update weightage inputs
document.querySelectorAll('.chapter-option').forEach(chapter => {
    chapter.addEventListener('click', () => {
        chapter.classList.toggle('active');
        const totalMarks = parseInt(document.getElementById('totalMarks').value);
        updateWeightageInputs(document.querySelectorAll('.chapter-option.active'), totalMarks);
    });
});

// Show chapters only when a subject is selected
document.getElementById('subject').addEventListener('change', function () {
    const chapterSection = document.getElementById('chapterSelection');
    if (this.value) {
        chapterSection.style.display = 'block';
    } else {
        chapterSection.style.display = 'none';
    }
});

// Toggle chapter selection on click using event delegation
document.getElementById('chapterSelection').addEventListener('click', function (event) {
    if (event.target.classList.contains('chapter-option')) {
        event.target.classList.toggle('bg-success');
        event.target.classList.toggle('text-white');
    }
});

// Function to filter patterns based on search query
function filterPatterns() {
    const searchQuery = document.getElementById("patternSearch").value.toLowerCase();
    const patternCards = document.querySelectorAll(".card");

    patternCards.forEach(card => {
        const title = card.querySelector(".card-title").textContent.toLowerCase();
        const description = card.querySelector(".card-text").textContent.toLowerCase();

        if (title.includes(searchQuery) || description.includes(searchQuery)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
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

document.addEventListener('DOMContentLoaded', function () {
    // Enable Language and Class selections based on dependencies
    document.getElementById('board').addEventListener('change', enableLanguageSelection);
    document.getElementById('language').addEventListener('change', enableClassSelection);
    document.getElementById('class').addEventListener('change', enableSubjectSelection);
    document.getElementById('subject').addEventListener('change', enableTotalMarksSelection);

    // Disable all elements initially
    document.getElementById('language').disabled = true;
    document.getElementById('class').disabled = true;
    document.getElementById('subject').disabled = true;
    document.getElementById('totalMarks').disabled = true;
    document.getElementById('selectPatternBtn').disabled = true;

    // Enable Language selection after Board is selected
    function enableLanguageSelection() {
        const board = document.getElementById('board').value;
        const languageSelect = document.getElementById('language');
        const classSelect = document.getElementById('class');

        if (board) {
            languageSelect.disabled = false; // Enable language select
        } else {
            languageSelect.disabled = true; // Disable language select if no board is selected
            classSelect.disabled = true; // Disable class select
            resetSelections(); // Reset all dependent selections
        }
    }

    // Enable Class selection after Language is selected
    function enableClassSelection() {
        const language = document.getElementById('language').value;
        const classSelect = document.getElementById('class');

        if (language) {
            classSelect.disabled = false; // Enable class select
        } else {
            classSelect.disabled = true; // Disable class select
            resetSelections('class'); // Reset class and subsequent selections
        }
    }

    // Enable Subject selection after Class is selected
    function enableSubjectSelection() {
        const selectedClass = document.getElementById('class').value;
        const subjectSelect = document.getElementById('subject');

        if (selectedClass) {
            subjectSelect.disabled = false; // Enable subject select
        } else {
            subjectSelect.disabled = true; // Disable subject select
            resetSelections('subject'); // Reset subject and subsequent selections
        }
    }

    // Enable Total Marks selection after Subject is selected
    function enableTotalMarksSelection() {
        const selectedSubject = document.getElementById('subject').value;
        const totalMarksSelect = document.getElementById('totalMarks');

        if (selectedSubject) {
            totalMarksSelect.disabled = false; // Enable total marks select
        } else {
            totalMarksSelect.disabled = true; // Disable total marks select
            document.getElementById('selectPatternBtn').disabled = true; // Disable pattern button
        }
    }

    // Reset selections if required
    function resetSelections(target) {
        if (!target || target === 'language') {
            document.getElementById('language').value = '';
            document.getElementById('language').disabled = true;
        }
        if (!target || target === 'class') {
            document.getElementById('class').value = '';
            document.getElementById('class').disabled = true;
        }
        if (!target || target === 'subject') {
            document.getElementById('subject').value = '';
            document.getElementById('subject').disabled = true;
        }
        if (!target || target === 'totalMarks') {
            document.getElementById('totalMarks').value = '';
            document.getElementById('totalMarks').disabled = true;
            document.getElementById('selectPatternBtn').disabled = true;
        }
    }

    // Enable the "Select Pattern" button only when total marks are selected
    document.getElementById('totalMarks').addEventListener('change', function () {
        const totalMarks = document.getElementById('totalMarks').value;
        const selectPatternBtn = document.getElementById('selectPatternBtn');

        if (totalMarks) {
            selectPatternBtn.disabled = false; // Enable pattern button
        } else {
            selectPatternBtn.disabled = true; // Disable pattern button if no total marks selected
        }
    });
});