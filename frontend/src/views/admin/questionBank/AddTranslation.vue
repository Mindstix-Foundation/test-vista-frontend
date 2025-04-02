<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'translationPending' }" aria-label="Close"></router-link>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10">
          <p class="text-muted text-start fs-5 m-0">
            <span class="col-12 col-md-auto">{{ questionBankData.boardName }} |</span>
            <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0">
            Standard {{ questionBankData.standardName }}
            <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} : {{ questionBankData.chapterName }}</span>
          </h4>
          <h4 class="text-left fw-bolder text-uppercase mb-2" id="pageHeader">Add Translation</h4>
        </div>
      </div>
      <hr>
    </div>

    <div id="questionsSection" class="container">
      <!-- Loading spinner in content area -->
      <div v-if="isLoading" class="row justify-content-center my-5">
        <div class="col-12 col-sm-10 text-center">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading translation data...</span>
          </div>
          <p class="mt-3 text-primary">Loading translation data...</p>
        </div>
      </div>

      <div v-else>
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
                      :class="[
                        selectedTranslationIndex === index ? 'btn-dark active' :
                        translation.translation_status === 'original' ? 'btn-outline-success' : 'btn-outline-info'
                      ]"
                      @click="changeTranslation(index)"
                    >
                      <span class="badge bg-light text-dark me-1 language-badge">{{ translation.medium.instruction_medium }}</span>
                      <i class="bi bi-translate"></i>
                      <span
                        v-if="translation.translation_status"
                        class="badge"
                        :class="translation.translation_status === 'original' ? 'bg-success ms-1' : 'bg-info ms-1'"
                      >
                        {{ translation.translation_status === 'original' ? 'Original' : 'Translated' }}
                      </span>
                    </button>
                  </div>
                  <div class="mt-3" v-if="selectedTranslationIndex >= 0">
                    <div class="alert alert-light border">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <span class="fw-bold">Currently viewing:</span>
                          <span class="badge bg-info text-dark">{{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}</span> version
                          <span
                            v-if="availableTranslations[selectedTranslationIndex].translation_status"
                            class="badge ms-2"
                            :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success' : 'bg-info'"
                          >
                            {{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }}
                          </span>
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
                <strong>No translations available.</strong> You are creating the first translation for this question.
                <span class="d-block mt-2 small">
                  Since there are no existing translations, your translation will become the first version in
                  <span class="badge bg-primary">{{ questionBankData.mediumName }}</span> language.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="container" id="descriptiveQuestion" v-show="questionType === 'True or False' ||
                                                 questionType === 'Give Scientific Reasons' ||
                                                 questionType === 'Short Answer Question' ||
                                                 questionType === 'Complete and Identify Reaction' ||
                                                 questionType === 'Short Note' ||
                                                 questionType === 'Odd One Out' ||
                                                 questionType === 'Complete the Correlation' ||
                                                 questionType === 'One-Word Answer'">
          <div class="row justify-content-center">
            <div class="col col-12 col-sm-10 ">
              <form @submit.prevent="saveTranslation">
                <div class="mb-3">
                  <label for="questionTranslate" class="form-label">
                    Original Question
                    <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                          class="badge ms-2"
                          :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
                      {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                      ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
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

        <div class="container" id="mcqQuestion" v-show="questionType === 'Multiple Choice Question (MCQ)'">
          <div class="row justify-content-center">
            <div class="col col-12 col-sm-10 ">
              <form @submit.prevent="saveTranslation">
                <div class="mb-3">
                  <label for="mcqTextTranslate" class="form-label">
                    Original Question
                    <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                          class="badge ms-2"
                          :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
                      {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                      ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
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
                    <div class="col-12 mb-2">
                      <div class="d-flex justify-content-between">
                        <h6 class="text-muted" v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0">
                          {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }} Options (Original)
                        </h6>
                        <h6 class="text-muted" v-else>
                          Original Options
                        </h6>
                        <h6 class="text-muted">{{ questionBankData.mediumName }} Options (Translation)</h6>
                      </div>
                      <hr class="mt-0">
                    </div>
                    <div class="col-md-6" v-for="(option, index) in originalOptions" :key="index">
                      <!-- Original Option with Image (Left Side) -->
                      <div class="card mb-2 border-light">
                        <div class="card-body p-2">
                          <div class="form-floating mb-2">
                            <input type="text" :value="option" readonly class="form-control" :id="'option' + (index + 1) + 'Translate'">
                            <label :for="'option' + (index + 1) + 'Translate'" class="small">
                              Option {{ String.fromCharCode(65 + index) }}
                              <span v-if="originalOptionIsCorrect[index]" class="badge bg-success ms-1">Correct</span>
                            </label>
                          </div>

                          <!-- Original Option Image -->
                          <div v-if="originalOptionImages && originalOptionImages[index]" class="option-image-container mb-2">
                            <div v-if="optionImageLoading[index]" class="image-loading-overlay">
                              <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="visually-hidden">Loading image...</span>
                              </div>
                            </div>
                            <img
                              :src="originalOptionImages[index]"
                              class="option-image"
                              alt="Option Image"
                              @load="handleOptionImageLoad(index)"
                              @error="handleOptionImageError(index)"
                            />
                            <div v-if="optionImageError[index]" class="image-error-message small">
                              <i class="bi bi-exclamation-triangle"></i>
                              Failed to load image
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Translated Option with Image Upload (Right Side) -->
                      <div class="form-floating mb-2">
                        <input type="text" v-model="translatedOptions[index]" class="form-control" :id="'option' + (index + 1)" :placeholder="'Option ' + (index + 1)">
                        <label :for="'option' + (index + 1)">
                          Option {{ String.fromCharCode(65 + index) }}
                          <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                          <span v-if="originalOptionIsCorrect[index]" class="badge bg-success ms-1">Correct</span>
                        </label>
                      </div>
                      <!-- Only enable image upload if there's an original image for this option -->
                      <div class="input-group input-group-sm mb-3" v-if="originalOptionImages && originalOptionImages[index]">
                        <input type="file" class="form-control" :id="'optionImage' + (index + 1)" accept="image/*" @change="e => handleOptionImageChange(e, index)">
                        <button v-if="optionImagePreviews[index]" class="btn btn-outline-secondary" type="button" @click="clearOptionImage(index)">
                          <i class="bi bi-x-circle"></i>
                        </button>
                      </div>
                      <!-- Disabled image upload with explanation if original has no image -->
                      <div class="input-group input-group-sm mb-3" v-else>
                        <input type="file" class="form-control" disabled title="Original option does not have an image. You can only upload images for options that have images in the original question.">
                        <span class="input-group-text text-muted small">
                          <i class="bi bi-info-circle me-1"></i>
                          No original image
                        </span>
                      </div>

                      <!-- Preview of selected image for translation -->
                      <div v-if="optionImagePreviews[index]" class="option-image-preview-container mb-3">
                        <img :src="optionImagePreviews[index]" class="option-image-preview" alt="Option Image Preview">
                        <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1" @click="clearOptionImage(index)">
                          <i class="bi bi-x"></i>
                        </button>
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
                          class="badge ms-2"
                          :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
                      {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                      ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
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

        <div class="container" id="matchPairQuestion" v-show="questionType === 'Match the Pairs'">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-10">
              <form @submit.prevent="saveTranslation">
                <!-- Question section -->
                <div class="mb-4">
                  <label for="matchPairTranslate" class="form-label">Original Question</label>
                  <textarea id="matchPairTranslate" v-model="originalQuestion" readonly class="form-control mb-3" @input="autoResize" rows="3"></textarea>
                  
                  <div class="form-floating mb-3">
                    <textarea id="matchPairQuestion" v-model="translatedQuestion.question" class="form-control" rows="3"
                            placeholder="Type your Match the Pairs question here..." @input="autoResize" required></textarea>
                    <label for="matchPairQuestion" class="form-label">
                      Translated Question
                      <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                    </label>
                  </div>
                  
                  <div class="input-group input-group-sm">
                    <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                  </div>
                </div>

                <!-- Match Pairs section -->
                <div class="mb-4">
                  <h6 class="text-muted mb-3">Original Matching Pairs</h6>
                  <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                      <thead class="table-light">
                        <tr>
                          <th scope="col">Left Side</th>
                          <th scope="col">Right Side</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(pair, index) in originalMatchPairs" :key="index">
                          <td>{{ pair.left_text }}</td>
                          <td>{{ pair.right_text }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="row g-4">
                    <div class="col-md-6">
                      <h6 class="fw-bold mb-3">Left Side Translation</h6>
                      <div v-for="(pair, index) in originalMatchPairs" :key="'lhs-'+index" class="mb-3">
                        <div class="form-floating">
                          <input type="text" v-model="translatedMatchPairs[index].left_text" class="form-control" :id="'lhs-' + index" :placeholder="'Left Side ' + (index + 1)" required>
                          <label :for="'lhs-' + index">
                            Left Side {{ index + 1 }}
                            <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <h6 class="fw-bold mb-3">Right Side Translation</h6>
                      <div v-for="(pair, index) in originalMatchPairs" :key="'rhs-'+index" class="mb-3">
                        <div class="form-floating">
                          <input type="text" v-model="translatedMatchPairs[index].right_text" class="form-control" :id="'rhs-' + index" :placeholder="'Right Side ' + (index + 1)" required>
                          <label :for="'rhs-' + index">
                            Right Side {{ index + 1 }}
                            <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
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

// Add loading state to prevent warning from showing before data loads
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
  translation_status: string;
  mcq_options?: McqOption[];
  match_pairs?: MatchPair[];
  answer_text?: string; // For "Fill in the Blanks" and other question types with a specific answer
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

// Update the McqOption interface to include all fields we need
interface McqOption {
  id?: number;
  question_text_id?: number;
  option_text: string;
  is_correct: boolean;
  image_id?: number | null;
  image?: {
    id: number;
    presigned_url?: string;
    image_url?: string;
  } | null;
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

// New states for option images
const originalOptionImages = ref<(string | null)[]>([])
const optionImageLoading = ref<boolean[]>([])
const optionImageError = ref<boolean[]>([])
const optionImagePreviews = ref<(string | null)[]>([])
const originalOptionIsCorrect = ref<boolean[]>([])
const optionImageIds = ref<(number | null)[]>([]) // To store original image IDs

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
      answer_text?: string;
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

    // Handle True/False questions which are treated as MCQs with fixed options
    if (questionType.value === 'True or False') {
      // For True/False questions, get the correct option from the original
      let trueIsCorrect = false;
      let falseIsCorrect = false;

      // Check which option (True or False) is correct in the original
      if (availableTranslations.value.length > 0 &&
          availableTranslations.value[selectedTranslationIndex.value].mcq_options) {

        const selectedTranslation = availableTranslations.value[selectedTranslationIndex.value];
        const options = selectedTranslation.mcq_options as McqOption[];

        for (const option of options) {
          if (option.option_text === 'True' && await isCorrectOption(questionId.value, 'True')) {
            trueIsCorrect = true;
          } else if (option.option_text === 'False' && await isCorrectOption(questionId.value, 'False')) {
            falseIsCorrect = true;
          }
        }
      }

      // Add True and False options to the translation request
      translationRequest.mcq_options = [
        {
          option_text: 'True',
          is_correct: trueIsCorrect
        },
        {
          option_text: 'False',
          is_correct: falseIsCorrect
        }
      ];
    }
    // Handle MCQ & Odd One Out questions
    else if ((questionType.value === 'Multiple Choice Question (MCQ)' || questionType.value === 'Odd One Out') &&
        translatedOptions.value.length > 0) {

      // Create translated MCQ options array
      translationRequest.mcq_options = [];

      for (let i = 0; i < translatedOptions.value.length; i++) {
        if (translatedOptions.value[i].trim() !== '') {
          // Determine if this is the correct option based on the original question
          const isCorrect = originalOptionIsCorrect.value[i];

          // Create the basic option object
          const optionObj: {
            option_text: string;
            is_correct: boolean;
            image_id?: number;
          } = {
            option_text: translatedOptions.value[i],
            is_correct: isCorrect
          };

          // Handle option image - if no new image is selected, use the original image_id if available
          const optionImageInput = document.getElementById(`optionImage${i + 1}`) as HTMLInputElement;
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
              optionObj.image_id = imageResponse.data.id;
            } catch (error) {
              console.error('Error uploading option image:', error);
              // If upload fails, use the original image ID if available
              if (optionImageIds.value[i] !== null) {
                optionObj.image_id = optionImageIds.value[i] as number;
              }
            }
          } else if (originalOptionImages.value[i] && optionImageIds.value[i] !== null) {
            // No new image uploaded but original has an image - use the original image ID
            optionObj.image_id = optionImageIds.value[i] as number;
          }

          // Add the option to the request
          translationRequest.mcq_options.push(optionObj);
        }
      }
    }
    // Handle Match Pairs & Complete Correlation questions
    else if ((questionType.value === 'Match the Pairs' || questionType.value === 'Complete the Correlation') &&
             translatedMatchPairs.value.length > 0) {
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
    // Handle Fill in the Blanks questions
    else if (questionType.value === 'Fill in the Blanks') {
      // For Fill in the Blanks, we need to get the correct answer from the original
      if (availableTranslations.value.length > 0 &&
          availableTranslations.value[selectedTranslationIndex.value].answer_text) {

        // Get the correct answer from API response and add it to the translation
        const correctAnswer = availableTranslations.value[selectedTranslationIndex.value].answer_text;
        if (correctAnswer) {
          translationRequest.answer_text = correctAnswer;
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
    // Set loading state to true
    isLoading.value = true;

    // Record the start time for minimum loading duration
    const minLoadingTime = 800; // Increased to 800ms for smoother experience
    const startTime = Date.now();

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

    // First, we need to fetch the question to get its associated topic ID
    // since we can't just use the chapter ID
    const questionDetailsResponse = await axiosInstance.get(`/questions/${questionId.value}`);
    const questionDetails = questionDetailsResponse.data;

    // Check if question has any question_texts with topics
    if (!questionDetails.question_texts ||
        !questionDetails.question_texts[0] ||
        !questionDetails.question_texts[0].topic ||
        !questionDetails.question_texts[0].topic.id) {
      console.error('Question has no associated topic');
      toastStore.showToast({
        title: 'Error',
        message: 'Question has no associated topic',
        type: 'error'
      });
      router.push({ name: 'translationPending' });
      return;
    }

    // Get the topic ID from the question details
    topicId.value = questionDetails.question_texts[0].topic.id;

    console.log(`Using topic ID: ${topicId.value} for question ID: ${questionId.value}`);

    // Now fetch verified texts using the correct topic ID
    const response = await axiosInstance.get(`/questions/${questionId.value}/topic/${topicId.value}/verified-texts`);
    const questionData = response.data;

    // Set question type
    questionType.value = questionData.question_type.type_name;
    console.log(`Question type: ${questionType.value}`);

    // Store all available translations
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      availableTranslations.value = questionData.question_texts;

      // Find the original translation if it exists
      const originalIndex = availableTranslations.value.findIndex(t => t.translation_status === 'original');
      // Set default translation to the original one if available, otherwise use the first one
      selectedTranslationIndex.value = originalIndex >= 0 ? originalIndex : 0;

      // Set original question from the selected translation
      if (availableTranslations.value.length > 0) {
        const selectedTranslation = availableTranslations.value[selectedTranslationIndex.value];
        originalQuestion.value = selectedTranslation.question_text;
        translatedQuestion.value.type = questionType.value;

        // Get image if available
        if (selectedTranslation.image_id && selectedTranslation.image) {
          imageLoading.value = true;
          questionImage.value = {
            id: selectedTranslation.image_id,
            presigned_url: selectedTranslation.image.presigned_url,
            image_url: selectedTranslation.image.image_url
          };
        }

        // Set original options for MCQ, Odd One Out, and True/False
        if ((questionType.value === 'Multiple Choice Question (MCQ)' ||
             questionType.value === 'Odd One Out' ||
             questionType.value === 'True or False') &&
            selectedTranslation.mcq_options) {
          originalOptions.value = selectedTranslation.mcq_options.map((opt: McqOption) => opt.option_text);
          // Initialize translated options array with the same length
          translatedOptions.value = Array(originalOptions.value.length).fill('');

          // Extract option images and correct options
          originalOptionImages.value = Array(originalOptions.value.length).fill(null);
          optionImageLoading.value = Array(originalOptions.value.length).fill(false);
          optionImageError.value = Array(originalOptions.value.length).fill(false);
          originalOptionIsCorrect.value = Array(originalOptions.value.length).fill(false);
          optionImageIds.value = Array(originalOptions.value.length).fill(null);
          optionImagePreviews.value = Array(originalOptions.value.length).fill(null);

          // Loop through options to extract images and correct status
          selectedTranslation.mcq_options.forEach((option: McqOption, index: number) => {
            // Set correct option
            if (option.is_correct) {
              originalOptionIsCorrect.value[index] = true;
            }

            // Set option image if available
            if (option.image_id && option.image && option.image.presigned_url) {
              originalOptionImages.value[index] = option.image.presigned_url;
              optionImageLoading.value[index] = true;
              optionImageIds.value[index] = option.image_id;
            }
          });
        }

        // Set original match pairs for Match the Pairs or Complete the Correlation
        if ((questionType.value === 'Match the Pairs' ||
             questionType.value === 'Complete the Correlation') &&
            selectedTranslation.match_pairs &&
            selectedTranslation.match_pairs.length > 0) {

          originalMatchPairs.value = selectedTranslation.match_pairs.map(
            (pair: MatchPair) => ({ left_text: pair.left_text, right_text: pair.right_text })
          );

          // Initialize translatedMatchPairs with empty strings for each pair
          translatedMatchPairs.value = Array(originalMatchPairs.value.length)
            .fill(0)
            .map(() => ({ left_text: '', right_text: '' }));
        }
      }
    }

    // Initialize textareas
    setTimeout(() => {
      document.querySelectorAll('textarea').forEach(textarea => {
        autoResize({ target: textarea } as unknown as Event);
      });
    }, 0);

    // Ensure minimum loading time to avoid flickering UI
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
    }

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
  } finally {
    // Clear loading state when done
    isLoading.value = false;
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

    // Update options for MCQ, Odd One Out, and True/False with option images
    if ((questionType.value === 'Multiple Choice Question (MCQ)' ||
         questionType.value === 'Odd One Out' ||
         questionType.value === 'True or False') &&
        selectedTranslation.mcq_options) {

      // Extract option text
      originalOptions.value = selectedTranslation.mcq_options.map((opt: McqOption) => opt.option_text);

      // Reset arrays for option images and correct status
      originalOptionImages.value = Array(originalOptions.value.length).fill(null);
      optionImageLoading.value = Array(originalOptions.value.length).fill(false);
      optionImageError.value = Array(originalOptions.value.length).fill(false);
      originalOptionIsCorrect.value = Array(originalOptions.value.length).fill(false);
      optionImageIds.value = Array(originalOptions.value.length).fill(null);

      // Loop through options to extract images and correct status
      selectedTranslation.mcq_options.forEach((option: McqOption, index: number) => {
        // Set correct option
        if (option.is_correct) {
          originalOptionIsCorrect.value[index] = true;
        }

        // Set option image if available
        if (option.image_id && option.image && option.image.presigned_url) {
          originalOptionImages.value[index] = option.image.presigned_url;
          optionImageLoading.value[index] = true;
          optionImageIds.value[index] = option.image_id;
        }
      });
    }

    // Reset translated options to empty for the new translation
    translatedOptions.value = Array(originalOptions.value.length).fill('');

    // Reset preview images
    optionImagePreviews.value = Array(originalOptions.value.length).fill(null);

    // Resize textareas after update
    setTimeout(() => {
      document.querySelectorAll('textarea').forEach(textarea => {
        autoResize({ target: textarea } as unknown as Event);
      });
    }, 0);
  }
}

// Add missing methods for option image handling
function handleOptionImageLoad(index: number): void {
  if (index >= 0 && index < optionImageLoading.value.length) {
    optionImageLoading.value[index] = false;
  }
  if (index >= 0 && index < optionImageError.value.length) {
    optionImageError.value[index] = false;
  }
}

function handleOptionImageError(index: number): void {
  if (index >= 0 && index < optionImageLoading.value.length) {
    optionImageLoading.value[index] = false;
  }
  if (index >= 0 && index < optionImageError.value.length) {
    optionImageError.value[index] = true;
  }
  console.error(`Failed to load image for option ${index + 1}`);
}

function handleOptionImageChange(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Create URL for preview
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        // Create a new array with the updated preview URL for this index
        const updatedPreviews = [...optionImagePreviews.value];
        updatedPreviews[index] = e.target.result as string;
        optionImagePreviews.value = updatedPreviews;
      }
    };

    reader.readAsDataURL(file);
  } else {
    // If no file selected, remove the preview
    clearOptionImage(index);
  }
}

function clearOptionImage(index: number): void {
  // Create a new array with the cleared preview for this index
  const updatedPreviews = [...optionImagePreviews.value];
  updatedPreviews[index] = null;
  optionImagePreviews.value = updatedPreviews;

  // Reset the file input
  const optionImageInput = document.getElementById(`optionImage${index + 1}`) as HTMLInputElement;
  if (optionImageInput) {
    optionImageInput.value = '';
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
  white-space: nowrap;
}

.translation-btn {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.translation-btn:hover {
  transform: translateY(-2px);
}

.translation-btn.active {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.translation-btn.btn-outline-success {
  border-width: 1.5px;
}

.translation-btn.btn-outline-info {
  border-width: 1.5px;
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

.option-image-container {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f8f9fa;
  min-height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.option-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.option-image-preview-container {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f8f9fa;
  min-height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #ced4da;
}

.option-image-preview {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
</style>
