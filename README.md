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

## 🚀 How to Run This Project

This project is split into two parts: a Python/Flask backend and a React/Vite frontend. You will need to run both simultaneously.

### 1. Backend (Flask)

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create and activate a Python virtual environment:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

4.  Create a `.env` file in the `backend` folder for your API key:
    ```bash
    echo "GEMINI_API_KEY='your_api_key_here'" > .env
    ```

5.  Run the backend server:
    ```bash
    python3 app.py
    ```
    The server will start on `http://localhost:5000`.

### 2. Frontend (React)

> **Important:** This project requires **Node.js v20 (LTS)**. Using other versions (like v24) may cause installation errors. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node version.
> ```bash
> nvm install --lts
> nvm use --lts
> ```

1.  In a **new terminal**, navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install the required Node packages:
    ```bash
    npm install
    ```

3.  Run the frontend development server:
    ```bash
    npm run dev
    ```
    Your browser will automatically open to `http://localhost:5173`.

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