# Study Agent

An AI-powered study assistant that auto-generates summaries, flashcards, and quizzes from your lecture slides, videos, and notes.

## Project Structure

```
study-agent/
│
├── backend/                    # Python Flask backend
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── models/
│   │   └── study_pack.py     # Data models for study packs
│   ├── agents/
│   │   └── syllabus_agent.py # AI agent for content generation
│   └── utils/
│       ├── scraper.py         # Web scraping utilities
│       └── searcher.py        # Search utilities
│
├── frontend/                   # React + TypeScript frontend
│   ├── index.html             # HTML entry point
│   ├── vite.config.js         # Vite configuration
│   └── src/
│       ├── App.tsx            # Main React component
│       ├── components/
│       │   ├── InputForm.tsx  # Form for input
│       │   └── ResultsView.tsx # Results display
│       └── services/
│           └── api.ts         # API client
│
└── README.md                   # This file
```

## Features

- 📝 **Auto-generate summaries** from your study materials
- 🗂️ **Create flashcards** for quick review and memorization
- ✅ **Generate quizzes** to test your knowledge
- 🌐 **Web scraping** to extract content from URLs
- 🔍 **Search utilities** to find relevant study resources

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd study-agent/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys (e.g., OPENAI_API_KEY)
   ```

5. Run the Flask application:
   ```bash
   python app.py
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd study-agent/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Backend API

- `GET /health` - Health check endpoint
- `POST /api/generate-study-pack` - Generate study materials

  Request body:
  ```json
  {
    "topic": "Machine Learning Basics",
    "content": "Your study content here...",
    "pack_type": "all"  // Options: "summary", "flashcards", "quiz", "all"
  }
  ```

## Technologies Used

### Backend
- **Flask** - Web framework
- **OpenAI** - AI text generation
- **BeautifulSoup4** - Web scraping
- **Pydantic** - Data validation

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **CSS3** - Styling

## Environment Variables

Create a `.env` file in the backend directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Flask Configuration
SECRET_KEY=your_secret_key_here
DEBUG=True

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Scraping Configuration
MAX_SCRAPE_DEPTH=3
SCRAPE_TIMEOUT=30

# Search Configuration
SEARCH_RESULTS_LIMIT=10
```

## Development

### Running Tests

```bash
# Backend tests
cd study-agent/backend
pytest

# Frontend tests
cd study-agent/frontend
npm test
```

### Code Style

- Backend: Follow PEP 8 guidelines
- Frontend: Use ESLint and Prettier

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI models
- The open-source community for the amazing tools and libraries

## Support

For issues, questions, or contributions, please open an issue on GitHub.
