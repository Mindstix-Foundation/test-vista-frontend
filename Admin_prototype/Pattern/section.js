document.addEventListener("DOMContentLoaded", function () {
    const totalQuestionInput = document.getElementById("totalQuestion");
    const mandatoryQuestionInput = document.getElementById("requiredQuestion");
    const marksPerQuestionInput = document.getElementById("marksPerQuestion");
    const sectionMarksInput = document.getElementById("sectionMarks");
    const remainingMarksInput = document.getElementById("remainingMarks");
    const sameTypeCheckbox = document.getElementById("sameType");
    const questionTypeContainer = document.querySelector("fieldset .row.g-2");
    const questionTypeInput = document.getElementById("questionType");
    const submitButton = document.getElementById("submit_button");

    marksPerQuestionInput.addEventListener("input",()=>{
        if(marksPerQuestionInput.value===""){
            remainingMarksInput.value  = tempMarks;
            remainingMarks=tempMarks;
        }
    });
    let remainingMarks = remainingMarksInput.value; // Set initial remaining marks
    let tempMarks=remainingMarksInput.value;
    // Function to calculate section marks
    function calculateSectionMarks() {
        const mandatoryQuestions = parseInt(mandatoryQuestionInput.value) || 0;
        const marksPerQuestion = parseInt(marksPerQuestionInput.value) || 0;
        const sectionMarks = mandatoryQuestions * marksPerQuestion;

        if (mandatoryQuestions > parseInt(totalQuestionInput.value || 0)) {
            mandatoryQuestionInput.style.border= "2px solid red";
            mandatoryQuestionInput.value = "";
            setTimeout(() => {
                mandatoryQuestionInput.style.border = ""; // Reset to default with animation
            }, 500);
        } else if (sectionMarks > remainingMarks) {
           marksPerQuestionInput.style.border= "2px solid red";
            marksPerQuestionInput.value = "";
            sectionMarksInput.value = "";
            remainingMarksInput.value  = tempMarks;
            remainingMarks=tempMarks;
            setTimeout(() => {
                marksPerQuestionInput.style.border= ""; // Reset to default with animation
            }, 500);
        } else {
            sectionMarksInput.value = sectionMarks;
            remainingMarks -= sectionMarks;
            remainingMarksInput.value = remainingMarks;
        }
    }

    // Event listeners for calculating marks
    [mandatoryQuestionInput, marksPerQuestionInput].forEach(input => {
        input.addEventListener("input", calculateSectionMarks);
    });

    function manageQuestionTypes() {
        const totalQuestions = parseInt(totalQuestionInput.value) || 0;
    
        if (sameTypeCheckbox.checked) {
            // If "All questions are of the same type" is checked, keep only one input group
            questionTypeContainer.querySelectorAll(".input-group:not(:first-child)").forEach(el => el.remove());
    
            // Reset numbering for the single input group
            const firstGroup = questionTypeContainer.querySelector(".input-group");
            if (firstGroup) {
                firstGroup.querySelector(".input-group-text").textContent = "1";
                firstGroup.querySelector("input").id = "questionType1";
                firstGroup.querySelector("label").htmlFor = "questionType1";
                firstGroup.querySelector("input").value = ""; // Clear the input value
            }
        } else if (totalQuestions === 0) {
            // Preserve the checkbox and remove only input groups
            questionTypeContainer.querySelectorAll(".input-group").forEach(el => el.remove());
    
            // Add the default single input group
            const defaultInputGroup = createDefaultInputGroup(1);
            questionTypeContainer.appendChild(defaultInputGroup);
        } else {
            const currentInputs = questionTypeContainer.querySelectorAll(".input-group").length;
    
            if (totalQuestions > currentInputs) {
                // Add new input groups if total questions are more than current inputs
                for (let i = currentInputs; i < totalQuestions; i++) {
                    const newInputGroup = createDefaultInputGroup(i + 1);
                    questionTypeContainer.appendChild(newInputGroup);
                }
            } else if (totalQuestions < currentInputs) {
                // Remove extra inputs if total questions are fewer than current inputs
                for (let i = currentInputs; i > totalQuestions; i--) {
                    questionTypeContainer.querySelector(".input-group:last-child").remove();
                }
            }
    
            // Update numbering for all input groups
            questionTypeContainer.querySelectorAll(".input-group").forEach((group, index) => {
                const span = group.querySelector(".input-group-text");
                if (span) {
                    span.textContent = (index + 1).toString();
                }
            });
        }
    }
    
    // Helper function to create a default input group
    function createDefaultInputGroup(index) {
        const inputGroup = document.createElement("div");
        inputGroup.classList.add("input-group", "mb-3");
    
        const inputGroupText = document.createElement("span");
        inputGroupText.classList.add("input-group-text");
        inputGroupText.textContent = index;
    
        const formFloating = document.createElement("div");
        formFloating.classList.add("form-floating");
    
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control");
        input.id = `questionType${index}`;
        input.placeholder = "Question Type";
        input.setAttribute("list", "questionTypeList");
    
        const label = document.createElement("label");
        label.htmlFor = `questionType${index}`;
        label.textContent = "Search for Question Type";
    
        formFloating.appendChild(input);
        formFloating.appendChild(label);
    
        inputGroup.appendChild(inputGroupText);
        inputGroup.appendChild(formFloating);
    
        return inputGroup;
    }
    

    // Event listener for question type management
    sameTypeCheckbox.addEventListener("change", manageQuestionTypes);
    totalQuestionInput.addEventListener("input", () => {
        if (!sameTypeCheckbox.checked) manageQuestionTypes();
    });

    
});
