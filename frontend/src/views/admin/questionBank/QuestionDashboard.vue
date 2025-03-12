<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'questionBank' }" aria-label="Close"></router-link>
      </div>
      <div class="row justify-content-center align-items-center">
        <div class="col col-12 col-sm-5">
          <p class="text-muted text-start fs-6 m-0">
            <span class="col-12 col-md-auto">{{ questionBankData.boardName }} | </span>
            <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0">
           Standard {{ questionBankData.standardName }}
            <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} | {{ questionBankData.chapterName }}</span>
          </h4>
        </div>
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <div class="row justify-content-end align-items-end g-2">
            <div class="col col-5 col-sm-auto text-end">
              <router-link class="btn btn-dark stick-bottom" :to="{ name: 'addQuestion' }" id="addButton">Add Questions</router-link>
            </div>
            <div class="col col-7 col-sm-auto text-end">
              <router-link class="btn btn-light" style="border: 1px solid gray !important;" id="addButton" :to="{ name: 'translationPending' }">Translation Pending</router-link>
            </div>
          </div>
        </div>
      </div>
      <hr>
    </div>

    <div id="questionsSection" class="container">
      <div class="container mb-4">
        <div class="row g-2 my-2 justify-content-center">
          <div class="col-12 col-md-10">
            <div class="input-group">
              <div class="form-floating">
                <input type="text" class="form-control" id="searchBar" placeholder="Search questions..." v-model="searchQuery" @input="filterCards">
                <label for="searchBar"><i class="bi bi-search text-secondary"></i> Search questions...</label>
              </div>
              <span class="input-group-text clear-icon" @click="clearSearch" style="cursor: pointer;">
                <i class="bi bi-x-lg"></i>
              </span>
              <span
                class="input-group-text"
                style="cursor: pointer"
                @click="toggleFilterIcon"
                aria-expanded="false"
                aria-controls="filter"
              >
                Filter
              </span>
            </div>
          </div>
        </div>

        <!-- Collapsible Filter Section -->
        <div class="row g-2 justify-content-center">
          <div class="col-12 col-md-10 collapse" id="filter">
            <div class="card border-0">
              <div class="card-body">
                <div class="container p-0">
                  <div class="row g-2 mb-2">
                    <div class="col-md-6">
                      <div class="form-floating">
                        <select id="filterTopic" class="form-select" v-model="selectedTopic" @change="filterCards">
                          <option value="">Select Topic</option>
                          <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
                        </select>
                        <label for="filterTopic" class="form-label"> Filter by Topic </label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating">
                        <select id="filterType" class="form-select" v-model="selectedType" @change="filterCards">
                          <option value="">Select Type</option>
                          <option value="Descriptive">Descriptive</option>
                          <option value="MCQ">MCQ</option>
                          <option value="Fill in the Blanks">Fill in the Blanks</option>
                          <option value="Match the Pairs">Match the Pairs</option>
                        </select>
                        <label for="filterType" class="form-label"> Filter by Type </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verified/Unverified Toggle Section - Always Visible -->
        <div class="row g-2 my-2 justify-content-center">
          <div class="col-12 col-md-10">
            <div class="row mb-2 justify-content-end align-items-center">
              <!-- First column: Label Before -->
              <div class="col-auto text-end">
                <label id="verifiedLabel" class="form-check-label fw-bold" :class="{ 'text-dark': !showUnverified, 'text-secondary': showUnverified }" for="flexSwitchCheckBefore">Verified</label>
              </div>

              <!-- Second column: The Switch -->
              <div class="col-auto text-center">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="flexSwitchCheckBefore" v-model="showUnverified">
                </div>
              </div>

              <!-- Third column: Label After -->
              <div class="col-auto text-start">
                <label id="unverifiedLabel" class="form-check-label fw-bold" :class="{ 'text-dark': showUnverified, 'text-secondary': !showUnverified }" for="flexSwitchCheckBefore">Unverified</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mb-5">
        <!-- Verified Questions -->
        <div class="row g-2 justify-content-center" id="verifiedContainer" v-show="!showUnverified">
          <div v-for="(question, index) in filteredVerifiedQuestions" :key="'verified-' + index" class="col-12 col-md-10">
            <div class="card" :data-unique-id="'verified-' + index">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="col-12 text-end">
                      <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                      <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'verified')"></i>
                      <i class="bi bi-trash3 fs-4 ms-2" @click="openDeleteConfirmationModal(index, 'verified')"></i>
                    </div>
                    <blockquote class="blockquote mb-0">
                      <p class="card-text"><strong>Q :</strong> &nbsp; {{ question.question }}</p>

                      <!-- MCQ Options -->
                      <div v-if="question.type === 'MCQ'" class="row g-2">
                        <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6 col-lg-3">
                          <strong>{{ String.fromCharCode(97 + optIndex) }} : &nbsp;</strong>{{ option }}
                        </div>
                      </div>

                      <!-- Match the Pairs -->
                      <ul v-if="question.type === 'Match the Pairs' && question.rhs" class="list-group">
                        <li v-for="(rhs, idx) in question.rhs" :key="idx" class="list-group-item" :class="{ 'disabled': !(question.lhs && question.lhs[idx]) }">
                          {{ (question.lhs && question.lhs[idx]) || '...........' }} <strong>&lt;-&gt;</strong> {{ rhs }}
                        </li>
                      </ul>

                      <footer class="blockquote-footer text-end mt-2">
                        {{ getTopicsDisplay(question) }} <br> {{ question.type }}
                        <span v-if="question.isPreviousExam" class="badge bg-info ms-2">Board Exam</span>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Unverified Questions -->
        <div class="row g-2 justify-content-center" id="unverifiedContainer" v-show="showUnverified">
          <div v-for="(question, index) in filteredUnverifiedQuestions" :key="'unverified-' + index" class="col-12 col-md-10">
            <div class="card" :class="getUnverifiedCardClass(question)" :data-unique-id="'unverified-' + index">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="col-12 text-end">
                      <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                      <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'unverified')"></i>
                      <i v-if="canVerifyQuestion(question)" class="bi bi-check-lg fs-4 ms-2" @click="openVerifyConfirmationModal(index)"></i>
                    </div>
                    <blockquote class="blockquote mb-0">
                      <p class="card-text"><strong>Q :</strong> &nbsp; {{ question.question }}</p>

                      <!-- MCQ Options -->
                      <div v-if="question.type === 'MCQ'" class="row g-2">
                        <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6 col-lg-3">
                          <strong>{{ String.fromCharCode(97 + optIndex) }} : &nbsp;</strong>{{ option }}
                        </div>
                      </div>

                      <!-- Match the Pairs -->
                      <ul v-if="question.type === 'Match the Pairs' && question.rhs" class="list-group">
                        <li v-for="(rhs, idx) in question.rhs" :key="idx" class="list-group-item" :class="{ 'disabled': !(question.lhs && question.lhs[idx]) }">
                          {{ (question.lhs && question.lhs[idx]) || '...........' }} <strong>&lt;-&gt;</strong> {{ rhs }}
                        </li>
                      </ul>

                      <footer class="blockquote-footer text-end mt-2">
                        {{ question.topic }} <br> {{ question.type }}
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import { Modal, Collapse } from 'bootstrap'

// Define interfaces for API response
interface ApiTopic {
  id: number;
  chapter_id: number;
  sequential_topic_number: number;
  name: string;
  created_at: string;
  updated_at: string;
  chapter?: {
    id: number;
    medium_standard_subject_id: number;
    sequential_chapter_number: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

interface ApiQuestionTopic {
  id: number;
  question_id: number;
  topic_id: number;
  created_at: string;
  updated_at: string;
  topic: ApiTopic;
}

interface ApiImage {
  id: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface ApiMcqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiMatchPair {
  id: number;
  question_text_id: number;
  left_side: string;
  right_side: string;
  created_at: string;
  updated_at: string;
}

interface ApiQuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  created_at: string;
  updated_at: string;
  image: ApiImage | null;
  mcq_options: ApiMcqOption[];
  match_pairs: ApiMatchPair[];
}

interface ApiQuestionType {
  id: number;
  type_name: string;
}

interface ApiQuestion {
  id: number;
  question_type_id: number;
  board_question: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  question_type: ApiQuestionType;
  question_texts: ApiQuestionText[];
  question_topics: ApiQuestionTopic[];
}

// Define interfaces for component's internal use
interface Topic {
  topic: string;
}

interface Question {
  id: number;
  question: string;
  type: string;
  topics: Topic[];
  options?: string[];
  correctOption?: string;
  lhs?: string[];
  rhs?: string[];
  correctAnswer?: string;
  topic?: string;
  isPreviousExam: boolean;
  isVerified: boolean;
}

// Component name (for linter)
defineOptions({
  name: 'QuestionDashboard'
})

const router = useRouter()

// Data from localStorage
const questionBankData = ref({
  boardId: '',
  boardName: '',
  mediumId: '',
  mediumName: '',
  standardId: '',
  standardName: '',
  subjectId: '',
  subjectName: '',
  chapterId: '',
  chapterName: '',
  mediumStandardSubjectId: null
})

// Questions data
const verifiedQuestions = ref<Question[]>([])
const unverifiedQuestions = ref<Question[]>([])
const topics = ref<string[]>([])

// UI state
const searchQuery = ref('')
const selectedTopic = ref('')
const selectedType = ref('')
const showUnverified = ref(false)
const isFilterOpen = ref(false)

// Computed properties for filtered questions
const filteredVerifiedQuestions = computed(() => {
  return filterQuestions(verifiedQuestions.value)
})

const filteredUnverifiedQuestions = computed(() => {
  return filterQuestions(unverifiedQuestions.value)
})

// Methods
function filterQuestions(questions: Question[]) {
  return questions.filter(question => {
    const matchesSearch = searchQuery.value === '' ||
      question.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (question.options && question.options.some(opt => opt.toLowerCase().includes(searchQuery.value.toLowerCase())))

    const matchesTopic = selectedTopic.value === '' ||
      (question.topics && question.topics.some(t => t.topic === selectedTopic.value)) ||
      question.topic === selectedTopic.value

    const matchesType = selectedType.value === '' || question.type === selectedType.value

    return matchesSearch && matchesTopic && matchesType
  })
}

function clearSearch() {
  searchQuery.value = ''
  filterCards()
}

function filterCards() {
  // This function is called when search or filters change
  // The computed properties will automatically update
}

function getTopicsDisplay(question: Question) {
  if (question.topics && question.topics.length > 0) {
    return question.topics.map(topic => topic.topic).join(', ')
  }
  return question.topic || ''
}

function normalizeText(text: string) {
  return text.toLowerCase().trim()
}

function getUnverifiedCardClass(question: Question) {
  // Determine card border class based on question status
  if (verifiedQuestions.value.some(vq => normalizeText(vq.question) === normalizeText(question.question))) {
    return 'border-danger' // Red border - duplicate of verified question
  } else if (unverifiedQuestions.value.filter(uq =>
    normalizeText(uq.question) === normalizeText(question.question)).length > 1) {
    return 'border-warning' // Yellow border - duplicate in unverified
  }
  return 'border-dark' // Default border
}

function toggleFilterIcon() {
  // Toggle the icon state
  isFilterOpen.value = !isFilterOpen.value

  // Manually toggle the collapse using Bootstrap's Collapse class
  const filterElement = document.getElementById('filter')
  if (filterElement) {
    // Get or create a collapse instance
    let bsCollapse = Collapse.getInstance(filterElement)
    if (!bsCollapse) {
      bsCollapse = new Collapse(filterElement, {
        toggle: false
      })
    }

    // Toggle the collapse
    bsCollapse.toggle()

    // If we're closing the filter section, clear all filters
    if (!isFilterOpen.value) {
      clearFilters()
    }
  }
}

function clearFilters() {
  // Reset filter values
  selectedTopic.value = ''
  selectedType.value = ''
  // Update filtered results
  filterCards()
}

function canVerifyQuestion(question: Question) {
  // Check if question can be verified (not a duplicate of verified question)
  return !verifiedQuestions.value.some(vq => normalizeText(vq.question) === normalizeText(question.question))
}

function editQuestion(question: Question) {
  // Navigate to edit question page with question data
  console.log('Edit question functionality is currently unavailable', question)
  // The EditQuestion.vue file has been removed
  // router.push({
  //   name: 'editQuestion',
  //   query: {
  //     mode: 'edit',
  //     question: encodeURIComponent(JSON.stringify(question))
  //   }
  // })
}

function openRemoveConfirmationModal(index: number, type: 'verified' | 'unverified') {
  createConfirmationModal({
    title: 'Remove Question',
    titleClass: 'bg-warning text-black',
    message: 'Are you sure you want to remove this question from this Chapter?',
    confirmButtonClass: 'btn-warning',
    confirmButtonText: 'Remove',
    onConfirm: () => {
      if (type === 'unverified') {
        deleteUnverifiedQuestion(index)
      } else {
        hideCard(`${type}-${index}`)
      }
    }
  })
}

function openDeleteConfirmationModal(index: number, type: 'verified' | 'unverified') {
  createConfirmationModal({
    title: 'Delete Question',
    titleClass: 'bg-danger text-white',
    message: 'Are you sure you want to delete this question from the Question Bank?',
    confirmButtonClass: 'btn-danger',
    confirmButtonText: 'Delete',
    onConfirm: () => {
      if (type === 'unverified') {
        deleteUnverifiedQuestion(index)
      } else {
        hideCard(`${type}-${index}`)
      }
    }
  })
}

function openVerifyConfirmationModal(index: number) {
  createConfirmationModal({
    title: 'Verify Question',
    titleClass: 'bg-success text-black',
    message: 'You want to add this question in the Question Bank?',
    confirmButtonClass: 'btn-success',
    confirmButtonText: 'Yes',
    onConfirm: () => {
      verifyQuestion(index)
    }
  })
}

function createConfirmationModal(options: {
  title: string,
  titleClass: string,
  message: string,
  confirmButtonClass: string,
  confirmButtonText: string,
  onConfirm: () => void
}) {
  // Create modal element
  const modalElement = document.createElement('div')
  modalElement.className = 'modal fade'
  modalElement.id = 'confirmationModal'
  modalElement.setAttribute('tabindex', '-1')
  modalElement.setAttribute('aria-hidden', 'true')
  modalElement.setAttribute('data-bs-backdrop', 'static')
  modalElement.setAttribute('data-bs-keyboard', 'false')

  modalElement.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header ${options.titleClass}">
          <h5 class="modal-title">${options.title}</h5>
        </div>
        <div class="modal-body">
          ${options.message}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" id="cancelButton">Cancel</button>
          <button type="button" class="btn ${options.confirmButtonClass}" id="confirmButton">${options.confirmButtonText}</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modalElement)

  // Initialize and show modal
  const modal = new Modal(modalElement)
  modal.show()

  // Add event listeners
  document.getElementById('cancelButton')?.addEventListener('click', () => {
    modal.hide()
    setTimeout(() => {
      modalElement.remove()
    }, 300)
  })

  document.getElementById('confirmButton')?.addEventListener('click', () => {
    modal.hide()
    setTimeout(() => {
      modalElement.remove()
      options.onConfirm()
    }, 300)
  })
}

function deleteUnverifiedQuestion(index: number) {
  // Remove question from unverified questions
  unverifiedQuestions.value.splice(index, 1)
  // Update localStorage
  localStorage.setItem('questions', JSON.stringify(unverifiedQuestions.value))
}

function verifyQuestion(index: number) {
  const question = unverifiedQuestions.value[index];

  // Make API call to update verification status
  axiosInstance.patch(`/questions/${question.id}`, { is_verified: true })
    .then(() => {
      console.log('Question verified successfully');
      // Remove from unverified list
      unverifiedQuestions.value.splice(index, 1);
      // Refresh verified questions if we're about to switch to that view
      if (!showUnverified.value) {
        fetchQuestions();
      }
    })
    .catch(error => {
      console.error('Error verifying question:', error);
    });
}

function hideCard(uniqueId: string) {
  // In a real app, this would make an API call to update the question status
  // For now, we just hide the card visually
  const card = document.querySelector(`.card[data-unique-id="${uniqueId}"]`)
  if (card) {
    card.classList.add('d-none')
  }
}

// Add a watch for showUnverified to refetch questions when toggle changes
watch(showUnverified, () => {
  fetchQuestions()
})

// Update fetchQuestions to use is_verified query parameter
async function fetchQuestions() {
  try {
    // Fetch questions from API based on questionBankData and verification status
    const response = await axiosInstance.get<ApiQuestion[]>('/questions', {
      params: {
        chapter_id: questionBankData.value.chapterId,
        is_verified: !showUnverified.value // true for verified, false for unverified
      }
    }).catch((error) => {
      console.error('Error fetching questions:', error);
      return { data: [] as ApiQuestion[] };
    });

    // Transform API response to match our component's expected structure
    const questions = response.data.map((apiQuestion: ApiQuestion) => {
      // Get the first question text (assuming there's at least one)
      const questionText = apiQuestion.question_texts.length > 0
        ? apiQuestion.question_texts[0].question_text
        : '';

      // Extract topics from question_topics
      const questionTopics = apiQuestion.question_topics.map(qt => ({
        topic: qt.topic.name
      }));

      // Handle MCQ options if present
      let options = undefined;
      if (apiQuestion.question_type.type_name === 'MCQ' &&
          apiQuestion.question_texts.length > 0 &&
          apiQuestion.question_texts[0].mcq_options.length > 0) {
        options = apiQuestion.question_texts[0].mcq_options.map(opt => opt.option_text);
      }

      // Handle match pairs if present
      let lhs = undefined;
      let rhs = undefined;
      if (apiQuestion.question_type.type_name === 'Match the Pairs' &&
          apiQuestion.question_texts.length > 0 &&
          apiQuestion.question_texts[0].match_pairs.length > 0) {
        lhs = apiQuestion.question_texts[0].match_pairs.map(pair => pair.left_side);
        rhs = apiQuestion.question_texts[0].match_pairs.map(pair => pair.right_side);
      }

      return {
        id: apiQuestion.id,
        question: questionText,
        type: apiQuestion.question_type.type_name,
        topics: questionTopics,
        options: options,
        lhs: lhs,
        rhs: rhs,
        isPreviousExam: apiQuestion.board_question,
        isVerified: apiQuestion.is_verified
      } as Question;
    });

    // Update the appropriate questions array based on verification status
    if (showUnverified.value) {
      unverifiedQuestions.value = questions;
    } else {
      verifiedQuestions.value = questions;
    }

    // Extract unique topics from the questions
    const allTopics = new Set<string>();

    questions.forEach(q => {
      if (q.topics) {
        q.topics.forEach(t => allTopics.add(t.topic));
      } else if (q.topic) {
        allTopics.add(q.topic);
      }
    });

    // Merge with existing topics to maintain a complete list
    const existingTopics = new Set(topics.value);
    allTopics.forEach(topic => existingTopics.add(topic));
    topics.value = Array.from(existingTopics);
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank')
  if (storedData) {
    questionBankData.value = JSON.parse(storedData)
    fetchQuestions()
  } else {
    // Redirect to question bank selection if no data
    router.push({ name: 'questionBank' })
  }

  // Check if the filter element has the 'show' class initially
  const filterElement = document.getElementById('filter')
  if (filterElement) {
    // Check if the element has the 'show' class initially
    if (filterElement.classList.contains('show')) {
      isFilterOpen.value = true
    } else {
      isFilterOpen.value = false
    }
  }
})
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}

/* Default styles for screens above 576px */
.dynamic-style {
  position: static;
  background-color: transparent;
  box-shadow: none;
}

/* Styles for screens below 576px */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  #addButton {
    width: 100%;
  }
}

/* Styles for nav link */
#navQuestion {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navQuestion {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.card.border-0 {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.collapse {
  transition: all 0.3s ease-out;
}

.input-group-text {
  transition: background-color 0.2s ease;
}

.input-group-text:hover {
  background-color: #e9ecef;
}
</style>
