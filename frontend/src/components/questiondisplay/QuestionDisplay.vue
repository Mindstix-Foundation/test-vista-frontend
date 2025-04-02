<template>
  <div class="question-display-container">
    <!-- Question Text -->
    <div class="question-text mb-3">
      <p v-if="questionNumber" class="mb-2">
        <strong>Q{{ questionNumber }}:</strong> &nbsp;
        <span v-if="shouldTruncateQuestion(question) && !isExpanded('question')">
          {{ truncateText(question, questionTextMaxLength) }}
          <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand('question')">
            <i class="bi bi-chevron-down"></i> Show More
          </button>
        </span>
        <span v-else>
          {{ question }}
          <button v-if="shouldTruncateQuestion(question)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand('question')">
            <i class="bi bi-chevron-up"></i> Show Less
          </button>
        </span>
      </p>
      <p v-else class="mb-2">
        <strong>Q:</strong> &nbsp; {{ question }}
      </p>
    </div>

    <!-- Image section - completely refactored to ensure the image always displays -->
    <div v-if="imageUrl" class="question-image-container mb-3">
      <!-- Loading overlay -->
      <div v-if="imageLoadingState" class="image-loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading image...</span>
        </div>
      </div>

      <!-- The actual image - always render when imageUrl exists -->
      <img
        :src="imageUrl"
        class="question-image"
        alt="Question Image"
        @load="handleImageLoad"
        @error="handleImageError"
        ref="questionImage"
      />

      <!-- Error message -->
      <div v-if="imageError" class="image-error-message">
        <i class="bi bi-exclamation-triangle"></i>
        Failed to load image
      </div>

      <!-- Preview indicator -->
      <div v-if="showPreviewIndicator && !imageError && !imageLoadingState" class="preview-indicator">
        <i class="bi bi-image"></i>
      </div>
    </div>

    <!-- Fallback for no image -->
    <div v-else-if="imageLoading" class="question-image-loading-container mb-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading image...</span>
      </div>
    </div>

    <!-- MCQ Options -->
    <McqOptionsDisplay
      v-if="isMcqQuestion && options && options.length > 0"
      :options="options"
      :correctOptionIndex="correctOptionIndex"
      :questionId="questionId"
      :optionImages="optionImages"
      :highlightCorrect="highlightCorrect"
      :layout="optionLayout"
      :showPreviewIndicator="showPreviewIndicator"
      :maxTextLength="optionTextMaxLength"
    />

    <!-- Match Pairs -->
    <MatchPairsDisplay
      v-else-if="isMatchPairsQuestion && (lhs || rhs)"
      :leftItems="lhs"
      :rightItems="rhs"
      :questionId="questionId"
      :leftImages="lhsImages"
      :rightImages="rhsImages"
      :showDebugInfo="showDebugInfo"
      :showPreviewIndicator="showPreviewIndicator"
      :maxTextLength="optionTextMaxLength"
    />

    <!-- Fill in the Blanks -->
    <div v-else-if="isFillBlanksQuestion && correctAnswer" class="fill-blanks-container mt-3">
      <div class="answer-section p-3 border-top">
        <div class="d-flex">
          <div class="answer-label fw-bold me-2">Answer:</div>
          <div>{{ correctAnswer }}</div>
        </div>
      </div>
    </div>

    <!-- Descriptive/Other Question Types -->
    <div v-else-if="isDescriptiveQuestion && correctAnswer" class="descriptive-container mt-3">
      <div class="answer-section p-3 border-top">
        <!-- Use specific labels based on question type -->
        <div class="answer-label fw-bold mb-2">
          <span v-if="isOddOneOutQuestion">Odd One Out:</span>
          <span v-else-if="isCompleteCorrelationQuestion">Correlation:</span>
          <span v-else-if="isTrueFalseQuestion">Correct Answer:</span>
          <span v-else>Answer:</span>
        </div>
        <div v-if="shouldTruncateAnswer(correctAnswer) && !isExpanded('answer')">
          {{ truncateText(correctAnswer, answerTextMaxLength) }}
          <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand('answer')">
            <i class="bi bi-chevron-down"></i> Show More
          </button>
        </div>
        <div v-else>
          {{ correctAnswer }}
          <button v-if="shouldTruncateAnswer(correctAnswer)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand('answer')">
            <i class="bi bi-chevron-up"></i> Show Less
          </button>
        </div>

        <!-- Optional display of options for special question types -->
        <div v-if="isOddOneOutQuestion && options && options.length > 0" class="mt-3">
          <div class="small text-muted mb-2">Available Options:</div>
          <ul class="list-unstyled">
            <li v-for="(option, idx) in options" :key="idx" class="mb-1">
              <span class="badge rounded-pill" :class="idx === correctOptionIndex ? 'bg-success' : 'bg-light text-dark'">
                {{ String.fromCharCode(65 + idx) }}
              </span>
              {{ option }}
              <i v-if="idx === correctOptionIndex" class="bi bi-check-circle-fill text-success ms-1"></i>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Question Footer -->
    <footer v-if="showFooter" class="question-footer text-end mt-3">
      <span v-if="topics && topics.length > 0">{{ getTopicsDisplay() }}</span>
      <span v-if="topics && topics.length > 0 && questionType">&nbsp;|&nbsp;</span>
      <span v-if="questionType">{{ questionType }}</span>
      <span v-if="isPreviousExam" class="badge bg-info ms-2">Board Exam</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import McqOptionsDisplay from './McqOptionsDisplay.vue';
import MatchPairsDisplay from './MatchPairsDisplay.vue';

// Interface for topics display
interface Topic {
  topic: string;
  id?: number;
}

// Define the props for this component
const props = defineProps<{
  question: string;
  questionId?: number;
  questionNumber?: number;
  questionType?: string;
  topics?: Topic[];
  options?: string[];
  correctOptionIndex?: number;
  lhs?: (string | null)[];
  rhs?: (string | null)[];
  correctAnswer?: string;
  imageUrl?: string | null;
  optionImages?: string[];
  lhsImages?: (string | null)[];
  rhsImages?: (string | null)[];
  isPreviousExam?: boolean;
  showFooter?: boolean;
  highlightCorrect?: boolean;
  showPreviewIndicator?: boolean;
  showDebugInfo?: boolean;
  optionLayout?: 'grid' | 'list';
  answerTextMaxLength?: number;
  questionTextMaxLength?: number;
  optionTextMaxLength?: number;
}>();

// Set up reactive data
const expandedSections = ref<Set<string>>(new Set());
const imageLoading = ref<boolean>(!!props.imageUrl);
const imageError = ref<boolean>(false);
const imageLoadingState = ref<boolean>(false);
const questionImage = ref<HTMLImageElement | null>(null);

// Computed values with defaults
const showFooter = computed(() => props.showFooter !== undefined ? props.showFooter : true);
const highlightCorrect = computed(() => props.highlightCorrect !== undefined ? props.highlightCorrect : true);
const showPreviewIndicator = computed(() => props.showPreviewIndicator !== undefined ? props.showPreviewIndicator : false);
const showDebugInfo = computed(() => props.showDebugInfo !== undefined ? props.showDebugInfo : false);
const optionLayout = computed(() => props.optionLayout || 'grid');
const questionTextMaxLength = computed(() => props.questionTextMaxLength || 200);
const answerTextMaxLength = computed(() => props.answerTextMaxLength || 200);
const optionTextMaxLength = computed(() => props.optionTextMaxLength || 80);

// Determine question type
const isMcqQuestion = computed(() => {
  // Only include MCQ type, remove Odd One Out and True/False
  return props.questionType?.includes('MCQ') ||
         props.questionType?.includes('Multiple Choice');
});

const isMatchPairsQuestion = computed(() => {
  // Only include Match the Pairs, remove Complete the Correlation
  return props.questionType?.includes('Match the Pairs');
});

const isFillBlanksQuestion = computed(() => {
  return props.questionType?.includes('Fill in the Blanks');
});

// Add specific checks for our special types
const isOddOneOutQuestion = computed(() => {
  return props.questionType?.includes('Odd One Out');
});

const isCompleteCorrelationQuestion = computed(() => {
  return props.questionType?.includes('Complete the Correlation');
});

const isTrueFalseQuestion = computed(() => {
  return props.questionType?.includes('True/False');
});

const isDescriptiveQuestion = computed(() => {
  // Include our special types as descriptive questions
  return (!isMcqQuestion.value &&
         !isMatchPairsQuestion.value &&
         !isFillBlanksQuestion.value &&
         !!props.correctAnswer) ||
         isOddOneOutQuestion.value ||
         isCompleteCorrelationQuestion.value ||
         isTrueFalseQuestion.value;
});

// Initialize image states
onMounted(() => {
  console.log('QuestionDisplay mounted, imageUrl:', props.imageUrl);
  if (props.imageUrl) {
    console.log('Setting up image loading for question:', props.questionId);
    // Don't set imageLoading to true here, as it would hide the image element
    imageLoadingState.value = true;
    imageError.value = false;
  }
});

// Watch for changes in imageUrl and reset states
watch(() => props.imageUrl, (newUrl, oldUrl) => {
  console.log('imageUrl changed for question:', props.questionId, 'newUrl:', newUrl, 'oldUrl:', oldUrl);
  if (newUrl) {
    // Only set the loading overlay state, not the main imageLoading state
    imageLoadingState.value = true;
    imageError.value = false;
  } else {
    imageLoading.value = false;
    imageLoadingState.value = false;
    imageError.value = false;
  }
});

// Add a watch for the question image element
watch(questionImage, (newImage) => {
  if (newImage) {
    console.log('Question image element mounted for question:', props.questionId);
    console.log('Current image src:', newImage.src.substring(0, 100) + '...');

    // Force the image to load if it hasn't already
    if (newImage.complete) {
      console.log('Image already complete on mount, checking naturalWidth');
      if (newImage.naturalWidth === 0) {
        console.warn('Image loaded but has 0 width - may be broken for question:', props.questionId);
        handleImageError();
      } else {
        console.log('Image already loaded successfully on mount for question:', props.questionId,
                    'width:', newImage.naturalWidth, 'height:', newImage.naturalHeight);
        handleImageLoad();
      }
    } else {
      console.log('Image not yet loaded, waiting for load event for question:', props.questionId);
    }
  }
});

// Methods for text truncation and expansion
function shouldTruncateQuestion(text: string): boolean {
  return text.length > questionTextMaxLength.value;
}

function shouldTruncateAnswer(text: string): boolean {
  return text.length > answerTextMaxLength.value;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function isExpanded(sectionKey: string): boolean {
  const key = props.questionId ? `${props.questionId}-${sectionKey}` : sectionKey;
  return expandedSections.value.has(key);
}

function toggleExpand(sectionKey: string): void {
  const key = props.questionId ? `${props.questionId}-${sectionKey}` : sectionKey;
  if (expandedSections.value.has(key)) {
    expandedSections.value.delete(key);
  } else {
    expandedSections.value.add(key);
  }
}

// Methods for handling image load events
function handleImageLoad(): void {
  console.log('Image loaded successfully for question:', props.questionId, 'URL:', props.imageUrl);
  // Clear all loading states when image loads successfully
  imageLoading.value = false;
  imageLoadingState.value = false;
  imageError.value = false;

  // Check if the image actually loaded with dimensions
  if (questionImage.value && questionImage.value.naturalWidth === 0) {
    console.warn('Image appears to have loaded but has zero width for question:', props.questionId);
    handleImageError();
    return;
  }

  console.log('Image loaded with dimensions:',
    questionImage.value?.naturalWidth,
    'x',
    questionImage.value?.naturalHeight,
    'for question:', props.questionId);
}

function handleImageError(): void {
  console.error(`Failed to load image for question ${props.questionId}, URL: ${props.imageUrl}`);
  // In case of error, still clear loading states but set error state
  imageLoading.value = false;
  imageLoadingState.value = false;
  imageError.value = true;

  // Log additional details that might help debug the issue
  if (props.imageUrl) {
    console.error(`Image URL that failed: ${props.imageUrl}`);
    // Try to determine if URL is malformed
    try {
      new URL(props.imageUrl);
      console.log('URL appears to be well-formed');
    } catch (e) {
      console.error('URL is malformed:', e);
    }
  } else {
    console.error('No image URL provided');
  }
}

// Get topics display text
function getTopicsDisplay(): string {
  if (props.topics && props.topics.length > 0) {
    return props.topics.map(topic => topic.topic).join(', ');
  }
  return '';
}
</script>

<style scoped>
/* Question Display Container */
.question-display-container {
  width: 100%;
}

/* Question Text Styling */
.question-text {
  line-height: 1.5;
  white-space: pre-line; /* Preserve line breaks in question text */
}

/* Button Styling */
.btn-link {
  color: #007bff;
  font-size: 0.85rem;
  text-decoration: none;
  padding: 0 0.25rem;
  vertical-align: middle;
}

.btn-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Question Image Styling */
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

/* Question image loading container */
.question-image-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Image loading overlay */
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

/* Fill in the Blanks & Descriptive Question Styling */
.fill-blanks-container,
.descriptive-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.answer-section {
  background-color: rgba(248, 249, 250, 0.5);
  border-top: 1px solid #dee2e6;
}

.answer-label {
  color: #212529;
}

/* Preview indicator */
.preview-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 4px;
  font-size: 0.75rem;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Footer Styling */
.question-footer {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container,
  .question-image-loading-container {
    min-height: 150px;
  }

  .question-footer {
    font-size: 0.8rem;
  }
}
</style>
