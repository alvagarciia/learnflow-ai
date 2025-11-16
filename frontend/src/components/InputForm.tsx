import { useState } from 'react';

interface GenerationOptions {
  overview: boolean;
  topics: boolean;
  key_concepts: boolean;
  example_problems: boolean;
  flashcards: boolean;
  external_resources: boolean;
}

interface InputFormProps {
  onSubmit: (input: string, apiKey?: string, options?: GenerationOptions) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    overview: true,
    topics: true,
    key_concepts: true,
    example_problems: true,
    flashcards: true,
    external_resources: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim(), apiKey.trim() || undefined, options);
    }
  };

  const handleCheckboxChange = (field: keyof GenerationOptions) => {
    setOptions(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Study Pack Generator
          </h1>
          <p className="text-gray-600">
            Enter a course name, syllabus, or description to generate comprehensive study materials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
              Course Information
            </label>
            <textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., 'Introduction to Machine Learning' or paste your syllabus here..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-blue-600 hover:text-blue-700 mb-2"
            >
              {showApiKey ? '− Hide' : '+ Add'} API Key (Optional)
            </button>
            
            {showApiKey && (
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your Gemini API key (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            )}
          </div>

          {/* Generation Options Checkboxes */}
          <div className="my-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Choose what to generate:</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.overview}
                  onChange={() => handleCheckboxChange('overview')}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Overview</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.topics}
                  onChange={() => handleCheckboxChange('topics')}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Topics</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.key_concepts}
                  onChange={() => handleCheckboxChange('key_concepts')}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Key Concepts</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.example_problems}
                  onChange={() => handleCheckboxChange('example_problems')}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Practice Problems</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.flashcards}
                  onChange={() => handleCheckboxChange('flashcards')}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Flashcards</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.external_resources}
                  onChange={() => handleCheckboxChange('external_resources')}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">External Resources</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Study Pack...
              </span>
            ) : (
              'Generate Study Pack'
            )}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          <p>💡 Tip: The more detailed your input, the better the study pack!</p>
        </div>
      </div>
    </div>
  );
}