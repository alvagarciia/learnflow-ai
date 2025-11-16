const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  async generateStudyPack(request: StudyPackRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
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