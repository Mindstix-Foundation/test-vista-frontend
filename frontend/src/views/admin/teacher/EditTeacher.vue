<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/teacher" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Teacher Information</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <TeacherFormComponent v-if="teacherData" :initial-data="teacherData" @submit="handleSubmit" />
      <div v-else class="text-center">
        <output class="spinner-border">
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>
    </div>

    <!-- Operation Result Modal -->
    <div
      class="modal fade"
      id="operationResultModal"
      tabindex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Operation Results</h5>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              <li
                v-for="(result, index) in operationResults"
                :key="index"
                class="list-group-item d-flex justify-content-between align-items-start"
                :class="{
                  'text-success': result.status === 'success',
                  'text-danger': result.status === 'error',
                }"
              >
                <div class="ms-2 me-auto">
                  <div>{{ result.operation }}</div>
                  <div v-if="result.status === 'error'" class="text-danger small">
                    Error: {{ result.message }}
                  </div>
                </div>
                <span
                  class="badge rounded-pill"
                  :class="{
                    'bg-success': result.status === 'success',
                    'bg-danger': result.status === 'error',
                  }"
                >
                  {{ result.status }}
                </span>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-dark" @click="cleanupAndNavigate">
              Go to Teacher List
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TeacherFormComponent from '@/components/forms/TeacherFormComponent.vue'
import type { TeacherFormData } from '@/models/Teacher'
import { getApiUrl } from '@/config/api'
import * as bootstrap from 'bootstrap'

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

interface UserData {
  name: string
  email_id: string
  contact_number: number
  alternate_contact_number?: number
  highest_qualification?: string
}

interface SchoolAssignment {
  end_date: string | null
  school: {
    id: number
    name: string
  }
}

interface SchoolStandard {
  standard_id: number
  standard: {
    id: number
    name: string
  }
}

interface TeacherSubject {
  school_standard: {
    id: number
    standard: {
      id: number
      name: string
    }
  }
  medium_standard_subject: {
    id: number
    subject: {
      name: string
    }
  }
}

interface TeacherSubjectWithId {
  id: number
  school_standard: {
    id: number
    standard: {
      id: number
      name: string
    }
  }
  medium_standard_subject: {
    id: number
    subject: {
      name: string
    }
  }
}

const router = useRouter()
const route = useRoute()
const teacherData = ref<TeacherFormData | null>(null)
const operationResults = ref<OperationResult[]>([])
let operationResultModal: bootstrap.Modal | null = null

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json()
    return data.message || data.error || 'Unknown error occurred'
  } catch {
    return 'Failed to parse error message'
  }
}

const fetchTeacherData = async (id: string) => {
  try {
    // Fetch user data
    const userResponse = await fetch(getApiUrl(`/users/${id}`))
    if (!userResponse.ok) throw new Error('Failed to fetch user data')
    const userData: UserData = await userResponse.json()

    // Fetch school data
    const schoolResponse = await fetch(getApiUrl(`/user-schools/user/${id}`))
    if (!schoolResponse.ok) throw new Error('Failed to fetch school data')
    const schoolData = await schoolResponse.json()
    const activeSchool = schoolData.find((s: SchoolAssignment) => !s.end_date)
    if (!activeSchool) throw new Error('No active school assignment found')

    // Fetch standards from school standard table
    const schoolStandardsResponse = await fetch(
      getApiUrl(`/school-standards/school/${activeSchool.school.id}`),
    )
    if (!schoolStandardsResponse.ok) throw new Error('Failed to fetch school standards')
    const schoolStandards: SchoolStandard[] = await schoolStandardsResponse.json()

    // Fetch teacher subjects
    const subjectsResponse = await fetch(getApiUrl(`/teacher-subjects?userId=${id}`))
    if (!subjectsResponse.ok) throw new Error('Failed to fetch teacher subjects')
    const subjectsData: TeacherSubject[] = await subjectsResponse.json()

    // Process and group subjects by standard
    const standardSubjects = new Map()
    subjectsData.forEach((subject: TeacherSubject) => {
      const standardId = subject.school_standard.standard.id
      const standardName = subject.school_standard.standard.name
      if (!standardSubjects.has(standardId)) {
        standardSubjects.set(standardId, {
          name: standardName,
          subjects: [],
        })
      }
      standardSubjects.get(standardId).subjects.push({
        id: subject.medium_standard_subject.id,
        name: subject.medium_standard_subject.subject.name,
      })
    })

    // Convert Map to array format for component
    const groupedSubjectsArray = Array.from(standardSubjects.entries()).map(
      ([standardId, data]: [
        number,
        { name: string; subjects: Array<{ id: number; name: string }> },
      ]) => ({
        standardId,
        standardName: data.name,
        subjects: data.subjects,
      }),
    )

    // Prepare form data
    teacherData.value = {
      name: userData.name,
      emailId: userData.email_id,
      contactNumber: userData.contact_number.toString(),
      alternateContactNumber: userData.alternate_contact_number?.toString(),
      highestQualification: userData.highest_qualification || '',
      schoolId: activeSchool.school.id,
      boardId: activeSchool.school.board_id,
      teacherSubjects: subjectsData.map((subject: TeacherSubject) => ({
        schoolStandardId: subject.school_standard.id,
        mediumStandardSubjectId: subject.medium_standard_subject.id,
      })),
      userId: parseInt(id),
      groupedSubjects: groupedSubjectsArray,
      schoolStandards: schoolStandards.map((standard: SchoolStandard) => ({
        id: standard.standard_id,
        name: standard.standard.name,
        standard: standard.standard,
      })),
    }

    console.log('Teacher data prepared:', teacherData.value)
  } catch (error) {
    console.error('Error fetching teacher data:', error)
    router.push('/admin/teacher')
  }
}

onMounted(async () => {
  const teacherId = route.params.id as string
  if (!teacherId) {
    router.push('/admin/teacher')
    return
  }

  await fetchTeacherData(teacherId)
  operationResultModal = new bootstrap.Modal(document.getElementById('operationResultModal')!)
})

const updateUserData = async (userId: string, formData: TeacherFormData) => {
  const response = await fetch(getApiUrl(`/users/${userId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email_id: formData.emailId,
      contact_number: formData.contactNumber,
      alternate_contact_number: formData.alternateContactNumber,
      highest_qualification: formData.highestQualification,
    }),
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new Error(errorMessage)
  }
}

const updateSchoolAssignment = async (userId: string, schoolId: number) => {
  const currentSchool = await fetch(getApiUrl(`/user-schools/user/${userId}`))
  const schoolData = await currentSchool.json()

  if (!schoolData[0]) return

  // End current assignment
  const endResponse = await fetch(
    getApiUrl(`/user-schools/user/${userId}/school/${schoolData[0].school_id}`),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ end_date: new Date().toISOString() }),
    },
  )
  if (!endResponse.ok) {
    const errorMessage = await getErrorMessage(endResponse)
    throw new Error(errorMessage)
  }

  // Create new assignment
  const newResponse = await fetch(getApiUrl('/user-schools'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      school_id: schoolId,
      start_date: new Date().toISOString(),
    }),
  })
  if (!newResponse.ok) {
    const errorMessage = await getErrorMessage(newResponse)
    throw new Error(errorMessage)
  }
}

const deleteSubject = async (subjectId: number) => {
  const response = await fetch(getApiUrl(`/teacher-subjects/${subjectId}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new Error(errorMessage)
  }
}

const addSubject = async (
  userId: string,
  schoolStandardId: number,
  mediumStandardSubjectId: number,
) => {
  const response = await fetch(getApiUrl('/teacher-subjects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      school_standard_id: schoolStandardId,
      medium_standard_subject_id: mediumStandardSubjectId,
    }),
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new Error(errorMessage)
  }
}

const cleanupAndNavigate = () => {
  operationResultModal?.hide()
  router.push('/admin/teacher')
}

// Add helper function to format operation messages
const formatOperationMessage = (operation: string, isResult: boolean) => {
  if (!isResult) return operation // Return as is for confirmation modal

  // Convert to past tense for result modal
  if (operation.startsWith('Add ')) {
    return operation.replace('Add ', 'Added ')
  }
  if (operation.startsWith('Remove ')) {
    return operation.replace('Remove ', 'Removed ')
  }
  if (operation.startsWith('Update ')) {
    return operation.replace('Update ', 'Updated ')
  }
  return operation
}

const handleSubmit = async (data: {
  formData: TeacherFormData
  changes: Array<{ type: string; message: string }>
}) => {
  try {
    operationResults.value = []
    const userId = route.params.id as string
    const { formData, changes } = data

    // Only update user data if there are changes to basic information
    const hasBasicInfoChanges = changes.some((change) =>
      ['Name:', 'Email:', 'Contact Number:', 'Alternate Contact:', 'Qualification:'].some(
        (prefix) => change.message.startsWith(prefix),
      ),
    )

    if (hasBasicInfoChanges) {
      try {
        await updateUserData(userId, formData)
        operationResults.value.push({
          operation: formatOperationMessage('Update Teacher Information', true),
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: formatOperationMessage('Update Teacher Information', false),
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update teacher information',
        })
      }
    }

    // Update school assignment if changed
    if (formData.schoolId !== teacherData.value?.schoolId) {
      try {
        await updateSchoolAssignment(userId, formData.schoolId)
        operationResults.value.push({
          operation: formatOperationMessage('Update School Assignment', true),
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: formatOperationMessage('Update School Assignment', false),
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update school assignment',
        })
      }
    }

    // Handle subject changes
    const currentSubjects = await fetch(getApiUrl(`/teacher-subjects?userId=${userId}`))
    const subjectsData: TeacherSubjectWithId[] = await currentSubjects.json()
    const newSubjects = formData.teacherSubjects

    // Find subjects to remove
    const subjectsToRemove = subjectsData.filter(
      (current) =>
        !newSubjects.some(
          (newSubj) =>
            newSubj.schoolStandardId === current.school_standard.id &&
            newSubj.mediumStandardSubjectId === current.medium_standard_subject.id,
        ),
    )

    // Find subjects to add
    const subjectsToAdd = newSubjects.filter(
      (newSubj) =>
        !subjectsData.some(
          (current) =>
            current.school_standard.id === newSubj.schoolStandardId &&
            current.medium_standard_subject.id === newSubj.mediumStandardSubjectId,
        ),
    )

    // Process removals
    for (const subject of subjectsToRemove) {
      try {
        await deleteSubject(subject.id)
        const standardName = subject.school_standard.standard.name
        const subjectName = subject.medium_standard_subject.subject.name
        const operation = `Remove "${subjectName}" from Standard ${standardName}`
        operationResults.value.push({
          operation: formatOperationMessage(operation, true),
          status: 'success',
        })
      } catch (error) {
        const standardName = subject.school_standard.standard.name
        const subjectName = subject.medium_standard_subject.subject.name
        const operation = `Remove "${subjectName}" from Standard ${standardName}`
        operationResults.value.push({
          operation: formatOperationMessage(operation, false),
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to remove subject assignment',
        })
      }
    }

    // Process additions
    for (const subject of subjectsToAdd) {
      try {
        await addSubject(userId, subject.schoolStandardId, subject.mediumStandardSubjectId)

        // Find the school standard to get the standard name
        const schoolStandard = await fetch(
          getApiUrl(`/school-standards/${subject.schoolStandardId}`),
        )
        const schoolStandardData = await schoolStandard.json()
        const standardName = schoolStandardData.standard.name

        // Find the subject info
        const subjectResponse = await fetch(
          getApiUrl(`/medium-standard-subjects/${subject.mediumStandardSubjectId}`),
        )
        const subjectData = await subjectResponse.json()
        const subjectName = subjectData.subject.name

        const operation = `Add "${subjectName}" to Standard ${standardName}`
        operationResults.value.push({
          operation: formatOperationMessage(operation, true),
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: 'Add Subject',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to add subject assignment',
        })
      }
    }

    // Show the results modal if there were any operations
    if (operationResults.value.length > 0) {
      operationResultModal?.show()
    } else {
      // If no changes were made, just navigate back
      router.push('/admin/teacher')
    }
  } catch (error) {
    console.error('Error updating teacher:', error)
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
