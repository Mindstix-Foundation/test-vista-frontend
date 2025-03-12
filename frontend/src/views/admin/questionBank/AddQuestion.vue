<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'questionBank' }" aria-label="Close"></router-link>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 ">
          <p class="text-muted text-start fs-5 m-0">
            <span class="col-12 col-md-auto">{{ questionBankData.boardName }} |</span>
            <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0 ">
            Standard {{ questionBankData.standardName }}
            <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} : {{ questionBankData.chapterName }}</span>
          </h4>
          <h4 class="text-left fw-bolder text-uppercase mb-2" id="pageHeader">Add Question</h4>
        </div>
      </div>
      <hr>
    </div>
    <div id="questionsSection" class="container">
      <div class="container mb-4">
        <div class="row g-2 mb-2 justify-content-center">
          <div class="col-md-5">
            <div class="form-floating">
              <select id="filterTopic" class="form-select" v-model="selectedTopic">
                <option value="">Select Topic</option>
                <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
              </select>
              <label for="filterTopic" class="form-label">Topic</label>
            </div>
          </div>
          <div class="col-md-5">
            <div class="form-floating">
              <select id="filterType" class="form-select" v-model="selectedType" @change="toggleQuestionContainer" :disabled="!selectedTopic">
                <option value="">Select Type</option>
                <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
              </select>
              <label for="filterType" class="form-label">Type</label>
            </div>
          </div>
        </div>
      </div>

      <div class="container" id="descriptiveQuestion" v-show="selectedType === 'Descriptive' ||
                                                 selectedType === 'True or False' ||
                                                 selectedType === 'Long Answer' ||
                                                 selectedType === 'Short Answer' ||
                                                 selectedType === 'Essay' ||
                                                 selectedType === 'Numerical' ||
                                                 selectedType === 'Coding Problem' ||
                                                 selectedType === 'Case Study'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="saveQuestion">
              <div class="mb-3 form-floating">
                <textarea id="question" v-model="descriptiveQuestion.question" class="form-control" rows="5" placeholder="Type your question here..." @input="autoResize" required></textarea>
                <label for="question" class="form-label">Question</label>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01">
                </div>
              </div>
              <div class="form-check mt-4">
                <input class="form-check-input" type="checkbox" v-model="descriptiveQuestion.isPreviousExam" id="flexCheckDefault">
                <label class="form-check-label fw-bold" for="flexCheckDefault">
                  Question appeared in a previous board exam.
                </label>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isDescriptiveValid">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="container" id="mcqQuestion" v-show="selectedType === 'MCQ' || selectedType === 'Multiple Choice'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="saveQuestion">
              <div class="mb-3 form-floating">
                <textarea id="mcqText" v-model="mcqQuestion.question" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
                <label for="mcqText" class="form-label">Question</label>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01">
                </div>
              </div>

              <div class="mb-3">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input type="text" v-model="mcqQuestion.options[0]" class="form-control" id="option1" placeholder="Option 1" required>
                      <label for="option1">Option A</label>
                    </div>
                    <div class="input-group input-group-sm mb-3">
                      <input type="file" class="form-control" id="inputGroupFile01">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-floating">
                      <input type="text" v-model="mcqQuestion.options[1]" class="form-control" id="option2" placeholder="Option 2" required>
                      <label for="option2">Option B</label>
                    </div>
                    <div class="input-group input-group-sm mb-3">
                      <input type="file" class="form-control" id="inputGroupFile01">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-floating">
                      <input type="text" v-model="mcqQuestion.options[2]" class="form-control" id="option3" placeholder="Option 3">
                      <label for="option3">Option C</label>
                    </div>
                    <div class="input-group input-group-sm mb-3">
                      <input type="file" class="form-control" id="inputGroupFile01">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-floating">
                      <input type="text" v-model="mcqQuestion.options[3]" class="form-control" id="option4" placeholder="Option 4">
                      <label for="option4">Option D</label>
                    </div>
                    <div class="input-group input-group-sm mb-3">
                      <input type="file" class="form-control" id="inputGroupFile01">
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3 form-floating">
                <select id="correctOption" v-model="mcqQuestion.correctOption" class="form-select" required>
                  <option value="">Select the correct option</option>
                  <option value="1">Option A</option>
                  <option value="2">Option B</option>
                  <option value="3">Option C</option>
                  <option value="4">Option D</option>
                </select>
                <label for="correctOption" class="form-label">Correct Option</label>
              </div>
              <div class="form-check mt-4">
                <input class="form-check-input" type="checkbox" v-model="mcqQuestion.isPreviousExam" id="flexCheckDefault">
                <label class="form-check-label fw-bold" for="flexCheckDefault">
                  Question appeared in a previous board exam.
                </label>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMcqValid">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="container" id="fillBlankQuestion" v-show="selectedType === 'Fill in the Blanks'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="saveQuestion">
              <div class="mb-3 form-floating">
                <textarea id="fillInTheBlankQuestion" v-model="fillBlankQuestion.question" class="form-control" rows="3"
                          placeholder="Type your question here, use '_____' for blanks." @input="autoResize" required></textarea>
                <label for="fillInTheBlankQuestion" class="form-label">Question</label>
                <div class="input-group input-group-sm mb-1">
                  <input type="file" class="form-control" id="inputGroupFile01">
                </div>
                <div class="col text-end">
                  <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="insertBlank">Insert Blank</button>
                </div>
              </div>

              <div class="mb-3 form-floating">
                <input type="text" id="correctAnswer" v-model="fillBlankQuestion.correctAnswer" class="form-control"
                       placeholder="Enter the correct answer for the blank" required>
                <label for="correctAnswer" class="form-label">Correct Answer</label>
              </div>
              <div class="form-check mt-4">
                <input class="form-check-input" type="checkbox" v-model="fillBlankQuestion.isPreviousExam" id="flexCheckDefault">
                <label class="form-check-label fw-bold" for="flexCheckDefault">
                  Question appeared in a previous board exam.
                </label>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isFillBlankValid">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="container" id="matchPairQuestion" v-show="selectedType === 'Match the Pairs' || selectedType === 'Matching'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="saveQuestion">
              <div class="mb-3">
                <label for="pairQuestion" class="form-label">Question</label>
                <textarea id="pairQuestion" v-model="matchPairQuestion.question" class="form-control" rows="3" placeholder="Enter the question (e.g., Match the terms with their definitions)" @input="autoResize" required></textarea>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01">
                </div>
              </div>

              <div class="row g-3 justify-content-between mb-4">
                <!-- Left-hand side (LHS) -->
                <div class="col-md-5">
                  <label for="lhs" class="form-label">Left Side</label>
                  <div id="lhsInputs">
                    <div v-for="(item, index) in matchPairQuestion.lhs" :key="'lhs-'+index" class="input-group mb-2" :id="'lhsInput'+(index+1)">
                      <input type="text" v-model="matchPairQuestion.lhs[index]" class="form-control" placeholder="LHS" required>
                      <button type="button" class="btn btn-custom" @click="removeInput('lhs', index)" :disabled="matchPairQuestion.lhs.length <= 1">Remove</button>
                      <div class="input-group input-group-sm mb-3">
                        <input type="file" class="form-control" id="inputGroupFile01">
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="addInput('lhs')">Add</button>
                </div>

                <!-- Right-hand side (RHS) -->
                <div class="col-md-5">
                  <label for="rhs" class="form-label">Right Side</label>
                  <div id="rhsInputs">
                    <div v-for="(item, index) in matchPairQuestion.rhs" :key="'rhs-'+index" class="input-group mb-2" :id="'rhsInput'+(index+1)">
                      <input type="text" v-model="matchPairQuestion.rhs[index]" class="form-control" placeholder="RHS" required>
                      <button type="button" class="btn btn-custom" @click="removeInput('rhs', index)" :disabled="matchPairQuestion.rhs.length <= 2">Remove</button>
                      <div class="input-group input-group-sm mb-3">
                        <input type="file" class="form-control" id="inputGroupFile01">
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="addInput('rhs')">Add</button>
                </div>
              </div>

              <div class="form-check mt-4 ">
                <input class="form-check-input" type="checkbox" v-model="matchPairQuestion.isPreviousExam" id="flexCheckDefault">
                <label class="form-check-label fw-bold" for="flexCheckDefault">
                  Question appeared in a previous board exam.
                </label>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMatchPairValid">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'

// Define component name
defineOptions({
  name: 'AddQuestion'
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

// Form data
const selectedType = ref('')
const selectedTopic = ref('')
const topics = ref<string[]>([])
const questionTypes = ref<string[]>([])

// Question models
const descriptiveQuestion = ref({
  question: '',
  type: 'Descriptive',
  isPreviousExam: false
})

const mcqQuestion = ref({
  question: '',
  type: 'MCQ',
  options: ['', '', '', ''],
  correctOption: '',
  isPreviousExam: false
})

const fillBlankQuestion = ref({
  question: '',
  type: 'Fill in the Blanks',
  correctAnswer: '',
  isPreviousExam: false
})

const matchPairQuestion = ref({
  question: '',
  type: 'Match the Pairs',
  lhs: [''],
  rhs: ['', ''],
  isPreviousExam: false
})

// Add computed properties to check if forms are valid
const isDescriptiveValid = computed(() => {
  return descriptiveQuestion.value.question.trim() !== ''
})

const isMcqValid = computed(() => {
  return mcqQuestion.value.question.trim() !== '' &&
         mcqQuestion.value.options[0].trim() !== '' &&
         mcqQuestion.value.options[1].trim() !== '' &&
         mcqQuestion.value.correctOption !== ''
})

const isFillBlankValid = computed(() => {
  return fillBlankQuestion.value.question.trim() !== '' &&
         fillBlankQuestion.value.correctAnswer.trim() !== '' &&
         fillBlankQuestion.value.question.includes('_____')
})

const isMatchPairValid = computed(() => {
  // Check if all LHS and RHS inputs have values
  const allLhsFilled = matchPairQuestion.value.lhs.every(item => item.trim() !== '')
  const allRhsFilled = matchPairQuestion.value.rhs.every(item => item.trim() !== '')
  return matchPairQuestion.value.question.trim() !== '' && allLhsFilled && allRhsFilled
})

// Add interfaces for API requests and responses
interface QuestionCreateRequest {
  question_type_id: number;
  board_question: boolean;
  is_verified: boolean;
}

// Add interfaces for API response types
interface QuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  created_at: string;
  updated_at: string;
}

interface QuestionTopic {
  id: number;
  question_id: number;
  topic_id: number;
  created_at: string;
  updated_at: string;
}

interface QuestionCreateResponse {
  id: number;
  question_type_id: number;
  board_question: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  question_type: {
    id: number;
    type_name: string;
  };
  question_texts: QuestionText[];
  question_topics: QuestionTopic[];
}

interface ImageCreateRequest {
  image_url: string;
}

interface ImageCreateResponse {
  id: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface QuestionTextCreateRequest {
  question_id: number;
  image_id?: number;
  question_text: string;
}

interface QuestionTopicCreateRequest {
  question_id: number;
  topic_id: number;
}

// Add interfaces for API data types
interface QuestionType {
  id: number;
  type_name: string;
  subsection_que?: boolean;
}

interface Topic {
  id: number;
  name: string;
  chapter_id: number;
  sequential_topic_number: number;
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

// Add a map to store question type IDs
const questionTypeMap = ref<Map<string, number>>(new Map());

// Update fetchQuestionTypes to use the QuestionType interface
async function fetchQuestionTypes() {
  try {
    const response = await axiosInstance.get('/question-types')
      .catch(() => ({ data: [] })) // Fallback to empty array if API fails

    if (response.data && Array.isArray(response.data)) {
      // Extract specifically the type_name property from each question type object
      questionTypes.value = response.data.map((type: QuestionType) => type.type_name || '')

      // Store the mapping of type names to IDs
      response.data.forEach((type: QuestionType) => {
        if (type.type_name && type.id) {
          questionTypeMap.value.set(type.type_name, type.id);
        }
      });
    } else {
      // Fallback to default question types if API fails
      questionTypes.value = ['Descriptive', 'MCQ', 'Fill in the Blanks', 'Match the Pairs']
    }
  } catch (error) {
    console.error('Error fetching question types:', error)
    // Fallback to default question types if API fails
    questionTypes.value = ['Descriptive', 'MCQ', 'Fill in the Blanks', 'Match the Pairs']
  }
}

// Add a map to store topic IDs
const topicMap = ref<Map<string, number>>(new Map());

// Update fetchTopics to use the Topic interface
async function fetchTopics() {
  try {
    // Fetch topics from API based on chapterId
    const response = await axiosInstance.get('/topics', {
      params: {
        chapterId: questionBankData.value.chapterId
      }
    }).catch(() => ({ data: [] })) // Fallback to empty array if API fails

    // Transform the API response to extract topic names
    if (response.data && Array.isArray(response.data)) {
      topics.value = response.data.map((topic: Topic) => topic.name)

      // Store the mapping of topic names to IDs
      response.data.forEach((topic: Topic) => {
        if (topic.name && topic.id) {
          topicMap.value.set(topic.name, topic.id);
        }
      });
    } else {
      topics.value = []
    }

    // If no topics from API, try to extract from stored questions
    if (topics.value.length === 0) {
      const storedQuestions = localStorage.getItem('questions')
      if (storedQuestions) {
        const questions = JSON.parse(storedQuestions)
        const uniqueTopics = new Set<string>()

        questions.forEach((q: { topic?: string; topics?: { topic: string }[] }) => {
          if (q.topic) uniqueTopics.add(q.topic)
          if (q.topics) {
            q.topics.forEach((t: { topic: string }) => uniqueTopics.add(t.topic))
          }
        })

        topics.value = Array.from(uniqueTopics)
      }
    }
  } catch (error) {
    console.error('Error fetching topics:', error)
  }
}

// Update saveQuestion function to use the API flow
async function saveQuestion() {
  try {
    // Get the question type ID from the map
    const questionTypeId = questionTypeMap.value.get(selectedType.value);
    if (!questionTypeId) {
      console.error('Question type ID not found for:', selectedType.value);
      return;
    }

    // Get the topic ID from the map
    const topicId = topicMap.value.get(selectedTopic.value);
    if (!topicId) {
      console.error('Topic ID not found for:', selectedTopic.value);
      return;
    }

    // Step 1: Create the question
    const isPreviousExam = getIsPreviousExam();
    const questionCreateRequest: QuestionCreateRequest = {
      question_type_id: questionTypeId,
      board_question: isPreviousExam,
      is_verified: false // New questions are unverified by default
    };

    const questionResponse = await axiosInstance.post<QuestionCreateResponse>(
      '/questions',
      questionCreateRequest
    );

    const questionId = questionResponse.data.id;

    // Step 2: Get the question text based on the question type
    let questionText = '';
    let imageFile = null;

    switch (selectedType.value) {
      case 'Descriptive':
      case 'True or False':
      case 'Long Answer':
      case 'Short Answer':
      case 'Essay':
      case 'Numerical':
      case 'Coding Problem':
      case 'Case Study':
        questionText = descriptiveQuestion.value.question;
        // Get the image file if it exists
        const descriptiveImageInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
        if (descriptiveImageInput && descriptiveImageInput.files && descriptiveImageInput.files.length > 0) {
          imageFile = descriptiveImageInput.files[0];
        }
        break;
      case 'MCQ':
      case 'Multiple Choice':
        questionText = mcqQuestion.value.question;
        // For MCQ, we would also need to handle option images, but for simplicity, we'll just use the question image
        const mcqImageInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
        if (mcqImageInput && mcqImageInput.files && mcqImageInput.files.length > 0) {
          imageFile = mcqImageInput.files[0];
        }
        break;
      case 'Fill in the Blanks':
        questionText = fillBlankQuestion.value.question;
        const fillBlankImageInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
        if (fillBlankImageInput && fillBlankImageInput.files && fillBlankImageInput.files.length > 0) {
          imageFile = fillBlankImageInput.files[0];
        }
        break;
      case 'Match the Pairs':
      case 'Matching':
        questionText = matchPairQuestion.value.question;
        const matchPairImageInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
        if (matchPairImageInput && matchPairImageInput.files && matchPairImageInput.files.length > 0) {
          imageFile = matchPairImageInput.files[0];
        }
        break;
      default:
        console.error('Unsupported question type:', selectedType.value);
        return;
    }

    // Step 3: If there's an image, create an image record
    let imageId = undefined;
    if (imageFile) {
      // In a real app, you would upload the image to a server and get a URL
      // For now, we'll just use the file name as the URL
      const imageUrl = imageFile.name;

      const imageCreateRequest: ImageCreateRequest = {
        image_url: imageUrl
      };

      const imageResponse = await axiosInstance.post<ImageCreateResponse>(
        '/images',
        imageCreateRequest
      );

      imageId = imageResponse.data.id;
    }

    // Step 4: Create the question text
    const questionTextCreateRequest: QuestionTextCreateRequest = {
      question_id: questionId,
      question_text: questionText
    };

    // Only include image_id if an image was uploaded
    if (imageId) {
      questionTextCreateRequest.image_id = imageId;
    }

    await axiosInstance.post(
      '/question-texts',
      questionTextCreateRequest
    );

    // Step 5: Create the question-topic association
    const questionTopicCreateRequest: QuestionTopicCreateRequest = {
      question_id: questionId,
      topic_id: topicId
    };

    await axiosInstance.post(
      '/question-topics',
      questionTopicCreateRequest
    );

    // Success! Navigate back to question dashboard
    router.push({ name: 'questionDashboard' });
  } catch (error) {
    console.error('Error saving question:', error);
    // In a real app, you would show an error message to the user
  }
}

// Helper function to get isPreviousExam based on the question type
function getIsPreviousExam() {
  switch (selectedType.value) {
    case 'Descriptive':
    case 'True or False':
    case 'Long Answer':
    case 'Short Answer':
    case 'Essay':
    case 'Numerical':
    case 'Coding Problem':
    case 'Case Study':
      return descriptiveQuestion.value.isPreviousExam;
    case 'MCQ':
    case 'Multiple Choice':
      return mcqQuestion.value.isPreviousExam;
    case 'Fill in the Blanks':
      return fillBlankQuestion.value.isPreviousExam;
    case 'Match the Pairs':
    case 'Matching':
      return matchPairQuestion.value.isPreviousExam;
    default:
      return false;
  }
}

// Methods
function toggleQuestionContainer() {
  // The v-show directives will handle showing/hiding based on selectedType
}

function autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = ''
  textarea.style.height = textarea.scrollHeight + 'px'
}

function insertBlank() {
  fillBlankQuestion.value.question += '_____'
}

function addInput(side: 'lhs' | 'rhs') {
  if (side === 'lhs') {
    matchPairQuestion.value.lhs.push('')
  } else {
    matchPairQuestion.value.rhs.push('')
  }
}

function removeInput(side: 'lhs' | 'rhs', index: number) {
  if (side === 'lhs') {
    if (matchPairQuestion.value.lhs.length > 1) {
      matchPairQuestion.value.lhs.splice(index, 1)
    }
  } else {
    if (matchPairQuestion.value.rhs.length > 2) {
      matchPairQuestion.value.rhs.splice(index, 1)
    }
  }
}

// Watch for changes in selectedTopic
watch(selectedTopic, (newTopic) => {
  // Reset selectedType when topic changes
  if (!newTopic) {
    selectedType.value = ''
  }
})

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank')
  if (storedData) {
    questionBankData.value = JSON.parse(storedData)
    fetchTopics()
    fetchQuestionTypes()
  } else {
    // Redirect to question bank selection if no data
    router.push({ name: 'questionBank' })
  }

  // Initialize textareas
  setTimeout(() => {
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.style.height = textarea.scrollHeight + 'px'
    })
  }, 0)
})
</script>

<style scoped>
/* For screen size "sm" or smaller */
@media (max-width: 576px) {
  .btn-custom {
    background-color: #dc3545;
    color: white;
  }
}

/* For larger screen sizes */
@media (min-width: 577px) {
  .btn-custom {
    border: 1px solid gray !important;
    background-color: #f8f9fa; /* Matches btn-light */
    color: black;
    transition: background-color 0.3s ease, color 0.3s ease; /* Smooth hover effect */
    border-radius: 1%;
  }
  .btn-custom:hover {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545;
    color: white;
  }
}

#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}
</style>
