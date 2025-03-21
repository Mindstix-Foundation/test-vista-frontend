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

                <!-- Original Question Image (only if available and no new image selected) -->
                <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
                  <div v-if="imageLoading" class="image-loading-overlay">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading image...</span>
                    </div>
                  </div>
                  <img
                    v-if="questionImage.presigned_url || questionImage.image_url"
                    :src="questionImage.presigned_url || questionImage.image_url"
                    class="question-image"
                    alt="Question Image"
                    @load="imageLoading = false"
                    @error="handleImageError"
                  />
                  <div v-if="imageError" class="image-error-message">
                    <i class="bi bi-exclamation-triangle"></i>
                    Failed to load image
                  </div>
                </div>

                <div class="form-floating">
                  <textarea id="question" v-model="translatedQuestion.question" class="form-control" rows="5" placeholder="Type your question here..." @input="autoResize" required></textarea>
                  <label for="question" class="form-label">Translated Question</label>
                </div>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                </div>
              </div>
              <div class="mt-5 text-center">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isSaving ? 'Saving...' : 'Save' }}
                </button>
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

                <!-- Original Question Image (only if available and no new image selected) -->
                <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
                  <div v-if="imageLoading" class="image-loading-overlay">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading image...</span>
                    </div>
                  </div>
                  <img
                    v-if="questionImage.presigned_url || questionImage.image_url"
                    :src="questionImage.presigned_url || questionImage.image_url"
                    class="question-image"
                    alt="Question Image"
                    @load="imageLoading = false"
                    @error="handleImageError"
                  />
                  <div v-if="imageError" class="image-error-message">
                    <i class="bi bi-exclamation-triangle"></i>
                    Failed to load image
                  </div>
                </div>

                <div class="form-floating">
                  <textarea id="mcqText" v-model="translatedQuestion.question" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
                  <label for="mcqText" class="form-label">Translated Question</label>
                </div>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
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
                      <input type="file" class="form-control" :id="'optionImage' + (index + 1)">
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center mt-3">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isSaving ? 'Saving...' : 'Save' }}
                </button>
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

                <!-- Original Question Image (only if available and no new image selected) -->
                <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
                  <div v-if="imageLoading" class="image-loading-overlay">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading image...</span>
                    </div>
                  </div>
                  <img
                    v-if="questionImage.presigned_url || questionImage.image_url"
                    :src="questionImage.presigned_url || questionImage.image_url"
                    class="question-image"
                    alt="Question Image"
                    @load="imageLoading = false"
                    @error="handleImageError"
                  />
                  <div v-if="imageError" class="image-error-message">
                    <i class="bi bi-exclamation-triangle"></i>
                    Failed to load image
                  </div>
                </div>

                <div class="form-floating">
                  <textarea id="fillInTheBlankQuestion" v-model="translatedQuestion.question" class="form-control" rows="3"
                            placeholder="Type your question here, use '_____' for blanks." @input="autoResize" required></textarea>
                  <label for="fillInTheBlankQuestion" class="form-label">Translated Question</label>
                </div>
                <div class="input-group input-group-sm mb-3">
                  <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                </div>
                <div class="col text-end">
                  <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="insertBlank">Insert Blank</button>
                </div>
              </div>

              <div class="text-center">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isSaving ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>

    <!-- Loading overlay shown during submission -->
    <div v-if="isFullscreenLoading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Saving translation...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
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

// Component name (for linter)
defineOptions({
  name: 'AddTranslation'
})

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

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

// Add interfaces for image handling
interface QuestionImage {
  id: number;
  presigned_url?: string;
  image_url?: string;
}

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
const questionImage = ref<QuestionImage | null>(null)
const imageLoading = ref(false)
const imageError = ref(false)

// Track if a new image is selected
const newImageSelected = ref(false)

// Define interfaces for API data
interface QuestionTextData {
  question_id: number;
  instruction_medium_id: number;
  image_id: number | null;
  question_text: string;
  is_verified: boolean;
}

interface McqOption {
  option_text: string;
}

// Add loading states
const isSaving = ref(false)
const isFullscreenLoading = ref(false)

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

// Add image handling methods
function handleImageError() {
  imageLoading.value = false;
  imageError.value = true;
  console.error('Failed to load question image');
}

// Simplified function to just track if a new image is selected
function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Simply flag that a new image is selected
    newImageSelected.value = true;
  } else {
    // Reset to show original image if file selection is canceled
    newImageSelected.value = false;
  }
}

async function saveTranslation() {
  try {
    if (!questionId.value) {
      toastStore.showToast({
        title: 'Error',
        message: 'Question ID is missing',
        type: 'error'
      });
      return;
    }

    // Enable both loading indicators
    isSaving.value = true;
    isFullscreenLoading.value = true;

    // Get medium ID from localStorage (this is the target language ID)
    const targetMediumId = questionBankData.value.mediumId;

    // Create the translated question text data with the original image ID as default
    const translatedQuestionData: QuestionTextData = {
      question_id: questionId.value,                      // Link to the original question
      instruction_medium_id: parseInt(targetMediumId.toString()), // Target language medium ID
      image_id: questionImage.value?.id || null,          // Default to original image ID if no new image
      question_text: translatedQuestion.value.question,   // The TRANSLATED question text
      is_verified: false
    };

    // Handle file upload for the question image only if a new image is selected
    const questionImageInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
    if (newImageSelected.value && questionImageInput && questionImageInput.files && questionImageInput.files.length > 0) {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', questionImageInput.files[0]);

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
          original_filename: uploadedImageDetails.original_filename || questionImageInput.files[0].name,
          file_size: uploadedImageDetails.file_size || questionImageInput.files[0].size,
          file_type: uploadedImageDetails.file_type || questionImageInput.files[0].type,
          width: uploadedImageDetails.width,
          height: uploadedImageDetails.height
        };

        const imageResponse = await axiosInstance.post('/images', imageCreateRequest);

        // Update the image ID in the translated question data
        translatedQuestionData.image_id = imageResponse.data.id;

        console.log('New image uploaded and associated with translation');
      } catch (error: unknown) {
        console.error('Error uploading new image:', error);

        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.status === 400 && axiosError.response?.data?.message) {
          isSaving.value = false;
          isFullscreenLoading.value = false;

          toastStore.showToast({
            title: 'Image Upload Error',
            message: axiosError.response.data.message,
            type: 'error'
          });
          return;
        }

        // If image upload fails, we'll use the original image if available
        if (!questionImage.value?.id) {
          // If there's no original image either, set to null
          translatedQuestionData.image_id = null;
        }
      }
    }

    // Create the translated question text in the target language
    const translationResponse = await axiosInstance.post('/question-texts', translatedQuestionData);

    // If this is an MCQ question, handle the translated options
    if ((questionType.value === 'MCQ' || questionType.value === 'Multiple Choice') &&
        translatedOptions.value.length > 0) {

      // Get the new question text ID for the translation
      const translatedQuestionTextId = translationResponse.data.id;

      // Create translated MCQ options
      for (let i = 0; i < translatedOptions.value.length; i++) {
        if (translatedOptions.value[i].trim() !== '') {
          // Determine if this is the correct option based on the original question
          const isCorrect = originalOptions.value[i] !== undefined &&
            await isCorrectOption(questionId.value, originalOptions.value[i]);

          // Create the translated option
          await axiosInstance.post('/mcq-options', {
            question_text_id: translatedQuestionTextId,
            option_text: translatedOptions.value[i], // The TRANSLATED option text
            is_correct: isCorrect
          });
        }
      }
    }

    // Navigate back to translation pending page with success query param
    router.push({
      name: 'translationPending',
      query: {
        success: 'true',
        message: 'Translation added successfully'
      }
    });
  } catch (error: unknown) {
    console.error('Error saving translation:', error);

    // Show error toast using toast store
    const axiosError = error as AxiosErrorResponse;
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message || 'Failed to save translation',
      type: 'error'
    });
  } finally {
    // Disable both loading indicators
    isSaving.value = false;
    isFullscreenLoading.value = false;
  }
}

// Helper function to determine if an option is the correct one
async function isCorrectOption(questionId: number, optionText: string): Promise<boolean> {
  try {
    // Get all options for the question
    const response = await axiosInstance.get(`/question-options?question_id=${questionId}`);

    // Find the matching option and check if it's correct
    if (response.data && Array.isArray(response.data)) {
      const matchingOption = response.data.find(
        (opt: { option_text: string; is_correct: boolean }) => opt.option_text === optionText
      );

      return matchingOption ? matchingOption.is_correct : false;
    }

    return false;
  } catch (error) {
    console.error('Error checking correct option:', error);
    return false;
  }
}

// Update loadQuestionData to fetch and handle images
async function loadQuestionData() {
  try {
    // Get question ID from route params or query
    const id = route.params.id || route.query.id;
    if (!id) {
      console.error('Question ID not provided');
      toastStore.showToast({
        title: 'Error',
        message: 'Question ID not provided',
        type: 'error'
      });
      router.push({ name: 'translationPending' });
      return;
    }

    questionId.value = Number(id);

    // Fetch question data from API
    const response = await axiosInstance.get(`/questions/${questionId.value}`);
    const questionData = response.data;

    // Set question type
    questionType.value = questionData.question_type.type_name;

    // Set original question text
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      originalQuestion.value = questionData.question_texts[0].question_text;
      translatedQuestion.value.type = questionType.value;

      // Get image if available
      if (questionData.question_texts[0].image_id && questionData.question_texts[0].image) {
        imageLoading.value = true;
        questionImage.value = {
          id: questionData.question_texts[0].image_id,
          presigned_url: questionData.question_texts[0].image.presigned_url,
          image_url: questionData.question_texts[0].image.image_url
        };
      }
    }

    // Set original options for MCQ
    if ((questionType.value === 'MCQ' || questionType.value === 'Multiple Choice') &&
        questionData.question_texts[0].mcq_options) {
      originalOptions.value = questionData.question_texts[0].mcq_options.map((opt: McqOption) => opt.option_text);
      // Initialize translated options array with the same length
      translatedOptions.value = Array(originalOptions.value.length).fill('');
    }

    // Initialize textareas
    setTimeout(() => {
      document.querySelectorAll('textarea').forEach(textarea => {
        autoResize({ target: textarea } as unknown as Event);
      });
    }, 0);
  } catch (error: unknown) {
    console.error('Error loading question data:', error);

    const axiosError = error as AxiosErrorResponse;
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message || 'Failed to load question data',
      type: 'error'
    });

    // Redirect back if we couldn't load the question
    router.push({ name: 'translationPending' });
  }
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank');
  if (storedData) {
    questionBankData.value = JSON.parse(storedData);
    loadQuestionData();
  } else {
    // Redirect to question bank selection if no data
    toastStore.showToast({
      title: 'Error',
      message: 'Question bank data not found',
      type: 'error'
    });
    router.push({ name: 'questionBank' });
  }

  // Check for success message in route query params (if coming back from another page)
  if (route.query.success === 'true') {
    const message = route.query.message as string || 'Operation completed successfully';

    toastStore.showToast({
      title: 'Success',
      message: message,
      type: 'success'
    });

    // Remove query parameters without page reload
    router.replace({ query: {} }).catch(() => {
      // Ignore navigation errors
    });
  }
});

// Clean up resources when component is unmounted
onUnmounted(() => {
  // No need for cleanup since we're not using object URLs anymore
});
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

/* Question image styling */
.question-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 200px;
  background-color: #f8f9fa;
}

.question-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.image-error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-error-message i {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.7);
  z-index: 5;
}

@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container {
    min-height: 150px;
  }
}
</style>
