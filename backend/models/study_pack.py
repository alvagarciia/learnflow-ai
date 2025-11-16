"""
Data model for study packs.
"""

from pydantic import BaseModel
from typing import List, Optional


class KeyConcept(BaseModel):
    term: str
    definition: str
    importance: str


class ExampleProblem(BaseModel):
    question: str
    answer: str
    difficulty: str


class Flashcard(BaseModel):
    front: str
    back: str


class TopicSummary(BaseModel):
    title: str
    summary: str
    key_points: List[str]


class ExternalResource(BaseModel):
    title: str
    url: str
    description: str


class StudyPack(BaseModel):
    """Complete structured study pack output"""
    course_name: str
    overview: str = ""  # Can be empty if not requested
    topics: List[TopicSummary] = []  # Empty list if not requested
    key_concepts: List[KeyConcept] = []  # Empty list if not requested
    example_problems: List[ExampleProblem] = []  # Empty list if not requested
    flashcards: List[Flashcard] = []  # Empty list if not requested
    external_resources: Optional[List[ExternalResource]] = None  # None if not requested