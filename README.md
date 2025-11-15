# Study Pack Generator

Fast, clean, high-quality study materials from messy inputs.

## 🚀 Features

- **Input Flexibility**: Course name, syllabus text, or description
- **Structured Output**: Topics, concepts, problems, flashcards, resources
- **AI-Powered**: Uses Google Gemini Flash for fast, accurate generation
- **Clean UI**: Single-page React app with instant results

## 🏗️ Architecture

- **Backend**: Flask + PydanticAI (structured outputs)
- **Frontend**: React + TypeScript + Tailwind CSS
- **AI**: Google Gemini Flash Lite (free tier)

## 📦 Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your-api-key-here" > .env
echo "DEBUG=True" >> .env

# Run
python app.py
```

**Get Gemini API Key**: https://aistudio.google.com/app/apikey

### Frontend

```bash
cd frontend
npm install

# Create .env file (optional, defaults to localhost:5000)
echo "VITE_API_URL=http://localhost:5000" > .env

# Run
npm run dev
```

## 🎯 Usage

1. Start backend (`python app.py`)
2. Start frontend (`npm run dev`)
3. Open http://localhost:5173
4. Enter course info
5. Generate study pack

## 📁 Project Structure

```
study-agent/
├── backend/
│   ├── app.py                 # Flask API
│   ├── config.py              # Configuration
│   ├── models/
│   │   └── study_pack.py      # Pydantic models
│   ├── agents/
│   │   └── syllabus_agent.py  # PydanticAI agent
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app
│   │   ├── components/
│   │   │   ├── InputForm.tsx  # Input component
│   │   │   └── ResultsView.tsx # Results component
│   │   └── services/api.ts    # API client
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🔧 API Reference

### POST /generate

Generate a study pack from course input.

**Request:**
```json
{
  "input": "Introduction to Machine Learning",
  "api_key": "optional-gemini-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course_name": "Introduction to Machine Learning",
    "overview": "...",
    "topics": [...],
    "key_concepts": [...],
    "example_problems": [...],
    "flashcards": [...],
    "external_resources": [...]
  }
}
```

## 🚢 Deployment

### Backend (Railway/Render)
1. Push to GitHub
2. Connect repo to Railway/Render
3. Set `GEMINI_API_KEY` env var
4. Deploy

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Connect repo to Vercel/Netlify
3. Set build command: `npm run build`
4. Set `VITE_API_URL` to backend URL
5. Deploy

## 🛠️ Tech Stack

- **Backend**: Flask, PydanticAI, Google Gemini
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Validation**: Pydantic v2

## 📝 License

MIT