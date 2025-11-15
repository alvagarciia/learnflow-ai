import { useState } from 'react'

interface ResultsViewProps {
  result: {
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
  onReset: () => void
}

const ResultsView = ({ result, onReset }: ResultsViewProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary')
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(new Map())

  const toggleCard = (index: number) => {
    const newFlipped = new Set(flippedCards)
    if (newFlipped.has(index)) {
      newFlipped.delete(index)
    } else {
      newFlipped.add(index)
    }
    setFlippedCards(newFlipped)
  }

  const selectAnswer = (questionIndex: number, answer: string) => {
    const newAnswers = new Map(selectedAnswers)
    newAnswers.set(questionIndex, answer)
    setSelectedAnswers(newAnswers)
  }

  return (
    <div className="results-view-container">
      <div className="results-header">
        <h2>📖 {result.topic}</h2>
        <button onClick={onReset} className="reset-button">
          Create New Study Pack
        </button>
      </div>

      <div className="tabs">
        {result.summary && (
          <button
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
        )}
        {result.flashcards && (
          <button
            className={`tab ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            Flashcards ({result.flashcards.length})
          </button>
        )}
        {result.quiz_questions && (
          <button
            className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz ({result.quiz_questions.length})
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && result.summary && (
          <div className="summary-section">
            <div className="summary-content">
              <p>{result.summary.content}</p>
            </div>
            <div className="key-points">
              <h3>Key Points:</h3>
              <ul>
                {result.summary.key_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && result.flashcards && (
          <div className="flashcards-section">
            <div className="flashcards-grid">
              {result.flashcards.map((card, index) => (
                <div
                  key={index}
                  className={`flashcard ${flippedCards.has(index) ? 'flipped' : ''}`}
                  onClick={() => toggleCard(index)}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <p>{card.question}</p>
                      <span className="flip-hint">Click to reveal answer</span>
                    </div>
                    <div className="flashcard-back">
                      <p>{card.answer}</p>
                      <span className="difficulty-badge">{card.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && result.quiz_questions && (
          <div className="quiz-section">
            {result.quiz_questions.map((question, qIndex) => (
              <div key={qIndex} className="quiz-question">
                <h4>Question {qIndex + 1}</h4>
                <p className="question-text">{question.question}</p>
                <div className="options">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers.get(qIndex) === option
                    const isCorrect = option === question.correct_answer
                    const showResult = selectedAnswers.has(qIndex)
                    
                    return (
                      <button
                        key={oIndex}
                        className={`option ${isSelected ? 'selected' : ''} ${
                          showResult && isCorrect ? 'correct' : ''
                        } ${showResult && isSelected && !isCorrect ? 'incorrect' : ''}`}
                        onClick={() => selectAnswer(qIndex, option)}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                {selectedAnswers.has(qIndex) && question.explanation && (
                  <div className="explanation">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsView
