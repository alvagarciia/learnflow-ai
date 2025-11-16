"""
Data model for study packs.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class KeyConcept(BaseModel):
    term: str = Field(description="The concept name or term")
    definition: str = Field(description="Clear, concise definition")
    importance: str = Field(description="Why this concept matters in the course")


class ExampleProblem(BaseModel):
    question: str = Field(description="The problem statement or question")
    answer: str = Field(description="Solution or answer explanation")
    difficulty: str = Field(description="Easy, Medium, or Hard")


class Flashcard(BaseModel):
    front: str = Field(description="Question or prompt side")
    back: str = Field(description="Answer or explanation side")


class TopicSummary(BaseModel):
    title: str = Field(description="Topic name")
    summary: str = Field(description="2-3 sentence overview of the topic")
    key_points: List[str] = Field(description="3-5 bullet points of main ideas")


class ExternalResource(BaseModel):
    title: str = Field(description="Resource name")
    url: str = Field(description="Link to resource")
    description: str = Field(description="What this resource provides")


class StudyPack(BaseModel):
    course_name: str
    overview: str
    topics: List[TopicSummary]
    key_concepts: List[KeyConcept]
    example_problems: List[ExampleProblem]
    flashcards: List[Flashcard]
    external_resources: Optional[List[ExternalResource]] = None