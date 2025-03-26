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
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import QuestionFormComponent from '@/components/forms/QuestionFormComponent.vue'
import { useToastStore } from '@/store/toast'

// Define custom error type for Axios errors
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Define component name
defineOptions({
  name: 'AddQuestion'
})

const router = useRouter()
const toastStore = useToastStore()
const isLoading = ref(true)
const isSubmitting = ref(false)

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
  imageFile?: File;
  optionImages?: (File | null)[];
}) {
  try {
    // Show loading overlay
    isSubmitting.value = true;
    let imageId = null;

    // Step 0: If an image file was uploaded, first upload and create the image
    if (payload.imageFile) {
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
      } catch (error: unknown) {
        console.error('Error uploading image:', error);

        // Check for specific image validation errors
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.data?.message) {
          isSubmitting.value = false;
          // Show error toast using toast store
          toastStore.showToast({
            title: 'Image Upload Error',
            message: axiosError.response.data.message,
            type: 'error'
          });

          // Return early, don't create the question if image upload failed
          return;
        }
        // For other errors, continue with question creation without the image
      }
    }

    // Prepare request payload for the consolidated API endpoint
    const createQuestionRequest: {
      question_type_id: number;
      board_question: boolean;
      question_text_data: {
        question_text: string;
        image_id?: number;
        mcq_options?: Array<{
          option_text: string;
          is_correct: boolean;
          image_id?: number;
        }>;
        match_pairs?: Array<{
          left_text: string;
          right_text: string;
          left_image_id?: number;
          right_image_id?: number;
        }>;
        answer_text?: string;
      };
      question_topic_data: {
        topic_id: number;
      };
      question_text_topic_medium_data: {
        instruction_medium_id: number;
      };
    } = {
      question_type_id: payload.questionTypeId,
      board_question: payload.isPreviousExam,
      question_text_data: {
        question_text: payload.questionText
      },
      question_topic_data: {
        topic_id: payload.topicId
      },
      question_text_topic_medium_data: {
        instruction_medium_id: parseInt(questionBankData.value.mediumId)
      }
    };

    // Add image ID if an image was uploaded
    if (imageId) {
      createQuestionRequest.question_text_data.image_id = imageId;
    }

    // Process MCQ options with images if provided
    if (payload.additionalData?.options && Array.isArray(payload.additionalData.options) &&
        (payload.questionTypeId === 1 || payload.questionTypeId === 2)) { // MCQ or Odd One Out
      const correctOptionIndex = payload.additionalData.correctOption;
      const mcqOptions = [];

      // First, upload all option images (if any)
      if (payload.optionImages && Array.isArray(payload.optionImages)) {
        for (let i = 0; i < payload.additionalData.options.length; i++) {
          if (payload.additionalData.options[i].trim() !== '') {
            const option: {
              option_text: string;
              is_correct: boolean;
              image_id?: number;
            } = {
              option_text: payload.additionalData.options[i],
              is_correct: i === correctOptionIndex
            };

            // Check if there's an image for this option
            if (payload.optionImages[i]) {
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
      } else {
        // No option images, just process the options
        for (let i = 0; i < payload.additionalData.options.length; i++) {
          if (payload.additionalData.options[i].trim() !== '') {
            mcqOptions.push({
              option_text: payload.additionalData.options[i],
              is_correct: i === correctOptionIndex
            });
          }
        }
      }

      createQuestionRequest.question_text_data.mcq_options = mcqOptions;
    }

    // Process match pairs with images if provided
    if (payload.additionalData?.lhs && payload.additionalData?.rhs &&
        (payload.questionTypeId === 5 || payload.questionTypeId === 3)) { // Match the Pairs or Complete the Correlation
      const lhs = payload.additionalData.lhs;
      const rhs = payload.additionalData.rhs;
      const matchPairs = [];

      // Process each pair and any associated images
      for (let i = 0; i < lhs.length; i++) {
        if (lhs[i].trim() !== '' && i < rhs.length && rhs[i].trim() !== '') {
          const pair: {
            left_text: string;
            right_text: string;
            left_image_id?: number;
            right_image_id?: number;
          } = {
            left_text: lhs[i],
            right_text: rhs[i]
          };

          // Check for LHS image (indices 0-9 in optionImages)
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

          // Check for RHS image (indices 10-19 in optionImages)
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

      createQuestionRequest.question_text_data.match_pairs = matchPairs;
    }

    // Handle different question types
    // True/False (4)
    if (payload.questionTypeId === 4) {
      // True/False questions are essentially MCQs with fixed True/False options
      const trueOption = {
        option_text: "True",
        is_correct: payload.additionalData.correctOption === 0
      };

      const falseOption = {
        option_text: "False",
        is_correct: payload.additionalData.correctOption === 1
      };

      createQuestionRequest.question_text_data.mcq_options = [trueOption, falseOption];
    }

    // Fill in the Blanks (6)
    else if (payload.questionTypeId === 6 && payload.additionalData?.correctAnswer) {
      createQuestionRequest.question_text_data.answer_text = payload.additionalData.correctAnswer;
    }

    // Short Note (11), Definition (8), Explanation/Reference (9), Long Answer (7), Very Short Answer (10)
    // These types typically don't require additional data beyond the question text

    // Make a single API call to create the question and all related data
    const response = await axiosInstance.post('/questions/add', createQuestionRequest);
    console.log('Question created successfully:', response.data);

    // Navigate back to question dashboard with success query param
    router.push({
      name: 'questionDashboard',
      query: {
        success: 'true',
        message: 'Question created successfully'
      }
    });
  } catch (error: unknown) {
    // Hide loading overlay
    isSubmitting.value = false;

    // Show error toast using toast store
    const axiosError = error as AxiosErrorResponse;
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message || 'Failed to create question',
      type: 'error'
    });
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
