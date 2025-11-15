/**
 * API service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

interface StudyPackRequest {
  topic: string
  content: string
  pack_type: 'summary' | 'flashcards' | 'quiz' | 'all'
}

interface StudyPackResponse {
  topic: string
  summary?: {
    content: string
    key_points: string[]
    word_count: number
  }
  flashcards?: Array<{
    question: string
    answer: string
    difficulty: string
  }>
  quiz_questions?: Array<{
    question: string
    options: string[]
    correct_answer: string
    explanation?: string
  }>
  status: string
}

/**
 * Generate a study pack from the provided content
 */
export async function generateStudyPack(data: StudyPackRequest): Promise<StudyPackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-study-pack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error generating study pack:', error)
    throw error
  }
}

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<{ status: string; service: string }> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error checking health:', error)
    throw error
  }
}

/**
 * Upload a file for processing
 */
export async function uploadFile(file: File): Promise<any> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}
