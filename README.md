# Medical AI Analyzer

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        __  __          _ _           _                        ║
║       |  \/  | ___  __| (_) ___ __ _| |                      ║
║       | |\/| |/ _ \/ _` | |/ __/ _` | |                      ║
║       | |  | |  __/ (_| | | (_| (_| | |                      ║
║       |_|  |_|\___|\__,_|_|\___\__,_|_|                      ║
║                                                               ║
║              AI-Powered Test Analyzer                        ║
║                    Version 1.0.0                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

An intelligent medical test analysis system powered by OpenAI GPT-4o that provides accurate, comprehensive analysis of laboratory test results with clear explanations and actionable recommendations.

## 🌟 Features

- 🤖 **AI-Powered Analysis** - Advanced medical test interpretation using GPT-4o
- 📄 **Multi-Format Support** - PDF and image upload capabilities
- ⚠️ **Smart Risk Assessment** - Automatic severity classification (Normal, Attention Needed, Urgent, Critical)
- 📊 **Comprehensive Reports** - Detailed analysis with medical insights
- 🔐 **Secure & Private** - Encrypted data storage and secure authentication
- 🎨 **Modern UI/UX** - Professional interface inspired by leading case management systems
- ⚡ **Real-time Processing** - Background processing with status updates

## 🏗️ Architecture

Built following enterprise-grade architecture patterns:

```
medical-ai-analyzer/
├── backend/              # FastAPI Backend
│   ├── app/
│   │   ├── agents/      # AI Agents (Document Extractor, Medical Analyzer)
│   │   ├── api/         # REST API Endpoints
│   │   ├── auth/        # Authentication & Authorization
│   │   ├── db/          # Database Models & Session
│   │   └── services/    # Business Logic Services
│   └── requirements.txt
│
└── frontend/            # Next.js 14 Frontend
    ├── app/             # App Router Pages
    ├── components/      # React Components
    ├── contexts/        # Context Providers
    ├── lib/             # API Client & Utilities
    └── types/           # TypeScript Definitions
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- OpenAI API Key

### Setup (One-Time)

```bash
# 1. Create Database
sudo -u postgres psql -c 'CREATE DATABASE medical_ai_analyzer OWNER mohammad;'

# 2. Install Backend Dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary openai pypdf2 pillow
pip install pydantic httpx aiofiles python-jose bcrypt pyjwt email-validator
pip install python-multipart python-dotenv alembic python-dateutil

# 3. Install Frontend Dependencies
cd ../frontend
npm install

# 4. Configure Environment
# Edit backend/.env and set OPENAI_API_KEY

# 5. Create Database Tables
cd ../backend
source venv/bin/activate
python -c "from app.db.models import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"
```

### Running

```bash
./start.sh
```

Press **Ctrl+C** to stop all services.

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Web Interface |
| Backend API | http://localhost:8000 | REST API |
| API Documentation | http://localhost:8000/docs | Interactive Swagger UI |

## 💡 How It Works

### AI Agents

**1. Document Extractor Agent**
- Extracts text from PDFs and images
- Identifies document type automatically
- Extracts structured medical data
- Uses GPT-4o for intelligent parsing

**2. Medical Analyzer Agent**
- Analyzes extracted test results
- Compares values against reference ranges
- Classifies severity levels
- Generates patient-friendly explanations
- Provides actionable recommendations

### Database Schema

**Users Table**
- Secure authentication
- User profiles
- Activity tracking

**Medical Reports Table**
- File metadata
- Analysis status
- Severity classification
- AI-generated insights

**Test Results Table**
- Individual test values
- Reference ranges
- Interpretations
- Clinical significance

**Agent Logs Table**
- AI operation tracking
- Performance metrics
- Error logging

## 🔧 Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Relational database
- **OpenAI GPT-4o** - AI model for analysis
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Beautiful icons

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

### Reports
- `POST /api/v1/reports/upload` - Upload medical report
- `GET /api/v1/reports/list` - List user's reports
- `GET /api/v1/reports/{id}` - Get report details
- `DELETE /api/v1/reports/{id}` - Delete report

## 🔒 Security

- Password hashing with bcrypt
- JWT-based authentication
- Secure file storage
- Input validation
- CORS protection
- SQL injection prevention

## 📖 User Guide

1. **Register** - Create your account
2. **Login** - Sign in to your account
3. **Upload** - Upload medical test report (PDF/Image)
4. **Wait** - AI analysis takes 1-2 minutes
5. **Review** - Read comprehensive analysis
6. **Consult** - Share results with your doctor

## 🎨 UI/UX Design

Inspired by professional case management systems:
- Clean, modern interface
- Gradient backgrounds
- Intuitive navigation
- Responsive design
- Real-time status updates
- Professional color schemes
- Accessible components

## ⚠️ Medical Disclaimer

This application provides AI-generated analysis for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals regarding your medical test results.

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

---

**Built with ❤️ using AI and modern web technologies**
