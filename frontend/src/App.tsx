import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';

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
  const navigate = useNavigate();

  const handleGenerate = (documents: Document[], apiKey?: string, options?: GenerationOptions) => {
    // Navigate immediately to ResultsView with the input data
    navigate('/results', {
      state: {
        documents,
        apiKey,
        options
      }
    });
  };

  const handleReset = () => {
    navigate('/generate');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <Routes>
          <Route path="/" element={<InputForm onSubmit={handleGenerate} />} />
          <Route path="/generate" element={<InputForm onSubmit={handleGenerate} />} />
          <Route path="/results" element={<ResultsView onReset={handleReset} />} />
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