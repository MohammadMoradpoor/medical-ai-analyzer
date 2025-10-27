from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, JSON, Integer, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()


class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    phone = Column(String(20))
    date_of_birth = Column(DateTime)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    medical_reports = relationship("MedicalReport", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', username='{self.username}')>"


class MedicalReport(Base):
    """Medical report/test model for storing uploaded test results"""
    __tablename__ = "medical_reports"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # File information
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50))  # pdf, image, etc.
    file_size = Column(Integer)  # in bytes
    
    # Report metadata
    report_type = Column(String(100))  # blood_test, urine_test, x_ray, mri, ct_scan, etc.
    test_date = Column(DateTime)
    upload_date = Column(DateTime, default=datetime.utcnow)
    lab_name = Column(String(200))
    doctor_name = Column(String(200))
    
    # Analysis status
    analysis_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    analysis_started_at = Column(DateTime)  # When analysis/processing actually started
    analysis_completed_at = Column(DateTime)
    
    # AI Analysis Results
    extracted_data = Column(JSON)  # Raw extracted data from document
    analysis_result = Column(JSON)  # Structured analysis results
    severity_level = Column(String(50))  # normal, attention_needed, urgent, critical
    is_critical = Column(Boolean, default=False)
    has_abnormalities = Column(Boolean, default=False)
    
    # AI Generated Report
    summary = Column(Text)  # Short summary
    detailed_report = Column(Text)  # Detailed analysis
    recommendations = Column(JSON)  # Array of recommendations
    abnormal_findings = Column(JSON)  # Array of abnormal findings
    
    # Additional metadata
    notes = Column(Text)  # User notes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="medical_reports")
    test_results = relationship("TestResult", back_populates="report", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<MedicalReport(id={self.id}, user_id={self.user_id}, type='{self.report_type}')>"


class TestResult(Base):
    """Individual test results extracted from medical reports"""
    __tablename__ = "test_results"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("medical_reports.id"), nullable=False, index=True)
    
    # Test information
    test_name = Column(String(200), nullable=False)
    test_category = Column(String(100))  # hematology, biochemistry, immunology, etc.
    
    # Test values
    value = Column(String(100))  # The actual test value
    value_numeric = Column(Float)  # Numeric value if applicable
    unit = Column(String(50))  # mg/dL, mmol/L, etc.
    
    # Reference ranges
    reference_min = Column(Float)
    reference_max = Column(Float)
    reference_range = Column(String(200))  # Text representation of normal range
    
    # Analysis
    is_normal = Column(Boolean)
    deviation_percentage = Column(Float)  # How much it deviates from normal
    severity = Column(String(50))  # normal, mildly_abnormal, moderately_abnormal, severely_abnormal
    
    # Interpretation
    interpretation = Column(Text)  # What this result means
    clinical_significance = Column(Text)  # Clinical implications
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    report = relationship("MedicalReport", back_populates="test_results")
    
    def __repr__(self):
        return f"<TestResult(id={self.id}, test_name='{self.test_name}', value='{self.value}')>"


class AgentLog(Base):
    """Logs for AI agent operations and analysis"""
    __tablename__ = "agent_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("medical_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Agent information
    agent_type = Column(String(100))  # medical_analyzer, document_extractor, report_generator
    operation = Column(String(100))  # extract, analyze, generate_report
    
    # Execution details
    status = Column(String(50))  # success, failure, pending
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration_ms = Column(Integer)
    
    # Input/Output
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    
    # AI Model information
    model_used = Column(String(100))  # gpt-4o, gpt-4, etc.
    tokens_used = Column(Integer)
    cost_estimate = Column(Float)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<AgentLog(id={self.id}, agent_type='{self.agent_type}', status='{self.status}')>"

