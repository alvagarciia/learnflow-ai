from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from models.study_pack import StudyPack
from typing import Optional


class SyllabusAgent:
    """Agent that converts course input into structured study packs"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.0-flash-lite"):
        """
        Initialize the agent with Gemini model
        
        Args:
            api_key: Gemini API key (required)
            model_name: Model to use (default: gemini-2.0-flash-lite)
        """
        if not api_key:
            raise ValueError("Gemini API key is required")
        
        # Store API key for use in requests
        import os
        os.environ["GOOGLE_API_KEY"] = api_key
        
        # Initialize Google model (newer API - pass key via environment or model string)
        self.model = GoogleModel(model_name)

        # Create PydanticAI agent with structured output
        self.agent = Agent(
            model=self.model,
            output_type=StudyPack,
            system_prompt=self._get_system_prompt()
        )

    def _get_system_prompt(self) -> str:
        """System prompt for the agent"""
        return """You are an expert educational content generator. Your job is to analyze course materials and create comprehensive study packs.

        Given course information (name, syllabus, or description), you must generate:
        1. Clear topic summaries covering major themes
        2. Key concepts with definitions and importance
        3. Practice problems with solutions at varying difficulty levels
        4. Flashcards for memorization
        5. External resource suggestions (optional)

        Guidelines:
        - Be thorough but concise
        - Make content actionable and study-ready
        - Ensure problems are solvable and relevant
        - Flashcards should test core knowledge
        - External resources should be real, reputable sources (Khan Academy, Coursera, MIT OCW, etc.)

        Focus on quality over quantity. Every item should add real value to a student's learning."""

    async def generate_study_pack(self, input_text: str) -> StudyPack:
        """
        Generate a complete study pack from input
        
        Args:
            input_text: Course name, syllabus text, or description
            
        Returns:
            StudyPack: Structured study materials
        """
        # Build user prompt
        user_prompt = f"""Analyze this course information and generate a comprehensive study pack:
        {input_text}

        Create a complete study pack with:
        - Course overview
        - 3-8 topic summaries
        - 5-15 key concepts
        - 3-10 practice problems (varied difficulty)
        - 8-20 flashcards
        - Optional external resources

        Make it practical and study-ready."""
        
        # Run agent
        result = await self.agent.run(user_prompt)
        return result.output

    def generate_study_pack_sync(self, input_text: str) -> StudyPack:
        """
        Synchronous wrapper for generate_study_pack
        
        Args:
            input_text: Course name, syllabus text, or description
            
        Returns:
            StudyPack: Structured study materials
        """
        import asyncio
        return asyncio.run(self.generate_study_pack(input_text))