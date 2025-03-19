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
            <h4 class="fw-bolder text-uppercase mb-0" id="pageHeader">Edit Question</h4>
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
        v-else
        :isEditMode="true"
        :questionId="questionId"
        :questionBankData="questionBankData"
        @update="handleUpdateQuestion"
      />
    </div>
  </div>

  <!-- Toast Notification -->
  <ToastNotification
    :show="showToast"
    :title="toastTitle"
    :message="toastMessage"
    :type="toastType"
    @close="closeToast"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import QuestionFormComponent from '@/components/forms/QuestionFormComponent.vue'
import ToastNotification from '@/components/common/ToastNotification.vue'

// Define component name
defineOptions({
  name: 'EditQuestion'
})

const router = useRouter()
const route = useRoute()
const isLoading = ref(true)
const questionId = ref<number | undefined>(undefined)

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

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Handle updating the question
async function handleUpdateQuestion(payload: {
  questionId?: number;
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
    if (!payload.questionId) {
      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = 'Question ID is missing';
      toastType.value = 'error';
      showToast.value = true;

      return;
    }

    // First, fetch the question data once to get all associated IDs
    const questionResponse = await axiosInstance.get(`/questions/${payload.questionId}`);
    const questionData = questionResponse.data;

    // Extract the question text ID
    let questionTextId: number | null = null;
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      questionTextId = questionData.question_texts[0].id;
    }

    if (!questionTextId) {
      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = 'Question text ID not found';
      toastType.value = 'error';
      showToast.value = true;

      return;
    }

    // Step 1: Update the question
    const questionUpdateRequest = {
      question_type_id: payload.questionTypeId,
      board_question: payload.isPreviousExam
    }

    await axiosInstance.put(
      `/questions/${payload.questionId}`,
      questionUpdateRequest
    )

    // Step 2: Update the question text using the ID we already fetched
    await axiosInstance.put(
      `/question-texts/${questionTextId}`,
      {
        question_text: payload.questionText
      }
    );

    // Step 3: Update the question-topic association
    // First, find existing associations
    const questionTopicsResponse = await axiosInstance.get(`/question-topics?question_id=${payload.questionId}`);

    if (questionTopicsResponse.data && questionTopicsResponse.data.length > 0) {
      // Delete each existing question-topic association using DELETE /question-topics/{id}
      for (const topicAssoc of questionTopicsResponse.data) {
        await axiosInstance.delete(`/question-topics/${topicAssoc.id}`);
      }
    }

    // Create new topic association using POST /question-topics
    await axiosInstance.post(
      '/question-topics',
      {
        question_id: payload.questionId,
        topic_id: payload.topicId
      }
    );

    // Step 4: Handle additional data based on question type
    if (payload.additionalData.options && Array.isArray(payload.additionalData.options)) {
      // MCQ questions
      // First, delete existing options
      const optionsResponse = await axiosInstance.get(`/question-options?question_id=${payload.questionId}`);
      if (optionsResponse.data) {
        for (const option of optionsResponse.data) {
          await axiosInstance.delete(`/question-options/${option.id}`);
        }
      }

      // Then create new options
      const options = payload.additionalData.options;
      const correctOptionIndex = payload.additionalData.correctOption;

      for (let i = 0; i < options.length; i++) {
        if (options[i].trim() !== '') {
          await axiosInstance.post('/question-options', {
            question_id: payload.questionId,
            option_text: options[i],
            is_correct: i === correctOptionIndex
          });
        }
      }
    } else if (payload.additionalData.correctAnswer) {
      // Fill in the blanks
      // First, delete existing answers
      const answersResponse = await axiosInstance.get(`/question-answers?question_id=${payload.questionId}`);
      if (answersResponse.data) {
        for (const answer of answersResponse.data) {
          await axiosInstance.delete(`/question-answers/${answer.id}`);
        }
      }

      // Then create new answer
      await axiosInstance.post('/question-answers', {
        question_id: payload.questionId,
        answer_text: payload.additionalData.correctAnswer
      });
    } else if (payload.additionalData.lhs && payload.additionalData.rhs) {
      // Match the pairs
      // First, delete existing pairs
      const pairsResponse = await axiosInstance.get(`/matching-pairs?question_id=${payload.questionId}`);
      if (pairsResponse.data) {
        for (const pair of pairsResponse.data) {
          await axiosInstance.delete(`/matching-pairs/${pair.id}`);
        }
      }

      // Then create new pairs
      const lhs = payload.additionalData.lhs;
      const rhs = payload.additionalData.rhs;

      for (let i = 0; i < lhs.length; i++) {
        if (lhs[i].trim() !== '' && i < rhs.length && rhs[i].trim() !== '') {
          await axiosInstance.post('/matching-pairs', {
            question_id: payload.questionId,
            left_text: lhs[i],
            right_text: rhs[i]
          });
        }
      }
    }

    // Show success toast notification
    toastTitle.value = 'Success';
    toastMessage.value = 'Question updated successfully';
    toastType.value = 'success';
    showToast.value = true;

    // Auto hide toast after 3 seconds, then navigate
    setTimeout(() => {
      showToast.value = false;
      // Navigate back to question dashboard
      router.push({ name: 'questionDashboard' });
    }, 1500);

  } catch {
    // Show error toast
    toastTitle.value = 'Error';
    toastMessage.value = 'Failed to update question';
    toastType.value = 'error';
    showToast.value = true;

    // Auto hide toast after 5 seconds
    setTimeout(() => {
      showToast.value = false;
    }, 5000);
  }
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank');
  if (storedData) {
    questionBankData.value = JSON.parse(storedData);
  } else {
    // Redirect to question bank selection if no data
    router.push({ name: 'questionBank' });
    return;
  }

  // Get the question ID from the route params
  if (route.params.id) {
    questionId.value = parseInt(route.params.id as string);
    isLoading.value = false;
  } else {
    // Redirect back to dashboard if no question ID
    router.push({ name: 'questionDashboard' });
  }
})

// Toast notification functions
function closeToast() {
  showToast.value = false
  toastTitle.value = ''
  toastMessage.value = ''
  toastType.value = 'info'
}
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}
</style>
