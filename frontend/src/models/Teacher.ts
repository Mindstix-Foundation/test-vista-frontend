export interface TeacherFormData {
  name: string
  boardId: number
  schoolId: number
  emailId: string
  contactNumber: string
  alternateContactNumber?: string
  highestQualification: string
  teacherSubjects: Array<{
    schoolStandardId: number
    mediumStandardSubjectId: number
  }>
  userId?: number
  groupedSubjects?: Array<{
    standardId: number
    standardName: string
    subjects: Array<{
      id: number
      name: string
    }>
  }>
  schoolStandards?: Array<{
    id: number
    name: string
    standard: {
      id: number
      name: string
    }
  }>
}

export interface Teacher {
  id: number
  name: string
  emailId: string
  contactNumber: string
  alternateContactNumber?: string
  highestQualification: string
  status: boolean
  createdAt: string
  updatedAt: string
  school: {
    id: number
    name: string
  }
  teacherSubjects: Array<{
    id: number
    schoolStandardId: number
    mediumStandardSubjectId: number
    mediumStandardSubject: {
      id: number
      instructionMedium: {
        id: number
        instruction_medium: string
      }
      standard: {
        id: number
        name: string
      }
      subject: {
        id: number
        name: string
      }
    }
  }>
}

export interface TeacherRole {
  userId: number
  roleId: number
}

export interface TeacherSchool {
  userId: number
  schoolId: number
  startDate: string
  endDate?: string
}
