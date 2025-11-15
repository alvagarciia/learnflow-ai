import { useState } from 'react'
import InputForm from './components/InputForm'
import ResultsView from './components/ResultsView'
import './App.css'

interface StudyPackResult {
  topic: string
  summary?: {
    content: string
    key_points: string[]
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
}

function App() {
  const [result, setResult] = useState<StudyPackResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFormSubmit = async (data: StudyPackResult) => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setResult(data)
    setIsLoading(false)
  }

  const handleReset = () => {
    setResult(null)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 Study Kit AI</h1>
        <p>Auto-generate summaries, flashcards, and quizzes from your content</p>
      </header>
      
      <main className="app-main">
        {!result ? (
          <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        ) : (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by AI | Study smarter, not harder</p>
      </footer>
    </div>
  )
}

export default App
