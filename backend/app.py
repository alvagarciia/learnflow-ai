"""
Main Flask application for the Study Agent backend.
"""

import os
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from config import config
from agents.syllabus_agent import SyllabusAgent
from services.document_processor import DocumentProcessor
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')

# Load configuration from environment or default to development
env = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Configure upload limits
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB total request size

CORS(app)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'study-agent-backend'}), 200


@app.route('/api/generate', methods=['POST', 'OPTIONS'])
def generate_study_pack():
    """
    Generate a study pack from provided content (files or text).
    
    Accepts multipart/form-data with:
    - files: Multiple file uploads (PDF, DOCX, PPTX)
    - text: Optional manual text input
    - api_key: Optional Gemini API key
    - selectedSections: JSON string of sections to generate
    
    Returns structured study pack
    """
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Get API key
        api_key = request.form.get('api_key') or app.config.get('GEMINI_API_KEY')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'No Gemini API key provided. Either include api_key in request or set GEMINI_API_KEY environment variable.'
            }), 400
        
        # Get files and text
        files = request.files.getlist('files')
        manual_text = request.form.get('text', '').strip()
        
        # Validate input
        if not files and not manual_text:
            return jsonify({
                'success': False,
                'error': 'No input provided. Please upload files or enter text.'
            }), 400
        
        # Get selected sections (parse JSON string)
        selected_sections_str = request.form.get('selectedSections', '{}')
        try:
            selected_sections = json.loads(selected_sections_str)
        except json.JSONDecodeError:
            selected_sections = {
                'overview': True,
                'topics': True,
                'key_concepts': True,
                'example_problems': True,
                'flashcards': True,
                'external_resources': True
            }
        
        # Check if at least one section is selected
        if not any(selected_sections.values()):
            return jsonify({
                'success': False,
                'error': 'No sections selected. Please select at least one section to generate.'
            }), 400
        
        # Process documents (extract, chunk, summarize)
        try:
            processor = DocumentProcessor(api_key)
            processing_result = processor.process_documents(
                files=files if files else None,
                manual_text=manual_text if manual_text else None,
                include_summaries=False,  # We'll use the agent for the final generation
                max_chunk_tokens=1000
            )
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
        
        # Use the combined text for study pack generation
        input_text = processing_result['all_text_combined']
        
        # Add processing metadata to input for context
        context = f"""Course Material Analysis:
        - Total sources: {processing_result['metadata']['total_sources']}
        - Total characters: {processing_result['metadata']['total_characters']}

        Combined Content:
        {input_text}"""
        
        # Initialize agent and generate study pack
        agent = SyllabusAgent(api_key=api_key)
        study_pack = agent.generate_study_pack_sync(context, selected_sections)
        
        # Return structured response with processing metadata
        return jsonify({
            'success': True,
            'data': study_pack.model_dump(),
            'processing_metadata': processing_result['metadata'],
            'message': 'Study pack generated successfully'
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        app.logger.error(f"Error generating study pack: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/generate-study-pack', methods=['POST', 'OPTIONS'])
def generate_study_pack_legacy():
    """Legacy endpoint for backward compatibility."""
    if request.method == 'OPTIONS':
        return '', 204
    return generate_study_pack()

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # If it's an API call that doesn't exist, return 404 JSON
    if path.startswith('api/'):
        return jsonify({"error": "Endpoint not found"}), 404
    
    # If the file exists in static folder, serve it
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Otherwise serve index.html (for React Router)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    debug_mode = app.config.get('DEBUG', False)
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)