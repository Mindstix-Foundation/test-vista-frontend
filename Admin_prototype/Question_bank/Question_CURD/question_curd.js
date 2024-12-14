let boardData = [];
let questionsData = [];
let selectedQuestions=[];


document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("question_curd.html")) {
        console.log("Initializing question display page logic...");
        console.log("Current page:", currentPage);

        fetch('question_data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                questionsData = data.questions;
                //console.log("Fetched Questions Data:", questionsData); // Log fetched data

                const filterData = JSON.parse(localStorage.getItem("filterData"));
                console.log("Filter data:", filterData);

                if (filterData) {
                    
                    renderQuestions(filterData);
                    populateTopics(filterData);
                    loadUnverifiedQuestions();
                    toggleContainers();

                } else {
                    console.warn("No filterData found in localStorage.");
                }
            })
            .catch(error => console.error("Error fetching question data:", error));
    }
     else if(currentPage.includes("question.html")) {
      console.log("Initializing filter page logic...");
      fetch('question_data.json')
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
              
              questionsData = data.questions;
              initializeBoards(); // Initialize boards dropdown on the filter page
          })
          .catch(error => console.error("Error fetching question data:", error));
        }
     else if(currentPage.includes("addQuestion.html"))  {
        console.log("Initializing question display page logic...");
        console.log("Current page:", currentPage);

        fetch('question_data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                questionsData = data.questions;
               

                const filterData = JSON.parse(localStorage.getItem("filterData"));
                console.log("Filter data:", filterData);

                if (filterData) {
                    
                    populateTopics(filterData);
                    
                } else {
                    console.warn("No filterData found in localStorage.");
                }
            })
            .catch(error => console.error("Error fetching question data:", error));
     } 
     else if(currentPage.includes("needTranslation.html"))  {
      
      console.log("Current page:", currentPage);

      fetch('translation.json')
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
              questionsData = data.questions;
             

              const filterData = JSON.parse(localStorage.getItem("filterData"));
              console.log("Filter data:", filterData);

              if (filterData) {
                  
                  populateTopics(filterData);
                  renderQuestions(filterData);
                  
              } else {
                  console.warn("No filterData found in localStorage.");
              }
          })
          .catch(error => console.error("Error fetching question data:", error));
   } 
});


// Initialize Board Dropdown
function initializeBoards() {
  const datalist = document.getElementById("boardList");

  // Ensure the datalist exists
  if (!datalist) {
    console.error("Datalist with id 'boardList' not found");
    return;
  }


  // Check if questionsData is available and has topics
  if (!Array.isArray(questionsData) || questionsData.length === 0) {
    console.error("Invalid or empty questionsData");
    return;
  }

  // Extract unique board names from questionsData
  const boards = [...new Set(questionsData.flatMap(question => question.topics.map(topic => topic.board)))];
  console.log('Boards:', boards);

  // Clear the current options in the datalist
  datalist.innerHTML = '';

  // Add the unique boards as options in the datalist
  boards.forEach(board => {
    const option = document.createElement("option");
    option.value = board;
    datalist.appendChild(option);
  });
  console.log('Datalist updated with boards'); // Confirm the update
}

// Populate Classes Dropdown based on selected Board
function populateClasses() {
    const selectedBoard = document.getElementById("filterBoard").value;
    const filterClass = document.getElementById("filterClass");
    filterClass.innerHTML = '<option value="">Select Class</option>';

    const classes = [...new Set(questionsData
        .filter(question => question.topics.some(topic => topic.board === selectedBoard))
        .flatMap(question => question.topics.filter(topic => topic.board === selectedBoard).map(topic => topic.class)))];

    classes.forEach(classItem => {
        const option = document.createElement("option");
        option.value = classItem;
        option.textContent = `Class ${classItem}`;
        filterClass.appendChild(option);
    });

    resetDropdowns(['filterSubject', 'filterChapter']);
}

// Populate Subjects Dropdown based on selected Class
function populateSubjects() {
    const selectedBoard = document.getElementById("filterBoard").value;
    const selectedClass = document.getElementById("filterClass").value;
    const filterSubject = document.getElementById("filterSubject");
    filterSubject.innerHTML = '<option value="">Select Subject</option>';

    const subjects = [...new Set(questionsData
        .filter(question => question.topics.some(topic => topic.board === selectedBoard && topic.class == selectedClass))
        .flatMap(question => question.topics.filter(topic => topic.board === selectedBoard && topic.class == selectedClass).map(topic => topic.subject)))];

    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        filterSubject.appendChild(option);
    });

    resetDropdowns(['filterChapter']);
}

// Populate Chapters Dropdown based on selected Subject
function populateChapters() {
    const selectedBoard = document.getElementById("filterBoard").value;
    const selectedClass = document.getElementById("filterClass").value;
    const selectedSubject = document.getElementById("filterSubject").value;
    const filterChapter = document.getElementById("filterChapter");
    filterChapter.innerHTML = '<option value="">Select Chapter</option>';

    const chapters = [...new Set(questionsData
        .filter(question => question.topics.some(topic => topic.board === selectedBoard && topic.class == selectedClass && topic.subject === selectedSubject))
        .flatMap(question => question.topics.filter(topic => topic.board === selectedBoard && topic.class == selectedClass && topic.subject === selectedSubject).map(topic => topic.chapter)))];

    chapters.forEach(chapter => {
        const option = document.createElement("option");
        option.value = chapter;
        option.textContent = `Chapter ${chapter}`;
        filterChapter.appendChild(option);
    });


}

// Reset dropdowns to default options
function resetDropdowns(dropdowns) {
  dropdowns.forEach(id => {
      const dropdown = document.getElementById(id);
      if (dropdown) {
          dropdown.innerHTML = '<option value="">Select Option</option>';
      } else {
          console.error(`Dropdown with ID "${id}" not found!`);
      }
  });
}

// Check chapter selection and save to localStorage
function checkChapterSelected(event) {
    const chapterDropdown = document.getElementById("filterChapter");
    if (!chapterDropdown.value) {
        event.preventDefault();
        alert("Please select a chapter before proceeding.");
        return false;
    }

    const filterData = {
        board: document.getElementById("filterBoard").value,
        class: document.getElementById("filterClass").value,
        subject: document.getElementById("filterSubject").value,
        chapter: chapterDropdown.value
    };
    localStorage.setItem("filterData", JSON.stringify(filterData));
    return true;
}

// Render questions based on filter data from localStorage
function renderQuestions(filterData) {
  if (!filterData) {
      console.error("filterData is undefined or null!");
      return;
  }

  const { board, class: classValue, subject, chapter } = filterData;

  const boardLower = board.toLowerCase().trim();
  const subjectLower = subject.toLowerCase().trim();
  const classValueString = classValue.toString().trim();
  const chapterString = chapter.toString().trim();

  selectedQuestions = questionsData.filter(question => {
    // Filter topics for each question based on the filterData criteria
    const matchingTopics = question.topics.filter(topic => {
        return (
            topic.board.toLowerCase().trim() === boardLower &&
            topic.class.toString().trim() === classValueString &&
            topic.subject.toLowerCase().trim() === subjectLower &&
            topic.chapter.toString().trim() === chapterString
        );
    });

    // If there are matching topics, include the question and the filtered topics
    if (matchingTopics.length > 0) {
        // Include only the matching topics in the question
        question.topics = matchingTopics;
        return true;  // Include this question in the selectedQuestions array
    }

    return false;  // Exclude this question if no matching topics were found
});



  console.log("Selected Questions:", selectedQuestions);

  if (selectedQuestions.length > 0) {
      document.getElementById("questionsSection").classList.remove("hidden");
      displayQuestions(selectedQuestions);
  } else {
      document.getElementById("questionsSection").classList.add("hidden");
      console.warn("No questions match the filters.");
  }
}


// Display the questions in the UI
function displayQuestions(data) {
    const container = document.getElementById("verifiedContainer");
    container.innerHTML = ""; // Clear previous content

    const isTranslatePage = window.location.pathname.includes("needTranslation.html");  // Check if current page is "translate"

    data.forEach(question => {
        const uniqueIndex = Date.now() + Math.random();  // Generates a unique timestamp + random number
        let questionHTML = `
        <div class="col-12 col-md-10">
                <div class="card" data-unique-id="${uniqueIndex}">
                  <div class="row g-0">       
                    <div class="col-12 ">
                      <div class="card-body">
                       <div class="col-12 text-end">
                       
                         ${isTranslatePage ?`
                        
                         
                                   <i class="bi bi-vector-pen fs-4" data-question='${JSON.stringify(question)}' onclick='translateQuestion(event)'></i> 
                                
                                `:`
                          
                            
                           <i class="bi bi-pencil-square fs-4 me-2" data-question='${JSON.stringify(question)}' onclick='editQuestion(event)'></i>
                            
                         
                              <i class="bi bi-eraser fs-4 mx-2" data-question='${JSON.stringify(question)}' onclick='openRemoveConfirmationModal(${uniqueIndex})'></i>
                            
                         
                            
                              <i class="bi bi-trash3 fs-4 ms-2" data-question='${JSON.stringify(question)}' onclick='openDeleteConfirmationModal(${uniqueIndex})'></i>
                           
                         `}
                          
                        </div>
                        <blockquote class="blockquote mb-0">
                        <p class="card-text"><strong>Q :</strong> &nbsp; ${question.question}</p>
                               `;

                                // Display MCQ Options
                               if (question.type === "MCQ") {
            questionHTML += `<div class="row g-2">`;
            let counter = 1;
            question.options.forEach(option => {
                questionHTML += `<div class="col-12 col-md-6 col-lg-3"><strong>${String.fromCharCode(96 + counter)} :  &nbsp;</strong>${option}</div>`;
                counter++;
            });
            questionHTML += `</div>`;
                               }

                               // Display Match the Pair (LHS and RHS)
                               if (question.type === "Match the Pairs") {
            questionHTML += `<ul class="list-group">`;
            for (let i = 0; i < question.rhs.length; i++) {
                if(question.lhs.length > i) {
                    questionHTML += `<li class="list-group-item" >${question.lhs[i]} <strong>&nbsp;<-> &nbsp;</strong> ${question.rhs[i]}</li>`;
                } else {
                    questionHTML += `<li class="list-group-item disabled">.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.<strong>&nbsp;<->&nbsp;</strong> ${question.rhs[i]}</li>`;
                }
            }
            questionHTML += `</ul>`;
                               }
                             
                                // Handle the topics
        // If there are multiple topics, join them with commas
        const topicsDisplay = question.topics.map(topic => topic.topic).join(", ");

                                questionHTML += `
                            <footer class="blockquote-footer text-end mt-2">${topicsDisplay} <br> ${question.type} </footer>
                        </blockquote>        
                      </div>
                    </div>
                      
                      </div>
                    </div>
                  </div>
                </div>
               </div>
               </div>
        `;
        container.innerHTML += questionHTML;
    });
}



function populateTopics(filterData) {
  const { board, class: classValue, subject, chapter } = filterData;

  const filterTopic = document.getElementById("filterTopic");
  filterTopic.innerHTML = '<option value="">Select Topic</option>'; // Reset the dropdown

  // Collect topics based on selected filters
  const topics = [...new Set(
      questionsData
          .filter(question => 
              question.topics.some(topic => 
                  topic.board === board &&
                  topic.class.toString() === classValue.toString() &&
                  topic.subject === subject &&
                  topic.chapter.toString() === chapter.toString()
              )
          )
          .flatMap(question => 
              question.topics
                  .filter(topic => 
                      topic.board === board &&
                      topic.class.toString() === classValue.toString() &&
                      topic.subject === subject &&
                      topic.chapter.toString() === chapter.toString()
                  )
                  .map(topic => topic.topic)
          )
  )];

  // Populate the dropdown
  if (topics.length > 0) {
      topics.forEach(topic => {
          const option = document.createElement("option");
          option.value = topic;
          option.textContent = topic;
          filterTopic.appendChild(option);
      });
  } else {
      console.warn("No topics available for the selected filters.");
  }
}

/////////////////////////////////////////////////////////////////////////////////


// Function to filter visible cards inside the container based on search, topic, and type
function filterCards() {
  const searchQuery = document.getElementById('searchBar').value.toLowerCase();  // Get the search query
  const selectedTopic = document.getElementById('filterTopic').value.toLowerCase(); // Get the selected topic from the dropdown
  const selectedType = document.getElementById('filterType').value.toLowerCase(); // Get the selected type (Descriptive, MCQ, etc.)
  
  const cards = document.querySelectorAll('.card');  // Select all cards in the container
  
  cards.forEach(card => {
      const questionText = card.querySelector('.card-text').textContent.toLowerCase();  // Get question text from the card
      const optionsText = card.querySelectorAll('.col-12.col-md-6.col-lg-3');  // Get all options for MCQ type
      const topicsText = card.querySelector('.blockquote-footer').textContent.toLowerCase();  // Get topics from the footer

      // Check if the question text or any of the options match the search query
      const matchesSearch = questionText.includes(searchQuery) || Array.from(optionsText).some(option => option.textContent.toLowerCase().includes(searchQuery));

      // Check if the selected topic matches any of the topics listed in the card's footer
      const matchesTopic = selectedTopic ? topicsText.includes(selectedTopic) : true;

      // Check if the selected type matches the card's question type
      const matchesType = selectedType ? topicsText.includes(selectedType) : true;

      // Show or hide the card based on the filters
      if (matchesSearch && matchesTopic && matchesType) {
          card.style.display = 'block';  // Show the card if it matches all filters
      } else {
          card.style.display = 'none';  // Hide the card if it doesn't match
      }
  });
}
// Function to toggle visibility of containers based on switch state
function toggleContainers() {
    const switchState = document.getElementById("flexSwitchCheckBefore").checked; // Get the state of the switch

    // Get the containers
    const verifiedContainer = document.getElementById("verifiedContainer");
    const unverifiedContainer = document.getElementById("unverifiedContainer");

    // Get the labels
    const verifiedLabel = document.getElementById("verifiedLabel");
    const unverifiedLabel = document.getElementById("unverifiedLabel");

    // Toggle the hidden attribute and update label colors based on the switch state
    if (switchState) {
        // Show Unverified, hide Verified
        verifiedContainer.hidden = true;
        unverifiedContainer.hidden = false;

        // Change label colors
        verifiedLabel.classList.remove("text-dark");
        verifiedLabel.classList.add("text-secondary");

        unverifiedLabel.classList.remove("text-secondary");
        unverifiedLabel.classList.add("text-dark");
    } else {
        // Show Verified, hide Unverified
        verifiedContainer.hidden = false;
        unverifiedContainer.hidden = true;

        // Change label colors
        verifiedLabel.classList.remove("text-secondary");
        verifiedLabel.classList.add("text-dark");

        unverifiedLabel.classList.remove("text-dark");
        unverifiedLabel.classList.add("text-secondary");
    }
}


////////////////////////////////////////////////////////////////////////////////////////

function toggleQuestionContainer(selectElement) {
    // Get the selected value from the passed element
    const selectedType = selectElement.value;

    // Define all question container IDs
    const questionContainers = {
      Descriptive: 'descriptiveQuestion',
      MCQ: 'mcqQuestion',
      'Fill in the Blanks': 'fillBlankQuestion',
      'Match the Pairs': 'matchPairQuestion'
    };

    // Hide all containers initially
    Object.values(questionContainers).forEach(id => {
      document.getElementById(id).hidden = true;
    });

    // Show the selected container if a valid option is selected
    if (selectedType && questionContainers[selectedType]) {
      document.getElementById(questionContainers[selectedType]).hidden = false;
    }
  }


  function insertBlank() {
    // Get the textarea element
    const questionField = document.getElementById('fillInTheBlankQuestion');
    
    // Check if the element exists and is accessible
    if (!questionField) {
      console.error("Question field not found!");
      return;
    }

    const blankText = ' ________ ';
    
    // Ensure cursor support and avoid errors
    if (typeof questionField.selectionStart === "number" && typeof questionField.selectionEnd === "number") {
      const startPos = questionField.selectionStart;
      const endPos = questionField.selectionEnd;

      // Insert the blank at the cursor position
      questionField.value = questionField.value.substring(0, startPos) + 
                            blankText + 
                            questionField.value.substring(endPos);

      // Move the cursor after the inserted blank
      questionField.selectionStart = questionField.selectionEnd = startPos + blankText.length;
      questionField.focus();
    } else {
      // Fallback for browsers that don't support selectionStart/End
      questionField.value += blankText;
    }
  }


  ///////////////////////////////MATCH THE PAIR////////////////////////////////////

// Initialize counts for LHS and RHS inputs
let lhsCount = 2;
let rhsCount = 2;
let lhsIdCount = 2;
let rhsIdCount = 2;
// Function to add new input fields for LHS or RHS
function addInput(side) {
  if (side === 'lhs') {
    console.log(lhsCount);
    lhsCount++;
    lhsIdCount++;
    const lhsDiv = document.getElementById('lhsInputs');
    const newLhsInput = document.createElement('div');
    newLhsInput.className = 'input-group mb-2';
    newLhsInput.name = 'lhsInputGroup'
    newLhsInput.id = `lhsInput${lhsIdCount}`;
    newLhsInput.innerHTML = `
      <input type="text" name="lhs${lhsIdCount}" class="form-control" placeholder="LHS " required>
      <button type="button" class="btn btn-custom" onclick="removeInput('lhs', ${lhsIdCount})">Remove</button>
      <div class="input-group input-group-sm mb-3">
                      
                      <input type="file" class="form-control " id="inputGroupFile01">
                    </div>
    `;
    lhsDiv.appendChild(newLhsInput);
    updateRemoveButtonState('lhs');
  } else if (side === 'rhs') {
    console.log(rhsCount);
    rhsCount++;
    rhsIdCount++;
    const rhsDiv = document.getElementById('rhsInputs');
    const newRhsInput = document.createElement('div');
    newRhsInput.className = 'input-group mb-2';
    newRhsInput.name = 'rhsInputGroup'
    newRhsInput.id = `rhsInput${rhsIdCount}`;
    newRhsInput.innerHTML = `
      <input type="text" name="rhs${rhsIdCount}" class="form-control" placeholder="RHS " required>
      <button type="button" class="btn btn-custom" onclick="removeInput('rhs', ${rhsIdCount})">Remove</button>
      <div class="input-group input-group-sm mb-3">
                      
                      <input type="file" class="form-control " id="inputGroupFile01">
                    </div>
    `;
    rhsDiv.appendChild(newRhsInput);
    updateRemoveButtonState('rhs');
  }
}

// Function to remove an input field for LHS or RHS
function removeInput(side, index) {
  const inputDiv = document.getElementById(`${side}Input${index}`);
  if (inputDiv) {
    inputDiv.remove();
    if (side === 'lhs') {
      lhsCount--;
      lhsCount--;
      console.log(lhsCount);
    } else if (side === 'rhs') {
      rhsCount--;
      rhsCount--;
      console.log(rhsCount);
    }
  }
  updateRemoveButtonState(side);
}

// Function to enable/disable the remove buttons
function updateRemoveButtonState(side) {
  const lhsInputs = document.querySelectorAll('#lhsInputs div[name="lhsInputGroup"]');
  const rhsInputs = document.querySelectorAll('#rhsInputs div[name="rhsInputGroup"]');

  // Disable remove button if LHS count or RHS count is 2
  lhsInputs.forEach((input, index) => {
    const removeButton = input.querySelector('.btn-custom');
    if (lhsCount < 4 && index < 4) {
      removeButton.disabled = true;
    } else {
      removeButton.disabled = false;
    }
  });

  rhsInputs.forEach((input, index) => {
    const removeButton = input.querySelector('.btn-custom');
    if (rhsCount < 4 && index < 4) {
      removeButton.disabled = true;
    } else {
      removeButton.disabled = false;
    }
  });
}

/////////////////////////////////////////////////////////////////////////////


function loadUnverifiedQuestions() {
    const container = document.getElementById("unverifiedQuestionsContainer");
    container.innerHTML = ""; // Clear previous content

    // Fetch unverified questions from localStorage or a placeholder array
    const unverifiedQuestions = JSON.parse(localStorage.getItem("questions")) || [];

     // Normalize the text (toLowerCase and trim)
     function normalizeText(text) {
        return text.toLowerCase().trim(); // Convert to lowercase and remove extra spaces
    }

    unverifiedQuestions.forEach((question, index) => {
        
        // Determine the card's border color and button visibility based on the question's presence in the arrays
        let cardClass = ""; // Default class
        let verifyButtonVisible = true;

        // Check if question is in selectedQuestions
        if (selectedQuestions.some(selectedQuestion => normalizeText(selectedQuestion.question) === normalizeText(question.question))) {
            cardClass = "border-danger"; // Red border
            verifyButtonVisible = false; // Hide delete button
        }
        // Check if question is in questionsData
        else if (questionsData.some(q => normalizeText(q.question) === normalizeText(question.question))) {
            cardClass = "border-warning"; // Yellow border
        }
        // Default case (no match in either array)
        else {
            cardClass = "border-dark"; // Default border
        }
        
        let questionHTML = `
        <div class="col-12 col-md-10">
            <div class="card  ${cardClass}">
              <div class="row g-0">
                <div class="col-12 ">
                  <div class="card-body">
                  <div class="col-12 text-end">
                  
                      
                        <i class="bi bi-pencil-square fs-4 me-2" data-question='${JSON.stringify(question)}' onclick='editQuestion(event)'></i>
                      
                    
                      
                        <i class="bi bi-eraser fs-4 mx-2" data-question='${JSON.stringify(question)}'onclick='openRemoveConfirmationModal(${index})'></i>
                    
                    ${verifyButtonVisible ? `
                        
                          <i class="bi bi-check-lg fs-4 ms-2" data-question='${JSON.stringify(question)}' onclick='openVerifyConfirmationModal(${index})'></i>
                        
                      ` : ""}
                    
                </div>
                    <blockquote class="blockquote mb-0">
                      <p class="card-text"><strong>Q :</strong> &nbsp; ${question.question}</p>
        `;

        // MCQ Options
        if (question.type === "MCQ") {
            questionHTML += `<div class="row g-2">`;
            let counter = 1;
            question.options.forEach(option => {
                questionHTML += `<div class="col-12 col-md-6 col-lg-3"><strong>${String.fromCharCode(96 + counter)}:</strong> ${option}</div>`;
                counter++;
            });
            questionHTML += `</div>`;
        }

        // Match the Pairs
        if (question.type === "Match the Pairs") {
            questionHTML += `<ul class="list-group">`;
            for (let i = 0; i < question.rhs.length; i++) {
                if (question.lhs.length > i) {
                    questionHTML += `<li class="list-group-item">${question.lhs[i]} <strong><-></strong> ${question.rhs[i]}</li>`;
                } else {
                    questionHTML += `<li class="list-group-item disabled ">.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;. <strong><-></strong> ${question.rhs[i]}</li>`;
                }
            }
            questionHTML += `</ul>`;
        }

        
        questionHTML += `
                      <footer class="blockquote-footer text-end mt-2">${question.topic}<br>${question.type}</footer>
                    </blockquote>        
                  </div>
                </div>
                
              </div>
            </div>
          </div>
          </div>
        `;
        container.innerHTML += questionHTML;
    });

    // Show the container if there are questions
    container.hidden = unverifiedQuestions.length === 0;
}


/////////////////////////////////////////////////////////////////////

function saveQuestion(event) {
    event.preventDefault();

    // Gather question data based on type
    const questionType = document.querySelector("#filterType").value;
    let questionData = { type: questionType };
    questionData.topic = document.querySelector("#filterTopic").value;
    
    
       

    if (questionType === "Descriptive") {
        questionData.question = document.querySelector("#question").value;
    } else if (questionType === "MCQ") {
        questionData.question = document.querySelector("#mcqText").value;
        questionData.options = [
            document.querySelector("#option1").value,
            document.querySelector("#option2").value,
            document.querySelector("#option3").value,
            document.querySelector("#option4").value,
        ];
        questionData.correctOption = document.querySelector("#correctOption").value;
    } else if (questionType === "Fill in the Blanks") {
        questionData.question = document.querySelector("#fillInTheBlankQuestion").value;
        questionData.correctAnswer = document.querySelector("#correctAnswer").value;
    } else if (questionType === "Match the Pairs") {
        questionData.question = document.querySelector("#pairQuestion").value;
        questionData.lhs = Array.from(document.querySelectorAll("#lhsInputs input")).map(input => input.value);
        questionData.rhs = Array.from(document.querySelectorAll("#rhsInputs input")).map(input => input.value);
    }

    // Save to localStorage
    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    questions.push(questionData);
    localStorage.setItem("questions", JSON.stringify(questions));

    // Redirect to CURD page
    window.location.href = "./question_curd.html";
}


//////////////////////////////////////////////////////////

// Function to open the verify confirmation modal
function openVerifyConfirmationModal(questionIndex) {
    // Create the modal HTML
    const modalHTML = `
        <div class="modal fade" id="verifyConfirmationModal" tabindex="-1" aria-labelledby="verifyConfirmationModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header bg-success text-black">
                        <h5 class="modal-title" id="verifyConfirmationModalLabel">Verify Question</h5>
                    </div>
                    <div class="modal-body">
                        You want to add this question in the Question Bank?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" id="cancelButton">Cancel</button>
                        <button type="button" class="btn btn-success" id="verifyButton">Yes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append modal to the body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Initialize the modal
    const verifyConfirmationModal = new bootstrap.Modal(document.getElementById("verifyConfirmationModal"));
    verifyConfirmationModal.show();

    // Add event listeners for buttons
    document.getElementById("cancelButton").addEventListener("click", function () {
        verifyConfirmationModal.hide();
        document.getElementById("verifyConfirmationModal").remove();
    });
    
    document.getElementById("verifyButton").addEventListener("click", function () {
        verifyConfirmationModal.hide();
        document.getElementById("verifyConfirmationModal").remove();
        
            deleteQuestion(questionIndex);
        
    });
}

// Function to open the delete confirmation modal
function openDeleteConfirmationModal(questionIndex) {
    // Create the modal HTML
    const modalHTML = `
        <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-labelledby="deleteConfirmationModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="deleteConfirmationModalLabel">Delete Question</h5>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete this question from the Question Bank?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" id="cancelButton">Cancel</button>
                        <button type="button" class="btn btn-danger" id="deleteButton">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append modal to the body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Initialize the modal
    const deleteConfirmationModal = new bootstrap.Modal(document.getElementById("deleteConfirmationModal"));
    deleteConfirmationModal.show();

    // Add event listeners for buttons
    document.getElementById("cancelButton").addEventListener("click", function () {
        deleteConfirmationModal.hide();
        document.getElementById("deleteConfirmationModal").remove();
    });
    const switchState = document.getElementById("flexSwitchCheckBefore").checked; // Get the state of the switch (true = checked, false = unchecked)
    document.getElementById("deleteButton").addEventListener("click", function () {
        deleteConfirmationModal.hide();
        document.getElementById("deleteConfirmationModal").remove();
        if(switchState){
            deleteQuestion(questionIndex);
        }
        else{
            hideCard(questionIndex);
        }
    });
}
// Function to open the remove confirmation modal
function openRemoveConfirmationModal(questionIndex) {
    // Create the modal HTML
    const modalHTML = `
        <div class="modal fade" id="removeConfirmationModal" tabindex="-1" aria-labelledby="removeConfirmationModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-black">
                        <h5 class="modal-title" id="removeConfirmationModalLabel">Remove Question</h5>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to remove this question from this Chapter?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" id="cancelButton">Cancel</button>
                        <button type="button" class="btn btn-warning" id="deleteButton">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append modal to the body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Initialize the modal
    const removeConfirmationModal = new bootstrap.Modal(document.getElementById("removeConfirmationModal"));
    removeConfirmationModal.show();

    // Add event listeners for buttons
    document.getElementById("cancelButton").addEventListener("click", function () {
        removeConfirmationModal.hide();
        document.getElementById("removeConfirmationModal").remove();
    });
    const switchState = document.getElementById("flexSwitchCheckBefore").checked; // Get the state of the switch (true = checked, false = unchecked)
    document.getElementById("deleteButton").addEventListener("click", function () {
        removeConfirmationModal.hide();
        document.getElementById("removeConfirmationModal").remove();
        if(switchState){
            deleteQuestion(questionIndex);
        }
        else{
            hideCard(questionIndex);
        }
       
    });
}
// Function to delete a question from localStorage
function deleteQuestion(questionIndex) {
    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    
    // Remove the question at the specified index
    questions.splice(questionIndex, 1);
    
    // Update localStorage with the new questions list
    localStorage.setItem("questions", JSON.stringify(questions));

    // Reload the question list
    loadUnverifiedQuestions();
}

// Function to hide the card using the unique identifier
function hideCard(uniqueIndex) {
    const card = document.querySelector(`.card[data-unique-id="${uniqueIndex}"]`);
    if (card) {
        card.style.display = "none";  // Hides the card
    }
}


//////////////////////////////////////////////////////////////////////////////

function editQuestion(event) {
  const questionData = JSON.parse(event.target.getAttribute('data-question'));

  // Check if question data is valid
  if (!questionData || !questionData.question || !questionData.type) {
      console.error('Invalid question data:', questionData);
      return; // Prevent the redirect if data is invalid
  }

  // Create a URL with encoded question data as a query parameter
  const queryParams = new URLSearchParams({
      mode: 'edit',
      question: encodeURIComponent(JSON.stringify(questionData))
  });

  // Redirect to the Add Question page with query parameters
  window.location.href = `./addQuestion.html?${queryParams.toString()}`;
}

function translateQuestion(event) {
  const questionData = JSON.parse(event.target.getAttribute('data-question'));

  // Validate question data
  if (!questionData || !questionData.question || !questionData.type) {
      console.error('Invalid question data:', questionData);
      return; // Prevent redirect if data is invalid
  }

  // Create query parameters (no extra encoding needed)
  const queryParams = new URLSearchParams({
      mode: 'translate',
      question: JSON.stringify(questionData)  // No need to encode again
  });

  // Redirect to the Translation page with query parameters
  window.location.href = `./addTranslation.html?${queryParams.toString()}`;
}




window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  const pageHeader = document.getElementById("pageHeader");
  const filterType = document.getElementById("filterType"); // Type select element
  if (urlParams.get('mode') === 'edit') {
    pageHeader.textContent = "Edit Question";
      const questionData = JSON.parse(decodeURIComponent(urlParams.get('question')));
        console.log(questionData);
      if (questionData) {
          // Handle single topic (string) or multiple topics (array)
      const topic = Array.isArray(questionData.topics) 
      ? questionData.topics[0]?.topic 
      : questionData.topic || "";
          document.getElementById("filterTopic").value = topic;
          filterType.value = questionData.type;
          toggleQuestionContainer(filterType);
             // Disable type selection after setting it
      filterType.setAttribute("disabled", "true");

          if (questionData.type === "Descriptive") {
              document.getElementById("question").value = questionData.question;
          } else if (questionData.type === "MCQ") {
              document.getElementById("mcqText").value = questionData.question;
              document.getElementById("option1").value = questionData.options[0] || "";
              document.getElementById("option2").value = questionData.options[1] || "";
              document.getElementById("option3").value = questionData.options[2] || "";
              document.getElementById("option4").value = questionData.options[3] || "";
              document.getElementById("correctOption").value = questionData.correctOption || "";
          } else if (questionData.type === "Fill in the Blanks") {
              document.getElementById("fillInTheBlankQuestion").value = questionData.question;
              document.getElementById("correctAnswer").value = questionData.correctAnswer || "";
          } else if (questionData.type === "Match the Pairs") {
              document.getElementById("pairQuestion").value = questionData.question;
              fillMatchPairsInputs('lhs', questionData.lhs);
              fillMatchPairsInputs('rhs', questionData.rhs);
          }
      }
  }
});

function fillMatchPairsInputs(side, values) {
  const container = document.getElementById(`${side}Inputs`);
  container.innerHTML = '';
  values.forEach((value, index) => {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group mb-2';
      inputGroup.id = `${side}Input${index + 1}`;
      inputGroup.innerHTML = `
          <input type="text" name="${side}${index + 1}" class="form-control" placeholder="${side.toUpperCase()}" value="${value}" required>
          <button type="button" class="btn btn-danger" onclick="removeInput('${side}', ${index + 1})">Remove</button>
      `;
      container.appendChild(inputGroup);
  });
}

window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('mode') === 'translate') {
      const questionData = JSON.parse(urlParams.get('question'));

      if (questionData) {
          // Hide all question containers initially
          document.getElementById('descriptiveQuestion').hidden = true;
          document.getElementById('mcqQuestion').hidden = true;
          document.getElementById('fillBlankQuestion').hidden = true;

          // Populate the correct form based on question type
          if (questionData.type === "Descriptive") {
              const questionField = document.querySelector('#descriptiveQuestion textarea[name="questionTranslate"]');
              questionField.value = questionData.question;
              document.getElementById('descriptiveQuestion').hidden = false;
          } 
          else if (questionData.type === "MCQ") {
              const questionField = document.querySelector('#mcqQuestion textarea[name="mcqTextTranslate"]');
              questionField.value = questionData.question;

              document.querySelector('#mcqQuestion input#option1Translate').value = questionData.options[0] || '';
              document.querySelector('#mcqQuestion input#option2Translate').value = questionData.options[1] || '';
              document.querySelector('#mcqQuestion input#option3Translate').value = questionData.options[2] || '';
              document.querySelector('#mcqQuestion input#option4Translate').value = questionData.options[3] || '';

              document.getElementById('mcqQuestion').hidden = false;
          } 
          else if (questionData.type === "Fill in the Blanks") {
              console.log("fill blank page");
              const questionField = document.querySelector('#fillBlankQuestion textarea[name="translateFillBlank"]');
              questionField.value = questionData.question;
              document.getElementById('fillBlankQuestion').hidden = false;
          }
      }
  }
});


function clearInput(inputId) {
  document.getElementById(inputId).value = '';
  filterCards();
}

