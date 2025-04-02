<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <a class="btn btn-close" href="#" @click.prevent="handleCloseClick" aria-label="Close"></a>
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
        :initialOptions="initialOptions"
        :initialCorrectOption="initialCorrectOption"
        :initialOptionImages="initialOptionImages"
        :initialOptionImageIds="initialOptionImageIds"
        :useSearchableDropdown="true"
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

// Define interfaces for the data structures
interface McqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  image_id: number | null;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
  image: null | {
    id: number;
    presigned_url: string;
    original_filename?: string;
  };
}

interface MatchPair {
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
  created_at?: string;
  updated_at?: string;
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
const initialOptions = ref<string[]>([])
const initialCorrectOption = ref<number>(-1)
const initialOptionImages = ref<string[]>([])
const initialOptionImageIds = ref<(number | null)[]>([])

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

// Add a ref to store the existing MCQ options and match pairs to avoid unnecessary API calls
const existingMcqOptions = ref<Array<{
  id: number;
  question_text_id: number;
  option_text: string;
  image_id: number | null;
  is_correct: boolean;
}>>([]);

// Add a ref to store the existing match pairs
const existingMatchPairs = ref<Array<{
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
}>>([]);

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
  optionImageIds?: (number | null)[];
  optionImageDeleteFlags?: boolean[];
}) {
  try {
    // Show loading overlay
    isSubmitting.value = true;

    if (!payload.questionId) {
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
        imageId = null;
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    } else if (payload.imageFile) {
      if (payload.existingImageId) {
        try {
          await axiosInstance.delete(`/images/${payload.existingImageId}`);
          console.log('Replaced old image successfully');
        } catch (error) {
          console.error('Error replacing old image:', error);
        }
      }

      try {
        const formData = new FormData();
        formData.append('file', payload.imageFile);

        const uploadResponse = await axiosInstance.post(
          '/images/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        const imageCreateRequest = {
          image_url: uploadResponse.data.image_url,
          original_filename: uploadResponse.data.original_filename || payload.imageFile.name,
          file_size: uploadResponse.data.file_size || payload.imageFile.size,
          file_type: uploadResponse.data.file_type || payload.imageFile.type,
          width: uploadResponse.data.width,
          height: uploadResponse.data.height
        };

        const imageResponse = await axiosInstance.post('/images', imageCreateRequest);
        imageId = imageResponse.data.id;
      } catch (error: unknown) {
        console.error('Error uploading new image:', error);
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.status === 400 && axiosError.response?.data?.message) {
          toastStore.showToast({
            title: 'Image Upload Error',
            message: axiosError.response.data.message,
            type: 'error'
          });
          isSubmitting.value = false;
          return;
        }
      }
    } else if (payload.existingImageId) {
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
          image_id?: number | null;
        }>;
        match_pairs?: Array<{
          left_text: string;
          right_text: string;
          id?: number;
          left_image_id?: number | null;
          right_image_id?: number | null;
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

    // Process match pairs with images if provided
    if (payload.additionalData.lhs && payload.additionalData.rhs &&
        (payload.questionTypeId === 5 || payload.questionTypeId === 3)) {

      console.log('Processing match pairs...');
      const lhs = payload.additionalData.lhs;
      const rhs = payload.additionalData.rhs;
      const matchPairs = [];

      // Use existing match pairs instead of making an API call
      const existingPairs = existingMatchPairs.value || [];
      console.log('Using stored match pairs data:', existingPairs);

      // Process each pair and any associated images
      const maxLength = Math.max(lhs.length, rhs.length);
      for (let i = 0; i < maxLength; i++) {
        // Only create a pair if either left or right text exists
        if (i < lhs.length || i < rhs.length) {
        const leftText = i < lhs.length ? lhs[i] : '';
        const rightText = i < rhs.length ? rhs[i] : '';

          // Create pair object with existing ID if available
          const pair: {
            left_text: string;
            right_text: string;
            id?: number;
            left_image_id?: number | null;
            right_image_id?: number | null;
          } = {
            left_text: leftText,
            right_text: rightText,
            left_image_id: null,
            right_image_id: null
          };

          // If we have an existing pair at this index, use its ID
          if (i < existingPairs.length) {
            pair.id = existingPairs[i].id;
            // Preserve existing image IDs if they exist
              if (existingPairs[i].left_image_id) {
              pair.left_image_id = existingPairs[i].left_image_id;
            }
              if (existingPairs[i].right_image_id) {
              pair.right_image_id = existingPairs[i].right_image_id;
            }
          }

          // Handle left side image only if there are new images or delete flags
          if (payload.optionImages && payload.optionImages[i]) {
            try {
              // Delete existing left image if any
              if (existingPairs[i]?.left_image_id) {
                await axiosInstance.delete(`/images/${existingPairs[i].left_image_id}`);
              }

              // Upload new left image
              const formData = new FormData();
              formData.append('file', payload.optionImages[i] as File);

              const uploadResponse = await axiosInstance.post('/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });

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
              console.error(`Error handling left image for pair ${i}:`, error);
            }
          } else if (payload.optionImageDeleteFlags?.[i]) {
            pair.left_image_id = null;
          }

          // Handle right side image only if there are new images or delete flags
          if (payload.optionImages && payload.optionImages[i + 10]) {
            try {
              // Delete existing right image if any
              if (existingPairs[i]?.right_image_id) {
                await axiosInstance.delete(`/images/${existingPairs[i].right_image_id}`);
              }

              // Upload new right image
              const formData = new FormData();
              formData.append('file', payload.optionImages[i + 10] as File);

              const uploadResponse = await axiosInstance.post('/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });

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
              console.error(`Error handling right image for pair ${i}:`, error);
            }
          } else if (payload.optionImageDeleteFlags?.[i + 10]) {
            pair.right_image_id = null;
          }

          // Add the pair regardless of content - we want to preserve empty pairs too
          matchPairs.push(pair);
        }
      }

      // Always include match pairs in the update request, even if empty
      updateQuestionRequest.question_text_data.match_pairs = matchPairs;
      console.log('Final match pairs data:', JSON.stringify(matchPairs, null, 2));
    }

    // Log the final update request
    console.log('Final update request:', JSON.stringify(updateQuestionRequest, null, 2));

    // Make a single API call to update the question and all related data
    const updateResponse = await axiosInstance.put(`/questions/edit/${payload.questionId}`, updateQuestionRequest);
    console.log('Update response:', updateResponse.data);

    // Store the sort option in localStorage to ensure it persists
    localStorage.setItem('questionDashboardSort', 'updated_at_desc');

    // Navigate back to question dashboard with success query param
    router.push({
      name: 'questionDashboard',
      query: {
        success: 'true',
        message: 'Question updated successfully',
        unverified: 'true'
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

// Add a function to handle the close button click
function handleCloseClick() {
  // Store the sort option in localStorage to ensure it persists
  localStorage.setItem('questionDashboardSort', 'updated_at_desc');

  // Navigate with query parameters
  router.push({
    name: 'questionDashboard',
    query: {
      unverified: 'true'
    }
  });
}

// Lifecycle hooks
onMounted(async () => {
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

    try {
      // Fetch question data to initialize the form
      const response = await axiosInstance.get(`/questions/${questionId.value}`);
      console.log('Question data:', response.data);

      // Check if it's an MCQ question and has options
      if (response.data &&
          response.data.question_type &&
          response.data.question_type.id === 1 &&
          response.data.question_texts &&
          response.data.question_texts.length > 0 &&
          response.data.question_texts[0].mcq_options) {

        const options = response.data.question_texts[0].mcq_options as McqOption[];

        // Store the existing MCQ options for later use when updating
        existingMcqOptions.value = options.map(opt => ({
          id: opt.id,
          question_text_id: opt.question_text_id,
          option_text: opt.option_text,
          image_id: opt.image_id,
          is_correct: opt.is_correct
        }));

        // Extract option texts
        initialOptions.value = options.map(opt => opt.option_text);

        // Find the correct option index
        const correctIndex = options.findIndex(opt => opt.is_correct === true);
        initialCorrectOption.value = correctIndex !== -1 ? correctIndex : -1;

        // Extract option image URLs and IDs
        initialOptionImages.value = Array(options.length).fill('');
        initialOptionImageIds.value = Array(options.length).fill(null);

        // Process each option to extract image data
        options.forEach((option, index) => {
          if (option.image && option.image.presigned_url) {
            initialOptionImages.value[index] = option.image.presigned_url;
            initialOptionImageIds.value[index] = option.image.id;
          }
        });

        console.log('Initialized MCQ options:', initialOptions.value);
        console.log('Correct option index:', initialCorrectOption.value);
        console.log('Option images:', initialOptionImages.value);
        console.log('Option image IDs:', initialOptionImageIds.value);
      }

      // Check if it's a matching pairs question and store the pairs
      if (response.data &&
          response.data.question_type &&
          (response.data.question_type.id === 3 || response.data.question_type.id === 5) && // Complete Correlation or Match Pairs
          response.data.question_texts &&
          response.data.question_texts.length > 0 &&
          response.data.question_texts[0].match_pairs) {

        // Store the match pairs for later use
        existingMatchPairs.value = response.data.question_texts[0].match_pairs.map((pair: MatchPair) => ({
          id: pair.id,
          question_text_id: pair.question_text_id,
          left_text: pair.left_text,
          right_text: pair.right_text,
          left_image_id: pair.left_image_id,
          right_image_id: pair.right_image_id
        }));

        console.log('Stored match pairs:', existingMatchPairs.value);
      }

      isLoading.value = false;
    } catch (error) {
      console.error('Error fetching question data:', error);
      toastStore.showToast({
        title: 'Error',
        message: 'Failed to load question data',
        type: 'error'
      });
      // Redirect back to dashboard if error
      router.push({ name: 'questionDashboard' });
    }
  } else {
    // Redirect back to dashboard if no question ID
    router.push({ name: 'questionDashboard' });
  }
});
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}
</style>
