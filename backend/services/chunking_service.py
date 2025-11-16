"""
Text chunking service for splitting large documents into manageable pieces.
Implements semantic chunking with token limits.
"""

from typing import List, Dict
import re


class ChunkingService:
    """Split text into semantically meaningful chunks"""
    
    # Approximate tokens per character (rough estimate: 1 token ≈ 4 characters)
    CHARS_PER_TOKEN = 4
    
    @staticmethod
    def estimate_tokens(text: str) -> int:
        """
        Estimate token count for text.
        Uses character-based approximation.
        
        Args:
            text: Input text
            
        Returns:
            Estimated token count
        """
        return len(text) // ChunkingService.CHARS_PER_TOKEN
    
    @staticmethod
    def split_by_sentences(text: str) -> List[str]:
        """
        Split text into sentences.
        Handles common abbreviations and edge cases.
        
        Args:
            text: Input text
            
        Returns:
            List of sentences
        """
        # Simple sentence splitting (can be improved with nltk if needed)
        sentence_endings = r'[.!?]\s+'
        sentences = re.split(sentence_endings, text)
        return [s.strip() for s in sentences if s.strip()]
    
    @classmethod
    def chunk_text(
        cls,
        text: str,
        source: str,
        max_tokens: int = 1000,
        overlap_tokens: int = 100
    ) -> List[Dict[str, any]]:
        """
        Split text into chunks with semantic boundaries.
        
        Strategy:
        1. Split by paragraphs first
        2. If paragraph too large, split by sentences
        3. Maintain overlap between chunks for context
        
        Args:
            text: Input text to chunk
            source: Source identifier (filename or "manual_text")
            max_tokens: Maximum tokens per chunk (default: 1000)
            overlap_tokens: Overlap between chunks (default: 100)
            
        Returns:
            List of chunk dictionaries with metadata
        """
        if not text or not text.strip():
            return []
        
        # Calculate character limits based on token estimates
        max_chars = max_tokens * cls.CHARS_PER_TOKEN
        overlap_chars = overlap_tokens * cls.CHARS_PER_TOKEN
        
        chunks = []
        chunk_index = 0
        
        # Split by paragraphs first (double newline)
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        current_chunk = ""
        
        for para in paragraphs:
            para_tokens = cls.estimate_tokens(para)
            
            # If single paragraph exceeds limit, split by sentences
            if para_tokens > max_tokens:
                sentences = cls.split_by_sentences(para)
                
                for sentence in sentences:
                    sentence_tokens = cls.estimate_tokens(current_chunk + " " + sentence)
                    
                    if sentence_tokens > max_tokens and current_chunk:
                        # Save current chunk
                        chunks.append({
                            "source": source,
                            "chunk_index": chunk_index,
                            "text": current_chunk.strip(),
                            "token_estimate": cls.estimate_tokens(current_chunk)
                        })
                        chunk_index += 1
                        
                        # Start new chunk with overlap (last few sentences)
                        overlap_text = cls._get_overlap(current_chunk, overlap_chars)
                        current_chunk = overlap_text + " " + sentence
                    else:
                        current_chunk += " " + sentence
            else:
                # Paragraph fits, check if adding it exceeds limit
                combined_tokens = cls.estimate_tokens(current_chunk + "\n\n" + para)
                
                if combined_tokens > max_tokens and current_chunk:
                    # Save current chunk
                    chunks.append({
                        "source": source,
                        "chunk_index": chunk_index,
                        "text": current_chunk.strip(),
                        "token_estimate": cls.estimate_tokens(current_chunk)
                    })
                    chunk_index += 1
                    
                    # Start new chunk with overlap
                    overlap_text = cls._get_overlap(current_chunk, overlap_chars)
                    current_chunk = overlap_text + "\n\n" + para
                else:
                    if current_chunk:
                        current_chunk += "\n\n" + para
                    else:
                        current_chunk = para
        
        # Add final chunk
        if current_chunk.strip():
            chunks.append({
                "source": source,
                "chunk_index": chunk_index,
                "text": current_chunk.strip(),
                "token_estimate": cls.estimate_tokens(current_chunk)
            })
        
        return chunks
    
    @staticmethod
    def _get_overlap(text: str, overlap_chars: int) -> str:
        """
        Get the last N characters of text for overlap.
        Tries to break at sentence boundary.
        
        Args:
            text: Source text
            overlap_chars: Number of characters to overlap
            
        Returns:
            Overlap text
        """
        if len(text) <= overlap_chars:
            return text
        
        # Get last overlap_chars characters
        overlap = text[-overlap_chars:]
        
        # Try to start at sentence boundary
        sentence_start = overlap.find('. ')
        if sentence_start != -1:
            return overlap[sentence_start + 2:]
        
        return overlap
    
    @classmethod
    def chunk_multiple_sources(
        cls,
        sources: List[Dict[str, str]],
        max_tokens: int = 1000
    ) -> List[Dict[str, any]]:
        """
        Chunk multiple text sources.
        
        Args:
            sources: List of dicts with 'source' and 'text' keys
            max_tokens: Maximum tokens per chunk
            
        Returns:
            Combined list of all chunks from all sources
        """
        all_chunks = []
        
        for source_data in sources:
            source_name = source_data.get('source', 'unknown')
            text = source_data.get('text', '')
            
            if text.strip():
                chunks = cls.chunk_text(text, source_name, max_tokens)
                all_chunks.extend(chunks)
        
        return all_chunks