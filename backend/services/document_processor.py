"""
Main document processing orchestrator.
Coordinates file extraction, chunking, and summarization.
"""

from typing import List, Dict, Optional
import io
from werkzeug.datastructures import FileStorage
from services.file_processor import FileProcessor
from services.chunking_service import ChunkingService
from services.summarization_service import SummarizationService


class DocumentProcessor:
    """Orchestrate the complete document processing pipeline"""
    
    MAX_TOTAL_DOCUMENTS = 5
    
    def __init__(self, api_key: str):
        """
        Initialize document processor.
        
        Args:
            api_key: Google AI API key for summarization
        """
        self.file_processor = FileProcessor()
        self.chunking_service = ChunkingService()
        self.summarization_service = SummarizationService(api_key)
    
    def extract_all_text(
        self,
        files: Optional[List[FileStorage]] = None,
        manual_text: Optional[str] = None
    ) -> List[Dict[str, any]]:
        """
        Extract text from all input sources.
        
        Args:
            files: List of uploaded file objects
            manual_text: Optional manually entered text
            
        Returns:
            List of extracted text dictionaries with metadata
            
        Raises:
            ValueError: If validation fails or extraction errors
        """
        extracted_sources = []
        
        # Validate document count
        total_docs = (len(files) if files else 0) + (1 if manual_text else 0)
        if total_docs > self.MAX_TOTAL_DOCUMENTS:
            raise ValueError(f"Maximum {self.MAX_TOTAL_DOCUMENTS} documents allowed. You provided {total_docs}.")
        
        if total_docs == 0:
            raise ValueError("No input provided. Please upload files or enter text.")
        
        # Process uploaded files
        if files:
            for file in files:
                if not file or not file.filename:
                    continue
                
                try:
                    # Read file into memory stream
                    file_stream = io.BytesIO(file.read())
                    file_size = file_stream.getbuffer().nbytes
                    
                    # Extract text
                    result = self.file_processor.process_file(
                        file_stream,
                        file.filename,
                        file_size
                    )
                    
                    extracted_sources.append(result)
                    
                except Exception as e:
                    raise ValueError(f"Error processing {file.filename}: {str(e)}")
        
        # Process manual text
        if manual_text and manual_text.strip():
            if len(manual_text) > 10000:
                raise ValueError("Manual text exceeds 10,000 character limit")
            
            extracted_sources.append({
                "source": "manual_text",
                "type": "text",
                "text": manual_text.strip(),
                "metadata": {
                    "characters": len(manual_text)
                }
            })
        
        return extracted_sources
    
    def process_documents(
        self,
        files: Optional[List[FileStorage]] = None,
        manual_text: Optional[str] = None,
        include_summaries: bool = True,
        max_chunk_tokens: int = 1000
    ) -> Dict[str, any]:
        """
        Complete document processing pipeline.
        
        Flow:
        1. Extract text from all sources
        2. Chunk the text
        3. (Optional) Generate summaries
        4. Return structured output
        
        Args:
            files: Uploaded files
            manual_text: Manual text input
            include_summaries: Whether to generate summaries
            max_chunk_tokens: Maximum tokens per chunk
            
        Returns:
            Complete processing result with all data
        """
        # Step 1: Extract text from all sources
        extracted_sources = self.extract_all_text(files, manual_text)
        
        # Combine all text for full content
        all_text_combined = "\n\n---\n\n".join([
            f"Source: {source['source']}\n\n{source['text']}"
            for source in extracted_sources
        ])
        
        # Step 2: Chunk all sources
        chunks = self.chunking_service.chunk_multiple_sources(
            extracted_sources,
            max_tokens=max_chunk_tokens
        )
        
        # Step 3: Optionally generate summaries
        summary_data = None
        if include_summaries and chunks:
            summary_data = self.summarization_service.process_all_sync(chunks)
        
        # Step 4: Build final output
        result = {
            "all_text_combined": all_text_combined,
            "extracted_sources": extracted_sources,
            "chunks": summary_data['chunks'] if summary_data else chunks,
            "chunk_summaries": summary_data.get('chunk_summaries', []) if summary_data else [],
            "final_summary": summary_data.get('final_summary', '') if summary_data else '',
            "metadata": {
                "total_sources": len(extracted_sources),
                "total_chunks": len(chunks),
                "total_characters": len(all_text_combined),
                "sources": [
                    {
                        "name": source['source'],
                        "type": source['type'],
                        "metadata": source['metadata']
                    }
                    for source in extracted_sources
                ]
            }
        }
        
        return result