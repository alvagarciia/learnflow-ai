"""
Main Flask application for the Study Agent backend.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'study-agent-backend'}), 200


@app.route('/api/generate-study-pack', methods=['POST'])
def generate_study_pack():
    """
    Generate a study pack from provided content.
    Expected JSON body: {
        "topic": "string",
        "content": "string",
        "type": "summary|flashcards|quiz"
    }
    """
    data = request.get_json()
    
    if not data or 'topic' not in data:
        return jsonify({'error': 'Missing required field: topic'}), 400
    
    # TODO: Implement study pack generation logic
    return jsonify({
        'message': 'Study pack generation endpoint',
        'topic': data.get('topic'),
        'status': 'pending'
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
