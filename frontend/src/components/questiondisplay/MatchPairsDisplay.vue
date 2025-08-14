<template>
  <div class="match-pairs-container mt-3">
    <!-- Debug info if no data -->
    <div v-if="!leftItems || !rightItems || (leftItems.length === 0 && rightItems.length === 0)" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      No matching pairs data available for this question.
      <div v-if="showDebugInfo" class="small mt-2">
        <strong>Question ID:</strong> {{ questionId }}<br>
        <strong>Has Left Items:</strong> {{ leftItems ? 'Yes (' + leftItems.length + ' items)' : 'No' }}<br>
        <strong>Has Right Items:</strong> {{ rightItems ? 'Yes (' + rightItems.length + ' items)' : 'No' }}
      </div>
    </div>

    <!-- Match Pairs Display -->
    <div v-else>
      <div v-for="(_, idx) in maxPairsLength" :key="'pair-'+idx" class="match-pair-row mb-3">
        <!-- Left Side Item -->
        <div class="match-pair-item">
          <div class="d-flex align-items-center">
            <div class="option-letter me-2">
              {{ String.fromCharCode(65 + idx) }}
            </div>
            <div class="option-text flex-grow-1">
              <span v-if="leftItems[idx]">
                <span v-if="shouldTruncateText(leftItems[idx]) && !isExpanded(`lhs-${idx}`)">
                  {{ truncateText(leftItems[idx], textMaxLength) }}
                  <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(`lhs-${idx}`)">
                    <i class="bi bi-chevron-down"></i>
                  </button>
                </span>
                <span v-else>
                  {{ leftItems[idx] }}
                  <button v-if="shouldTruncateText(leftItems[idx])" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(`lhs-${idx}`)">
                    <i class="bi bi-chevron-up"></i>
                  </button>
                </span>
              </span>
              <span v-else>&nbsp;</span>
            </div>
          </div>

          <!-- Left side image if available -->
          <div v-if="leftImages && leftImages[idx]" class="pair-image-container mt-2">
            <div v-if="leftImageLoading[idx]" class="image-loading-overlay">
              <output
 class=
"spinner-border spinner-border-sm text-primary"
>
                <span class="visually-hidden">Loading image...</span>
              </output>
            </div>
            <img
              :src="leftImages[idx]"
              class="pair-image"
              alt="Left Item"
              @load="handleLeftImageLoad(idx)"
              @error="handleLeftImageError(idx)"
              :data-side="'left'"
              :data-index="idx"
            />
            <div v-if="leftImageError[idx]" class="image-error-message">
              <i class="bi bi-exclamation-triangle"></i>
              <span>Failed to load image</span>
            </div>
            <div v-if="showPreviewIndicator && !leftImageError[idx] && !leftImageLoading[idx]" class="preview-indicator">
              <i class="bi bi-image"></i>
            </div>
          </div>
        </div>

        <!-- Arrow Between -->
        <div class="match-pair-arrow">
          <div class="match-arrow-circle">
            <i class="bi bi-arrows"></i>
          </div>
        </div>

        <!-- Right Side Item -->
        <div class="match-pair-item">
          <div class="d-flex align-items-center">
            <div class="option-text flex-grow-1">
              <span v-if="rightItems[idx]">
                <span v-if="shouldTruncateText(rightItems[idx]) && !isExpanded(`rhs-${idx}`)">
                  {{ truncateText(rightItems[idx], textMaxLength) }}
                  <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(`rhs-${idx}`)">
                    <i class="bi bi-chevron-down"></i>
                  </button>
                </span>
                <span v-else>
                  {{ rightItems[idx] }}
                  <button v-if="shouldTruncateText(rightItems[idx])" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(`rhs-${idx}`)">
                    <i class="bi bi-chevron-up"></i>
                  </button>
                </span>
              </span>
              <span v-else>&nbsp;</span>
            </div>
          </div>

          <!-- Right side image if available -->
          <div v-if="rightImages && rightImages[idx]" class="pair-image-container mt-2">
            <div v-if="rightImageLoading[idx]" class="image-loading-overlay">
              <output
 class=
"spinner-border spinner-border-sm text-primary"
>
                <span class="visually-hidden">Loading image...</span>
              </output>
            </div>
            <img
              :src="rightImages[idx]"
              class="pair-image"
              alt="Right Item"
              @load="handleRightImageLoad(idx)"
              @error="handleRightImageError(idx)"
              :data-side="'right'"
              :data-index="idx"
            />
            <div v-if="rightImageError[idx]" class="image-error-message">
              <i class="bi bi-exclamation-triangle"></i>
              <span>Failed to load image</span>
            </div>
            <div v-if="showPreviewIndicator && !rightImageError[idx] && !rightImageLoading[idx]" class="preview-indicator">
              <i class="bi bi-image"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

// Define the props for this component
const props = defineProps<{
  leftItems?: (string | null)[];  // Updated to allow null values
  rightItems?: (string | null)[];  // Updated to allow null values
  questionId?: number;  // Unique ID for the question (for expansion tracking)
  leftImages?: (string | null)[];  // Updated to allow null values
  rightImages?: (string | null)[];  // Updated to allow null values
  showDebugInfo?: boolean;  // Whether to show debugging information
  showPreviewIndicator?: boolean;  // Whether to show a visual indicator for images
  maxTextLength?: number;  // Maximum text length before truncation
}>();

// Set default values for optional props
const leftItems = computed(() => props.leftItems ?? []);
const rightItems = computed(() => props.rightItems ?? []);
const showDebugInfo = computed(() => props.showDebugInfo ?? false);
const showPreviewIndicator = computed(() => props.showPreviewIndicator ?? false);
const textMaxLength = computed(() => props.maxTextLength ?? 80);

// Compute the maximum length of pairs to display
const maxPairsLength = computed(() => Math.max(leftItems.value.length, rightItems.value.length));

// Set up reactive data
const expandedSections = ref<Set<string>>(new Set());

// Set up image loading states for both left and right images
const leftImageLoading = ref<boolean[]>([]);
const leftImageError = ref<boolean[]>([]);
const rightImageLoading = ref<boolean[]>([]);
const rightImageError = ref<boolean[]>([]);

// Initialize image states
onMounted(() => {
  initializeImageStates();
});

// Watch for changes in images and reinitialize states
watch(() => [props.leftImages, props.rightImages], () => {
  initializeImageStates();
}, { deep: true });

// Function to initialize image states
function initializeImageStates() {
  console.log('Initializing match pairs image states for question:', props.questionId);

  if (props.leftImages && props.leftImages.length > 0) {
    console.log('Left images available:', props.leftImages.length);
    leftImageLoading.value = props.leftImages.map((url, idx) => {
      const hasUrl = !!url;
      console.log(`Left image ${idx} has URL:`, hasUrl);
      return hasUrl;
    });
    leftImageError.value = props.leftImages.map(() => false);
  } else {
    console.log('No left images available');
    leftImageLoading.value = [];
    leftImageError.value = [];
  }

  if (props.rightImages && props.rightImages.length > 0) {
    console.log('Right images available:', props.rightImages.length);
    rightImageLoading.value = props.rightImages.map((url, idx) => {
      const hasUrl = !!url;
      console.log(`Right image ${idx} has URL:`, hasUrl);
      return hasUrl;
    });
    rightImageError.value = props.rightImages.map(() => false);
  } else {
    console.log('No right images available');
    rightImageLoading.value = [];
    rightImageError.value = [];
  }
}

// Methods for text truncation and expansion
function shouldTruncateText(text: string): boolean {
  return text.length > textMaxLength.value;
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

// Methods for handling left images
function handleLeftImageLoad(index: number): void {
  leftImageLoading.value[index] = false;
  leftImageError.value[index] = false;

  // Log successful load
  console.log(`Left image ${index} loaded successfully for question:`, props.questionId);

  // Check image dimensions
  const imgElement = document.querySelector(`.pair-image[data-side="left"][data-index="${index}"]`) as HTMLImageElement;
  if (imgElement && imgElement.naturalWidth === 0) {
    console.warn(`Left image ${index} appears to have loaded but has zero width for question:`, props.questionId);
    handleLeftImageError(index);
  }
}

function handleLeftImageError(index: number): void {
  leftImageLoading.value[index] = false;
  leftImageError.value[index] = true;

  // Detailed error logging
  console.error(`Failed to load left image at index ${index} for question:`, props.questionId);
  if (props.leftImages?.[index]) {
    console.error(`Left image URL that failed:`, props.leftImages[index]);

    // Check if URL is well-formed
    try {
      new URL(props.leftImages[index] as string);
      console.log('URL appears to be well-formed');
    } catch (e) {
      console.error('URL is malformed:', e);
    }
  }
}

// Methods for handling right images
function handleRightImageLoad(index: number): void {
  rightImageLoading.value[index] = false;
  rightImageError.value[index] = false;

  // Log successful load
  console.log(`Right image ${index} loaded successfully for question:`, props.questionId);

  // Check image dimensions
  const imgElement = document.querySelector(`.pair-image[data-side="right"][data-index="${index}"]`) as HTMLImageElement;
  if (imgElement && imgElement.naturalWidth === 0) {
    console.warn(`Right image ${index} appears to have loaded but has zero width for question:`, props.questionId);
    handleRightImageError(index);
  }
}

function handleRightImageError(index: number): void {
  rightImageLoading.value[index] = false;
  rightImageError.value[index] = true;

  // Detailed error logging
  console.error(`Failed to load right image at index ${index} for question:`, props.questionId);
  if (props.rightImages?.[index]) {
    console.error(`Right image URL that failed:`, props.rightImages[index]);

    // Check if URL is well-formed
    try {
      new URL(props.rightImages[index] as string);
      console.log('URL appears to be well-formed');
    } catch (e) {
      console.error('URL is malformed:', e);
    }
  }
}
</script>

<style scoped>
/* Match Pairs Styling */
.match-pairs-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-pair-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: center;
}

.match-pair-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  min-height: 48px;
  display: flex;
  flex-direction: column;
}

.match-pair-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
}

.match-arrow-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #dee2e6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.option-letter {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  color: #495057;
  text-align: center;
  font-weight: 600;
  line-height: 22px;
  font-size: 0.85rem;
}

.option-text {
  line-height: 1.4;
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

/* Image styling */
.pair-image-container {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f8f9fa;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pair-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  border-radius: 4px;
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
  border-radius: 6px;
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
  z-index: 6;
}

.image-error-message i {
  margin-right: 5px;
  color: #dc3545;
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
  .match-pair-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .match-pair-arrow {
    display: flex;
    justify-content: center;
    margin: 5px 0;
    transform: rotate(90deg);
  }

  .option-text {
    font-size: 0.95rem;
  }

  .btn-link {
    font-size: 0.8rem;
  }

  .pair-image {
    max-height: 120px;
  }

  .pair-image-container {
    min-height: 80px;
  }
}
</style>
