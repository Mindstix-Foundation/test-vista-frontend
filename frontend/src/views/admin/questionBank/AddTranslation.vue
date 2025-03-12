<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'translationPending' }" aria-label="Close"></router-link>
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
          <h4 class="text-left fw-bolder text-uppercase mb-2" id="pageHeader">Add Translation</h4>
        </div>
      </div>
      <hr>
    </div>
    <div id="questionsSection" class="container">

      <div class="container" id="descriptiveQuestion" v-show="questionType === 'Descriptive' ||
                                                 questionType === 'True or False' ||
                                                 questionType === 'Long Answer' ||
                                                 questionType === 'Short Answer' ||
                                                 questionType === 'Essay' ||
                                                 questionType === 'Numerical' ||
                                                 questionType === 'Coding Problem' ||
                                                 questionType === 'Case Study'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="saveTranslation">
              <div class="mb-3">
                <label for="questionTranslate" class="form-label">Original Question</label>
                <textarea id="questionTranslate" v-model="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>
                <div class="form-floating">
                  <textarea id="question" v-model="translatedQuestion.question" class="form-control" rows="5" placeholder="Type your question here..." @input="autoResize" required></textarea>
                  <label for="question" class="form-label">Translated Question</label>
                </div>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01">
                </div>
              </div>
              <div class="mt-5 text-center">
                <button type="submit" class="btn btn-dark" id="saveButton">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="container" id="mcqQuestion" v-show="questionType === 'MCQ' || questionType === 'Multiple Choice'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="saveTranslation">
              <div class="mb-3">
                <label for="mcqTextTranslate" class="form-label">Original Question</label>
                <textarea id="mcqTextTranslate" v-model="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>
                <div class="form-floating">
                  <textarea id="mcqText" v-model="translatedQuestion.question" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
                  <label for="mcqText" class="form-label">Translated Question</label>
                </div>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01">
                </div>
              </div>

              <div class="mb-3">
                <div class="row g-3">
                  <div class="col-md-6" v-for="(option, index) in originalOptions" :key="index">
                    <div class="form-floating">
                      <input type="text" :value="option" readonly class="form-control" :id="'option' + (index + 1) + 'Translate'">
                    </div>
                    <div class="form-floating">
                      <input type="text" v-model="translatedOptions[index]" class="form-control" :id="'option' + (index + 1)" :placeholder="'Option ' + (index + 1)">
                      <label :for="'option' + (index + 1)">Option {{ String.fromCharCode(65 + index) }}</label>
                    </div>
                    <div class="input-group input-group-sm mb-3">
                      <input type="file" class="form-control" id="inputGroupFile01">
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center mt-3">
                <button type="submit" class="btn btn-dark" id="saveButton">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="container" id="fillBlankQuestion" v-show="questionType === 'Fill in the Blanks'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="saveTranslation">
              <div class="mb-3">
                <label for="translateFillBlank" class="form-label">Original Question</label>
                <textarea id="translateFillBlank" v-model="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

                <div class="form-floating">
                  <textarea id="fillInTheBlankQuestion" v-model="translatedQuestion.question" class="form-control" rows="3"
                            placeholder="Type your question here, use '_____' for blanks." @input="autoResize" required></textarea>
                  <label for="fillInTheBlankQuestion" class="form-label">Translated Question</label>
                </div>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01">
                </div>
                <div class="col text-end">
                  <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="insertBlank">Insert Blank</button>
                </div>
              </div>

              <div class="text-center">
                <button type="submit" class="btn btn-dark" id="saveButton">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'

// Component name (for linter)
defineOptions({
  name: 'AddTranslation'
})

const router = useRouter()
const route = useRoute()

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

// Question data
const questionId = ref<number | null>(null)
const questionType = ref('')
const originalQuestion = ref('')
const originalOptions = ref<string[]>([])
const translatedQuestion = ref({
  question: '',
  type: ''
})
const translatedOptions = ref<string[]>(['', '', '', ''])

// Define interfaces for API data
interface TranslationData {
  question_id: number;
  translated_text: string;
  language: string;
  options?: string[];
}

interface McqOption {
  option_text: string;
}

// Methods
function autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  if (textarea.readOnly) {
    // Temporarily remove readonly to calculate height
    textarea.readOnly = false
    textarea.style.height = ''
    textarea.style.height = textarea.scrollHeight + 'px'
    textarea.readOnly = true
  } else {
    textarea.style.height = ''
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

function insertBlank() {
  translatedQuestion.value.question += '_____'
}

async function saveTranslation() {
  try {
    if (!questionId.value) {
      console.error('Question ID is missing')
      return
    }

    // Prepare the translation data based on question type
    const translationData: TranslationData = {
      question_id: questionId.value,
      translated_text: translatedQuestion.value.question,
      language: 'hi' // Assuming Hindi translation, adjust as needed
    }

    // Add options for MCQ questions
    if (questionType.value === 'MCQ' || questionType.value === 'Multiple Choice') {
      translationData.options = translatedOptions.value
    }

    // Make API call to save translation
    await axiosInstance.post('/question-translations', translationData)

    // Navigate back to translation pending page
    router.push({ name: 'translationPending' })
  } catch (error) {
    console.error('Error saving translation:', error)
  }
}

// Load question data
async function loadQuestionData() {
  try {
    // Get question ID from route params or query
    const id = route.params.id || route.query.id
    if (!id) {
      console.error('Question ID not provided')
      return
    }

    questionId.value = Number(id)

    // Fetch question data from API
    const response = await axiosInstance.get(`/questions/${questionId.value}`)
    const questionData = response.data

    // Set question type
    questionType.value = questionData.question_type.type_name

    // Set original question text
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      originalQuestion.value = questionData.question_texts[0].question_text
      translatedQuestion.value.type = questionType.value
    }

    // Set original options for MCQ
    if ((questionType.value === 'MCQ' || questionType.value === 'Multiple Choice') &&
        questionData.question_texts[0].mcq_options) {
      originalOptions.value = questionData.question_texts[0].mcq_options.map((opt: McqOption) => opt.option_text)
      // Initialize translated options array with the same length
      translatedOptions.value = Array(originalOptions.value.length).fill('')
    }

    // Initialize textareas
    setTimeout(() => {
      document.querySelectorAll('textarea').forEach(textarea => {
        autoResize({ target: textarea } as unknown as Event)
      })
    }, 0)
  } catch (error) {
    console.error('Error loading question data:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank')
  if (storedData) {
    questionBankData.value = JSON.parse(storedData)
    loadQuestionData()
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

textarea[readonly] {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}
</style>
