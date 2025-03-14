<template>
  <form @submit.prevent="handleSubmit">
    <div class="row g-3 justify-content-center">
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="mb-3 form-floating">
          <input
            type="text"
            class="form-control"
            id="chapterName"
            placeholder="Enter Chapter Name"
            v-model="chapterName"
            @input="handleChapterNameInput"
            @keydown.enter.prevent="focusFirstTopic"
          />
          <label for="chapterName" class="form-label">Chapter Name</label>
        </div>
      </div>

      <fieldset class="border p-2 rounded col col-12 col-sm-10 col-md-8 mb-4">
        <legend class="float-none w-auto">Chapter Topics &nbsp;</legend>

        <div class="row g-2 justify-content-center" id="input-container">
          <div v-for="(topic, index) in topics" :key="index" class="col col-12">
            <div class="form-floating">
              <input
                type="text"
                class="form-control topic-input"
                :id="'topic-' + index"
                placeholder="Enter Topic"
                v-model="topics[index]"
                @input="handleTopicInput(index)"
                @keydown.enter.prevent="handleTopicEnter(index)"
              />
              <label :for="'topic-' + index" class="form-label">Topic Name</label>
            </div>
          </div>
        </div>
      </fieldset>

      <div class="col col-12 col-sm-10 col-md-8 mt-4">
        <div class="text-center">
          <button type="submit" class="btn btn-dark" :disabled="!chapterName.trim()">Save</button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  initialData?: {
    chapterName: string
    topics: string[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
})

interface ChapterFormData {
  chapterName: string
  topics: string[]
}

const emit = defineEmits<{
  (e: 'submit', data: ChapterFormData): void
}>()

// Function to capitalize the first letter of a string
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize with capitalized values
const chapterName = ref(props.initialData?.chapterName ?
  capitalizeFirstLetter(props.initialData.chapterName) : '')

const topics = ref<string[]>(
  props.initialData?.topics ?
  props.initialData.topics.map(topic => capitalizeFirstLetter(topic)) :
  ['']
)

// Ensure capitalization on mount
onMounted(() => {
  // Capitalize chapter name if it exists
  if (chapterName.value) {
    chapterName.value = capitalizeFirstLetter(chapterName.value)
  }

  // Capitalize all topics
  topics.value = topics.value.map(topic => capitalizeFirstLetter(topic))
})

const focusFirstTopic = () => {
  const firstTopicInput = document.getElementById('topic-0')
  if (firstTopicInput) {
    firstTopicInput.focus()
  }
}

const handleTopicEnter = (index: number) => {
  const currentTopic = topics.value[index]

  // If current field is empty and not the last one, remove it
  if (currentTopic.trim() === '' && index !== topics.value.length - 1) {
    topics.value.splice(index, 1)
    // Focus the next input
    setTimeout(() => {
      const nextInput = document.getElementById(`topic-${index}`)
      if (nextInput) {
        nextInput.focus()
      }
    }, 0)
    return
  }

  // If it's the last topic and not empty, add a new one and focus it
  if (index === topics.value.length - 1 && currentTopic.trim() !== '') {
    topics.value.push('')
    setTimeout(() => {
      const nextInput = document.getElementById(`topic-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }, 0)
  } else {
    // Focus the next topic
    const nextInput = document.getElementById(`topic-${index + 1}`)
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const handleTopicInput = (index: number) => {
  const currentTopic = topics.value[index]

  // Capitalize the first letter of the topic
  if (currentTopic) {
    topics.value[index] = capitalizeFirstLetter(currentTopic);
  }

  // Add new input field if the last field is filled
  if (index === topics.value.length - 1 && currentTopic.trim() !== '') {
    topics.value.push('')
  }

  // Remove input field if it is empty and not the last one
  if (currentTopic.trim() === '' && index !== topics.value.length - 1) {
    topics.value.splice(index, 1)
    // Focus the previous input after removal
    setTimeout(() => {
      const prevInput = document.getElementById(`topic-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }, 0)
  }
}

const handleChapterNameInput = () => {
  chapterName.value = capitalizeFirstLetter(chapterName.value)
}

const handleSubmit = () => {
  const validTopics = topics.value.filter((topic) => topic.trim() !== '')
  emit('submit', {
    chapterName: chapterName.value.trim(),
    topics: validTopics,
  })
}
</script>

<style scoped>
.form-floating > label {
  left: 0.5rem;
}

fieldset {
  border-color: #dee2e6;
}

legend {
  font-size: 1rem;
  margin-bottom: 0;
  color: #6c757d;
}
</style>
