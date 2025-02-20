<template>
  <div class="container my-4">
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <router-link
          class="btn btn-close"
          :to="{
            name: 'syllabusStandard',
            query: {
              board: selectedBoard?.id,
              medium: selectedMedium?.id,
              standard: selectedStandard?.id,
            },
          }"
          aria-label="Close"
        />
      </div>
      <div class="row justify-content-center align-items-center my-1">
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
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <div class="row justify-content-end g-2">
            <div class="col col-6 col-sm-auto text-end">
              <button
                id="quickEditButton"
                class="btn btn-outline-dark fw-bold stick-bottom"
                @click="toggleQuickEdit"
              >
                Quick Edit
              </button>
            </div>
            <div class="col col-6 col-sm-auto text-end">
              <button
                id="addChapterButton"
                class="btn btn-success fw-bold stick-bottom"
                @click="navigateToAddChapter"
              >
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </div>

    <div class="container mt-2 pt-3 mb-5 pb-3">
      <div class="row g-2 justify-content-center align-items-center">
        <div class="col col-12 col-sm-9 p-0 m-0">
          <ol id="sortable-list" class="list-group list-group-numbered">
            <li
              v-for="chapter in chapters"
              :key="chapter.id"
              :data-chapter-id="chapter.id"
              class="list-group-item list-group-item-action d-flex justify-content-between draggable-item py-1 fs-4"
            >
              <i
                class="bi bi-grip-vertical text-secondary"
                :class="{ 'd-none': !isQuickEditMode }"
              ></i>
              <div class="container pe-0">
                <div class="row">
                  <span class="toggle-card pe-0" @click="toggleChapter(chapter.id)">
                    {{ chapter.sequential_chapter_number }}. {{ chapter.name }}
                    <i
                      class="bi fs-6 text-secondary toggle-icon"
                      :class="chapter.isExpanded ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"
                    ></i>
                  </span>
                </div>
                <div class="row">
                  <div
                    :id="'chapter-' + chapter.id"
                    class="collapse"
                    :class="{ show: chapter.isExpanded }"
                  >
                    <div class="card card-body border-0 p-0">
                      <ol class="sortable-list list-group">
                        <li
                          v-for="topic in chapter.topics"
                          :key="topic.id"
                          :data-topic-id="topic.id"
                          class="list-group-item list-group-item-action d-flex justify-content-between draggable-item py-1 fs-5"
                        >
                          <div class="col-auto">
                            <i
                              class="bi bi-grip-vertical text-secondary"
                              :class="{ 'd-none': !isQuickEditMode }"
                            ></i>
                          </div>
                          <div class="col ms-3">
                            <span
                              >{{ chapter.sequential_chapter_number }}.{{
                                topic.sequential_topic_number
                              }}. {{ topic.name }}</span
                            >
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              <a
                href="#"
                class="text-decoration-none text-black"
                @click.prevent="editChapter(chapter)"
              >
                <i class="bi bi-pencil-square" :class="{ 'd-none': !isQuickEditMode }"></i>
              </a>
              <i
                class="bi bi-trash3 ms-2"
                :class="{ 'd-none': !isQuickEditMode }"
                @click="showDeleteConfirmation(chapter)"
              ></i>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      aria-labelledby="deleteConfirmationModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Remove Chapter</h5>
          </div>
          <div class="modal-body">Are you sure you want to delete this Chapter from Syllabus?</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              style="border: 1px solid gray"
              id="cancelButton"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              id="deleteButton"
              @click="deleteChapter"
              data-bs-dismiss="modal"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import Sortable from 'sortablejs'
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

interface ChapterData {
  id: number
  name: string
  sequential_chapter_number: number
  isExpanded: boolean
  topics: TopicData[]
  medium_standard_subject: {
    id: number
    instruction_medium_id: number
    standard_id: number
    subject_id: number
  }
}

interface TopicData {
  id: number
  name: string
  sequential_topic_number: number
  chapter_id: number
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)
const chapters = ref<ChapterData[]>([])
const isQuickEditMode = ref(false)
const selectedChapterForDelete = ref<ChapterData | null>(null)

onMounted(async () => {
  await fetchData()
  initializeSortable()
})

const fetchData = async () => {
  try {
    // Fetch board, medium, standard, and subject details
    const boardId = route.query.board
    const mediumId = route.query.medium
    const standardId = route.query.standard
    const subjectId = route.params.id

    // Fetch board details
    const boardResponse = await fetch(getApiUrl(`/boards/${boardId}`))
    if (!boardResponse.ok) throw new Error('Failed to fetch board details')
    selectedBoard.value = await boardResponse.json()

    // Fetch medium details
    const mediumResponse = await fetch(getApiUrl(`/instruction-mediums/${mediumId}`))
    if (!mediumResponse.ok) throw new Error('Failed to fetch medium details')
    selectedMedium.value = await mediumResponse.json()

    // Fetch standard details
    const standardResponse = await fetch(getApiUrl(`/standards/${standardId}`))
    if (!standardResponse.ok) throw new Error('Failed to fetch standard details')
    selectedStandard.value = await standardResponse.json()

    // Fetch subject details
    const subjectResponse = await fetch(getApiUrl(`/subjects/${subjectId}`))
    if (!subjectResponse.ok) throw new Error('Failed to fetch subject details')
    selectedSubject.value = await subjectResponse.json()

    // Fetch chapters and topics in a single request
    const chaptersResponse = await fetch(
      getApiUrl(`/chapters?mediumStandardSubjectId=${route.params.id}`),
    )
    if (!chaptersResponse.ok) throw new Error('Failed to fetch chapters')

    // Transform the response data to match our interface
    const chaptersData = await chaptersResponse.json()
    chapters.value = chaptersData
      .map((chapter: ChapterData) => ({
        id: chapter.id,
        name: chapter.name,
        sequential_chapter_number: chapter.sequential_chapter_number,
        isExpanded: false,
        medium_standard_subject: chapter.medium_standard_subject,
        topics: chapter.topics
          .map((topic: TopicData) => ({
            id: topic.id,
            name: topic.name,
            sequential_topic_number: topic.sequential_topic_number,
            chapter_id: topic.chapter_id,
          }))
          .sort(
            (a: TopicData, b: TopicData) => a.sequential_topic_number - b.sequential_topic_number,
          ),
      }))
      .sort(
        (a: ChapterData, b: ChapterData) =>
          a.sequential_chapter_number - b.sequential_chapter_number,
      )
  } catch (error) {
    console.error('Error fetching data:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load syllabus data',
      type: 'error',
    })
  }
}

const initializeSortable = () => {
  // Initialize main chapter list sortable
  new Sortable(document.getElementById('sortable-list') as HTMLElement, {
    animation: 150,
    handle: '.bi-grip-vertical',
    onEnd: handleChapterReorder,
  })

  // Initialize topic lists sortable
  document.querySelectorAll('.sortable-list').forEach((list) => {
    new Sortable(list as HTMLElement, {
      animation: 150,
      handle: '.bi-grip-vertical',
      onEnd: handleTopicReorder,
    })
  })
}

const toggleQuickEdit = () => {
  isQuickEditMode.value = !isQuickEditMode.value
}

const toggleChapter = (chapterId: number) => {
  const chapter = chapters.value.find((c) => c.id === chapterId)
  if (chapter) {
    chapter.isExpanded = !chapter.isExpanded
  }
}

const navigateToAddChapter = () => {
  // Implement navigation to add chapter form
  router.push({
    name: 'addChapter',
    query: {
      board: selectedBoard.value?.id,
      medium: selectedMedium.value?.id,
      standard: selectedStandard.value?.id,
      subject: selectedSubject.value?.id,
    },
  })
}

const editChapter = (chapter: ChapterData) => {
  // Implement navigation to edit chapter form
  router.push({
    name: 'editChapter',
    params: { id: chapter.id.toString() },
    query: {
      board: selectedBoard.value?.id,
      medium: selectedMedium.value?.id,
      standard: selectedStandard.value?.id,
      subject: selectedSubject.value?.id,
    },
  })
}

const showDeleteConfirmation = (chapter: ChapterData) => {
  selectedChapterForDelete.value = chapter
  const modal = new Modal(document.getElementById('deleteConfirmationModal')!)
  modal.show()
}

const deleteChapter = async () => {
  if (!selectedChapterForDelete.value) return

  try {
    const response = await fetch(getApiUrl(`/chapters/${selectedChapterForDelete.value.id}`), {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete chapter')

    // Remove chapter from list
    chapters.value = chapters.value.filter((c) => c.id !== selectedChapterForDelete.value?.id)

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter deleted successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error deleting chapter:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to delete chapter',
      type: 'error',
    })
  }
}

const handleChapterReorder = async ({ item, newIndex }: Sortable.SortableEvent) => {
  try {
    if (typeof newIndex === 'undefined') return

    // Get the chapter ID from the dragged item
    const chapterId = Number(item.getAttribute('data-chapter-id'))
    // Get the subject ID from the route params
    const mediumStandardSubjectId = Number(route.params.id)

    // Make API call to update only the dragged chapter's position
    const response = await fetch(
      getApiUrl(`/chapters/reorder/${chapterId}/${mediumStandardSubjectId}`),
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequential_chapter_number: newIndex + 1,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to update chapter order')
    }

    // Store the expanded states before fetching
    const expandedStates = new Map(
      chapters.value.map((chapter) => [chapter.id, chapter.isExpanded]),
    )

    // Fetch updated chapters to get the new order
    await fetchData()

    // Restore the expanded states
    chapters.value = chapters.value.map((chapter) => ({
      ...chapter,
      isExpanded: expandedStates.get(chapter.id) || false,
    }))

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter order updated successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error updating chapter order:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update chapter order',
      type: 'error',
    })
  }
}

const handleTopicReorder = async ({ item, newIndex }: Sortable.SortableEvent) => {
  try {
    if (typeof newIndex === 'undefined') return

    // Get the parent chapter element and IDs
    const chapterElement = (item as HTMLElement).closest('.collapse')
    if (!chapterElement) return

    const chapterId = Number(chapterElement.id.replace('chapter-', ''))
    const topicId = Number(item.getAttribute('data-topic-id'))

    if (!topicId) {
      throw new Error('Failed to find topic ID')
    }

    // Make API call to update only the dragged topic's position
    const response = await fetch(getApiUrl(`/topics/reorder/${topicId}/${chapterId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sequential_topic_number: newIndex + 1,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update topic order')
    }

    // Store the expanded states before fetching
    const expandedStates = new Map(
      chapters.value.map((chapter) => [chapter.id, chapter.isExpanded]),
    )

    // Fetch updated data to get the new order
    await fetchData()

    // Restore the expanded states
    chapters.value = chapters.value.map((chapter) => ({
      ...chapter,
      isExpanded: expandedStates.get(chapter.id) || false,
    }))

    toastStore.showToast({
      title: 'Success',
      message: 'Topic order updated successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error updating topic order:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update topic order',
      type: 'error',
    })
  }
}
</script>

<style scoped>
.draggable-item {
  cursor: grab;
}

.list-group-item {
  border: none;
  padding: 0;
}

.list-number {
  min-width: 3ch;
  text-align: right;
  margin-right: 1rem;
}

/* Remove the automatic list numbering styles */
ol.list-group {
  list-style: none;
  padding-left: 0;
  counter-reset: none;
}

ol.list-group > li::before {
  content: none;
}

ol.list-group ol > li::before {
  content: none;
}

/* Mobile styles */
@media (max-width: 768px) {
  #navSyllabus {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

/* Styles for screens below 576px */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  #quickEditButton,
  #addChapterButton {
    width: 100%;
  }
}

.toggle-card {
  cursor: pointer;
}

.toggle-icon {
  transition: transform 0.2s;
}

.bi-three-dots:hover,
.bi-pencil-square:hover,
.bi-trash3:hover {
  color: #0d6efd !important;
  cursor: pointer;
}
</style>
