"""
Main Flask application for the Study Agent backend.
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import config
from agents.syllabus_agent import SyllabusAgent

app = Flask(__name__)

# Load configuration from environment or default to development
env = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Configure CORS properly
CORS(app, 
     origins=app.config['CORS_ORIGINS'],
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type'],
     supports_credentials=True)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'study-agent-backend'}), 200


@app.route('/generate', methods=['POST', 'OPTIONS'])
def generate_study_pack():
    """
    Generate a study pack from provided content.
    Expected JSON body: {
        "input": "course name or syllabus text",
        "api_key": "optional gemini api key",
        "selectedSections": {
            "overview": true/false,
            "topics": true/false,
            "key_concepts": true/false,
            "example_problems": true/false,
            "flashcards": true/false,
            "external_resources": true/false
        }
    }
    """
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        if not data or 'input' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: input'
            }), 400
        
        input_text = data.get('input', '').strip()
        
        if not input_text:
            return jsonify({
                'success': False,
                'error': 'Input text cannot be empty'
            }), 400
        
        # Get API key (user-provided or from config)
        api_key = data.get('api_key') or app.config.get('GEMINI_API_KEY')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'No Gemini API key provided. Either include api_key in request or set GEMINI_API_KEY environment variable.'
            }), 400
        
        # Get selected sections (default all to True if not provided)
        selected_sections = data.get('selectedSections', {
            'overview': True,
            'topics': True,
            'key_concepts': True,
            'example_problems': True,
            'flashcards': True,
            'external_resources': True
        })
        
        # Check if at least one section is selected
        if not any(selected_sections.values()):
            return jsonify({
                'success': False,
                'error': 'No sections selected. Please select at least one section to generate.'
            }), 400
        
        # Initialize agent and generate
        agent = SyllabusAgent(api_key=api_key)
        study_pack = agent.generate_study_pack_sync(input_text, selected_sections)
        
        # Return structured response
        return jsonify({
            'success': True,
            'data': study_pack.model_dump(),
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


if __name__ == '__main__':
    debug_mode = app.config.get('DEBUG', False)
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)