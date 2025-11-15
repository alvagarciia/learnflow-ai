"""
Data model for study packs.
"""

from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class Flashcard(BaseModel):
    """Flashcard model."""
    question: str
    answer: str
    difficulty: Optional[Literal['easy', 'medium', 'hard']] = 'medium'


class QuizQuestion(BaseModel):
    """Quiz question model."""
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None


class Summary(BaseModel):
    """Summary model."""
    content: str
    key_points: List[str]
    word_count: int


class StudyPack(BaseModel):
    """Main study pack model."""
    
    id: Optional[str] = None
    topic: str
    source_content: str
    pack_type: Literal['summary', 'flashcards', 'quiz', 'all']
    
    # Generated content
    summary: Optional[Summary] = None
    flashcards: Optional[List[Flashcard]] = None
    quiz_questions: Optional[List[QuizQuestion]] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: Literal['pending', 'processing', 'completed', 'failed'] = 'pending'
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "topic": "Machine Learning Basics",
                "source_content": "Machine learning is a subset of artificial intelligence...",
                "pack_type": "all"
            }
        }
