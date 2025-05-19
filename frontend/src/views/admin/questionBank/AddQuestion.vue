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
        <output class="spinner-border text-primary">
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>
      <QuestionFormComponent
        v-else-if="validateChapterId()"
        :questionBankData="questionBankData"
        :chapterId="questionBankData.chapterId"
        @save="handleSaveQuestion"
        :useSearchableDropdown="true"
      />
      <div v-else class="alert alert-danger text-center">
        Chapter ID is missing. Please go back to <router-link :to="{ name: 'questionBank' }">Question Bank</router-link> and try again.
      </div>
    </div>

    <!-- Loading overlay shown during submission -->
    <div v-if="isSubmitting" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
      <output class="spinner-border text-light" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Saving...</span>
      </output>
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

// Helper functions for image upload and processing
async function uploadImage(file: File) {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', file);

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
    original_filename: uploadedImageDetails.original_filename || file.name,
    file_size: uploadedImageDetails.file_size || file.size,
    file_type: uploadedImageDetails.file_type || file.type,
    width: uploadedImageDetails.width,
    height: uploadedImageDetails.height
  };

  const imageResponse = await axiosInstance.post('/images', imageCreateRequest);
  return imageResponse.data.id;
}

// Process main question image
async function processMainQuestionImage(imageFile: File) {
  try {
    return await uploadImage(imageFile);
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    
    // Check for specific image validation errors
    const axiosError = error as AxiosErrorResponse;
    if (axiosError.response?.data?.message) {
      // Show error toast using toast store
      toastStore.showToast({
        title: 'Image Upload Error',
        message: axiosError.response.data.message,
        type: 'error'
      });
      
      // Rethrow to signal a critical error
      throw error;
    }
    // For other errors, return null to continue without image
    return null;
  }
}

// Process MCQ options
async function processMCQOptions(options: string[], correctOptionIndex: number | undefined, optionImages?: (File | null)[]) {
  const mcqOptions = [];
  
  // Determine if we have images to process
  const hasOptionImages = optionImages && Array.isArray(optionImages);
  
  for (let i = 0; i < options.length; i++) {
    if (options[i].trim() === '') continue;
    
    const option: {
      option_text: string;
      is_correct: boolean;
      image_id?: number;
    } = {
      option_text: options[i],
      is_correct: i === correctOptionIndex
    };
    
    // Process option image if it exists
    if (hasOptionImages && optionImages[i]) {
      try {
        option.image_id = await uploadImage(optionImages[i] as File);
      } catch (error) {
        console.error(`Error uploading image for option ${i+1}:`, error);
        // Continue without the image if upload fails
      }
    }
    
    mcqOptions.push(option);
  }
  
  return mcqOptions;
}

// Create pair object helper function
function createPairObject(leftText: string, rightText: string) {
  return {
    left_text: leftText,
    right_text: rightText
  };
}

// Helper to upload image with error handling
async function uploadPairImage(image: File, side: string, index: number) {
  try {
    return await uploadImage(image);
  } catch (error) {
    console.error(`Error uploading image for ${side} side ${index+1}:`, error);
    return undefined;
  }
}

// Process match pairs
async function processMatchPairs(lhs: string[], rhs: string[], optionImages?: (File | null)[]) {
  const matchPairs = [];
  const maxLength = Math.max(lhs.length, rhs.length);
  const hasOptionImages = optionImages && Array.isArray(optionImages);
  
  for (let i = 0; i < maxLength; i++) {
    // Skip empty pairs
    const leftText = i < lhs.length ? lhs[i].trim() : '';
    const rightText = i < rhs.length ? rhs[i].trim() : '';
    
    if (leftText === '' && rightText === '') continue;
    
    // Create the pair object
    const pair = createPairObject(leftText, rightText);
    
    // Process images if they exist
    if (hasOptionImages) {
      // Handle left image
      if (i < lhs.length && optionImages[i]) {
        pair.left_image_id = await uploadPairImage(optionImages[i] as File, 'left', i);
      }
      
      // Handle right image
      if (i < rhs.length && optionImages[i + 10]) {
        pair.right_image_id = await uploadPairImage(optionImages[i + 10] as File, 'right', i);
      }
    }
    
    matchPairs.push(pair);
  }
  
  return matchPairs;
}

// Create question request base
function createBaseQuestionRequest(payload: {
  questionTypeId: number;
  isPreviousExam: boolean;
  topicId: number;
  questionText: string;
}, imageId: number | null) {
  const request = {
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
    request.question_text_data.image_id = imageId;
  }
  
  return request;
}

// Handle special question types (Odd One Out, Correlation)
function processSpecialQuestionTypes(request, questionTypeId: number, correctAnswer?: string) {
  if (questionTypeId === 2) { // Odd One Out
    request.question_text_data.answer_text = correctAnswer || "See question for details";
  } 
  else if (questionTypeId === 3) { // Complete the Correlation
    request.question_text_data.answer_text = correctAnswer || "See question for correlation details";
  }
  
  return request;
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
    
    // Process main question image if provided
    let imageId = null;
    if (payload.imageFile) {
      try {
        imageId = await processMainQuestionImage(payload.imageFile);
      } catch {
        // Critical error occurred, abort question creation
        isSubmitting.value = false;
        return;
      }
    }
    
    // Create the base question request
    const createQuestionRequest = createBaseQuestionRequest(payload, imageId);
    
    // Process MCQ options with images if applicable
    if (payload.questionTypeId === 1 && payload.additionalData?.options) {
      createQuestionRequest.question_text_data.mcq_options = 
        await processMCQOptions(
          payload.additionalData.options, 
          payload.additionalData.correctOption,
          payload.optionImages
        );
    }
    
    // Process match pairs with images if applicable
    if (payload.questionTypeId === 5 && payload.additionalData?.lhs && payload.additionalData?.rhs) {
      createQuestionRequest.question_text_data.match_pairs = 
        await processMatchPairs(
          payload.additionalData.lhs,
          payload.additionalData.rhs,
          payload.optionImages
        );
    }
    
    // Handle special question types
    if (payload.questionTypeId === 2 || payload.questionTypeId === 3) {
      processSpecialQuestionTypes(
        createQuestionRequest, 
        payload.questionTypeId,
        payload.additionalData?.correctAnswer
      );
    }
    
    // Make API call to create the question
    const response = await axiosInstance.post('/questions/add', createQuestionRequest);
    console.log('Question created successfully:', response.data);
    
    // Navigate back to question dashboard with success query param
    router.push({
      name: 'questionDashboard',
      query: {
        success: 'true',
        message: 'Question created successfully',
        tab: 'unverified'
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
