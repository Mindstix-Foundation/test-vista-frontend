<template>
  <div class="mcq-options-container mt-3">
    <div class="row g-2">
      <div v-for="(option, optIndex) in options" :key="optIndex" class="col-12" :class="layout === 'grid' ? 'col-md-6' : ''">
        <div class="d-flex align-items-start mb-2" :class="{
          'text-success': correctOptionIndex === optIndex && highlightCorrect,
          'fw-bold': correctOptionIndex === optIndex && highlightCorrect
        }">
          <div class="option-letter me-2 mt-1" :class="{ 'correct-option': correctOptionIndex === optIndex && highlightCorrect }">
            {{ String.fromCharCode(65 + optIndex) }}
          </div>
          <div class="option-content flex-grow-1">
            <!-- Option Text -->
            <div class="option-text">
              <span v-if="shouldTruncateOption(option) && !isExpanded(`option-${optIndex}`)">
                {{ truncateText(option, optionTextMaxLength) }}
                <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(`option-${optIndex}`)">
                  <i class="bi bi-chevron-down"></i>
                </button>
              </span>
              <span v-else>
                {{ option }}
                <button v-if="shouldTruncateOption(option)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(`option-${optIndex}`)">
                  <i class="bi bi-chevron-up"></i>
                </button>
              </span>
            </div>

            <!-- Option Image if available -->
            <div v-if="optionImages && optionImages[optIndex]" class="option-image-container mt-2">
              <div v-if="optionImageLoading[optIndex]" class="image-loading-overlay">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading image...</span>
                </div>
              </div>
              <img
                :src="optionImages[optIndex]"
                class="option-image"
                alt="Option Image"
                @load="handleImageLoad(optIndex)"
                @error="handleImageError(optIndex)"
              />
              <div v-if="optionImageError[optIndex]" class="image-error-message">
                <i class="bi bi-exclamation-triangle"></i>
                <span>Failed to load image</span>
              </div>
              <div v-if="showPreviewIndicator && !optionImageError[optIndex] && !optionImageLoading[optIndex]" class="preview-indicator">
                <i class="bi bi-image"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

// Define the props for this component
const props = defineProps<{
  options?: string[]; // Array of MCQ options (optional)
  correctOptionIndex?: number; // Index of the correct option (optional)
  questionId?: number; // Unique ID for the question (optional, used for expansion tracking)
  optionImages?: string[] | null; // Array of image URLs for each option (optional)
  highlightCorrect?: boolean; // Whether to highlight the correct option
  layout?: 'grid' | 'list'; // Layout style (grid or list)
  showPreviewIndicator?: boolean; // Whether to show a visual indicator for option images
  maxTextLength?: number; // Maximum text length before truncation
}>();

// Set default values for optional props
const options = computed(() => props.options || []);
const highlightCorrect = computed(() => props.highlightCorrect !== undefined ? props.highlightCorrect : true);
const layout = computed(() => props.layout || 'grid');
const showPreviewIndicator = computed(() => props.showPreviewIndicator !== undefined ? props.showPreviewIndicator : false);

// Set up reactive data
const expandedSections = ref<Set<string>>(new Set());
const optionTextMaxLength = computed(() => props.maxTextLength || 80); // Characters before truncating for options

// Set up image loading states
const optionImageLoading = ref<boolean[]>([]);
const optionImageError = ref<boolean[]>([]);

// Initialize image loading states
onMounted(() => {
  initializeImageStates();
});

// Watch for changes in optionImages and reinitialize states
watch(() => props.optionImages, () => {
  initializeImageStates();
}, { deep: true });

// Function to initialize image states
function initializeImageStates() {
  if (props.optionImages) {
    // Initialize loading state for each option image
    optionImageLoading.value = props.optionImages.map(url => !!url);
    optionImageError.value = props.optionImages.map(() => false);
  } else {
    optionImageLoading.value = [];
    optionImageError.value = [];
  }
}

// Methods for text truncation and expansion
function shouldTruncateOption(text: string): boolean {
  return text.length > optionTextMaxLength.value;
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

// Methods for handling images
function handleImageLoad(optionIndex: number): void {
  optionImageLoading.value[optionIndex] = false;
  optionImageError.value[optionIndex] = false;
}

function handleImageError(optionIndex: number): void {
  optionImageLoading.value[optionIndex] = false;
  optionImageError.value[optionIndex] = true;
  console.error(`Failed to load image for option ${optionIndex}`);
}
</script>

<style scoped>
/* MCQ Options Styling */
.option-letter {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #212529;
  text-align: center;
  font-weight: 600;
  line-height: 22px;
  font-size: 0.85rem;
}

.option-text {
  line-height: 1.4;
}

.option-content {
  display: flex;
  flex-direction: column;
}

.correct-option {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

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

/* Option Image Styling */
.option-image-container {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f8f9fa;
  min-height: 100px;
}

.option-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
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

.image-error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #dc3545;
  text-align: center;
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 4px;
}

.image-error-message i {
  margin-right: 5px;
}

/* Preview indicator */
.preview-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .option-text {
    font-size: 0.95rem;
  }

  .btn-link {
    font-size: 0.8rem;
  }

  .option-image {
    max-height: 120px;
  }

  .option-image-container {
    min-height: 80px;
  }
}
</style>
