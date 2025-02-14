<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/teacher" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Add New Teacher</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <TeacherFormComponent @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TeacherFormComponent from '@/components/forms/TeacherFormComponent.vue'
import type { TeacherFormData } from '@/models/Teacher'
import { getApiUrl } from '@/config/api'

const router = useRouter()

const handleSubmit = async (data: {
  formData: TeacherFormData
  changes: Array<{ type: string; message: string }>
}) => {
  console.log('AddTeacher: Starting form submission with data:', data.formData)
  try {
    // Step 1: Create the user
    const userResponse = await fetch(getApiUrl('/users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: 'Testvista@123',
        email_id: data.formData.emailId,
        name: data.formData.name,
        contact_number: data.formData.contactNumber,
        alternate_contact_number: data.formData.alternateContactNumber || undefined,
        highest_qualification: data.formData.highestQualification,
        status: true,
      }),
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      throw new Error(`Failed to create user: ${JSON.stringify(errorData)}`)
    }

    const userData = await userResponse.json()
    const userId = userData.id

    // Step 2: Assign TEACHER role
    const rolesResponse = await fetch(getApiUrl('/roles'))
    if (!rolesResponse.ok) throw new Error('Failed to fetch roles')
    const roles = await rolesResponse.json()
    const teacherRole = roles.find((role: { role_name: string }) => role.role_name === 'TEACHER')
    if (!teacherRole) throw new Error('Teacher role not found')

    await fetch(getApiUrl('/user-roles'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        role_id: teacherRole.id,
      }),
    })

    // Step 3: Create school assignment
    await fetch(getApiUrl('/user-schools'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        school_id: data.formData.schoolId,
        start_date: new Date().toISOString(),
        end_date: null,
      }),
    })

    // Step 4: Create teacher subjects
    for (const subject of data.formData.teacherSubjects) {
      await fetch(getApiUrl('/teacher-subjects'), {
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
    }

    console.log('AddTeacher: Form submission completed successfully')
    router.push('/admin/teacher')
  } catch (error) {
    console.error('AddTeacher: Error in form submission:', error)
    alert('Failed to create teacher. Please try again.')
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
