import { useState, useRef } from 'react';

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

interface InputFormProps {
  onSubmit: (documents: Document[], apiKey?: string, options?: GenerationOptions) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const pdfDocInputRef = useRef<HTMLInputElement>(null);
  const pptInputRef = useRef<HTMLInputElement>(null);
  
  const [options, setOptions] = useState<GenerationOptions>({
    overview: true,
    topics: true,
    key_concepts: true,
    example_problems: true,
    flashcards: true,
    external_resources: true,
  });

  const validateFile = (file: File, type: 'pdf-doc' | 'ppt'): string | null => {
    const maxSize = type === 'pdf-doc' ? 15 * 1024 * 1024 : 30 * 1024 * 1024; // 15MB for PDF/DOC, 30MB for PPT
    
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`;
    }
    
    if (documents.length >= 5) {
      return 'Maximum 5 documents allowed';
    }
    
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'pdf-doc' | 'ppt') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, fileType);
    if (validationError) {
      setError(validationError);
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const newDoc: Document = {
      id: Date.now().toString(),
      type: 'file',
      fileType,
      file,
      name: file.name,
      size: `${sizeInMB} MB`
    };

    setDocuments(prev => [...prev, newDoc]);
    setError(null);
    
    // Reset input
    if (e.target) e.target.value = '';
  };

  const handleTextSave = () => {
    if (!textInput.trim()) {
      setError('Text cannot be empty');
      return;
    }

    if (textInput.length > 10000) {
      setError('Text too long. Maximum 10,000 characters');
      return;
    }

    if (documents.length >= 5) {
      setError('Maximum 5 documents allowed');
      return;
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      type: 'text',
      content: textInput,
      name: 'Manual Text Input',
      size: `${textInput.length} chars`
    };

    setDocuments(prev => [...prev, newDoc]);
    setTextInput('');
    setShowTextModal(false);
    setError(null);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (documents.length === 0) {
      setError('Please add at least one document or text input');
      return;
    }

    onSubmit(documents, apiKey.trim() || undefined, options);
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
            Upload documents or enter text to generate comprehensive study materials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Method Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add Study Source
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => pdfDocInputRef.current?.click()}
                disabled={isLoading || documents.length >= 5}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">PDF / DOC</span>
                <span className="text-xs text-gray-500 mt-1">Max 15MB</span>
              </button>

              <button
                type="button"
                onClick={() => pptInputRef.current?.click()}
                disabled={isLoading || documents.length >= 5}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">PowerPoint</span>
                <span className="text-xs text-gray-500 mt-1">Max 30 slides</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTextModal(true)}
                disabled={isLoading || documents.length >= 5}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Enter Text</span>
                <span className="text-xs text-gray-500 mt-1">Max 10k chars</span>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={pdfDocInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e, 'pdf-doc')}
              className="hidden"
            />
            <input
              ref={pptInputRef}
              type="file"
              accept=".ppt,.pptx"
              onChange={(e) => handleFileSelect(e, 'ppt')}
              className="hidden"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Document Manager */}
          {documents.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Study Sources:</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {doc.type === 'file' ? (
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      disabled={isLoading}
                      className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {documents.length} / 5 documents added
              </p>
            </div>
          )}

          {/* API Key Section */}
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
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Choose what to generate:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleCheckboxChange(key as keyof GenerationOptions)}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || documents.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 flex-shrink-0 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <p>💡 Tip: You can combine multiple sources for comprehensive study materials!</p>
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Enter Text Manually</h2>
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setTextInput('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste or type your course content, notes, or syllabus here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={10000}
              />
              <p className="text-xs text-gray-500 mt-2">
                {textInput.length} / 10,000 characters
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setTextInput('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}