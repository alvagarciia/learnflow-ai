from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from models.study_pack import StudyPack
from typing import Optional
import asyncio
import threading
import os


class SyllabusAgent:
    """Thread-safe agent that runs async operations in a dedicated event loop"""
    
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
        
        # Create a dedicated event loop in a background thread
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
        return """You are an expert educational content generator. Your job is to produce high-quality study materials. If the user uploads PDFs, slides, or text, ALWAYS base the study pack ONLY on that content. If the user provides only a short label (e.g., 'Calc I' or 'O-Chem') without additional content, you may use your own internal knowledge to build the study pack.

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

    async def generate_study_pack(self, input_text: str, selected_sections: dict) -> StudyPack:
        """Async version with conditional section generation"""
        
        # Build conditional instructions based on selected sections
        sections_to_generate = []
        if selected_sections.get('overview', True):
            sections_to_generate.append("- Course overview")
        if selected_sections.get('topics', True):
            sections_to_generate.append("- Topic summaries (3–8)")
        if selected_sections.get('key_concepts', True):
            sections_to_generate.append("- Key concepts (5–15)")
        if selected_sections.get('example_problems', True):
            sections_to_generate.append("- Practice problems (3–10)")
        if selected_sections.get('flashcards', True):
            sections_to_generate.append("- Flashcards (8–20)")
        if selected_sections.get('external_resources', True):
            sections_to_generate.append("- Optional external resources")
        
        sections_instruction = "\n".join(sections_to_generate)
        
        # Build disabled sections instruction
        disabled_fields = []
        if not selected_sections.get('overview', True):
            disabled_fields.append("overview: set to empty string")
        if not selected_sections.get('topics', True):
            disabled_fields.append("topics: set to empty list []")
        if not selected_sections.get('key_concepts', True):
            disabled_fields.append("key_concepts: set to empty list []")
        if not selected_sections.get('example_problems', True):
            disabled_fields.append("example_problems: set to empty list []")
        if not selected_sections.get('flashcards', True):
            disabled_fields.append("flashcards: set to empty list []")
        if not selected_sections.get('external_resources', True):
            disabled_fields.append("external_resources: set to null")
        
        disabled_instruction = ""
        if disabled_fields:
            disabled_instruction = f"\n\nIMPORTANT: The following sections were NOT requested. Set them to empty values:\n" + "\n".join(f"- {field}" for field in disabled_fields)
        
        user_prompt = f"""Analyze this course information and generate a study pack with ONLY the requested sections:

        {input_text}

        Generate ONLY these sections:
        {sections_instruction}
        {disabled_instruction}

        Make it practical and study-ready. You must still provide a valid course_name field."""
        
        result = await self.agent.run(user_prompt)
        return result.output

    def generate_study_pack_sync(self, input_text: str, selected_sections: dict) -> StudyPack:
        """Thread-safe synchronous wrapper with selected sections"""
        if self._loop is None:
            raise RuntimeError("Background event loop not started")
        
        # Schedule the coroutine in the background loop and wait for result
        future = asyncio.run_coroutine_threadsafe(
            self.generate_study_pack(input_text, selected_sections),
            self._loop
        )
        
        # Block until complete (with timeout for safety)
        return future.result(timeout=300)  # 5 minute timeout

    def __del__(self):
        """Cleanup: stop the background loop when agent is destroyed"""
        if self._loop:
            self._loop.call_soon_threadsafe(self._loop.stop)