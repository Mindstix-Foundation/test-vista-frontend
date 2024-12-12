// List of additional questions for shuffling
const additionalQuestions = [
    {
        question: "Which metal is most reactive among the following?<span class='marks'> [1 Mark]</span><br> A) Copper <br> B) Gold <br> C) Potassium <br> D) Silver",
        answer: "C) Potassium"
    },
    {
        question: "In which part of the human body does digestion begin?<span class='marks'> [1 Mark]</span><br> A) Stomach <br> B) Small intestine <br> C) Mouth <br> D) Large intestine",
        answer: "C) Mouth"
    },
    {
        question: "The color of the sky appears blue due to:<span class='marks'> [1 Mark]</span><br> A) Refraction of light <br> B) Absorption of light <br> C) Scattering of light <br> D) Diffusion of light",
        answer: "C) Scattering of light"
    },
    {
        question: "Which of the following is a non-renewable source of energy?<span class='marks'> [1 Mark]</span><br> A) Solar <br> B) Wind <br> C) Coal <br> D) Geothermal",
        answer: "C) Coal"
    },
    {
        question: "What is the boiling point of water at sea level?<span class='marks'> [1 Mark]</span><br> A) 50°C <br> B) 100°C <br> C) 200°C <br> D) 0°C",
        answer: "B) 100°C"
    }
];

// Function to shuffle questions
function shuffleQuestion(questionIndex) {
    const newQuestion = additionalQuestions[Math.floor(Math.random() * additionalQuestions.length)];
    const questionDiv = document.getElementById(`question-${questionIndex + 1}`);
    questionDiv.innerHTML = `<span>${questionIndex + 1}. ${newQuestion.question}</span><span class="marks">${newQuestion.answer}</span><div class="options"></div><div class="shuffle-container"><button class="shuffle-button" onclick="shuffleQuestion(${questionIndex})">Change Question</button></div>`;
}

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
