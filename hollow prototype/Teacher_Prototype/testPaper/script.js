const additionalQuestions = [
    {
        question: "Which metal is most reactive among the following?",
        options: "A) Copper <br> B) Gold <br> C) Potassium <br> D) Silver",
        marks: "[1 Mark]"
    },
    {
        question: "In which part of the human body does digestion begin?",
        options: "A) Stomach <br> B) Small intestine <br> C) Mouth <br> D) Large intestine",
        marks: "[1 Mark]"
    },
    {
        question: "The color of the sky appears blue due to:",
        options: "A) Refraction of light <br> B) Absorption of light <br> C) Scattering of light <br> D) Diffusion of light",
        marks: "[1 Mark]"
    },
    {
        question: "Which of the following is a non-renewable source of energy?",
        options: "A) Solar <br> B) Wind <br> C) Coal <br> D) Geothermal",
        marks: "[1 Mark]"
    },
    {
        question: "What is the boiling point of water at sea level?",
        options: "A) 50°C <br> B) 100°C <br> C) 200°C <br> D) 0°C",
        marks: "[1 Mark]"
    }
];

// Function to shuffle questions
function shuffleQuestion(questionIndex) {
    const newQuestion = additionalQuestions[Math.floor(Math.random() * additionalQuestions.length)];
    const questionDiv = document.getElementById(`question-${questionIndex + 1}`);

    questionDiv.innerHTML = `
        <div class="marks-container">
            <span>${questionIndex + 1}. ${newQuestion.question}</span>
            <span class="marks">${newQuestion.marks}</span>
        </div>
        <div class="options">
            ${newQuestion.options}
        </div>
        <div class="shuffle-container">
        <button class="btn btn-outline-primary shuffle-button" onclick="shuffleQuestion(${questionIndex})">
                        <i class="bi bi-arrow-clockwise"></i> Change Question
                    </button>
        </div>
    `;
}
document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.getElementById('backToTop');

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function () {
        if (document.documentElement.scrollTop > 200) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    // Scroll to top
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Function to print the page
function printPage() {
    window.print();
}

// Function to save the page
function savePage() {
    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'science_test_paper.html';
    link.click();
}
function exitPage() {
    window.history.back();
}