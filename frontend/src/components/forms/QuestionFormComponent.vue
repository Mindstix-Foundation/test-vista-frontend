<template>
  <div class="container">
    <div class="container mb-4">
      <div class="row g-2 mb-2 justify-content-center">
        <div class="col-md-5">
          <SearchableDropdown
            v-if="useSearchableDropdown"
            id="filterTopic"
            label="Topic"
            placeholder="Select Topic"
            :items="topicItems"
            v-model="selectedTopicObject"
            @change="handleTopicChange"
            required
          />
          <div v-else class="form-floating">
            <select id="filterTopic" class="form-select" v-model="selectedTopic">
              <option value="">Select Topic</option>
              <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
            </select>
            <label for="filterTopic" class="form-label">Topic</label>
          </div>
        </div>
        <div class="col-md-5">
          <SearchableDropdown
            v-if="useSearchableDropdown"
            id="filterType"
            label="Type"
            placeholder="Select Type"
            :items="questionTypeItems"
            v-model="selectedTypeObject"
            @change="handleTypeChange"
            :disabled="!selectedTopic || isEditMode"
            required
          />
          <div v-else class="form-floating">
            <select id="filterType" class="form-select" v-model="selectedType" @change="toggleQuestionContainer" :disabled="!selectedTopic || isEditMode">
              <option value="">Select Type</option>
              <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
            </select>
            <label for="filterType" class="form-label">Type</label>
          </div>
        </div>
      </div>
    </div>

    <div class="container" id="descriptiveQuestion" v-show="selectedType === 'True or False' ||
                                               selectedType === 'Give Scientific Reasons' ||
                                               selectedType === 'Short Answer Question' ||
                                               selectedType === 'Complete and Identify Reaction' ||
                                               selectedType === 'Short Note' ||
                                               selectedType === 'One-Word Answer' ||
                                               selectedType === 'Odd One Out' ||
                                               selectedType === 'Complete the Correlation'">
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3 form-floating">
              <textarea id="question" v-model="descriptiveQuestion.question" class="form-control" rows="5"
                :placeholder="getPlaceholderText"
                @input="autoResize" required></textarea>
              <label for="question" class="form-label">{{ getLabelText }}</label>
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" id="inputGroupFile01" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp">
                <button
                  v-if="questionImageFile !== null"
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="(e) => removeUploadedImage(e, 'question')"
                  title="Remove uploaded image"
                >
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
            </div>
            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" v-model="descriptiveQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isDescriptiveValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container" id="mcqQuestion" v-show="selectedType === 'Multiple Choice Question (MCQ)'">
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3 form-floating">
              <textarea id="mcqText" v-model="mcqQuestion.question" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
              <label for="mcqText" class="form-label">Question</label>
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" id="mcqImageFile" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp">
                <button
                  v-if="questionImageFile !== null"
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="(e) => removeUploadedImage(e, 'question')"
                  title="Remove uploaded image"
                >
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
            </div>

            <div class="mb-3">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[0]" class="form-control" id="option1" placeholder="Option 1" required>
                    <label for="option1">Option A</label>
                  </div>
                  <div id="optionAImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <input type="file" class="form-control" id="optionAImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 0)" accept=".jpg,.jpeg,.webp">
                    <button
                      v-if="mcqOptionImages[0]"
                      type="button"
                      class="btn btn-danger btn-sm"
                      @click="(e) => removeUploadedImage(e, 'option', 0)"
                      title="Remove uploaded image"
                    >
                      <i class="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[1]" class="form-control" id="option2" placeholder="Option 2" required>
                    <label for="option2">Option B</label>
                  </div>
                  <div id="optionBImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <input type="file" class="form-control" id="optionBImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 1)" accept=".jpg,.jpeg,.webp">
                    <button
                      v-if="mcqOptionImages[1]"
                      type="button"
                      class="btn btn-danger btn-sm"
                      @click="(e) => removeUploadedImage(e, 'option', 1)"
                      title="Remove uploaded image"
                    >
                      <i class="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[2]" class="form-control" id="option3" placeholder="Option 3">
                    <label for="option3">Option C</label>
                  </div>
                  <div id="optionCImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <input type="file" class="form-control" id="optionCImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 2)" accept=".jpg,.jpeg,.webp">
                    <button
                      v-if="mcqOptionImages[2]"
                      type="button"
                      class="btn btn-danger btn-sm"
                      @click="(e) => removeUploadedImage(e, 'option', 2)"
                      title="Remove uploaded image"
                    >
                      <i class="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[3]" class="form-control" id="option4" placeholder="Option 4">
                    <label for="option4">Option D</label>
                  </div>
                  <div id="optionDImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <input type="file" class="form-control" id="optionDImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 3)" accept=".jpg,.jpeg,.webp">
                    <button
                      v-if="mcqOptionImages[3]"
                      type="button"
                      class="btn btn-danger btn-sm"
                      @click="(e) => removeUploadedImage(e, 'option', 3)"
                      title="Remove uploaded image"
                    >
                      <i class="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-3 form-floating">
              <select id="correctOption" v-model="mcqQuestion.correctOption" class="form-select" required>
                <option value="">Select the correct option</option>
                <option value="1">Option A</option>
                <option value="2">Option B</option>
                <option value="3">Option C</option>
                <option value="4">Option D</option>
              </select>
              <label for="correctOption" class="form-label">Correct Option</label>
            </div>
            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" v-model="mcqQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMcqValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container" id="fillBlankQuestion" v-show="selectedType === 'Fill in the Blanks'">
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3 form-floating">
              <textarea id="fillInTheBlankQuestion" v-model="fillBlankQuestion.question" class="form-control" rows="3"
                        placeholder="Type your question here, use '_____' for blanks." @input="autoResize" required></textarea>
              <label for="fillInTheBlankQuestion" class="form-label">Question</label>
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" id="fillInTheBlankImageFile" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp">
                <button
                  v-if="questionImageFile !== null"
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="(e) => removeUploadedImage(e, 'question')"
                  title="Remove uploaded image"
                >
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
              <div class="col text-end">
                <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="insertBlank">Insert Blank</button>
              </div>
            </div>

            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" v-model="fillBlankQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isFillBlankValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container" id="matchPairQuestion" v-show="selectedType === 'Match the Pairs'">
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3">
              <label for="pairQuestion" class="form-label">Question</label>
              <textarea id="pairQuestion" v-model="matchPairQuestion.question" class="form-control" rows="3" placeholder="Enter the question (e.g., Match the terms with their definitions)" @input="autoResize" required></textarea>
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question Image" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" id="matchPairsImageFile" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp">
                <button
                  v-if="questionImageFile !== null"
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="(e) => removeUploadedImage(e, 'question')"
                  title="Remove uploaded image"
                >
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
            </div>

            <div class="row g-3 justify-content-between mb-4">
              <!-- Left-hand side (LHS) -->
              <div class="col-md-5">
                <label for="lhs" class="form-label">Left Side</label>
                <div id="lhsInputs">
                  <div v-for="(item, index) in matchPairQuestion.lhs.filter(item => item !== null)" :key="'lhs-'+index" class="input-group mb-2" :id="'lhsInput'+(index+1)">
                    <input type="text" v-model="matchPairQuestion.lhs[matchPairQuestion.lhs.indexOf(item)]" class="form-control" placeholder="LHS" required>
                    <button type="button" class="btn btn-custom" @click="removeInput('lhs', matchPairQuestion.lhs.indexOf(item))" :disabled="matchPairQuestion.lhs.filter(item => item !== null).length <= 1">Remove</button>
                    <div class="input-group input-group-sm mt-1 mb-3">
                      <input type="file" class="form-control" :id="'lhsImageFile'+matchPairQuestion.lhs.indexOf(item)" @change="(e) => handleQuestionImageUpload(e, 'option', matchPairQuestion.lhs.indexOf(item))" accept=".jpg,.jpeg,.webp">
                      <button
                        v-if="mcqOptionImages[matchPairQuestion.lhs.indexOf(item)]"
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="(e) => removeUploadedImage(e, 'option', matchPairQuestion.lhs.indexOf(item))"
                        title="Remove uploaded image"
                      >
                        <i class="bi bi-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="addInput('lhs')">Add</button>
              </div>

              <!-- Right-hand side (RHS) -->
              <div class="col-md-5">
                <label for="rhs" class="form-label">Right Side</label>
                <div id="rhsInputs">
                  <div v-for="(item, index) in matchPairQuestion.rhs.filter(item => item !== null)" :key="'rhs-'+index" class="input-group mb-2" :id="'rhsInput'+(index+1)">
                    <input type="text" v-model="matchPairQuestion.rhs[matchPairQuestion.rhs.indexOf(item)]" class="form-control" placeholder="RHS" required>
                    <button type="button" class="btn btn-custom" @click="removeInput('rhs', matchPairQuestion.rhs.indexOf(item))" :disabled="matchPairQuestion.rhs.filter(item => item !== null).length <= 1">Remove</button>
                    <div class="input-group input-group-sm mt-1 mb-3">
                      <input type="file" class="form-control" :id="'rhsImageFile'+matchPairQuestion.rhs.indexOf(item)" @change="(e) => handleQuestionImageUpload(e, 'option', matchPairQuestion.rhs.indexOf(item) + 10)" accept=".jpg,.jpeg,.webp">
                      <button
                        v-if="mcqOptionImages[matchPairQuestion.rhs.indexOf(item) + 10]"
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="(e) => removeUploadedImage(e, 'option', matchPairQuestion.rhs.indexOf(item) + 10)"
                        title="Remove uploaded image"
                      >
                        <i class="bi bi-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="addInput('rhs')">Add</button>
              </div>
            </div>

            <div class="form-check mt-4 ">
              <input class="form-check-input" type="checkbox" v-model="matchPairQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMatchPairValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axiosInstance from '@/config/axios'
import SearchableDropdown, { type Item } from '@/components/common/SearchableDropdown.vue'

const props = defineProps<{
  isEditMode?: boolean
  questionId?: number
  chapterId?: string | number
  useSearchableDropdown?: boolean
  initialOptions?: string[]
  initialCorrectOption?: number
  initialOptionImages?: string[]
  initialOptionImageIds?: (number | null)[]
  questionBankData?: {
    boardId: string
    boardName: string
    mediumId: string
    mediumName: string
    standardId: string
    standardName: string
    subjectId: string
    subjectName: string
    chapterId: string
    chapterName: string
    mediumStandardSubjectId: number | null
  }
}>()

const emit = defineEmits<{
  (e: 'save', data: {
    questionTypeId: number
    topicId: number
    isPreviousExam: boolean
    isVerified: boolean
    questionText: string
    additionalData: {
      options?: string[]
      correctOption?: number
      correctAnswer?: string
      lhs?: string[]
      rhs?: string[]
    }
    imageFile?: File
    optionImages?: (File | null)[]
    deleteImage?: boolean
    existingImageId?: number | null
    optionImageIds?: (number | null)[]
    optionImageDeleteFlags?: boolean[]
  }): void
  (e: 'update', data: {
    questionId?: number
    questionTypeId: number
    topicId: number
    isPreviousExam: boolean
    isVerified: boolean
    questionText: string
    additionalData: {
      options?: string[]
      correctOption?: number
      correctAnswer?: string
      lhs?: string[]
      rhs?: string[]
    }
    imageFile?: File
    optionImages?: (File | null)[]
    deleteImage?: boolean
    existingImageId?: number | null
    optionImageIds?: (number | null)[]
    optionImageDeleteFlags?: boolean[]
  }): void
}>()

// Provide default values for props
const isEditMode = ref(props.isEditMode || false)

// Form data
const selectedType = ref('')
const selectedTopic = ref('')
const topics = ref<string[]>([])
const questionTypes = ref<string[]>([])

// Add objects for SearchableDropdown
const selectedTopicObject = ref<Item | null>(null)
const selectedTypeObject = ref<Item | null>(null)

// Compute items for SearchableDropdown
const topicItems = computed(() => {
  return topics.value.map(topicName => {
    return {
      id: topicMap.value.get(topicName) || 0,
      name: topicName
    } as Item
  })
})

const questionTypeItems = computed(() => {
  return questionTypes.value.map(typeName => {
    return {
      id: questionTypeMap.value.get(typeName) || 0,
      name: typeName
    } as Item
  })
})

// Handle SearchableDropdown changes
function handleTopicChange(item: Item | null) {
  if (item) {
    selectedTopic.value = item.name as string
  } else {
    selectedTopic.value = ''
  }
}

function handleTypeChange(item: Item | null) {
  if (item) {
    selectedType.value = item.name as string
    toggleQuestionContainer()
  } else {
    selectedType.value = ''
  }
}

// Question models
const descriptiveQuestion = ref({
  question: '',
  type: 'Descriptive',
  isPreviousExam: false
})

const mcqQuestion = ref({
  question: '',
  type: 'MCQ',
  options: ['', '', '', ''],
  correctOption: '',
  isPreviousExam: false
})

const fillBlankQuestion = ref({
  question: '',
  type: 'Fill in the Blanks',
  isPreviousExam: false
})

const matchPairQuestion = ref({
  question: '',
  type: 'Match the Pairs',
  lhs: [''],
  rhs: ['', ''],
  isPreviousExam: false
})

// Add computed properties to check if forms are valid
const isDescriptiveValid = computed(() => {
  return selectedTopic.value && selectedType.value && descriptiveQuestion.value.question.trim() !== '';
});

const isMcqValid = computed(() => {
  return mcqQuestion.value.question.trim() !== '' &&
         mcqQuestion.value.options[0].trim() !== '' &&
         mcqQuestion.value.options[1].trim() !== '' &&
         mcqQuestion.value.correctOption !== ''
})

const isFillBlankValid = computed(() => {
  return fillBlankQuestion.value.question.trim() !== '' &&
         fillBlankQuestion.value.question.includes('_____')
})

const isMatchPairValid = computed(() => {
  // Check if question is filled
  if (matchPairQuestion.value.question.trim() === '') return false;
  
  // Check if at least one LHS and one RHS item is filled
  const hasValidLhs = matchPairQuestion.value.lhs.some(item => item.trim() !== '');
  const hasValidRhs = matchPairQuestion.value.rhs.some(item => item.trim() !== '');
  
  return hasValidLhs && hasValidRhs;
})

// Add maps to store question type and topic IDs
const questionTypeMap = ref<Map<string, number>>(new Map())
const topicMap = ref<Map<string, number>>(new Map())

// Add interfaces for API data types
interface QuestionType {
  id: number
  type_name: string
  subsection_que?: boolean
}

interface Topic {
  id: number
  name: string
  chapter_id: number
  sequential_topic_number: number
  created_at: string
  updated_at: string
  chapter?: {
    id: number
    medium_standard_subject_id: number
    sequential_chapter_number: number
    name: string
    created_at: string
    updated_at: string
  }
}

// Update the SavePayload interface to include isVerified and option image related fields
interface SavePayload {
  questionId?: number;
  questionTypeId: number;
  topicId: number;
  isPreviousExam: boolean;
  isVerified: boolean;
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
}

// Add interface for question response to include image details
interface QuestionResponse {
  id: number
  question_type_id: number
  board_question: boolean
  is_verified: boolean
  question_type: {
    id: number
    type_name: string
  }
  question_texts: Array<{
    id: number
    question_id: number
    question_text: string
    image_id: number | null
    image?: {
      id: number
      presigned_url: string
      original_filename: string
    } | null
    match_pairs?: Array<{
      left_text: string
      right_text: string
      left_image?: {
        id: number
        presigned_url: string
        original_filename: string
      }
      right_image?: {
        id: number
        presigned_url: string
        original_filename: string
      }
    }>
  }>
  question_topics: Array<{
    id: number
    question_id: number
    topic_id: number
  }>
  question_options?: Array<{
    id: number
    question_id: number
    option_text: string
    is_correct: boolean
  }>
  question_answers?: Array<{
    id: number
    question_id: number
    answer_text: string
  }>
  matching_pairs?: Array<{
    id: number
    question_id: number
    left_text: string
    right_text: string
  }>
}

// Add a ref for the question image file
const questionImageFile = ref<File | null>(null);

// Add refs for the current image
const existingImageUrl = ref<string | null>(null);
const existingImageName = ref<string | null>(null);
const existingImageId = ref<number | null>(null);
const shouldDeleteImage = ref<boolean>(false);
const imageUploadError = ref<string | null>(null);

// Add refs to track each option image (MCQ options + match pairs)
const mcqOptionImages = ref<(File | null)[]>(Array(20).fill(null)); // Increased size to handle all option types

// Add refs to track option image IDs and deletion status
const optionImageIds = ref<(number | null)[]>(Array(20).fill(null));
const optionImageDeleteFlags = ref<boolean[]>(Array(20).fill(false));

// Add computed properties for placeholder and label text
const getPlaceholderText = computed(() => {
  switch (selectedType.value) {
    case 'True or False':
      return 'Type your True/False statement here...';
    case 'Fill in the Blanks':
      return 'Type your sentence with blanks indicated by underscores (___)...';
    default:
      return 'Type your question here...';
  }
});

const getLabelText = computed(() => {
  switch (selectedType.value) {
    case 'True or False':
      return 'Statement';
    case 'Fill in the Blanks':
      return 'Sentence with Blanks';
    default:
      return 'Question';
  }
});

// Expose computed properties
defineExpose({
  getPlaceholderText,
  getLabelText
});

// Methods
async function fetchQuestionTypes() {
  try {
    const response = await axiosInstance.get('/question-types')
      .catch(() => ({ data: [] })) // Fallback to empty array if API fails

    if (response.data && Array.isArray(response.data)) {
      // Extract specifically the type_name property from each question type object
      questionTypes.value = response.data.map((type: QuestionType) => type.type_name || '')

      // Store the mapping of type names to IDs
      response.data.forEach((type: QuestionType) => {
        if (type.type_name && type.id) {
          questionTypeMap.value.set(type.type_name, type.id)
        }
      })
    } else {
      // Fallback to default question types if API fails
      questionTypes.value = [
        'Multiple Choice Question (MCQ)',
        'Odd One Out',
        'Complete the Correlation',
        'True or False',
        'Match the Pairs',
        'Fill in the Blanks',
        'One-Word Answer',
        'Give Scientific Reasons',
        'Short Answer Question',
        'Complete and Identify Reaction',
        'Short Note'
      ]
    }
  } catch (error) {
    console.error('Error fetching question types:', error)
    // Fallback to default question types if API fails
    questionTypes.value = [
      'Multiple Choice Question (MCQ)',
      'Odd One Out',
      'Complete the Correlation',
      'True or False',
      'Match the Pairs',
      'Fill in the Blanks',
      'One-Word Answer',
      'Give Scientific Reasons',
      'Short Answer Question',
      'Complete and Identify Reaction',
      'Short Note'
    ]
  }
}

async function fetchTopics() {
  try {
    // Get chapter ID from props or from questionBankData
    const chapterId = props.chapterId || (props.questionBankData?.chapterId ?? null);

    if (!chapterId) {
      topics.value = [];

      // Add a special "error" topic that will be displayed to the user
      topics.value.push('Error: Chapter ID is missing. Please go back and select a chapter.');
      selectedTopic.value = topics.value[0];
      return;
    }

    // Fetch topics from API based on chapterId
    const response = await axiosInstance.get('/topics', {
      params: {
        chapterId: chapterId
      }
    }).catch(() => ({ data: [] })); // Fallback to empty array if API fails

    // Transform the API response to extract topic names
    if (response.data && Array.isArray(response.data)) {
      topics.value = response.data.map((topic: Topic) => topic.name)

      // Store the mapping of topic names to IDs
      response.data.forEach((topic: Topic) => {
        if (topic.name && topic.id) {
          topicMap.value.set(topic.name, topic.id)
        }
      })
    } else {
      topics.value = ['Error: Invalid response from API']
    }

    // If no topics from API, try to extract from stored questions
    if (topics.value.length === 0 || topics.value[0].startsWith('Error:')) {
      // Try fallback to local storage
      const storedQuestions = localStorage.getItem('questions')
      if (storedQuestions) {
        try {
          const questions = JSON.parse(storedQuestions)
          const uniqueTopics = new Set<string>()

          questions.forEach((q: { topic?: string; topics?: { topic: string }[] }) => {
            if (q.topic) uniqueTopics.add(q.topic)
            if (q.topics) {
              q.topics.forEach((t: { topic: string }) => uniqueTopics.add(t.topic))
            }
          })

          const localTopics = Array.from(uniqueTopics)
          if (localTopics.length > 0) {
            topics.value = localTopics
          } else if (!topics.value.length || topics.value[0].startsWith('Error:')) {
            topics.value = ['No topics found. Please create topics first.']
          }
        } catch {
          if (!topics.value.length || topics.value[0].startsWith('Error:')) {
            topics.value = ['Error: Could not load topics']
          }
        }
      } else if (topics.value.length === 0) {
        topics.value = ['No topics found. Please create topics first.']
      }
    }
  } catch {
    topics.value = ['Error: Could not load topics']
  }
}

async function fetchQuestionData() {
  if (!isEditMode.value || !props.questionId) return

  try {
    const response = await axiosInstance.get<QuestionResponse>(`/questions/${props.questionId}`)
    const questionData: QuestionResponse = response.data

    // Set the topic and type based on the question data
    if (questionData.question_topics && questionData.question_topics.length > 0) {
      const topicId = questionData.question_topics[0].topic_id
      const topicResponse = await axiosInstance.get(`/topics/${topicId}`)
      selectedTopic.value = topicResponse.data.name
    }

    if (questionData.question_type) {
      selectedType.value = questionData.question_type.type_name
    }

    // Check for image and set if available
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      const questionText = questionData.question_texts[0].question_text

      // Check if there's an image associated with this question
      if (questionData.question_texts[0].image_id && questionData.question_texts[0].image) {
        existingImageUrl.value = questionData.question_texts[0].image.presigned_url;
        existingImageName.value = questionData.question_texts[0].image.original_filename || 'question_image';
        existingImageId.value = questionData.question_texts[0].image.id;
        console.log('Image found:', existingImageUrl.value);
      }

      // Fill the appropriate question form based on question type
      switch (selectedType.value) {
        case 'True or False':
        case 'Give Scientific Reasons':
        case 'Short Answer Question':
        case 'Complete and Identify Reaction':
        case 'Short Note':
        case 'One-Word Answer':
          descriptiveQuestion.value.question = questionText
          descriptiveQuestion.value.isPreviousExam = questionData.board_question
          break

        case 'Multiple Choice Question (MCQ)':
          mcqQuestion.value.question = questionText
          mcqQuestion.value.isPreviousExam = questionData.board_question

          // Fetch MCQ options
          if (questionData.question_options) {
            questionData.question_options.forEach((option: { option_text: string; is_correct: boolean }, index: number) => {
              if (index < 4) {
                mcqQuestion.value.options[index] = option.option_text
                if (option.is_correct) {
                  mcqQuestion.value.correctOption = (index + 1).toString()
                }
              }
            })
          }
          break

        case 'Odd One Out':
          descriptiveQuestion.value.question = questionText
          descriptiveQuestion.value.isPreviousExam = questionData.board_question
          // Get the correct answer if available
          if (questionData.question_answers && questionData.question_answers.length > 0) {
            descriptiveQuestion.value.question += '\n\nOdd One Out: ' + questionData.question_answers[0].answer_text
          }
          break

        case 'Complete the Correlation':
          descriptiveQuestion.value.question = questionText
          descriptiveQuestion.value.isPreviousExam = questionData.board_question
          // Get any additional correlation notes if available
          if (questionData.question_answers && questionData.question_answers.length > 0) {
            descriptiveQuestion.value.question += '\n\nCorrelation Notes: ' + questionData.question_answers[0].answer_text
          }
          break

        case 'Fill in the Blanks':
          fillBlankQuestion.value.question = questionText
          fillBlankQuestion.value.isPreviousExam = questionData.board_question
          break

        case 'Match the Pairs':
          matchPairQuestion.value.question = questionText
          matchPairQuestion.value.isPreviousExam = questionData.board_question

          // Fetch matching pairs from question_texts
          if (questionData.question_texts && questionData.question_texts[0].match_pairs) {
            const matchPairs = questionData.question_texts[0].match_pairs;
            if (matchPairs.length > 0) {
              // Initialize arrays with the pairs data
              matchPairQuestion.value.lhs = matchPairs.map((pair: { left_text: string }) => pair.left_text)
              matchPairQuestion.value.rhs = matchPairs.map((pair: { right_text: string }) => pair.right_text)

              // Handle option images
              matchPairs.forEach((pair: { 
                left_text: string;
                right_text: string;
                left_image?: {
                  id: number;
                  presigned_url: string;
                  original_filename: string;
                };
                right_image?: {
                  id: number;
                  presigned_url: string;
                  original_filename: string;
                };
              }, index: number) => {
                // Handle left image if exists
                if (pair.left_image) {
                  optionImageIds.value[index] = pair.left_image.id;
                  // Create image preview for left side
                  const optionImageContainer = document.getElementById(`lhsInput${index + 1}`);
                  if (optionImageContainer) {
                    createImagePreview(optionImageContainer, pair.left_image.presigned_url, index);
                  }
                }

                // Handle right image if exists
                if (pair.right_image) {
                  optionImageIds.value[index + 10] = pair.right_image.id;
                  // Create image preview for right side
                  const optionImageContainer = document.getElementById(`rhsInput${index + 1}`);
                  if (optionImageContainer) {
                    createImagePreview(optionImageContainer, pair.right_image.presigned_url, index + 10);
                  }
                }
              });
            }
          } else {
            // Initialize with default empty state
            matchPairQuestion.value.lhs = ['']
            matchPairQuestion.value.rhs = ['', '']
          }

          // Ensure we have at least one LHS item and two RHS items
          if (matchPairQuestion.value.lhs.length === 0) {
            matchPairQuestion.value.lhs = ['']
          }
          if (matchPairQuestion.value.rhs.length < 2) {
            while (matchPairQuestion.value.rhs.length < 2) {
              matchPairQuestion.value.rhs.push('')
            }
          }
          break
      }
    }
  } catch (error) {
    console.error('Error fetching question data:', error)
  }
}

function toggleQuestionContainer() {
  // The v-show directives will handle showing/hiding the appropriate container based on selectedType
  // Container mapping:
  // - descriptiveQuestion: True or False, Give Scientific Reasons, Short Answer Question, Complete and Identify Reaction, Short Note, One-Word Answer, Odd One Out, Complete the Correlation
  // - mcqQuestion: Multiple Choice Question (MCQ)
  // - fillBlankQuestion: Fill in the Blanks
  // - matchPairQuestion: Match the Pairs
}

function autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = ''
  textarea.style.height = textarea.scrollHeight + 'px'
}

function insertBlank() {
  fillBlankQuestion.value.question += '_____'
}

function addInput(side: 'lhs' | 'rhs') {
  if (side === 'lhs') {
    matchPairQuestion.value.lhs.push('');
  } else {
    matchPairQuestion.value.rhs.push('');
  }
}

function removeInput(side: 'lhs' | 'rhs', index: number) {
  if (side === 'lhs') {
    // Allow removing LHS items as long as there's at least one non-null item
    const nonNullItems = matchPairQuestion.value.lhs.filter(item => item !== null);
    if (nonNullItems.length > 1) {
      matchPairQuestion.value.lhs.splice(index, 1);
      // Remove corresponding image if exists
      if (optionImageIds.value[index]) {
        optionImageDeleteFlags.value[index] = true;
      }
    }
  } else {
    // Allow removing RHS items as long as there's at least one non-null item
    const nonNullItems = matchPairQuestion.value.rhs.filter(item => item !== null);
    if (nonNullItems.length > 1) {
      matchPairQuestion.value.rhs.splice(index, 1);
      // Remove corresponding image if exists
      if (optionImageIds.value[index + 10]) {
        optionImageDeleteFlags.value[index + 10] = true;
      }
    }
  }
}

function saveQuestion() {
  // Validate required fields based on the question type
  if (selectedTopic.value === '') {
    alert('Please select a topic')
    return
  }

  if (selectedType.value === '') {
    alert('Please select a question type')
    return
  }

  let isValid = true
  const errorMessages: string[] = []

  // Type-specific validation
  switch (selectedType.value) {
    case 'True or False':
    case 'Give Scientific Reasons':
    case 'Short Answer Question':
    case 'Complete and Identify Reaction':
    case 'Short Note':
    case 'One-Word Answer':
    case 'Odd One Out':
    case 'Complete the Correlation':
      if (!isDescriptiveValid.value) {
        isValid = false
        errorMessages.push('Please enter the question text')
      }
      break
    case 'Multiple Choice Question (MCQ)':
      if (!isMcqValid.value) {
        isValid = false
        errorMessages.push('Please fill in the question, at least two options, and select the correct answer')
      }
      break
    case 'Fill in the Blanks':
      if (!isFillBlankValid.value) {
        isValid = false
        errorMessages.push('Please fill in the question with blanks')
      }
      break
    case 'Match the Pairs':
      if (!isMatchPairValid.value) {
        isValid = false
        errorMessages.push('Please fill in the question, left-hand items, and right-hand items')
      }
      break
  }

  if (!isValid) {
    alert(errorMessages.join('\n'))
    return
  }

  // Prepare the base payload
  const payload: SavePayload = {
    questionTypeId: getQuestionTypeId(),
    topicId: getTopicId(),
    isPreviousExam: getIsPreviousExam(),
    isVerified: false,
    questionText: '',
    additionalData: {},
    imageFile: questionImageFile.value || undefined,
    optionImages: [...mcqOptionImages.value].map(img => img === undefined ? null : img) as (File | null)[],
    deleteImage: shouldDeleteImage.value,
    existingImageId: existingImageId.value,
    optionImageIds: [...optionImageIds.value],
    optionImageDeleteFlags: [...optionImageDeleteFlags.value]
  }

  // Add question-type specific data
  switch (selectedType.value) {
    case 'True or False':
    case 'Give Scientific Reasons':
    case 'Short Answer Question':
    case 'Complete and Identify Reaction':
    case 'Short Note':
    case 'One-Word Answer':
    case 'Odd One Out':
    case 'Complete the Correlation':
      payload.questionText = descriptiveQuestion.value.question
      break
    case 'Multiple Choice Question (MCQ)':
      payload.questionText = mcqQuestion.value.question
      payload.additionalData = {
        options: mcqQuestion.value.options,
        correctOption: parseInt(mcqQuestion.value.correctOption) - 1
      }
      break
    case 'Fill in the Blanks':
      payload.questionText = fillBlankQuestion.value.question
      break
    case 'Match the Pairs':
      payload.questionText = matchPairQuestion.value.question
      payload.additionalData = {
        lhs: matchPairQuestion.value.lhs,
        rhs: matchPairQuestion.value.rhs
      }
      break
  }

  // Emit the save or update event
  if (isEditMode.value) {
    emit('update', {
      questionId: props.questionId,
      questionTypeId: payload.questionTypeId,
      topicId: payload.topicId,
      isPreviousExam: payload.isPreviousExam,
      isVerified: payload.isVerified,
      questionText: payload.questionText,
      additionalData: payload.additionalData,
      imageFile: payload.imageFile,
      optionImages: payload.optionImages,
      deleteImage: payload.deleteImage,
      existingImageId: payload.existingImageId,
      optionImageIds: payload.optionImageIds,
      optionImageDeleteFlags: payload.optionImageDeleteFlags
    })
  } else {
    emit('save', {
      questionTypeId: payload.questionTypeId,
      topicId: payload.topicId,
      isPreviousExam: payload.isPreviousExam,
      isVerified: payload.isVerified,
      questionText: payload.questionText,
      additionalData: payload.additionalData,
      imageFile: payload.imageFile,
      optionImages: payload.optionImages,
      deleteImage: payload.deleteImage,
      existingImageId: payload.existingImageId,
      optionImageIds: payload.optionImageIds,
      optionImageDeleteFlags: payload.optionImageDeleteFlags
    })
  }
}

function getQuestionTypeId(): number {
  // If a type ID map is available, use it
  if (questionTypeMap.value.has(selectedType.value)) {
    return questionTypeMap.value.get(selectedType.value) || 0
  }

  // Otherwise use hardcoded values
  switch (selectedType.value) {
    case 'Multiple Choice Question (MCQ)':
      return 1
    case 'Odd One Out':
      return 2
    case 'Complete the Correlation':
      return 3
    case 'True or False':
      return 4
    case 'Match the Pairs':
      return 5
    case 'Fill in the Blanks':
      return 6
    case 'One-Word Answer':
      return 7
    case 'Give Scientific Reasons':
      return 8
    case 'Short Answer Question':
      return 9
    case 'Complete and Identify Reaction':
      return 10
    case 'Short Note':
      return 11
    default:
      return 0 // Default to 0, which should trigger a validation error
  }
}

function getIsPreviousExam(): boolean {
  switch (selectedType.value) {
    case 'True or False':
    case 'Give Scientific Reasons':
    case 'Short Answer Question':
    case 'Complete and Identify Reaction':
    case 'Short Note':
    case 'One-Word Answer':
      return descriptiveQuestion.value.isPreviousExam
    case 'Multiple Choice Question (MCQ)':
      return mcqQuestion.value.isPreviousExam
    case 'Fill in the Blanks':
      return fillBlankQuestion.value.isPreviousExam
    case 'Match the Pairs':
    case 'Complete the Correlation':
      return matchPairQuestion.value.isPreviousExam
    default:
      return false
  }
}

function getTopicId(): number {
  if (topicMap.value.has(selectedTopic.value)) {
    return topicMap.value.get(selectedTopic.value) || 0
  }
  return 0 // Default to 0 if topic is not found
}

// Watch for changes in selectedTopic
watch(selectedTopic, (newTopic) => {
  // Reset selectedType when topic changes
  if (!newTopic) {
    selectedType.value = ''
  }
})

// Add a watcher for questionImageFile to debug
watch(questionImageFile, (newValue) => {
  console.log('questionImageFile changed:', newValue);
}, { immediate: true });

// Update the handleQuestionImageUpload function to properly set values
function handleQuestionImageUpload(event: Event, type: 'question' | 'option' = 'question', optionIndex?: number) {
  const input = event.target as HTMLInputElement;
  imageUploadError.value = null; // Reset error message

  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      imageUploadError.value = 'Only .jpg, .jpeg, and .webp files are allowed';
      input.value = ''; // Clear the input
      if (type === 'question') {
        questionImageFile.value = null;
      }
      return;
    }

    // Validate file size (between 10KB and 5MB)
    const minSize = 10 * 1024; // 10KB in bytes
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (file.size < minSize) {
      imageUploadError.value = 'Image size must be at least 10KB';
      input.value = ''; // Clear the input
      if (type === 'question') {
        questionImageFile.value = null;
      }
      return;
    }

    if (file.size > maxSize) {
      imageUploadError.value = 'Image size must not exceed 5MB';
      input.value = ''; // Clear the input
      if (type === 'question') {
        questionImageFile.value = null;
      }
      return;
    }

    // File passed all validations
    if (type === 'question') {
      console.log('Setting question image file:', file.name);
      questionImageFile.value = file;
      shouldDeleteImage.value = false; // Reset deletion flag since we're adding a new image
    } else if (type === 'option' && optionIndex !== undefined) {
      // Set the specific index to the file
      const newOptionImages = [...mcqOptionImages.value];
      newOptionImages[optionIndex] = file;
      mcqOptionImages.value = newOptionImages;
    }
  } else {
    // No file selected or file selection cancelled
    if (type === 'question') {
      questionImageFile.value = null;
    } else if (type === 'option' && optionIndex !== undefined) {
      // Set the specific index to null
      const newOptionImages = [...mcqOptionImages.value];
      newOptionImages[optionIndex] = null;
      mcqOptionImages.value = newOptionImages;
    }
  }
}

// Update the removeUploadedImage function
function removeUploadedImage(event: Event, type: 'question' | 'option' = 'question', optionIndex?: number) {
  event.preventDefault(); // Prevent any default behavior

  const button = event.currentTarget as HTMLButtonElement;
  const fileInput = button.closest('.input-group')?.querySelector('input[type="file"]') as HTMLInputElement;

  if (fileInput) {
    fileInput.value = ''; // Clear the file input

    if (type === 'question') {
      questionImageFile.value = null; // Clear the file reference
    } else if (type === 'option' && optionIndex !== undefined) {
      // Set the specific index to null
      const newOptionImages = [...mcqOptionImages.value];
      newOptionImages[optionIndex] = null;
      mcqOptionImages.value = newOptionImages;
    }

    imageUploadError.value = null; // Clear any error message
  }
}

// Function to handle removing the existing image
function removeExistingImage() {
  shouldDeleteImage.value = true;
  existingImageUrl.value = null;
  existingImageName.value = null;
  imageUploadError.value = null; // Clear any error message
  // Keep the existingImageId value for sending the delete request
}

// Add this helper function for creating image previews
function createImagePreview(container: HTMLElement, imageUrl: string, index: number) {
  const previewDiv = document.createElement('div');
  previewDiv.className = 'image-preview mb-2';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = `Option Image ${index + 1}`;
  img.className = 'img-fluid mb-2';
  img.style.maxHeight = '100px';
  img.style.borderRadius = '5px';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'd-flex justify-content-between align-items-center';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger btn-sm';
  removeBtn.innerHTML = '<i class="bi bi-trash"></i> Remove';
  removeBtn.onclick = (e) => {
    e.preventDefault();
    previewDiv.remove();
    optionImageDeleteFlags.value[index] = true;
  };

  infoContainer.appendChild(removeBtn);
  previewDiv.appendChild(img);
  previewDiv.appendChild(infoContainer);
  container.appendChild(previewDiv);
}

// Initialize textareas and fetch data on mount
onMounted(() => {
  // Explicitly set image file refs to null
  questionImageFile.value = null;
  mcqOptionImages.value = Array(20).fill(null);
  optionImageIds.value = Array(20).fill(null);
  optionImageDeleteFlags.value = Array(20).fill(false);
  imageUploadError.value = null;

  fetchQuestionTypes()
  fetchTopics()

  if (isEditMode.value && props.questionId) {
    fetchQuestionData().then(() => {
      if (props.useSearchableDropdown) {
        // Initialize SearchableDropdown values if in edit mode
        if (selectedTopic.value) {
          const topicId = topicMap.value.get(selectedTopic.value) || 0
          selectedTopicObject.value = {
            id: topicId,
            name: selectedTopic.value
          } as Item
        }

        if (selectedType.value) {
          const typeId = questionTypeMap.value.get(selectedType.value) || 0
          selectedTypeObject.value = {
            id: typeId,
            name: selectedType.value
          } as Item
        }
      }

      // Initialize MCQ options from props if provided
      if (props.initialOptions && props.initialOptions.length > 0) {
        mcqQuestion.value.options = [...props.initialOptions]
        while (mcqQuestion.value.options.length < 4) {
          mcqQuestion.value.options.push('')
        }
      }

      if (props.initialCorrectOption !== undefined && props.initialCorrectOption >= 0) {
        mcqQuestion.value.correctOption = (props.initialCorrectOption + 1).toString()
      }

      // Load option image data if provided
      if (props.initialOptionImages && props.initialOptionImages.length > 0) {
        console.log('Setting up option images from props:', props.initialOptionImages);

        // Create image preview elements for each option that has an image
        for (let i = 0; i < props.initialOptionImages.length; i++) {
          if (props.initialOptionImages[i]) {
            // Store the image IDs for later use
            if (props.initialOptionImageIds && props.initialOptionImageIds[i]) {
              optionImageIds.value[i] = props.initialOptionImageIds[i];
            }

            // Display existing option images in the UI
            const optionImageContainer = document.getElementById(`option${String.fromCharCode(65 + i)}ImagePreview`);
            if (optionImageContainer) {
              // Clear any existing content
              optionImageContainer.innerHTML = '';

              // Create the image preview HTML
              const imagePreview = document.createElement('div');
              imagePreview.className = 'image-preview mb-2';

              const img = document.createElement('img');
              img.src = props.initialOptionImages[i];
              img.alt = `Option ${String.fromCharCode(65 + i)} Image`;
              img.className = 'img-fluid mb-2';
              img.style.maxHeight = '100px';
              img.style.borderRadius = '5px';

              const infoContainer = document.createElement('div');
              infoContainer.className = 'd-flex justify-content-between align-items-center';

              const removeBtn = document.createElement('button');
              removeBtn.type = 'button';
              removeBtn.className = 'btn btn-danger btn-sm';
              removeBtn.innerHTML = '<i class="bi bi-trash"></i> Remove';
              removeBtn.onclick = (e) => {
                e.preventDefault();
                // Remove the image preview
                imagePreview.remove();

                // Mark this option image for deletion when form is submitted
                if (props.initialOptionImageIds && props.initialOptionImageIds[i]) {
                  console.log(`Marking option image ${i} for deletion`);
                  optionImageDeleteFlags.value[i] = true;
                }
              };

              infoContainer.appendChild(removeBtn);
              imagePreview.appendChild(img);
              imagePreview.appendChild(infoContainer);
              optionImageContainer.appendChild(imagePreview);
            }
          }
        }
      }
    })
  }

  // Initialize textareas
  setTimeout(() => {
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.style.height = textarea.scrollHeight + 'px'
    })
  }, 0)
})
</script>

<style scoped>
/* For screen size "sm" or smaller */
@media (max-width: 576px) {
  .btn-custom {
    background-color: #dc3545;
    color: white;
  }
}

/* For larger screen sizes */
@media (min-width: 577px) {
  .btn-custom {
    border: 1px solid gray !important;
    background-color: #f8f9fa; /* Matches btn-light */
    color: black;
    transition: background-color 0.3s ease, color 0.3s ease; /* Smooth hover effect */
    border-radius: 1%;
  }
  .btn-custom:hover {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545;
    color: white;
  }
}

/* Add styles at the end of the style section */
.form-select:disabled {
  background-color: #f8f9fa;
  opacity: 0.75;
  cursor: not-allowed;
}

/* Style for error options in select lists */
option[value^="Error:"], option[value^="No topics"] {
  color: #dc3545;
  font-weight: bold;
  font-style: italic;
}

/* Add style for image preview */
.image-preview {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f8f9fa;
}

.image-preview img {
  max-width: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
</style>
