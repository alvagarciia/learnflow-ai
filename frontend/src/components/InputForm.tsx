import { useState, FormEvent } from 'react'
import { generateStudyPack } from '../services/api'

interface InputFormProps {
  onSubmit: (data: any) => void
  isLoading: boolean
}

const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [packType, setPackType] = useState<'summary' | 'flashcards' | 'quiz' | 'all'>('all')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim() || !content.trim()) {
      alert('Please fill in both topic and content fields')
      return
    }

    try {
      const result = await generateStudyPack({
        topic,
        content,
        pack_type: packType
      })
      onSubmit(result)
    } catch (error) {
      console.error('Error generating study pack:', error)
      alert('Failed to generate study pack. Please try again.')
    }
  }

  return (
    <div className="input-form-container">
      <form onSubmit={handleSubmit} className="input-form">
        <h2>Create Your Study Pack</h2>
        
        <div className="form-group">
          <label htmlFor="topic">
            Topic <span className="required">*</span>
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Machine Learning Basics"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">
            Content <span className="required">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your lecture notes, slides, or any study material here..."
            rows={10}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="packType">
            Study Pack Type
          </label>
          <select
            id="packType"
            value={packType}
            onChange={(e) => setPackType(e.target.value as any)}
            disabled={isLoading}
          >
            <option value="all">All (Summary + Flashcards + Quiz)</option>
            <option value="summary">Summary Only</option>
            <option value="flashcards">Flashcards Only</option>
            <option value="quiz">Quiz Only</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Study Pack'}
        </button>
      </form>
    </div>
  )
}

export default InputForm
