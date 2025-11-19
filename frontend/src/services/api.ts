const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface Document {
  id: string;
  type: 'file' | 'text';
  fileType?: 'pdf-doc' | 'ppt';
  file?: File;
  content?: string;
  name: string;
  size: string;
}

export interface StudyPackRequest {
  input: string;
  api_key?: string;
  selectedSections?: {
    overview: boolean;
    topics: boolean;
    key_concepts: boolean;
    example_problems: boolean;
    flashcards: boolean;
    external_resources: boolean;
  };
  documents?: Document[]; // For future file upload support
}

export interface KeyConcept {
  term: string;
  definition: string;
  importance: string;
}

export interface ExampleProblem {
  question: string;
  answer: string;
  difficulty: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface TopicSummary {
  title: string;
  summary: string;
  key_points: string[];
}

export interface ExternalResource {
  title: string;
  url: string;
  description: string;
}

export interface StudyPack {
  course_name: string;
  overview: string;
  topics: TopicSummary[];
  key_concepts: KeyConcept[];
  example_problems: ExampleProblem[];
  flashcards: Flashcard[];
  external_resources?: ExternalResource[];
}

export interface ApiResponse {
  success: boolean;
  data?: StudyPack;
  error?: string;
  message?: string;
}

export const api = {
  async generateStudyPackWithFiles(formData: FormData): Promise<ApiResponse | null> {
    try {
      // Add a longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        body: formData, // Don't set Content-Type - browser will set it with boundary
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit specifically
        if (response.status === 429) {
          return {
            success: false,
            error: 'The AI service is currently busy. Please wait a moment and try again with fewer files.',
          };
        }
        
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Handle timeout
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request took too long. Please try with fewer or smaller files.',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  async generateStudyPack(request: StudyPackRequest): Promise<ApiResponse | null> {
    try {
      // Add a longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit specifically
        if (response.status === 429) {
          return {
            success: false,
            error: 'Demo limit reached! Use your own free Gemini API key or try again tomorrow.',
          };
        }
        
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Handle timeout
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request took too long. Please try with fewer or smaller files.',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};