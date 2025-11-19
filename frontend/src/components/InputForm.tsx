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
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [apiKey] = useState('');
  // const [showApiKey, setShowApiKey] = useState(false);
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
    const maxIndividualSize = 10 * 1024 * 1024; // 10MB per file
    const maxTotalSize = 15 * 1024 * 1024; // 15MB total
    
    // Check individual file size
    if (file.size > maxIndividualSize) {
      return `File too large. Maximum size per file: ${maxIndividualSize / (1024 * 1024)}MB`;
    }
    
    // Check maximum number of files
    if (documents.length >= 5) {
      return 'Maximum 5 documents allowed';
    }
    
    // Check total size including this new file
    const currentTotalSize = documents.reduce((sum, doc) => sum + (doc.file?.size || 0), 0);
    const newTotalSize = currentTotalSize + file.size;
    
    if (newTotalSize > maxTotalSize) {
      const currentSizeMB = (currentTotalSize / (1024 * 1024)).toFixed(1);
      const maxSizeMB = (maxTotalSize / (1024 * 1024)).toFixed(0);
      return `Total file size would exceed ${maxSizeMB}MB limit. Current total: ${currentSizeMB}MB`;
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

  // Calculate current total file size
  const totalSizeMB = (documents.reduce((sum, doc) => sum + (doc.file?.size || 0), 0) / (1024 * 1024)).toFixed(1);

  // Options configuration with icons
  const generationOptions = [
    { 
      key: 'overview' as keyof GenerationOptions, 
      label: 'Overview', 
      icon: (
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      key: 'topics' as keyof GenerationOptions, 
      label: 'Topics', 
      icon: (
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    { 
      key: 'key_concepts' as keyof GenerationOptions, 
      label: 'Key Concepts', 
      icon: (
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    { 
      key: 'example_problems' as keyof GenerationOptions, 
      label: 'Practice Problems', 
      icon: (
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    { 
      key: 'flashcards' as keyof GenerationOptions, 
      label: 'Flashcards', 
      icon: (
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      key: 'external_resources' as keyof GenerationOptions, 
      label: 'Further Reading', 
      icon: (
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stop Organizing, Start Studying.
          </h1>
          <p className="text-gray-600">
            Upload your course files, and LearnFlowAI will instantly generate your summaries, flashcards, and practice problems.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Method Buttons */}
          <div>
            <h3 className="block text-lg font-medium text-gray-700 mb-3">
              Add Study Sources:
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => pdfDocInputRef.current?.click()}
                disabled={documents.length >= 5}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Upload Documents</span>
                <span className="text-xs text-gray-500 mt-1">PDF, DOCX (Max 10MB)</span>
              </button>

              <button
                type="button"
                onClick={() => pptInputRef.current?.click()}
                disabled={documents.length >= 5}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Upload Slides</span>
                <span className="text-xs text-gray-500 mt-1">PowerPoint (Max 10MB)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTextModal(true)}
                disabled={documents.length >= 5}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Paste Text</span>
                <span className="text-xs text-gray-500 mt-1">(Max 10k chars)</span>
              </button>
            </div>

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

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Processing time:</strong> Small inputs take ~20-30 seconds. Large files may take 2-3 minutes. Please be patient!
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              💡 <strong>Tip:</strong> Keep total uploads under 15MB for best results. Individual files max 10MB.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700">Your Study Sources:</h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
              {documents.length > 0 ? (
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
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              ) : (
                <p className="text-sm text-gray-500 italic mt-3 mb-6">Your files will appear here. Click an option above to get started.</p>
              )}
              
              <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                <span>{documents.length} / 5 documents added</span>
                {documents.length > 0 && (
                  <span className={parseFloat(totalSizeMB) > 15 ? 'text-red-600 font-medium' : ''}>
                    Total: {totalSizeMB}MB / 15MB
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Generation Options - Visual Boxes */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Choose what to generate:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generationOptions.map(({ key, label, icon }) => (
                <div
                  key={key}
                  onClick={() => handleCheckboxChange(key)}
                  className={`
                    cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all min-h-[120px]
                    ${options[key] 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-500' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`transition-colors ${options[key] ? 'text-blue-600' : 'text-gray-400'}`}>
                    {icon}
                  </div>
                  <span className={`text-sm font-medium text-center ${options[key] ? 'text-blue-700' : 'text-gray-700'}`}>
                    {label}
                  </span>
                  {options[key] && (
                    <div className="mt-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={documents.length === 0}
            className="w-full text-lg bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate Study Pack
          </button>
        </form>
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