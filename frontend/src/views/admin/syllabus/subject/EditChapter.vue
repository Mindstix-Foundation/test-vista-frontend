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
          <h3 class="text-left fw-bolder text-uppercase mb-2">Edit Chapter</h3>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <ChapterFormComponent
        v-if="chapterData"
        :initial-data="chapterData"
        @submit="updateChapter"
      />
      <div v-else class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiUrl } from '@/config/api'
import { useToastStore } from '@/store/toast'
import ChapterFormComponent from '@/components/forms/ChapterFormComponent.vue'

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

interface ChapterData {
  chapterName: string
  topics: string[]
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)
const chapterData = ref<ChapterData | null>(null)

onMounted(async () => {
  await Promise.all([fetchData(), fetchChapterData()])
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

const fetchChapterData = async () => {
  try {
    const chapterId = route.params.id
    const response = await fetch(getApiUrl(`/chapters/${chapterId}`))
    if (!response.ok) throw new Error('Failed to fetch chapter data')

    const data = await response.json()

    // Transform the data to match the form component's expected format
    chapterData.value = {
      chapterName: data.name,
      topics: data.topics.map((topic: { name: string }) => topic.name),
    }
  } catch (error) {
    console.error('Error fetching chapter data:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load chapter data',
      type: 'error',
    })
    router.push({
      name: 'subjectSyllabus',
      params: { id: route.query.subject as string },
      query: route.query,
    })
  }
}

const updateChapter = async (formData: ChapterData) => {
  try {
    const chapterId = route.params.id

    // Update chapter name
    const chapterResponse = await fetch(getApiUrl(`/chapters/${chapterId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.chapterName,
      }),
    })

    if (!chapterResponse.ok) throw new Error('Failed to update chapter')

    // Get existing topics to compare
    const existingTopicsResponse = await fetch(getApiUrl(`/topics?chapterId=${chapterId}`))
    if (!existingTopicsResponse.ok) throw new Error('Failed to fetch existing topics')
    const existingTopics = await existingTopicsResponse.json()

    // Update or create topics
    await Promise.all(
      formData.topics.map(async (topicName, index) => {
        const existingTopic = existingTopics[index]
        const topicData = {
          name: topicName.trim(),
          sequential_topic_number: index + 1,
        }

        if (existingTopic) {
          // Update existing topic
          const response = await fetch(getApiUrl(`/topics/${existingTopic.id}`), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(topicData),
          })
          if (!response.ok) throw new Error(`Failed to update topic: ${topicName}`)
        } else {
          // Create new topic
          const response = await fetch(getApiUrl('/topics'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...topicData,
              chapter_id: chapterId,
            }),
          })
          if (!response.ok) throw new Error(`Failed to create topic: ${topicName}`)
        }
      }),
    )

    // Delete any extra existing topics
    if (existingTopics.length > formData.topics.length) {
      await Promise.all(
        existingTopics.slice(formData.topics.length).map(async (topic: { id: number }) => {
          const response = await fetch(getApiUrl(`/topics/${topic.id}`), {
            method: 'DELETE',
          })
          if (!response.ok) throw new Error(`Failed to delete topic: ${topic.id}`)
        }),
      )
    }

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter updated successfully',
      type: 'success',
    })

    router.push({
      name: 'subjectSyllabus',
      params: { id: route.query.subject as string },
      query: route.query,
    })
  } catch (error) {
    console.error('Error updating chapter:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update chapter',
      type: 'error',
    })
  }
}
</script>

<style scoped>
@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
