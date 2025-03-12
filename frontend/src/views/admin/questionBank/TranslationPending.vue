<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'questionDashboard' }" aria-label="Close"></router-link>
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
          <h4 class="text-left fw-bolder text-uppercase mb-2">Translation Pending</h4>
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
            </div>
          </div>
        </div>
        <div class="row g-2 mb-2 justify-content-center">
          <div class="col-md-5">
            <div class="form-floating">
              <select id="filterTopic" class="form-select" v-model="selectedTopic" @change="filterCards">
                <option value="">Select Topic</option>
                <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
              </select>
              <label for="filterTopic" class="form-label"> Filter by Topic </label>
            </div>
          </div>
          <div class="col-md-5">
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

      <div class="container mb-5">
        <div class="row g-2 justify-content-center" id="verifiedContainer">
          <div v-for="(question, index) in filteredQuestions" :key="'question-' + index" class="col-12 col-md-10">
            <div class="card">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="col-12 text-end">
                      <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                      <i class="bi bi-translate fs-4 mx-2" @click="translateQuestion(question)"></i>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'

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
  name: 'TranslationPending'
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
const questions = ref<Question[]>([])
const topics = ref<string[]>([])

// UI state
const searchQuery = ref('')
const selectedTopic = ref('')
const selectedType = ref('')

// Computed property for filtered questions
const filteredQuestions = computed(() => {
  return questions.value.filter(question => {
    const matchesSearch = searchQuery.value === '' ||
      question.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (question.options && question.options.some(opt => opt.toLowerCase().includes(searchQuery.value.toLowerCase())))

    const matchesTopic = selectedTopic.value === '' ||
      (question.topics && question.topics.some(t => t.topic === selectedTopic.value)) ||
      question.topic === selectedTopic.value

    const matchesType = selectedType.value === '' || question.type === selectedType.value

    return matchesSearch && matchesTopic && matchesType
  })
})

// Methods
function clearSearch() {
  searchQuery.value = ''
  filterCards()
}

function filterCards() {
  // This function is called when search or filters change
  // The computed property will automatically update
}

function getTopicsDisplay(question: Question) {
  if (question.topics && question.topics.length > 0) {
    return question.topics.map(topic => topic.topic).join(', ')
  }
  return question.topic || ''
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

function translateQuestion(question: Question) {
  // This function would handle translation functionality
  console.log('Translate question:', question.id)
  // Implement translation logic here
}

// Fetch questions from API
async function fetchQuestions() {
  try {
    // Fetch questions that need translation
    // You might need to adjust the API endpoint or parameters based on your backend
    const response = await axiosInstance.get<ApiQuestion[]>('/questions', {
      params: {
        chapter_id: questionBankData.value.chapterId,
        needs_translation: true
      }
    }).catch((error) => {
      console.error('Error fetching questions:', error);
      return { data: [] as ApiQuestion[] };
    });

    // Transform API response to match our component's expected structure
    questions.value = response.data.map((apiQuestion: ApiQuestion) => {
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

    // Extract unique topics from the questions
    const allTopics = new Set<string>();

    questions.value.forEach(q => {
      if (q.topics) {
        q.topics.forEach(t => allTopics.add(t.topic));
      } else if (q.topic) {
        allTopics.add(q.topic);
      }
    });

    topics.value = Array.from(allTopics);
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
})
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}

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
</style>
