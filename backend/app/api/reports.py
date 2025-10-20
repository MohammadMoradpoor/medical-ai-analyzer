"""Medical Reports API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import os
import uuid
from ..db.session import get_db
from ..db.models import User, MedicalReport, TestResult, AgentLog
from ..auth.dependencies import get_current_user
from ..agents import DocumentExtractorAgent, MedicalAnalyzerAgent
from ..agents.file_classifier_agent import FileClassifierAgent
from ..services.file_service import FileService

router = APIRouter()

# Get OpenAI API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize file service
file_service = FileService()


# Pydantic models
class ReportUploadResponse(BaseModel):
    report_id: str
    status: str
    message: str


class ReportAnalysisResponse(BaseModel):
    report_id: str
    status: str
    severity_level: Optional[str]
    is_critical: bool
    has_abnormalities: bool
    summary: Optional[str]
    abnormal_findings: Optional[List[dict]]
    recommendations: Optional[List[str]]


class ReportListResponse(BaseModel):
    id: str
    file_name: str
    report_type: Optional[str]
    test_date: Optional[datetime]
    upload_date: datetime
    analysis_status: str
    severity_level: Optional[str]
    is_critical: bool


async def process_medical_report(
    report_id: str,
    file_path: str,
    file_type: str,
    file_name: str,
    db: Session
):
    """Background task to process medical report."""
    try:
        # Update status to processing
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        report.analysis_status = "processing"
        db.commit()
        
        # Read file
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Initialize agents
        classifier = FileClassifierAgent(OPENAI_API_KEY)
        extractor = DocumentExtractorAgent(OPENAI_API_KEY)
        analyzer = MedicalAnalyzerAgent(OPENAI_API_KEY)
        
        # Step 1: Classify and validate file
        classification_start = datetime.utcnow()
        classification_result = await classifier.process({
            "file_content": file_content,
            "file_type": file_type,
            "file_name": file_name
        })
        classification_duration = (datetime.utcnow() - classification_start).total_seconds() * 1000
        
        # Log classification
        classification_log = AgentLog(
            report_id=report_id,
            user_id=report.user_id,
            agent_type="file_classifier",
            operation="classify",
            status=classification_result["status"],
            started_at=classification_start,
            completed_at=datetime.utcnow(),
            duration_ms=int(classification_duration),
            input_data={"file_type": file_type, "file_name": file_name},
            output_data=classification_result.get("data"),
            error_message=classification_result.get("error"),
            model_used="gpt-4o"
        )
        db.add(classification_log)
        db.commit()
        
        # Check if file is medical and processable
        if classification_result["status"] == "success":
            classification_data = classification_result["data"]
            
            if not classification_data.get("is_medical", True):
                report.analysis_status = "failed"
                report.extracted_data = {"rejection_reason": classification_data.get("rejection_reason", "File does not appear to be medical-related")}
                db.commit()
                return
            
            if not classification_data.get("is_processable", True):
                report.analysis_status = "failed"
                report.extracted_data = {"rejection_reason": classification_data.get("rejection_reason", "File quality is too low for processing")}
                db.commit()
                return
            
            # Store classification metadata
            report.report_type = classification_data.get("document_type")
        
        # Step 2: Extract data from document
        extraction_start = datetime.utcnow()
        
        # Extract data from document
        extraction_start = datetime.utcnow()
        extraction_result = await extractor.process({
            "file_content": file_content,
            "file_type": file_type
        })
        extraction_duration = (datetime.utcnow() - extraction_start).total_seconds() * 1000
        
        # Log extraction
        extraction_log = AgentLog(
            report_id=report_id,
            user_id=report.user_id,
            agent_type="document_extractor",
            operation="extract",
            status=extraction_result["status"],
            started_at=extraction_start,
            completed_at=datetime.utcnow(),
            duration_ms=int(extraction_duration),
            input_data={"file_type": file_type},
            output_data=extraction_result.get("data"),
            error_message=extraction_result.get("error"),
            model_used="gpt-4o"
        )
        db.add(extraction_log)
        
        if extraction_result["status"] != "success":
            report.analysis_status = "failed"
            report.extracted_data = None
            db.commit()
            return
        
        extracted_data = extraction_result["data"]
        report.extracted_data = extracted_data
        
        # Extract metadata
        if "report_info" in extracted_data:
            report.report_type = extracted_data["report_info"].get("report_type")
            test_date_str = extracted_data["report_info"].get("test_date")
            if test_date_str:
                try:
                    report.test_date = datetime.fromisoformat(test_date_str)
                except:
                    pass
            report.lab_name = extracted_data["report_info"].get("lab_name")
            report.doctor_name = extracted_data["report_info"].get("doctor_name")
        
        db.commit()
        
        # Analyze extracted data
        analysis_start = datetime.utcnow()
        analysis_result = await analyzer.process({
            "extracted_data": extracted_data,
            "patient_context": {}
        })
        analysis_duration = (datetime.utcnow() - analysis_start).total_seconds() * 1000
        
        # Log analysis
        analysis_log = AgentLog(
            report_id=report_id,
            user_id=report.user_id,
            agent_type="medical_analyzer",
            operation="analyze",
            status=analysis_result["status"],
            started_at=analysis_start,
            completed_at=datetime.utcnow(),
            duration_ms=int(analysis_duration),
            input_data={"extracted_data": extracted_data},
            output_data=analysis_result.get("data"),
            error_message=analysis_result.get("error"),
            model_used="gpt-4o"
        )
        db.add(analysis_log)
        
        if analysis_result["status"] != "success":
            report.analysis_status = "failed"
            db.commit()
            return
        
        analysis_data = analysis_result["data"]
        
        # Update report with analysis results
        overall = analysis_data.get("overall_assessment", {})
        report.analysis_result = analysis_data
        report.severity_level = overall.get("severity_level", "normal")
        report.is_critical = overall.get("is_critical", False)
        report.has_abnormalities = overall.get("has_abnormalities", False)
        report.summary = overall.get("summary")
        report.detailed_report = analysis_data.get("detailed_report")
        report.recommendations = analysis_data.get("recommendations", [])
        report.abnormal_findings = analysis_data.get("abnormal_findings", [])
        report.analysis_status = "completed"
        report.analysis_completed_at = datetime.utcnow()
        
        # Save individual test results
        for test_analysis in analysis_data.get("test_analysis", []):
            test_result = TestResult(
                report_id=report_id,
                test_name=test_analysis.get("test_name"),
                value=test_analysis.get("value"),
                unit=test_analysis.get("unit"),
                reference_range=test_analysis.get("reference_range"),
                is_normal=test_analysis.get("is_normal", True),
                severity=test_analysis.get("severity", "normal"),
                interpretation=test_analysis.get("interpretation"),
                clinical_significance=test_analysis.get("clinical_significance")
            )
            db.add(test_result)
        
        db.commit()
        
    except Exception as e:
        # Update report status to failed
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        if report:
            report.analysis_status = "failed"
            db.commit()
        raise e


@router.post("/upload", response_model=ReportUploadResponse)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a medical report file for analysis.
    """
    # Validate file type
    file_ext = file.filename.split('.')[-1].lower()
    allowed_extensions = ['pdf', 'png', 'jpg', 'jpeg', 'tiff']
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Determine file type
    file_type = "pdf" if file_ext == "pdf" else "image"
    
    # Save file
    file_path = await file_service.save_uploaded_file(file, str(current_user.id))
    file_size = os.path.getsize(file_path)
    
    # Create report record
    report = MedicalReport(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        analysis_status="pending",
        upload_date=datetime.utcnow()
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Add background task to process the report
    background_tasks.add_task(
        process_medical_report,
        str(report.id),
        file_path,
        file_type,
        file.filename,
        db
    )
    
    return {
        "report_id": str(report.id),
        "status": "pending",
        "message": "Report uploaded successfully. Analysis in progress."
    }


@router.get("/list", response_model=List[ReportListResponse])
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    skip: int = 0
):
    """
    List all reports for the current user.
    """
    reports = db.query(MedicalReport).filter(
        MedicalReport.user_id == current_user.id
    ).order_by(MedicalReport.upload_date.desc()).offset(skip).limit(limit).all()
    
    return [
        ReportListResponse(
            id=str(r.id),
            file_name=r.file_name,
            report_type=r.report_type,
            test_date=r.test_date,
            upload_date=r.upload_date,
            analysis_status=r.analysis_status,
            severity_level=r.severity_level,
            is_critical=r.is_critical or False
        )
        for r in reports
    ]


@router.get("/{report_id}", response_model=ReportAnalysisResponse)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed analysis of a specific report.
    """
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return {
        "report_id": str(report.id),
        "status": report.analysis_status,
        "severity_level": report.severity_level,
        "is_critical": report.is_critical or False,
        "has_abnormalities": report.has_abnormalities or False,
        "summary": report.summary,
        "abnormal_findings": report.abnormal_findings,
        "recommendations": report.recommendations
    }


@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a medical report.
    """
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Delete file from filesystem
    if os.path.exists(report.file_path):
        os.remove(report.file_path)
    
    # Delete from database (cascades to test_results and logs)
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}


@router.get("/{report_id}/agent-logs")
async def get_report_agent_logs(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get agent execution logs for a specific report.
    """
    # Verify report belongs to user
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Get agent logs
    logs = db.query(AgentLog).filter(
        AgentLog.report_id == report_id
    ).order_by(AgentLog.created_at.asc()).all()
    
    return [
        {
            "id": str(log.id),
            "agent_type": log.agent_type,
            "operation": log.operation,
            "status": log.status,
            "started_at": log.started_at.isoformat() if log.started_at else None,
            "completed_at": log.completed_at.isoformat() if log.completed_at else None,
            "duration_ms": log.duration_ms,
            "input_data": log.input_data,
            "output_data": log.output_data,
            "error_message": log.error_message,
            "model_used": log.model_used,
            "tokens_used": log.tokens_used,
            "cost_estimate": log.cost_estimate
        }
        for log in logs
    ]

