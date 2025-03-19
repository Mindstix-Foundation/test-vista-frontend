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
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="fw-bolder text-start text-dark m-0 ">
              Standard {{ questionBankData.standardName }}
              <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} : {{ questionBankData.chapterName }}</span>
            </h4>
            <h4 class="fw-bolder text-uppercase mb-0" id="pageHeader">Add Question</h4>
          </div>
        </div>
      </div>
      <hr>
    </div>
    <div id="questionsSection" class="container">
      <div v-if="isLoading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <QuestionFormComponent
        v-else-if="validateChapterId()"
        :questionBankData="questionBankData"
        :chapterId="questionBankData.chapterId"
        @save="handleSaveQuestion"
      />
      <div v-else class="alert alert-danger text-center">
        Chapter ID is missing. Please go back to <router-link :to="{ name: 'questionBank' }">Question Bank</router-link> and try again.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import QuestionFormComponent from '@/components/forms/QuestionFormComponent.vue'

// Define component name
defineOptions({
  name: 'AddQuestion'
})

const router = useRouter()
const isLoading = ref(true)

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

// Debug function to validate chapter ID
function validateChapterId() {
  if (!questionBankData.value.chapterId) {
    return false;
  }
  return true;
}

// Handle saving the question
async function handleSaveQuestion(payload: {
  questionTypeId: number;
  isPreviousExam: boolean;
  topicId: number;
  questionText: string;
  additionalData: {
    options?: string[];
    correctOption?: number;
    correctAnswer?: string;
    lhs?: string[];
    rhs?: string[];
  };
}) {
  try {
    // Step 1: Create the question
    const questionCreateRequest = {
      question_type_id: payload.questionTypeId,
      board_question: payload.isPreviousExam,
      is_verified: false // New questions are unverified by default
    }

    const questionResponse = await axiosInstance.post(
      '/questions',
      questionCreateRequest
    )

    const questionId = questionResponse.data.id

    // Step 2: Create the question text
    const questionTextCreateRequest = {
      question_id: questionId,
      question_text: payload.questionText
    }

    await axiosInstance.post(
      '/question-texts',
      questionTextCreateRequest
    )

    // Step 3: Create the question-topic association
    const questionTopicCreateRequest = {
      question_id: questionId,
      topic_id: payload.topicId
    }

    await axiosInstance.post(
      '/question-topics',
      questionTopicCreateRequest
    )

    // Step 4: Handle additional data based on question type
    // Handle type-specific data
    if (payload.additionalData.options && Array.isArray(payload.additionalData.options)) {
      // MCQ questions
      const options = payload.additionalData.options
      const correctOptionIndex = payload.additionalData.correctOption

      for (let i = 0; i < options.length; i++) {
        if (options[i].trim() !== '') {
          await axiosInstance.post('/question-options', {
            question_id: questionId,
            option_text: options[i],
            is_correct: i === correctOptionIndex
          })
        }
      }
    } else if (payload.additionalData.correctAnswer) {
      // Fill in the blanks
      await axiosInstance.post('/question-answers', {
        question_id: questionId,
        answer_text: payload.additionalData.correctAnswer
      })
    } else if (payload.additionalData.lhs && payload.additionalData.rhs) {
      // Match the pairs
      const lhs = payload.additionalData.lhs
      const rhs = payload.additionalData.rhs

      for (let i = 0; i < lhs.length; i++) {
        if (lhs[i].trim() !== '' && i < rhs.length && rhs[i].trim() !== '') {
          await axiosInstance.post('/matching-pairs', {
            question_id: questionId,
            left_text: lhs[i],
            right_text: rhs[i]
          })
        }
      }
    }

    // Success! Navigate back to question dashboard
    router.push({ name: 'questionDashboard' })
  } catch {
    // In a real app, you would show an error message to the user
  }
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank')
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData)
      questionBankData.value = parsedData

      // Clean up the chapterId if it exists but might be a string "null" or "undefined"
      if (questionBankData.value.chapterId === "null" || questionBankData.value.chapterId === "undefined") {
        questionBankData.value.chapterId = ""
      }

      isLoading.value = false
    } catch {
      // Redirect to question bank selection if data is invalid
      router.push({ name: 'questionBank' })
    }
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
</style>
