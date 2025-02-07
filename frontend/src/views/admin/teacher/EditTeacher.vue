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
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
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

interface SubjectResponse {
  id: number
  school_standard_id: number
  medium_standard_subject_id: number
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
      id: number
      name: string
    }
    instruction_medium: {
      id: number
      instruction_medium: string
    }
  }
}

const router = useRouter()
const route = useRoute()
const teacherData = ref<TeacherFormData | null>(null)

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
})

const handleSubmit = async (data: {
  formData: TeacherFormData
  changes: Array<{ type: string; message: string }>
}) => {
  try {
    console.log('EditTeacher: Starting form submission with data:', data)
    const { formData, changes } = data

    // If no changes detected, just redirect
    if (changes.length === 0) {
      console.log('No changes detected, returning to dashboard')
      router.push('/admin/teacher')
      return
    }

    const userId = route.params.id

    // 1. Update user information if basic details changed
    const hasBasicInfoChanges = changes.some(
      (change) =>
        change.message.startsWith('Name:') ||
        change.message.startsWith('Email:') ||
        change.message.startsWith('Contact Number:') ||
        change.message.startsWith('Alternate Contact:') ||
        change.message.startsWith('Qualification:'),
    )

    if (hasBasicInfoChanges) {
      console.log('Updating user basic information')
      const userResponse = await fetch(getApiUrl(`/users/${userId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email_id: formData.emailId,
          contact_number: formData.contactNumber,
          alternate_contact_number: formData.alternateContactNumber,
          highest_qualification: formData.highestQualification,
        }),
      })

      if (!userResponse.ok) {
        throw new Error('Failed to update user data')
      }
    }

    // 2. Update school assignment if school changed
    const schoolChange = changes.find((change) => change.message.startsWith('School:'))
    if (schoolChange) {
      // Get current school assignment
      const currentSchool = await fetch(getApiUrl(`/user-schools/user/${userId}`))
      const schoolData = await currentSchool.json()

      if (schoolData[0]) {
        // End current school assignment
        const endResponse = await fetch(
          getApiUrl(`/user-schools/user/${userId}/school/${schoolData[0].school_id}`),
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              end_date: new Date().toISOString(),
            }),
          },
        )
        if (!endResponse.ok) {
          throw new Error('Failed to end current school assignment')
        }

        // Create new school assignment
        const newSchoolResponse = await fetch(getApiUrl('/user-schools'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            school_id: formData.schoolId,
            start_date: new Date().toISOString(),
          }),
        })
        if (!newSchoolResponse.ok) {
          throw new Error('Failed to create new school assignment')
        }
      }
    }

    // 3. Update subject assignments if subjects changed
    const subjectChanges = changes.filter(
      (change) => change.message.includes('Subject') || change.message.includes('Standard'),
    )

    if (subjectChanges.length > 0) {
      // Get current subjects
      const currentSubjects = await fetch(getApiUrl(`/teacher-subjects?userId=${userId}`))
      const subjectsData: SubjectResponse[] = await currentSubjects.json()

      // Handle removed subjects
      for (const subject of subjectsData) {
        if (
          !formData.teacherSubjects.some(
            (ts) =>
              ts.schoolStandardId === subject.school_standard_id &&
              ts.mediumStandardSubjectId === subject.medium_standard_subject_id,
          )
        ) {
          const deleteResponse = await fetch(getApiUrl(`/teacher-subjects/${subject.id}`), {
            method: 'DELETE',
          })
          if (!deleteResponse.ok) {
            throw new Error('Failed to delete subject assignment')
          }
        }
      }

      // Add new subjects
      for (const subject of formData.teacherSubjects) {
        if (
          !subjectsData.some(
            (s) =>
              s.school_standard_id === subject.schoolStandardId &&
              s.medium_standard_subject_id === subject.mediumStandardSubjectId,
          )
        ) {
          const addResponse = await fetch(getApiUrl('/teacher-subjects'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              school_standard_id: subject.schoolStandardId,
              medium_standard_subject_id: subject.mediumStandardSubjectId,
            }),
          })
          if (!addResponse.ok) {
            throw new Error('Failed to add subject assignment')
          }
        }
      }
    }

    router.push('/admin/teacher')
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
