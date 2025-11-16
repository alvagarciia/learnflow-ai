import { useState } from 'react';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import { api } from './services/api';
import type { StudyPack } from './services/api';

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

function App() {
  const [studyPack, setStudyPack] = useState<StudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (documents: Document[], apiKey?: string, options?: GenerationOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, combine all text content as a single input
      // File handling will be implemented in backend later
      const combinedText = documents.map(doc => {
        if (doc.type === 'text') {
          return doc.content;
        } else {
          return `[File: ${doc.name}]`;
        }
      }).join('\n\n');

      const response = await api.generateStudyPack({ 
        input: combinedText,
        api_key: apiKey,
        selectedSections: options,
        documents: documents // Pass documents for future file upload support
      });

      if (response && response.success && response.data) {
        console.log('Study pack received:', response.data);
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

  const handleReset = () => {
    setStudyPack(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {error && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
            <svg className="w-5 h-5 flex-shrink-0 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!studyPack ? (
        <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
      ) : (
        <ResultsView studyPack={studyPack} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;