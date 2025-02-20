<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link
          class="btn btn-close"
          :to="{
            name: 'subjectSyllabus',
            params: { id: route.query.subject as string },
            query: {
              board: route.query.board,
              medium: route.query.medium,
              standard: route.query.standard,
            },
          }"
          aria-label="Close"
        />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-5">
          <p class="text-muted text-start fs-5 m-0">
            <span class="col-12 col-md-auto">{{ selectedBoard?.name }} |</span>
            <span class="col-12 col-md-auto"> {{ selectedMedium?.instruction_medium }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0">
            Standard {{ selectedStandard?.name }}
            <span class="d-block text-start text-secondary"
              >{{ selectedSubject?.name }} Syllabus</span
            >
          </h4>
        </div>
        <div class="col col-12 col-sm-5 text-end align-self-end">
          <h3 class="text-left fw-bolder text-uppercase mb-2">Add New Chapter</h3>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <form @submit.prevent="saveChapter">
        <div class="row g-3 justify-content-center">
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="mb-3 form-floating">
              <input
                type="text"
                class="form-control"
                id="chapterName"
                placeholder="Enter Chapter Name"
                v-model="chapterName"
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
              <button type="submit" class="btn btn-dark" :disabled="!chapterName.trim()">
                Save
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiUrl } from '@/config/api'
import { useToastStore } from '@/store/toast'

interface Board {
  id: number
  name: string
}

interface Medium {
  id: number
  instruction_medium: string
}

interface Standard {
  id: number
  name: string
}

interface Subject {
  id: number
  name: string
}

interface Chapter {
  id: number
  medium_standard_subject_id: number
  sequential_chapter_number: number
  name: string
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)

const chapterName = ref('')
const topics = ref<string[]>(['']) // Initialize with one empty topic

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  try {
    // Fetch board details
    const boardResponse = await fetch(getApiUrl(`/boards/${route.query.board}`))
    if (!boardResponse.ok) throw new Error('Failed to fetch board details')
    selectedBoard.value = await boardResponse.json()

    // Fetch medium details
    const mediumResponse = await fetch(getApiUrl(`/instruction-mediums/${route.query.medium}`))
    if (!mediumResponse.ok) throw new Error('Failed to fetch medium details')
    selectedMedium.value = await mediumResponse.json()

    // Fetch standard details
    const standardResponse = await fetch(getApiUrl(`/standards/${route.query.standard}`))
    if (!standardResponse.ok) throw new Error('Failed to fetch standard details')
    selectedStandard.value = await standardResponse.json()

    // Fetch subject details
    const subjectResponse = await fetch(getApiUrl(`/subjects/${route.query.subject}`))
    if (!subjectResponse.ok) throw new Error('Failed to fetch subject details')
    selectedSubject.value = await subjectResponse.json()
  } catch (error) {
    console.error('Error fetching data:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load data',
      type: 'error',
    })
  }
}

const focusFirstTopic = () => {
  const firstTopicInput = document.getElementById('topic-0')
  if (firstTopicInput) {
    firstTopicInput.focus()
  }
}

const handleTopicEnter = (index: number) => {
  // If it's the last topic, add a new one and focus it
  if (index === topics.value.length - 1) {
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
  // Add new input field if the last field is filled
  if (index === topics.value.length - 1 && topics.value[index].trim() !== '') {
    topics.value.push('')
  }
}

const saveChapter = async () => {
  try {
    // First, get all existing chapters to determine the next sequential number
    const chaptersResponse = await fetch(getApiUrl(`/chapters?subject_id=${route.query.subject}`))
    if (!chaptersResponse.ok) throw new Error('Failed to fetch chapters')
    const existingChapters: Chapter[] = await chaptersResponse.json()

    // Calculate next sequential number
    const nextChapterNumber =
      existingChapters.length > 0
        ? Math.max(...existingChapters.map((ch) => ch.sequential_chapter_number)) + 1
        : 1

    // Prepare chapter data
    const chapterData = {
      medium_standard_subject_id: Number(route.query.subject),
      sequential_chapter_number: nextChapterNumber,
      name: chapterName.value.trim(),
    }

    // Save chapter
    const chapterResponse = await fetch(getApiUrl('/chapters'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chapterData),
    })

    if (!chapterResponse.ok) throw new Error('Failed to save chapter')

    const savedChapter = await chapterResponse.json()

    // Filter out empty topics and save them
    const validTopics = topics.value.filter((topic) => topic.trim() !== '')

    // Save topics with sequential numbers
    await Promise.all(
      validTopics.map(async (topicName, index) => {
        const topicData = {
          chapter_id: savedChapter.id,
          sequential_topic_number: index + 1,
          name: topicName.trim(),
        }

        const topicResponse = await fetch(getApiUrl('/topics'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(topicData),
        })

        if (!topicResponse.ok) throw new Error(`Failed to save topic: ${topicName}`)
      }),
    )

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter and topics saved successfully',
      type: 'success',
    })

    // Navigate back to subject syllabus
    router.push({
      name: 'subjectSyllabus',
      params: { id: route.query.subject as string },
      query: {
        board: route.query.board,
        medium: route.query.medium,
        standard: route.query.standard,
      },
    })
  } catch (error) {
    console.error('Error saving chapter:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to save chapter and topics',
      type: 'error',
    })
  }
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

@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
