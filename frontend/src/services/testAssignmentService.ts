import axiosInstance from '@/config/axios'

export interface StudentAssignedTest {
  id: number
  title: string
  status: 'upcoming' | 'active' | 'completed' | 'absent'
  dueDate: string
  availableDate: string
  duration: number
  questions: number
  maxScore: number
  progress: number
  remainingTime: string
  subject: string
  standard: string
  assignedBy: string
}

class TestAssignmentService {
  async getStudentAssignedTests(status?: string): Promise<StudentAssignedTest[]> {
    try {
      const params = status ? `?status=${status}` : ''
      const response = await axiosInstance.get(`/test-assignments/student/my-tests${params}`)
      return response.data
    } catch (error) {
      console.error('Error fetching assigned tests:', error)
      throw new Error('Failed to fetch assigned tests. Please try again.')
    }
  }

  // Utility method to get status display text
  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'Upcoming'
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      case 'absent':
        return 'Absent'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Utility method to get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'bg-info'
      case 'active':
        return 'bg-success'
      case 'completed':
        return 'bg-primary'
      case 'absent':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  // Utility method to format remaining time
  formatRemainingTime(remainingTime: string): string {
    if (!remainingTime || remainingTime === '0:00') {
      return 'Time expired'
    }
    return `${remainingTime} remaining`
  }
}

export const testAssignmentService = new TestAssignmentService()
export default testAssignmentService 