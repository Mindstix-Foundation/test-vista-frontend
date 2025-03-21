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

    <!-- Loading overlay shown during submission -->
    <div v-if="isSubmitting" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Saving...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import QuestionFormComponent from '@/components/forms/QuestionFormComponent.vue'
import { useToastStore } from '@/store/toast'

// Define custom error type for Axios errors
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

// Define component name
defineOptions({
  name: 'EditQuestion'
})

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const isLoading = ref(true)
const isSubmitting = ref(false)
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
  imageFile?: File;
  deleteImage?: boolean;
  existingImageId?: number | null;
}) {
  try {
    // Show loading overlay
    isSubmitting.value = true;

    if (!payload.questionId) {
      // Show error toast using toast store
      toastStore.showToast({
        title: 'Error',
        message: 'Question ID is missing',
        type: 'error'
      });
      isSubmitting.value = false;
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
      // Show error toast using toast store
      toastStore.showToast({
        title: 'Error',
        message: 'Question text ID not found',
        type: 'error'
      });
      isSubmitting.value = false;
      return;
    }

    let imageId = null;

    // Handle image deletion if requested
    if (payload.deleteImage && payload.existingImageId) {
      try {
        await axiosInstance.delete(`/images/${payload.existingImageId}`);
        console.log('Image deleted successfully');

        // Update question text to remove image reference
        await axiosInstance.put(
          `/question-texts/${questionTextId}`,
          {
            question_text: payload.questionText,
            image_id: null // Remove the image association
          }
        );
      } catch (error) {
        console.error('Error deleting image:', error);
        // Continue with question update even if image deletion fails
      }
    } else if (payload.imageFile) {
      // If a new image is being uploaded and there's an existing image,
      // we'll handle the replacement by deleting the old one first
      if (payload.existingImageId) {
        try {
          await axiosInstance.delete(`/images/${payload.existingImageId}`);
          console.log('Replaced old image successfully');
        } catch (error) {
          console.error('Error replacing old image:', error);
          // Continue with upload even if deletion fails
        }
      }

      // Upload the new image
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', payload.imageFile);

        // Upload the image
        const uploadResponse = await axiosInstance.post(
          '/images/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        // Extract image details from upload response
        const uploadedImageDetails = uploadResponse.data;

        // Create image record with returned details
        const imageCreateRequest = {
          image_url: uploadedImageDetails.image_url,
          original_filename: uploadedImageDetails.original_filename || payload.imageFile.name,
          file_size: uploadedImageDetails.file_size || payload.imageFile.size,
          file_type: uploadedImageDetails.file_type || payload.imageFile.type,
          width: uploadedImageDetails.width,
          height: uploadedImageDetails.height
        };

        const imageResponse = await axiosInstance.post('/images', imageCreateRequest);
        imageId = imageResponse.data.id;

        // Update question text with the new image ID
        await axiosInstance.put(
          `/question-texts/${questionTextId}`,
          {
            question_text: payload.questionText,
            image_id: imageId
          }
        );

        console.log('New image uploaded and associated with question');
      } catch (error: unknown) {
        console.error('Error uploading new image:', error);

        // Check if this is a validation error
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.status === 400 && axiosError.response?.data?.message) {
          // Show specific error message to the user using toast store
          toastStore.showToast({
            title: 'Image Upload Error',
            message: axiosError.response.data.message,
            type: 'error'
          });
          isSubmitting.value = false;
          // Return early without completing the question update
          return;
        }

        // For other types of errors, continue with question update without the image
        await axiosInstance.put(
          `/question-texts/${questionTextId}`,
          {
            question_text: payload.questionText
          }
        );
      }
    } else {
      // Regular update without changing images
      // Update the question text
      await axiosInstance.put(
        `/question-texts/${questionTextId}`,
        {
          question_text: payload.questionText
        }
      );
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

    // Step 2: Update the question-topic association
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

    // Navigate back to question dashboard with success query param
    router.push({
      name: 'questionDashboard',
      query: {
        success: 'true',
        message: 'Question updated successfully'
      }
    });

  } catch (error: unknown) {
    // Hide loading overlay
    isSubmitting.value = false;

    // Show error toast using toast store
    const axiosError = error as AxiosErrorResponse;
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message || 'Failed to update question',
      type: 'error'
    });
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
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}
</style>
