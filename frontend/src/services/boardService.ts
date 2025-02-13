import { getApiUrl } from '@/utils/api'
import type { Board } from '@/models/Board'

export const fetchBoardDetails = async (boardId: number): Promise<Board | null> => {
  try {
    const response = await fetch(getApiUrl(`/boards/${boardId}`))
    if (!response.ok) {
      console.error('Failed to fetch board details')
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching board details:', error)
    return null
  }
}
