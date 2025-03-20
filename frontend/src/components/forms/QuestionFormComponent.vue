<template>
  <div class="container">
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
            <select id="filterType" class="form-select" v-model="selectedType" @change="toggleQuestionContainer" :disabled="!selectedTopic || isEditMode">
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
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
            </div>
            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" v-model="descriptiveQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isDescriptiveValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
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
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
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
                    <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[1]" class="form-control" id="option2" placeholder="Option 2" required>
                    <label for="option2">Option B</label>
                  </div>
                  <div class="input-group input-group-sm mb-3">
                    <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[2]" class="form-control" id="option3" placeholder="Option 3">
                    <label for="option3">Option C</label>
                  </div>
                  <div class="input-group input-group-sm mb-3">
                    <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[3]" class="form-control" id="option4" placeholder="Option 4">
                    <label for="option4">Option D</label>
                  </div>
                  <div class="input-group input-group-sm mb-3">
                    <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
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
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMcqValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
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
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-1">
                <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
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
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isFillBlankValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
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
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
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
                      <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
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
                      <input type="file" class="form-control" id="inputGroupFile01" @change="handleQuestionImageUpload" accept=".jpg,.jpeg,.webp">
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
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMatchPairValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axiosInstance from '@/config/axios'

const props = defineProps<{
  isEditMode?: boolean
  questionId?: number
  chapterId?: string | number
  questionBankData?: {
    boardId: string
    boardName: string
    mediumId: string
    mediumName: string
    standardId: string
    standardName: string
    subjectId: string
    subjectName: string
    chapterId: string
    chapterName: string
    mediumStandardSubjectId: number | null
  }
}>()

const emit = defineEmits<{
  (e: 'save', data: {
    questionTypeId: number
    topicId: number
    isPreviousExam: boolean
    isVerified: boolean
    questionText: string
    additionalData: {
      options?: string[]
      correctOption?: number
      correctAnswer?: string
      lhs?: string[]
      rhs?: string[]
    }
    imageFile?: File
    deleteImage?: boolean
    existingImageId?: number | null
  }): void
  (e: 'update', data: {
    questionId?: number
    questionTypeId: number
    topicId: number
    isPreviousExam: boolean
    isVerified: boolean
    questionText: string
    additionalData: {
      options?: string[]
      correctOption?: number
      correctAnswer?: string
      lhs?: string[]
      rhs?: string[]
    }
    imageFile?: File
    deleteImage?: boolean
    existingImageId?: number | null
  }): void
}>()

// Provide default values for props
const isEditMode = ref(props.isEditMode || false)

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

// Add maps to store question type and topic IDs
const questionTypeMap = ref<Map<string, number>>(new Map())
const topicMap = ref<Map<string, number>>(new Map())

// Add interfaces for API data types
interface QuestionType {
  id: number
  type_name: string
  subsection_que?: boolean
}

interface Topic {
  id: number
  name: string
  chapter_id: number
  sequential_topic_number: number
  created_at: string
  updated_at: string
  chapter?: {
    id: number
    medium_standard_subject_id: number
    sequential_chapter_number: number
    name: string
    created_at: string
    updated_at: string
  }
}

// Add interface for question response to include image details
interface QuestionResponse {
  id: number
  question_type_id: number
  board_question: boolean
  is_verified: boolean
  question_type: {
    id: number
    type_name: string
  }
  question_texts: Array<{
    id: number
    question_id: number
    question_text: string
    image_id: number | null
    image?: {
      id: number
      presigned_url: string
      original_filename: string
    } | null
  }>
  question_topics: Array<{
    id: number
    question_id: number
    topic_id: number
  }>
  question_options?: Array<{
    id: number
    question_id: number
    option_text: string
    is_correct: boolean
  }>
  question_answers?: Array<{
    id: number
    question_id: number
    answer_text: string
  }>
  matching_pairs?: Array<{
    id: number
    question_id: number
    left_text: string
    right_text: string
  }>
}

// Add a ref for the question image file
const questionImageFile = ref<File | null>(null);

// Add refs for the current image
const existingImageUrl = ref<string | null>(null);
const existingImageName = ref<string | null>(null);
const existingImageId = ref<number | null>(null);
const shouldDeleteImage = ref<boolean>(false);
const imageUploadError = ref<string | null>(null);

// Methods
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
          questionTypeMap.value.set(type.type_name, type.id)
        }
      })
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

async function fetchTopics() {
  try {
    // Get chapter ID from props or from questionBankData
    const chapterId = props.chapterId || (props.questionBankData?.chapterId ?? null);

    if (!chapterId) {
      topics.value = [];

      // Add a special "error" topic that will be displayed to the user
      topics.value.push('Error: Chapter ID is missing. Please go back and select a chapter.');
      selectedTopic.value = topics.value[0];
      return;
    }

    // Fetch topics from API based on chapterId
    const response = await axiosInstance.get('/topics', {
      params: {
        chapterId: chapterId
      }
    }).catch(() => ({ data: [] })); // Fallback to empty array if API fails

    // Transform the API response to extract topic names
    if (response.data && Array.isArray(response.data)) {
      topics.value = response.data.map((topic: Topic) => topic.name)

      // Store the mapping of topic names to IDs
      response.data.forEach((topic: Topic) => {
        if (topic.name && topic.id) {
          topicMap.value.set(topic.name, topic.id)
        }
      })
    } else {
      topics.value = ['Error: Invalid response from API']
    }

    // If no topics from API, try to extract from stored questions
    if (topics.value.length === 0 || topics.value[0].startsWith('Error:')) {
      // Try fallback to local storage
      const storedQuestions = localStorage.getItem('questions')
      if (storedQuestions) {
        try {
          const questions = JSON.parse(storedQuestions)
          const uniqueTopics = new Set<string>()

          questions.forEach((q: { topic?: string; topics?: { topic: string }[] }) => {
            if (q.topic) uniqueTopics.add(q.topic)
            if (q.topics) {
              q.topics.forEach((t: { topic: string }) => uniqueTopics.add(t.topic))
            }
          })

          const localTopics = Array.from(uniqueTopics)
          if (localTopics.length > 0) {
            topics.value = localTopics
          } else if (!topics.value.length || topics.value[0].startsWith('Error:')) {
            topics.value = ['No topics found. Please create topics first.']
          }
        } catch {
          if (!topics.value.length || topics.value[0].startsWith('Error:')) {
            topics.value = ['Error: Could not load topics']
          }
        }
      } else if (topics.value.length === 0) {
        topics.value = ['No topics found. Please create topics first.']
      }
    }
  } catch {
    topics.value = ['Error: Could not load topics']
  }
}

async function fetchQuestionData() {
  if (!isEditMode.value || !props.questionId) return

  try {
    const response = await axiosInstance.get<QuestionResponse>(`/questions/${props.questionId}`)
    const questionData: QuestionResponse = response.data

    // Set the topic and type based on the question data
    if (questionData.question_topics && questionData.question_topics.length > 0) {
      const topicId = questionData.question_topics[0].topic_id
      const topicResponse = await axiosInstance.get(`/topics/${topicId}`)
      selectedTopic.value = topicResponse.data.name
    }

    if (questionData.question_type) {
      selectedType.value = questionData.question_type.type_name
    }

    // Check for image and set if available
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      const questionText = questionData.question_texts[0].question_text

      // Check if there's an image associated with this question
      if (questionData.question_texts[0].image_id && questionData.question_texts[0].image) {
        existingImageUrl.value = questionData.question_texts[0].image.presigned_url;
        existingImageName.value = questionData.question_texts[0].image.original_filename || 'question_image';
        existingImageId.value = questionData.question_texts[0].image.id;
        console.log('Image found:', existingImageUrl.value);
      }

      // Fill the appropriate question form based on question type
      switch (selectedType.value) {
        case 'Descriptive':
        case 'True or False':
        case 'Long Answer':
        case 'Short Answer':
        case 'Essay':
        case 'Numerical':
        case 'Coding Problem':
        case 'Case Study':
          descriptiveQuestion.value.question = questionText
          descriptiveQuestion.value.isPreviousExam = questionData.board_question
          break

        case 'MCQ':
        case 'Multiple Choice':
          mcqQuestion.value.question = questionText
          mcqQuestion.value.isPreviousExam = questionData.board_question

          // Fetch MCQ options
          if (questionData.question_options) {
            questionData.question_options.forEach((option: { option_text: string; is_correct: boolean }, index: number) => {
              if (index < 4) {
                mcqQuestion.value.options[index] = option.option_text
                if (option.is_correct) {
                  mcqQuestion.value.correctOption = (index + 1).toString()
                }
              }
            })
          }
          break

        case 'Fill in the Blanks':
          fillBlankQuestion.value.question = questionText
          fillBlankQuestion.value.isPreviousExam = questionData.board_question

          // Fetch correct answer
          if (questionData.question_answers && questionData.question_answers.length > 0) {
            fillBlankQuestion.value.correctAnswer = questionData.question_answers[0].answer_text
          }
          break

        case 'Match the Pairs':
        case 'Matching':
          matchPairQuestion.value.question = questionText
          matchPairQuestion.value.isPreviousExam = questionData.board_question

          // Fetch matching pairs
          if (questionData.matching_pairs) {
            matchPairQuestion.value.lhs = questionData.matching_pairs.map((pair: { left_text: string; right_text: string }) => pair.left_text)
            matchPairQuestion.value.rhs = questionData.matching_pairs.map((pair: { left_text: string; right_text: string }) => pair.right_text)
          }
          break
      }
    }
  } catch (error) {
    console.error('Error fetching question data:', error)
  }
}

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

// Get the question payload based on the current form state
function getQuestionPayload() {
  // Get the question type ID from the map
  const questionTypeId = questionTypeMap.value.get(selectedType.value)
  if (!questionTypeId) {
    console.error('Question type ID not found for:', selectedType.value)
    return null
  }

  // Get the topic ID from the map
  const topicId = topicMap.value.get(selectedTopic.value)
  if (!topicId) {
    console.error('Topic ID not found for:', selectedTopic.value)
    return null
  }

  // Common question data
  const isPreviousExam = getIsPreviousExam()

  // Create a base question payload
  const payload = {
    questionId: props.questionId,
    questionTypeId: questionTypeId,
    topicId: topicId,
    isPreviousExam: isPreviousExam,
    isVerified: false,
    questionText: '',
    additionalData: {} as {
      options?: string[];
      correctOption?: number;
      correctAnswer?: string;
      lhs?: string[];
      rhs?: string[];
    },
    imageFile: questionImageFile.value as File | undefined,
    deleteImage: shouldDeleteImage.value,
    existingImageId: existingImageId.value
  }

  // Add question-type specific data
  switch (selectedType.value) {
    case 'Descriptive':
    case 'True or False':
    case 'Long Answer':
    case 'Short Answer':
    case 'Essay':
    case 'Numerical':
    case 'Coding Problem':
    case 'Case Study':
      payload.questionText = descriptiveQuestion.value.question
      break

    case 'MCQ':
    case 'Multiple Choice':
      payload.questionText = mcqQuestion.value.question
      payload.additionalData = {
        options: mcqQuestion.value.options,
        correctOption: parseInt(mcqQuestion.value.correctOption) - 1 // Convert to 0-based index
      }
      break

    case 'Fill in the Blanks':
      payload.questionText = fillBlankQuestion.value.question
      payload.additionalData = {
        correctAnswer: fillBlankQuestion.value.correctAnswer
      }
      break

    case 'Match the Pairs':
    case 'Matching':
      payload.questionText = matchPairQuestion.value.question
      payload.additionalData = {
        lhs: matchPairQuestion.value.lhs,
        rhs: matchPairQuestion.value.rhs
      }
      break
  }

  return payload
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
      return descriptiveQuestion.value.isPreviousExam
    case 'MCQ':
    case 'Multiple Choice':
      return mcqQuestion.value.isPreviousExam
    case 'Fill in the Blanks':
      return fillBlankQuestion.value.isPreviousExam
    case 'Match the Pairs':
    case 'Matching':
      return matchPairQuestion.value.isPreviousExam
    default:
      return false
  }
}

// The main save function that will be called when submitting the form
async function saveQuestion() {
  const payload = getQuestionPayload()
  if (!payload) return

  try {
    if (isEditMode.value && props.questionId) {
      // Use type casting to satisfy TypeScript
      emit('update', {
        ...payload,
        imageFile: payload.imageFile as File | undefined
      })
    } else {
      // For save, omit the questionId without destructuring
      emit('save', {
        questionTypeId: payload.questionTypeId,
        topicId: payload.topicId,
        isPreviousExam: payload.isPreviousExam,
        isVerified: payload.isVerified,
        questionText: payload.questionText,
        additionalData: payload.additionalData,
        imageFile: payload.imageFile as File | undefined,
        deleteImage: payload.deleteImage,
        existingImageId: payload.existingImageId
      })
    }
  } catch (error) {
    console.error('Error saving question:', error)
  }
}

// Watch for changes in selectedTopic
watch(selectedTopic, (newTopic) => {
  // Reset selectedType when topic changes
  if (!newTopic) {
    selectedType.value = ''
  }
})

// Function to handle image file selection
function handleQuestionImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  imageUploadError.value = null; // Reset error message

  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      imageUploadError.value = 'Only .jpg, .jpeg, and .webp files are allowed';
      input.value = ''; // Clear the input
      return;
    }

    // Validate file size (between 10KB and 5MB)
    const minSize = 10 * 1024; // 10KB in bytes
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (file.size < minSize) {
      imageUploadError.value = 'Image size must be at least 10KB';
      input.value = ''; // Clear the input
      return;
    }

    if (file.size > maxSize) {
      imageUploadError.value = 'Image size must not exceed 5MB';
      input.value = ''; // Clear the input
      return;
    }

    // File passed all validations
    questionImageFile.value = file;
    shouldDeleteImage.value = false; // Reset deletion flag since we're adding a new image
  } else {
    questionImageFile.value = null;
  }
}

// Function to handle removing the existing image
function removeExistingImage() {
  shouldDeleteImage.value = true;
  existingImageUrl.value = null;
  existingImageName.value = null;
  imageUploadError.value = null; // Clear any error message
  // Keep the existingImageId value for sending the delete request
}

// Initialize textareas and fetch data on mount
onMounted(() => {
  fetchQuestionTypes()
  fetchTopics()

  if (isEditMode.value && props.questionId) {
    fetchQuestionData()
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

/* Add styles at the end of the style section */
.form-select:disabled {
  background-color: #f8f9fa;
  opacity: 0.75;
  cursor: not-allowed;
}

/* Style for error options in select lists */
option[value^="Error:"], option[value^="No topics"] {
  color: #dc3545;
  font-weight: bold;
  font-style: italic;
}

/* Add style for image preview */
.image-preview {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f8f9fa;
}

.image-preview img {
  max-width: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
</style>
