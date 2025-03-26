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
      <!-- New Section: Language Selector for available translations -->
      <div class="container mb-4" v-if="availableTranslations.length > 0">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10">
            <div class="card border-light shadow-sm language-selector-container">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 class="m-0">Available Translations</h6>
                <span class="badge bg-primary">{{ availableTranslations.length }} languages</span>
              </div>
              <div class="card-body p-3">
                <div class="d-flex flex-wrap gap-2 translation-buttons">
                  <button
                    v-for="(translation, index) in availableTranslations"
                    :key="translation.id"
                    class="btn btn-sm translation-btn"
                    :class="[selectedTranslationIndex === index ? 'btn-dark active' : 'btn-outline-secondary']"
                    @click="changeTranslation(index)"
                  >
                    <span class="badge bg-light text-dark me-1 language-badge">{{ translation.medium.instruction_medium }}</span>
                    <i class="bi bi-translate"></i>
                  </button>
                </div>
                <div class="mt-3" v-if="selectedTranslationIndex >= 0">
                  <div class="alert alert-light border">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <span class="fw-bold">Currently viewing:</span>
                        <span class="badge bg-info text-dark">{{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}</span> version
                      </div>
                      <div v-if="availableTranslations.length > 1">
                        <small class="text-muted d-none d-md-block">Switch between languages to see different translations</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message when no translations are available -->
      <div class="container mb-4" v-if="availableTranslations.length === 0">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10">
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              No verified translations are available for this question. You are creating the first translation.
            </div>
          </div>
        </div>
      </div>

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
                <label for="questionTranslate" class="form-label">
                  Original Question
                  <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                        class="badge bg-secondary ms-2 language-badge">
                    {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                  </span>
                </label>
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
                  <label for="question" class="form-label">
                    Translated Question
                    <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                  </label>
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
                <label for="mcqTextTranslate" class="form-label">
                  Original Question
                  <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                        class="badge bg-secondary ms-2 language-badge">
                    {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                  </span>
                </label>
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
                  <label for="mcqText" class="form-label">
                    Translated Question
                    <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                  </label>
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
                      <label :for="'option' + (index + 1) + 'Translate'" class="small">
                        <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0" class="medium-badge">
                          {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                        </span>
                        Option {{ String.fromCharCode(65 + index) }}
                      </label>
                    </div>
                    <div class="form-floating">
                      <input type="text" v-model="translatedOptions[index]" class="form-control" :id="'option' + (index + 1)" :placeholder="'Option ' + (index + 1)">
                      <label :for="'option' + (index + 1)">
                        Option {{ String.fromCharCode(65 + index) }}
                        <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                      </label>
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
                <label for="translateFillBlank" class="form-label">
                  Original Question
                  <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                        class="badge bg-secondary ms-2 language-badge">
                    {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                  </span>
                </label>
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
                  <label for="fillInTheBlankQuestion" class="form-label">
                    Translated Question
                    <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                  </label>
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

// Define interfaces for image handling
interface QuestionImage {
  id: number;
  presigned_url?: string;
  image_url?: string;
}

// Update interface for QuestionTranslation to include match_pairs
interface QuestionTranslation {
  id: number;
  question_text: string;
  image_id: number | null;
  image: QuestionImage | null;
  medium: {
    id: number;
    instruction_medium: string;
  };
  mcq_options?: McqOption[];
  match_pairs?: MatchPair[];
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

// New data for multiple translations
const availableTranslations = ref<QuestionTranslation[]>([])
const selectedTranslationIndex = ref<number>(0)
const topicId = ref<number | null>(null)

// Track if a new image is selected
const newImageSelected = ref(false)

// Define interfaces for API data
interface McqOption {
  option_text: string;
}

// Interface for matching pairs
interface MatchPair {
  left_text: string;
  right_text: string;
  left_image_id?: number;
  right_image_id?: number;
}

// Add loading states
const isSaving = ref(false)
const isFullscreenLoading = ref(false)

// Add new state for matching pairs if we need to handle this question type
const originalMatchPairs = ref<Array<{ left_text: string; right_text: string }>>([])
const translatedMatchPairs = ref<Array<{ left_text: string; right_text: string }>>([])

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
    const targetMediumId = parseInt(questionBankData.value.mediumId.toString());

    // Prepare the translation request object for the new API
    const translationRequest: {
      question_text: string;
      image_id?: number;
      instruction_medium_id: number;
      mcq_options?: Array<{
        option_text: string;
        image_id?: number;
        is_correct: boolean;
      }>;
      match_pairs?: Array<{
        left_text: string;
        right_text: string;
        left_image_id?: number;
        right_image_id?: number;
      }>;
    } = {
      question_text: translatedQuestion.value.question,
      instruction_medium_id: targetMediumId,
      // Only include image_id if there's an image (required by the API's consistency check)
      ...(questionImage.value?.id && { image_id: questionImage.value.id })
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

        // Update the image ID in the translation request
        translationRequest.image_id = imageResponse.data.id;

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
          delete translationRequest.image_id;
        }
      }
    }

    // If this is an MCQ question, add the translated options to the request
    if ((questionType.value === 'MCQ' || questionType.value === 'Multiple Choice') &&
        translatedOptions.value.length > 0) {

      // Create translated MCQ options array
      translationRequest.mcq_options = [];

      for (let i = 0; i < translatedOptions.value.length; i++) {
        if (translatedOptions.value[i].trim() !== '') {
          // Determine if this is the correct option based on the original question
          const isCorrect = originalOptions.value[i] !== undefined &&
            await isCorrectOption(questionId.value, originalOptions.value[i]);

          // Handle potential image upload for this option
          const optionImageInput = document.getElementById(`optionImage${i + 1}`) as HTMLInputElement;
          let optionImageId: number | undefined = undefined;

          if (optionImageInput && optionImageInput.files && optionImageInput.files.length > 0) {
            try {
              // Upload the option image
              const formData = new FormData();
              formData.append('file', optionImageInput.files[0]);

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
                original_filename: uploadResponse.data.original_filename || optionImageInput.files[0].name,
                file_size: uploadResponse.data.file_size || optionImageInput.files[0].size,
                file_type: uploadResponse.data.file_type || optionImageInput.files[0].type,
                width: uploadResponse.data.width,
                height: uploadResponse.data.height
              };

              const imageResponse = await axiosInstance.post('/images', imageCreateRequest);
              optionImageId = imageResponse.data.id;

              console.log(`Image for option ${i + 1} uploaded successfully:`, imageResponse.data);
            } catch (error) {
              console.error(`Error uploading image for option ${i + 1}:`, error);
              // Continue without image if upload fails
            }
          }

          // Create the option object with or without image
          const optionObj: { option_text: string; is_correct: boolean; image_id?: number } = {
            option_text: translatedOptions.value[i],
            is_correct: isCorrect
          };

          // Only add image_id if we have one
          if (optionImageId) {
            optionObj.image_id = optionImageId;
          }

          // Add the translated option to the request
          translationRequest.mcq_options.push(optionObj);
        }
      }
    }

    // If this is a Matching question, add the translated pairs to the request
    if (questionType.value === 'Matching' && translatedMatchPairs.value.length > 0) {
      translationRequest.match_pairs = [];

      for (let i = 0; i < translatedMatchPairs.value.length; i++) {
        const pair = translatedMatchPairs.value[i];

        // Only add pairs that have both values filled
        if (pair.left_text.trim() !== '' && pair.right_text.trim() !== '') {
          translationRequest.match_pairs.push({
            left_text: pair.left_text,
            right_text: pair.right_text
          });
        }
      }
    }

    // Use the new translate API endpoint to submit the translation
    const translationResponse = await axiosInstance.post(
      `/questions/${questionId.value}/translate`,
      translationRequest
    );

    console.log('Translation saved successfully:', translationResponse.data);

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

    // Get topic ID (chapter ID) from stored data
    topicId.value = Number(questionBankData.value.chapterId);

    if (!topicId.value) {
      console.error('Topic/Chapter ID not found');
      toastStore.showToast({
        title: 'Error',
        message: 'Topic/Chapter ID not found',
        type: 'error'
      });
      router.push({ name: 'translationPending' });
      return;
    }

    // Fetch question data from new API - including verified texts in all languages
    const response = await axiosInstance.get(`/questions/${questionId.value}/topic/${topicId.value}/verified-texts`);
    const questionData = response.data;

    // Set question type
    questionType.value = questionData.question_type.type_name;

    // Store all available translations
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      availableTranslations.value = questionData.question_texts;

      // Set default translation to the first available one
      if (availableTranslations.value.length > 0) {
        // Set original question from the first available translation
        originalQuestion.value = availableTranslations.value[0].question_text;
        translatedQuestion.value.type = questionType.value;

        // Get image if available
        if (availableTranslations.value[0].image_id && availableTranslations.value[0].image) {
          imageLoading.value = true;
          questionImage.value = {
            id: availableTranslations.value[0].image_id,
            presigned_url: availableTranslations.value[0].image.presigned_url,
            image_url: availableTranslations.value[0].image.image_url
          };
        }

        // Set original options for MCQ
        if ((questionType.value === 'MCQ' || questionType.value === 'Multiple Choice') &&
            availableTranslations.value[0].mcq_options) {
          originalOptions.value = availableTranslations.value[0].mcq_options.map((opt: McqOption) => opt.option_text);
          // Initialize translated options array with the same length
          translatedOptions.value = Array(originalOptions.value.length).fill('');
        }

        // Set original match pairs for Matching Questions
        if (questionType.value === 'Matching' &&
            availableTranslations.value[0].match_pairs &&
            availableTranslations.value[0].match_pairs.length > 0) {

          originalMatchPairs.value = availableTranslations.value[0].match_pairs.map(
            (pair: MatchPair) => ({ left_text: pair.left_text, right_text: pair.right_text })
          );

          // Initialize translatedMatchPairs with empty strings
          translatedMatchPairs.value = Array(originalMatchPairs.value.length).fill({ left_text: '', right_text: '' });
        }
      }
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

// New function to handle changing the selected translation
function changeTranslation(index: number) {
  if (index >= 0 && index < availableTranslations.value.length) {
    selectedTranslationIndex.value = index;
    const selectedTranslation = availableTranslations.value[index];

    // Update the displayed original question
    originalQuestion.value = selectedTranslation.question_text;

    // Update image if available
    if (selectedTranslation.image_id && selectedTranslation.image) {
      imageLoading.value = true;
      imageError.value = false;
      questionImage.value = {
        id: selectedTranslation.image_id,
        presigned_url: selectedTranslation.image.presigned_url,
        image_url: selectedTranslation.image.image_url
      };
    } else {
      questionImage.value = null;
    }

    // Update options for MCQ
    if ((questionType.value === 'MCQ' || questionType.value === 'Multiple Choice') &&
        selectedTranslation.mcq_options) {
      originalOptions.value = selectedTranslation.mcq_options.map((opt: McqOption) => opt.option_text);
    }

    // Update match pairs for Matching questions
    if (questionType.value === 'Matching' &&
        selectedTranslation.match_pairs &&
        selectedTranslation.match_pairs.length > 0) {

      originalMatchPairs.value = selectedTranslation.match_pairs.map(
        (pair: MatchPair) => ({ left_text: pair.left_text, right_text: pair.right_text })
      );
    }

    // Resize textareas after update
    setTimeout(() => {
      document.querySelectorAll('textarea').forEach(textarea => {
        autoResize({ target: textarea } as unknown as Event);
      });
    }, 0);
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

/* New styles for translation language selection */
.language-selector-container {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.language-badge {
  font-size: 0.8rem;
  border-radius: 4px;
  padding: 2px 6px;
}

.translation-btn {
  transition: all 0.2s ease;
}

.translation-btn:hover {
  transform: translateY(-2px);
}

.translation-btn.active {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.medium-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  display: inline-block;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container {
    min-height: 150px;
  }

  /* Mobile styles for translation selector */
  .translation-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .translation-btn {
    margin-bottom: 0.5rem;
  }
}

.form-floating > label {
  left: 0.5rem;
  padding-right: 2.5rem; /* Increase right padding to prevent badge from being cut off */
}

/* Style for labels with badges in floating elements */
.form-floating label .badge {
  font-weight: normal;
  font-size: 70%;
  vertical-align: middle;
}
</style>
