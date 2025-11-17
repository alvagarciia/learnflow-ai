import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { StudyPack } from '../services/api';

interface GenerationOptions {
  overview: boolean;
  topics: boolean;
  key_concepts: boolean;
  example_problems: boolean;
  flashcards: boolean;
  external_resources: boolean;
}

interface Document {
  id: string;
  type: 'file' | 'text';
  fileType?: 'pdf-doc' | 'ppt';
  file?: File;
  content?: string;
  name: string;
  size: string;
}

interface LocationState {
  documents: Document[];
  apiKey?: string;
  options?: GenerationOptions;
}

interface ResultsViewProps {
  onReset: () => void;
}

export default function ResultsView({ onReset }: ResultsViewProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [studyPack, setStudyPack] = useState<StudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState({
    topics: false,
    keyConcepts: false,
    problems: false,
    flashcards: false,
    resources: false,
  });
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const generateStudyPack = async () => {
      const state = location.state as LocationState;
      
      // If no state, redirect back to generate page
      if (!state || !state.documents) {
        navigate('/generate');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Collect text inputs separately to combine them
        let combinedText = '';
        
        // Add files and collect text
        state.documents.forEach(doc => {
          if (doc.type === 'file' && doc.file) {
            formData.append('files', doc.file);
          } else if (doc.type === 'text' && doc.content) {
            combinedText += (combinedText ? '\n\n' : '') + doc.content;
          }
        });
        
        // Add combined text if exists
        if (combinedText) {
          formData.append('text', combinedText);
        }
        
        // Add API key if provided
        if (state.apiKey) {
          formData.append('api_key', state.apiKey);
        }
        
        // Add selected sections as JSON string
        if (state.options) {
          formData.append('selectedSections', JSON.stringify(state.options));
        }

        const response = await api.generateStudyPackWithFiles(formData);

        if (response && response.success && response.data) {
          setStudyPack(response.data);
        } else {
          setError(response?.error || 'Failed to generate study pack');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    generateStudyPack();
  }, [location, navigate]);

  const toggleSection = (section: keyof typeof collapsed) => {
    setCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFlashcard = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Study Pack</h2>
              <p className="text-gray-600">This may take a minute... AI is analyzing your materials</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              <span>Processing your content with AI...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">⚠️ Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We couldn't generate your study pack. This might be due to:
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-1 mb-4 inline-block">
                <li>• File too large or unsupported format</li>
                <li>• Connection timeout</li>
                <li>• Server temporarily unavailable</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-6">
                <strong>Error details:</strong> {error}
              </div>
            </div>
            <button
              onClick={onReset}
              className="w-full max-w-sm bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ← Back to Uploads
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - display study pack
  if (!studyPack) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {studyPack.course_name}
          </h1>
          <p className="text-gray-600">{studyPack.overview}</p>
        </div>

        {/* Topics */}
        {studyPack.topics?.length > 0 && (
          <section className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('topics')}
            >
              <h2 className="text-2xl font-bold text-gray-900">📚 Topics</h2>
              <svg 
                className="w-6 h-6 flex-shrink-0 text-gray-600 transition-transform duration-200"
                style={{ transform: collapsed.topics ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${collapsed.topics ? 'max-h-0' : 'max-h-[5000px]'}`}>
              <div className="grid gap-4 md:grid-cols-2">
                {studyPack.topics.map((topic, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{topic.summary}</p>
                    <ul className="space-y-1">
                      {topic.key_points.map((point, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Key Concepts */}
        {studyPack.key_concepts?.length > 0 && (
          <section className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('keyConcepts')}
            >
              <h2 className="text-2xl font-bold text-gray-900">🔑 Key Concepts</h2>
              <svg 
                className="w-6 h-6 flex-shrink-0 text-gray-600 transition-transform duration-200"
                style={{ transform: collapsed.keyConcepts ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${collapsed.keyConcepts ? 'max-h-0' : 'max-h-[5000px]'}`}>
              <div className="space-y-3">
                {studyPack.key_concepts.map((concept, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <h3 className="font-semibold text-lg mb-1">{concept.term}</h3>
                    <p className="text-gray-700 mb-2">{concept.definition}</p>
                    <p className="text-sm text-gray-600 italic">
                      <strong>Why it matters:</strong> {concept.importance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Practice Problems */}
        {studyPack.example_problems?.length > 0 && (
          <section className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('problems')}
            >
              <h2 className="text-2xl font-bold text-gray-900">💪 Practice Problems</h2>
              <svg 
                className="w-6 h-6 flex-shrink-0 text-gray-600 transition-transform duration-200"
                style={{ transform: collapsed.problems ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${collapsed.problems ? 'max-h-0' : 'max-h-[5000px]'}`}>
              <div className="space-y-4">
                {studyPack.example_problems.map((problem, idx) => (
                  <details key={idx} className="border border-gray-200 rounded-lg p-4">
                    <summary className="cursor-pointer font-semibold text-gray-900 flex justify-between items-center">
                      <span>Problem {idx + 1}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Question:</p>
                        <p className="text-gray-800">{problem.question}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Answer:</p>
                        <p className="text-gray-800">{problem.answer}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Flashcards */}
        {studyPack.flashcards?.length > 0 && (
          <section className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('flashcards')}
            >
              <h2 className="text-2xl font-bold text-gray-900">🃏 Flashcards</h2>
              <svg 
                className="w-6 h-6 flex-shrink-0 text-gray-600 transition-transform duration-200"
                style={{ transform: collapsed.flashcards ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${collapsed.flashcards ? 'max-h-0' : 'max-h-[5000px]'}`}>
              <p className="text-sm text-gray-500 mb-3">💡 Click on cards to flip and reveal answers</p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {studyPack.flashcards.map((card, idx) => (
                  <div 
                    key={idx} 
                    className="perspective h-40 cursor-pointer"
                    onClick={() => toggleFlashcard(idx)}
                  >
                    <div 
                      className="relative w-full h-full transition-transform duration-500 transform-style-3d"
                      style={{ transform: flippedCards.has(idx) ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                      <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 flex items-center justify-center text-center">
                        <p className="text-sm font-medium">{card.front}</p>
                      </div>
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-lg p-4 flex items-center justify-center text-center">
                        <p className="text-sm">{card.back}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* External Resources */}
        {studyPack.external_resources && studyPack.external_resources.length > 0 && (
          <section>
            <div 
              className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('resources')}
            >
              <h2 className="text-2xl font-bold text-gray-900">🔗 Further Reading</h2>
              <svg 
                className="w-6 h-6 flex-shrink-0 text-gray-600 transition-transform duration-200"
                style={{ transform: collapsed.resources ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${collapsed.resources ? 'max-h-0' : 'max-h-[5000px]'}`}>
              <p className="text-sm text-gray-500 mb-3">💡 Here are a few external resources to help you dive deeper</p>
              <div className="space-y-2">
                {studyPack.external_resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-blue-600 mb-1 flex items-center gap-1">
                      {resource.title}
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <button
            onClick={onReset}
            className="w-full text-lg bg-blue-600 text-white mt-5 py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          > New Study Pack
          </button>
      </div>
    </div>
  );
}