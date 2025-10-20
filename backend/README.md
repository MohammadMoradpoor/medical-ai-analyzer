# Medical AI Analyzer - Backend

AI-powered medical test analysis system using FastAPI and OpenAI.

## Features

- 🔐 User authentication with JWT tokens
- 📄 PDF and image upload support
- 🤖 AI-powered document extraction
- 🩺 Intelligent medical test analysis
- ⚠️ Severity classification (normal, attention needed, urgent, critical)
- 📊 Detailed test result interpretation
- 💡 Personalized recommendations

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL 12+
- OpenAI API key

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your configuration
```

4. Setup database:
```bash
# Create database
createdb medical_analyzer

# Or using psql
psql -U postgres
CREATE DATABASE medical_analyzer;
\q
```

5. Run migrations:
```bash
alembic upgrade head
```

### Running the Application

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Reports
- `POST /api/v1/reports/upload` - Upload medical report
- `GET /api/v1/reports/list` - List user's reports
- `GET /api/v1/reports/{report_id}` - Get report analysis
- `DELETE /api/v1/reports/{report_id}` - Delete report

## Architecture

### Agents

**Document Extractor Agent**
- Extracts structured data from medical documents
- Supports PDF and image formats
- Uses GPT-4o for intelligent extraction

**Medical Analyzer Agent**
- Analyzes extracted test results
- Provides medical interpretations
- Classifies severity levels
- Generates recommendations

### Database Models

- **User**: User accounts and authentication
- **MedicalReport**: Uploaded reports and analysis results
- **TestResult**: Individual test results
- **AgentLog**: AI agent execution logs

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medical_analyzer

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Security
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Application
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

## Development

### Running Tests
```bash
pytest tests/
```

### Code Style
```bash
# Format code
black app/

# Lint code
flake8 app/
```

## License

MIT License

