from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from models.study_pack import StudyPack
from typing import Optional
import asyncio
import os
import threading


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

        # Background event loop for thread-safe async execution
        self._loop = None
        self._thread = None
        self._start_background_loop()


    def _start_background_loop(self):
        """Start a background thread with its own event loop"""
        def run_loop(loop):
            asyncio.set_event_loop(loop)
            loop.run_forever()
        
        self._loop = asyncio.new_event_loop()
        self._thread = threading.Thread(target=run_loop, args=(self._loop,), daemon=True)
        self._thread.start()

    def _get_system_prompt(self) -> str:
        return (
            "You are an expert educational content generator. Your job is to produce high-quality study materials. If the user uploads PDFs, slides, or text, ALWAYS base the study pack ONLY on that content. If the user provides only a short label (e.g., 'Calc I' or 'O-Chem') without additional content, you may use your own internal knowledge to build the study pack."
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
        return result.output


    def generate_study_pack_sync(self, input_text: str) -> StudyPack:
        """Thread-safe sync wrapper"""
        if self._loop is None:
            raise RuntimeError("Background event loop not started")
        
        # Schedule coroutine in background loop and wait for result
        future = asyncio.run_coroutine_threadsafe(
            self.generate_study_pack(input_text),
            self._loop
        )
        
        return future.result(timeout=300)  # 5 minute timeout

    def __del__(self):
        """Cleanup: stop background loop when agent is destroyed"""
        if self._loop:
            self._loop.call_soon_threadsafe(self._loop.stop)