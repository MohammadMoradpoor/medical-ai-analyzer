from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/medical_analyzer")

# Create database engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=10,  # Number of connections to maintain
    max_overflow=20,  # Maximum number of connections that can be created beyond pool_size
    echo=False  # Set to True to log SQL queries (for debugging)
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Use this in FastAPI endpoints with Depends(get_db).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

