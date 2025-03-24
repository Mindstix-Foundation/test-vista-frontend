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
  optionImages?: (File | null)[];
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
        imageId = null; // Ensure null image_id is set in request
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
      }
    } else if (payload.existingImageId) {
      // Keep existing image
      imageId = payload.existingImageId;
    }

    // Prepare the consolidated update request
    const updateQuestionRequest: {
      board_question: boolean;
      question_text_id: number;
      question_text_data: {
        question_text: string;
        image_id?: number | null;
        mcq_options?: Array<{
          option_text: string;
          is_correct: boolean;
          id?: number;
          image_id?: number;
        }>;
        match_pairs?: Array<{
          left_text: string;
          right_text: string;
          id?: number;
          left_image_id?: number;
          right_image_id?: number;
        }>;
        answer_text?: string;
      };
      question_topic_data: {
        topic_id: number;
      };
    } = {
      board_question: payload.isPreviousExam,
      question_text_id: questionTextId,
      question_text_data: {
        question_text: payload.questionText
      },
      question_topic_data: {
        topic_id: payload.topicId
      }
    };

    // Set image ID if available or explicitly set to null for deletion
    if (imageId !== undefined) {
      updateQuestionRequest.question_text_data.image_id = imageId;
    }

    // Process MCQ options with images if provided
    if (payload.additionalData.options && Array.isArray(payload.additionalData.options) &&
        (payload.questionTypeId === 1 || payload.questionTypeId === 2)) { // MCQ or Odd One Out
      const correctOptionIndex = payload.additionalData.correctOption;
      const mcqOptions = [];

      // Get existing options to preserve IDs if possible
      const optionsResponse = await axiosInstance.get(`/question-options?question_text_id=${questionTextId}`);
      const existingOptions = optionsResponse.data || [];

      // Process all options and their images
      for (let i = 0; i < payload.additionalData.options.length; i++) {
        if (payload.additionalData.options[i].trim() !== '') {
          const option: {
            option_text: string;
            is_correct: boolean;
            id?: number;
            image_id?: number;
          } = {
            option_text: payload.additionalData.options[i],
            is_correct: i === correctOptionIndex
          };

          // If we have an existing option at this index, use its ID
          if (i < existingOptions.length) {
            option.id = existingOptions[i].id;

            // Check if this option had an image before
            if (existingOptions[i].image_id) {
              // If there's a new image, we'll replace; otherwise keep existing
              if (payload.optionImages && payload.optionImages[i]) {
                try {
                  // Delete old image
                  await axiosInstance.delete(`/images/${existingOptions[i].image_id}`);
                } catch (error) {
                  console.error(`Error deleting old image for option ${i}:`, error);
                  // Continue even if deletion fails
                }
              } else {
                // Keep existing image
                option.image_id = existingOptions[i].image_id;
              }
            }
          }

          // Upload new image if provided
          if (payload.optionImages && payload.optionImages[i]) {
            try {
              // Upload option image
              const formData = new FormData();
              formData.append('file', payload.optionImages[i] as File);

              const uploadResponse = await axiosInstance.post(
                '/images/upload',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );

              // Create image record
              const imageCreateRequest = {
                image_url: uploadResponse.data.image_url,
                original_filename: uploadResponse.data.original_filename || (payload.optionImages[i] as File).name,
                file_size: uploadResponse.data.file_size || (payload.optionImages[i] as File).size,
                file_type: uploadResponse.data.file_type || (payload.optionImages[i] as File).type,
                width: uploadResponse.data.width,
                height: uploadResponse.data.height
              };

              const imageResponse = await axiosInstance.post('/images', imageCreateRequest);
              option.image_id = imageResponse.data.id;
            } catch (error) {
              console.error(`Error uploading image for option ${i+1}:`, error);
              // Continue without the image if upload fails
            }
          }

          mcqOptions.push(option);
        }
      }

      updateQuestionRequest.question_text_data.mcq_options = mcqOptions;
    }

    // Add correct answer for Fill in the Blanks type
    if (payload.additionalData.correctAnswer && payload.questionTypeId === 6) {
      updateQuestionRequest.question_text_data.answer_text = payload.additionalData.correctAnswer;
    }

    // Process match pairs with images if provided
    if (payload.additionalData.lhs && payload.additionalData.rhs &&
        (payload.questionTypeId === 5 || payload.questionTypeId === 3)) { // Match the Pairs or Complete the Correlation
      const lhs = payload.additionalData.lhs;
      const rhs = payload.additionalData.rhs;
      const matchPairs = [];

      // Get existing pairs to preserve IDs if possible
      const pairsResponse = await axiosInstance.get(`/matching-pairs?question_text_id=${questionTextId}`);
      const existingPairs = pairsResponse.data || [];

      // Process each pair and any associated images
      for (let i = 0; i < lhs.length; i++) {
        if (lhs[i].trim() !== '' && i < rhs.length && rhs[i].trim() !== '') {
          const pair: {
            left_text: string;
            right_text: string;
            id?: number;
            left_image_id?: number;
            right_image_id?: number;
          } = {
            left_text: lhs[i],
            right_text: rhs[i]
          };

          // If we have an existing pair at this index, use its ID
          if (i < existingPairs.length) {
            pair.id = existingPairs[i].id;

            // Check if this pair had left or right images before
            if (existingPairs[i].left_image_id) {
              // If there's a new image for left side, we'll replace; otherwise keep existing
              if (payload.optionImages && payload.optionImages[i]) {
                try {
                  // Delete old left image
                  await axiosInstance.delete(`/images/${existingPairs[i].left_image_id}`);
                } catch (error) {
                  console.error(`Error deleting old left image for pair ${i}:`, error);
                  // Continue even if deletion fails
                }
              } else {
                // Keep existing left image
                pair.left_image_id = existingPairs[i].left_image_id;
              }
            }

            if (existingPairs[i].right_image_id) {
              // If there's a new image for right side, we'll replace; otherwise keep existing
              if (payload.optionImages && payload.optionImages[i + 10]) {
                try {
                  // Delete old right image
                  await axiosInstance.delete(`/images/${existingPairs[i].right_image_id}`);
                } catch (error) {
                  console.error(`Error deleting old right image for pair ${i}:`, error);
                  // Continue even if deletion fails
                }
              } else {
                // Keep existing right image
                pair.right_image_id = existingPairs[i].right_image_id;
              }
            }
          }

          // Upload new left image if provided
          if (payload.optionImages && payload.optionImages[i]) {
            try {
              // Upload LHS image
              const formData = new FormData();
              formData.append('file', payload.optionImages[i] as File);

              const uploadResponse = await axiosInstance.post(
                '/images/upload',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );

              // Create image record
              const imageCreateRequest = {
                image_url: uploadResponse.data.image_url,
                original_filename: uploadResponse.data.original_filename || (payload.optionImages[i] as File).name,
                file_size: uploadResponse.data.file_size || (payload.optionImages[i] as File).size,
                file_type: uploadResponse.data.file_type || (payload.optionImages[i] as File).type,
                width: uploadResponse.data.width,
                height: uploadResponse.data.height
              };

              const imageResponse = await axiosInstance.post('/images', imageCreateRequest);
              pair.left_image_id = imageResponse.data.id;
            } catch (error) {
              console.error(`Error uploading image for left side ${i+1}:`, error);
              // Continue without the image if upload fails
            }
          }

          // Upload new right image if provided
          if (payload.optionImages && payload.optionImages[i + 10]) {
            try {
              // Upload RHS image
              const formData = new FormData();
              formData.append('file', payload.optionImages[i + 10] as File);

              const uploadResponse = await axiosInstance.post(
                '/images/upload',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );

              // Create image record
              const imageCreateRequest = {
                image_url: uploadResponse.data.image_url,
                original_filename: uploadResponse.data.original_filename || (payload.optionImages[i + 10] as File).name,
                file_size: uploadResponse.data.file_size || (payload.optionImages[i + 10] as File).size,
                file_type: uploadResponse.data.file_type || (payload.optionImages[i + 10] as File).type,
                width: uploadResponse.data.width,
                height: uploadResponse.data.height
              };

              const imageResponse = await axiosInstance.post('/images', imageCreateRequest);
              pair.right_image_id = imageResponse.data.id;
            } catch (error) {
              console.error(`Error uploading image for right side ${i+1}:`, error);
              // Continue without the image if upload fails
            }
          }

          matchPairs.push(pair);
        }
      }

      updateQuestionRequest.question_text_data.match_pairs = matchPairs;
    }

    // Make a single API call to update the question and all related data
    await axiosInstance.put(`/questions/edit/${payload.questionId}`, updateQuestionRequest);

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
