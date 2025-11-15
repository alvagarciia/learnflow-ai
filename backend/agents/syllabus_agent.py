from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from models.study_pack import StudyPack
from typing import Optional
import asyncio
import os


class SyllabusAgent:
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.0-flash-lite"):
        if not api_key:
            raise ValueError("Gemini API key is required")
        
        os.environ["GOOGLE_API_KEY"] = api_key

        self.model = GoogleModel(model_name)

        self.agent = Agent(
            model=self.model,
            output_type=StudyPack,
            system_prompt=self._get_system_prompt()
        )


    def _get_system_prompt(self) -> str:
        return (
            "You are an expert educational content generator. Your job is to produce "
            "high-quality study materials…"
        )


    async def generate_study_pack(self, input_text: str) -> StudyPack:
        """Async version"""
        user_prompt = f"""
        Analyze this course information and generate a comprehensive study pack:

        {input_text}

        Create a complete study pack including:
        - Course overview
        - Topic summaries (3–8)
        - Key concepts (5–15)
        - Practice problems (3–10)
        - Flashcards (8–20)
        - Optional external resources
        """
        result = await self.agent.run(user_prompt)
        return result.output  # << the correct attribute!


    def generate_study_pack_sync(self, input_text: str) -> StudyPack:
        """Sync wrapper that actually runs the async task"""
        return asyncio.run(self.generate_study_pack(input_text))