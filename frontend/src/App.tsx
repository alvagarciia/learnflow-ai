import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
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

function AppContent() {
  const [studyPack, setStudyPack] = useState<StudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerate = async (documents: Document[], apiKey?: string, options?: GenerationOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Collect text inputs separately to combine them
      let combinedText = '';
      
      // Add files and collect text
      documents.forEach(doc => {
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
      if (apiKey) {
        formData.append('api_key', apiKey);
      }
      
      // Add selected sections as JSON string
      if (options) {
        formData.append('selectedSections', JSON.stringify(options));
      }

      const response = await api.generateStudyPackWithFiles(formData);

      if (response && response.success && response.data) {
        console.log('Study pack received:', response.data);
        setStudyPack(response.data);
        navigate('/results');
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
    navigate('/generate');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="flex-1 py-12 px-4">
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

        <Routes>
          <Route path="/" element={<InputForm onSubmit={handleGenerate} isLoading={isLoading} />} />
          <Route path="/generate" element={<InputForm onSubmit={handleGenerate} isLoading={isLoading} />} />
          <Route 
            path="/results" 
            element={
              studyPack ? (
                <ResultsView studyPack={studyPack} onReset={handleReset} />
              ) : (
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-gray-600">No study pack generated yet. Please generate one first.</p>
                </div>
              )
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;