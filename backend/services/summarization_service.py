"""
Summarization service for generating summaries from text chunks.
Uses AI model to create concise summaries of large documents.
"""

from typing import List, Dict
import asyncio
from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
import os


class SummarizationService:
    """Generate summaries from text chunks using AI"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash-exp"):
        """
        Initialize summarization service.
        
        Args:
            api_key: Google AI API key
            model_name: Model to use for summarization
        """
        os.environ["GOOGLE_API_KEY"] = api_key
        self.model = GoogleModel(model_name)
        
        # Create agent for chunk summarization
        self.chunk_agent = Agent(
            model=self.model,
            output_type=str,
            system_prompt="""You are an expert at creating concise, accurate summaries of educational content.
            Your summaries should:
            - Capture the main ideas and key points
            - Be clear and well-structured
            - Preserve important details and terminology
            - Be about 2-3 sentences for short chunks, 1 paragraph for longer chunks
            Keep summaries focused and informative."""
        )
        
        # Create agent for final summary
        self.final_agent = Agent(
            model=self.model,
            output_type=str,
            system_prompt="""You are an expert at synthesizing multiple summaries into a cohesive overview.
            Your final summary should:
            - Integrate information from all chunk summaries
            - Create a unified narrative
            - Highlight the most important themes and concepts
            - Be comprehensive but concise (2-3 paragraphs)
            Organize the summary logically and make it useful for studying."""
        )
    
    async def summarize_chunk(self, chunk: Dict[str, any]) -> str:
        """
        Summarize a single text chunk.
        
        Args:
            chunk: Dictionary with 'text' and metadata
            
        Returns:
            Summary string
        """
        prompt = f"""Summarize the following educational content:

        {chunk['text']}

        Provide a concise summary capturing the main ideas."""
        
        result = await self.chunk_agent.run(prompt)
        return result.output
    
    async def summarize_chunks(self, chunks: List[Dict[str, any]]) -> List[Dict[str, any]]:
        """
        Summarize all chunks in parallel.
        
        Args:
            chunks: List of chunk dictionaries
            
        Returns:
            List of chunks with added 'summary' field
        """
        # Create tasks for parallel processing
        tasks = [self.summarize_chunk(chunk) for chunk in chunks]
        
        # Wait for all summaries
        summaries = await asyncio.gather(*tasks)
        
        # Add summaries to chunks
        for chunk, summary in zip(chunks, summaries):
            chunk['summary'] = summary
        
        return chunks
    
    async def create_final_summary(self, chunk_summaries: List[str]) -> str:
        """
        Create final unified summary from chunk summaries.
        
        Args:
            chunk_summaries: List of individual chunk summaries
            
        Returns:
            Final comprehensive summary
        """
        combined = "\n\n".join([f"Section {i+1}: {s}" for i, s in enumerate(chunk_summaries)])
        
        prompt = f"""Synthesize these section summaries into a cohesive overall summary:

        {combined}

        Create a unified summary that captures the main themes and key concepts from all sections."""
        
        result = await self.final_agent.run(prompt)
        return result.output
    
    async def process_all(self, chunks: List[Dict[str, any]]) -> Dict[str, any]:
        """
        Complete summarization pipeline.
        
        Args:
            chunks: List of text chunks
            
        Returns:
            Dictionary with chunk summaries and final summary
        """
        # Summarize all chunks
        chunks_with_summaries = await self.summarize_chunks(chunks)
        
        # Extract just the summary texts
        chunk_summaries = [chunk['summary'] for chunk in chunks_with_summaries]
        
        # Create final summary
        final_summary = await self.create_final_summary(chunk_summaries)
        
        return {
            "chunks": chunks_with_summaries,
            "chunk_summaries": chunk_summaries,
            "final_summary": final_summary
        }
    
    def process_all_sync(self, chunks: List[Dict[str, any]]) -> Dict[str, any]:
        """
        Synchronous wrapper for summarization pipeline.
        
        Args:
            chunks: List of text chunks
            
        Returns:
            Dictionary with chunk summaries and final summary
        """
        return asyncio.run(self.process_all(chunks))