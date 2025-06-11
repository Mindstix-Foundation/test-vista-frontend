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
        @openQuestionImageModal="openQuestionImageModal"
        @openOptionImageModal="openOptionImageModal"
        :useSearchableDropdown="true"
        ref="questionFormComponent"
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

    <!-- Enhanced Image Upload Modals -->
    <ImageUploadEditor
      :isVisible="showQuestionImageModal"
      :questionText="currentQuestionData.questionText"
      :questionNumber="1"
      imageType="question"
      :questionType="currentQuestionData.questionType"
      :options="currentQuestionData.options"
      @close="() => showQuestionImageModal = false"
      @cancelled="handleQuestionImageCancelled"
      @imageUploaded="handleQuestionImageUploaded"
    />

    <ImageUploadEditor
      :isVisible="showOptionImageModal"
      :questionText="currentQuestionData.questionText"
      :questionNumber="1"
      imageType="option"
      :questionType="currentQuestionData.questionType"
      :options="currentQuestionData.options"
      :optionIndex="currentOptionIndex"
      @close="() => showOptionImageModal = false"
      @cancelled="handleOptionImageCancelled"
      @imageUploaded="handleOptionImageUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import QuestionFormComponent from '@/components/forms/QuestionFormComponent.vue'
import { useToastStore } from '@/store/toast'
import ImageUploadEditor from '@/components/common/ImageUploadEditor.vue'
import imageService from '@/services/imageService'
import { useImageUploadStore } from '@/stores/imageUpload'

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
const imageUploadStore = useImageUploadStore()
const isLoading = ref(true)
const isSubmitting = ref(false)
const questionFormComponent = ref<any>(null)

// Add new state for image upload modals
const showQuestionImageModal = ref(false)
const showOptionImageModal = ref(false)
const currentOptionIndex = ref<number>(-1)
const currentQuestionData = ref<{
  questionText: string
  questionType: string
  options?: string[]
}>({
  questionText: '',
  questionType: '',
  options: []
})

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
const uploadImage = async (imageFile: File, customWidth?: number, customHeight?: number): Promise<number> => {
  try {
    // Use the imageService which now supports custom dimensions
    const response = await imageService.uploadImage(imageFile, customWidth, customHeight);
    return response.id;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
};

// Process main question image
const processMainQuestionImage = async (customWidth?: number, customHeight?: number) => {
  const questionImageData = imageUploadStore.getQuestionImage()
  if (questionImageData) {
    try {
      // Upload image with custom dimensions from the store
      const imageId = await uploadImage(
        questionImageData.file, 
        customWidth || questionImageData.metadata.width, 
        customHeight || questionImageData.metadata.height
      );
      
      // Update the store with the uploaded ID
      imageUploadStore.updateUploadedId(questionImageData.id, imageId);
      
      return imageId;
    } catch (error: any) {
      console.error('Error processing main question image:', error);
      if (error.response?.data?.statusCode === 413) {
        toastStore.showToast({
          title: 'Image file size is too large',
          message: 'Please select a smaller image.',
          type: 'warning'
        });
      } else if (error.response?.data?.statusCode === 400) {
        toastStore.showToast({
          title: 'Invalid image format',
          message: 'Please select a valid image file.',
          type: 'warning'
        });
      }
      return null; // Return null to continue without image
    }
  }
  return null;
};

// Process MCQ options
async function processMCQOptions(options: string[], correctOptionIndex: number | undefined) {
  const mcqOptions = [];
  
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
    
    // Process option image if it exists in store
    const optionImageData = imageUploadStore.getOptionImage(i);
    if (optionImageData) {
      try {
        const imageId = await uploadImage(
          optionImageData.file,
          optionImageData.metadata.width,
          optionImageData.metadata.height
        );
        option.image_id = imageId;
        
        // Update the store with the uploaded ID
        imageUploadStore.updateUploadedId(optionImageData.id, imageId);
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
async function uploadPairImage(image: File, side: string, index: number): Promise<number | undefined> {
  try {
    return await uploadImage(image);
  } catch (error) {
    console.error(`Error uploading image for ${side} side ${index+1}:`, error);
    return undefined;
  }
}

// Process match pairs
async function processMatchPairs(lhs: string[], rhs: string[]) {
  const matchPairs = [];
  const maxLength = Math.max(lhs.length, rhs.length);
  
  for (let i = 0; i < maxLength; i++) {
    const pair = await processSingleMatchPair(lhs, rhs, i);
    if (pair) {
      matchPairs.push(pair);
    }
  }
  
  return matchPairs;
}

// Helper to process a single match pair
async function processSingleMatchPair(lhs: string[], rhs: string[], index: number) {
  // Get text values with defaults
  const leftText = index < lhs.length ? lhs[index].trim() : '';
  const rightText = index < rhs.length ? rhs[index].trim() : '';
  
  // Skip empty pairs
  if (leftText === '' && rightText === '') return null;
  
  // Create the pair object
  const pair = createPairObject(leftText, rightText);
  
  // Process images if applicable
  await processMatchPairImages(pair, index);
  
  return pair;
}

// Helper to process images for a match pair
async function processMatchPairImages(
  pair: { left_text: string; right_text: string; left_image_id?: number; right_image_id?: number }, 
  index: number
) {
  // Handle left image (using same index as option)
  const leftImageData = imageUploadStore.getOptionImage(index);
  if (leftImageData) {
    try {
      const imageId = await uploadImage(
        leftImageData.file,
        leftImageData.metadata.width,
        leftImageData.metadata.height
      );
      pair.left_image_id = imageId;
      imageUploadStore.updateUploadedId(leftImageData.id, imageId);
    } catch (error) {
      console.error(`Error uploading left image for pair ${index+1}:`, error);
    }
  }
  
  // Handle right image (using index + 10 for right side)
  const rightImageData = imageUploadStore.getOptionImage(index + 10);
  if (rightImageData) {
    try {
      const imageId = await uploadImage(
        rightImageData.file,
        rightImageData.metadata.width,
        rightImageData.metadata.height
      );
      pair.right_image_id = imageId;
      imageUploadStore.updateUploadedId(rightImageData.id, imageId);
    } catch (error) {
      console.error(`Error uploading right image for pair ${index+1}:`, error);
    }
  }
}

// Create question request base
function createBaseQuestionRequest(payload: {
  questionTypeId: number;
  isPreviousExam: boolean;
  topicId: number;
  questionText: string;
}, imageId: number | null) {
  const request: {
    question_type_id: number;
    board_question: boolean;
    question_text_data: {
      question_text: string;
      image_id?: number;
      mcq_options?: any[];
      match_pairs?: any[];
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
    request.question_text_data.image_id = imageId;
  }
  
  return request;
}

// Handle special question types (Odd One Out, Correlation)
function processSpecialQuestionTypes(request: any, questionTypeId: number, correctAnswer?: string) {
  if (questionTypeId === 2) { // Odd One Out
    request.question_text_data.answer_text = correctAnswer ?? "See question for details";
  } 
  else if (questionTypeId === 3) { // Complete the Correlation
    request.question_text_data.answer_text = correctAnswer ?? "See question for correlation details";
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
    
    // Process main question image if exists in store
    let imageId = null;
    if (imageUploadStore.getQuestionImage()) {
      try {
        imageId = await processMainQuestionImage();
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
          payload.additionalData.correctOption
        );
    }
    
    // Process match pairs with images if applicable
    if (payload.questionTypeId === 5 && payload.additionalData?.lhs && payload.additionalData?.rhs) {
      createQuestionRequest.question_text_data.match_pairs = 
        await processMatchPairs(
          payload.additionalData.lhs,
          payload.additionalData.rhs
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
    
    // Clear images from store after successful save
    imageUploadStore.clearAllImages();
    
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
      message: axiosError.response?.data?.message ?? 'Failed to create question',
      type: 'error'
    });
  }
}

// Add methods for ImageUploadEditor
function openQuestionImageModal(data: { questionText: string; questionType: string; options?: string[] }) {
  currentQuestionData.value = data
  showQuestionImageModal.value = true
}

function openOptionImageModal(data: { questionText: string; questionType: string; options?: string[]; optionIndex: number }) {
  currentQuestionData.value = data
  currentOptionIndex.value = data.optionIndex
  showOptionImageModal.value = true
}

function handleQuestionImageUploaded(imageData: any) {
  // Store image locally in Pinia store
  console.log('Question image uploaded locally:', imageData);
  showQuestionImageModal.value = false;
  
  // Store in Pinia store
  imageUploadStore.setQuestionImage(imageData.file, imageData.metadata);
  
  // Pass the image data to the QuestionFormComponent for preview
  if (questionFormComponent.value && imageData.file) {
    questionFormComponent.value.setUploadedQuestionImage(imageData.file, imageData.id, imageData.url);
  }
}

function handleOptionImageUploaded(imageData: any) {
  // Store image locally in Pinia store
  console.log('Option image uploaded locally for index:', currentOptionIndex.value, imageData);
  showOptionImageModal.value = false;
  
  // Store in Pinia store
  imageUploadStore.setOptionImage(currentOptionIndex.value, imageData.file, imageData.metadata);
  
  // Pass the image data to the QuestionFormComponent for preview
  if (questionFormComponent.value && imageData.file && currentOptionIndex.value >= 0) {
    questionFormComponent.value.setUploadedOptionImage(imageData.file, currentOptionIndex.value, imageData.id, imageData.url);
  }
}

function handleQuestionImageCancelled() {
  // Handle cancelled question image
  console.log('Question image cancelled')
  showQuestionImageModal.value = false
  
  // Remove from Pinia store
  imageUploadStore.removeQuestionImage()
  
  // Emit a custom event that the QuestionFormComponent can listen to
  window.dispatchEvent(new CustomEvent('clearQuestionImage'))
}

function handleOptionImageCancelled() {
  console.log('Option image upload cancelled');
  showOptionImageModal.value = false;
  
  // Remove from Pinia store
  imageUploadStore.removeOptionImage(currentOptionIndex.value)
  
  // Emit custom event with optionIndex
  const event = new CustomEvent('clearOptionImage', { 
    detail: { optionIndex: currentOptionIndex.value } 
  });
  window.dispatchEvent(event);
}

// Lifecycle hooks
onMounted(() => {
  // Clear any existing images when component mounts
  imageUploadStore.clearAllImages();
  
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
