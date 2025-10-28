"""Medical Reports API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import os
import uuid
import json
import logging
from ..db.session import get_db
from ..db.models import User, MedicalReport, TestResult, AgentLog
from ..auth.dependencies import get_current_user
from ..agents import DocumentExtractorAgent, MedicalAnalyzerAgent, ImageQualityAgent
from ..agents.file_classifier_agent import FileClassifierAgent
from ..services.file_service import FileService

router = APIRouter()
logger = logging.getLogger(__name__)

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
    extracted_data: Optional[dict]  # Raw extracted data from document
    test_analysis: Optional[List[dict]]  # Individual test results from database


class ReportListResponse(BaseModel):
    id: str
    file_name: str
    report_type: Optional[str]
    test_date: Optional[datetime]
    upload_date: datetime
    analysis_status: str
    severity_level: Optional[str]
    is_critical: bool
    file_size: Optional[int]
    analysis_completed_at: Optional[datetime]
    processing_duration: Optional[int]  # Duration in seconds


async def process_medical_report(
    report_id: str,
    file_path: str,
    file_type: str,
    file_name: str,
    db: Session
):
    """Background task to process medical report."""
    try:
        # Update status to processing and set start time
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        report.analysis_status = "processing"
        report.analysis_started_at = datetime.utcnow()
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
        
        # Calculate cost for classification
        classification_token_usage = classification_result.get("token_usage")
        classification_tokens = None
        classification_cost = None
        
        if classification_token_usage:
            total_tokens = classification_token_usage.get("total_tokens", 0)
            prompt_tokens = classification_token_usage.get("prompt_tokens", 0)
            completion_tokens = classification_token_usage.get("completion_tokens", 0)
            
            # GPT-4o pricing
            classification_cost = (prompt_tokens / 1_000_000 * 2.50) + (completion_tokens / 1_000_000 * 10.00)
            classification_tokens = total_tokens
        
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
            model_used="gpt-4o",
            tokens_used=classification_tokens,
            cost_estimate=classification_cost
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
        
        # Step 2: Quality Assessment (for images only)
        if file_type == "image":
            quality_start = datetime.utcnow()
            
            quality_agent = ImageQualityAgent(OPENAI_API_KEY)
            
            # Prepare base64 image
            import base64
            base64_image = base64.b64encode(file_content).decode('utf-8')
            
            quality_result = await quality_agent.process({
                "image_data": base64_image,
                "image_type": classification_data.get("document_type", "medical image"),
                "expected_content": "medical data or imaging"
            })
            
            quality_duration = (datetime.utcnow() - quality_start).total_seconds() * 1000
            
            # Calculate cost for quality check
            quality_token_usage = quality_result.get("token_usage", {})
            quality_cost = None
            quality_tokens = None
            
            if quality_token_usage:
                total_tokens = quality_token_usage.get("total_tokens", 0)
                prompt_tokens = quality_token_usage.get("prompt_tokens", 0)
                completion_tokens = quality_token_usage.get("completion_tokens", 0)
                quality_cost = (prompt_tokens / 1_000_000 * 2.50) + (completion_tokens / 1_000_000 * 10.00)
                quality_tokens = total_tokens
            
            # Log quality assessment
            quality_log = AgentLog(
                report_id=report_id,
                user_id=report.user_id,
                agent_type="image_quality",
                operation="assess_quality",
                status=quality_result["status"],
                started_at=quality_start,
                completed_at=datetime.utcnow(),
                duration_ms=int(quality_duration),
                input_data={"file_type": file_type},
                output_data=quality_result.get("data"),
                error_message=quality_result.get("error"),
                model_used="gpt-4o",
                tokens_used=quality_tokens,
                cost_estimate=quality_cost
            )
            db.add(quality_log)
            db.commit()
            
            # Check if quality is acceptable
            if quality_result["status"] == "success":
                quality_data = quality_result["data"]
                
                if not quality_data.get("is_acceptable_for_analysis", True):
                    # Image quality too low - reject with specific feedback
                    report.analysis_status = "failed"
                    report.extracted_data = {
                        "quality_check_failed": True,
                        "quality_assessment": quality_data,
                        "user_feedback": quality_data.get("user_feedback", {
                            "title": "Image Quality Too Low",
                            "message": "The uploaded image quality is insufficient for medical analysis.",
                            "recommendations": ["Please upload a clearer, higher-quality image"]
                        })
                    }
                    db.commit()
                    logger.info(f"[QUALITY CHECK] Image rejected - quality score: {quality_data.get('quality_score')}")
                    return
                
                # Quality acceptable - store assessment data
                logger.info(f"[QUALITY CHECK] Image accepted - quality score: {quality_data.get('quality_score')}")
        
        # Step 3: Extract data from document
        extraction_start = datetime.utcnow()
        
        # Extract data from document
        extraction_start = datetime.utcnow()
        extraction_result = await extractor.process({
            "file_content": file_content,
            "file_type": file_type
        })
        extraction_duration = (datetime.utcnow() - extraction_start).total_seconds() * 1000
        
        # Calculate cost for extraction
        extraction_token_usage = extraction_result.get("token_usage")
        extraction_tokens = None
        extraction_cost = None
        
        if extraction_token_usage:
            total_tokens = extraction_token_usage.get("total_tokens", 0)
            prompt_tokens = extraction_token_usage.get("prompt_tokens", 0)
            completion_tokens = extraction_token_usage.get("completion_tokens", 0)
            
            # GPT-4o pricing
            extraction_cost = (prompt_tokens / 1_000_000 * 2.50) + (completion_tokens / 1_000_000 * 10.00)
            extraction_tokens = total_tokens
        
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
            model_used="gpt-4o",
            tokens_used=extraction_tokens,
            cost_estimate=extraction_cost
        )
        db.add(extraction_log)
        
        # If imaging analysis was performed, also log it separately for easy retrieval
        if extraction_result.get("execution_details", {}).get("imaging_analysis"):
            imaging_analysis = extraction_result["execution_details"]["imaging_analysis"]
            imaging_tokens = extraction_result["execution_details"].get("imaging_token_usage", {})
            
            imaging_cost = None
            if imaging_tokens:
                total_tokens = imaging_tokens.get("total_tokens", 0)
                prompt_tokens = imaging_tokens.get("prompt_tokens", 0)
                completion_tokens = imaging_tokens.get("completion_tokens", 0)
                imaging_cost = (prompt_tokens / 1_000_000 * 2.50) + (completion_tokens / 1_000_000 * 10.00)
            
            imaging_log = AgentLog(
                report_id=report_id,
                user_id=report.user_id,
                agent_type="medical_imaging",
                operation="analyze_imaging",
                status="success",
                started_at=extraction_start,
                completed_at=datetime.utcnow(),
                duration_ms=int(extraction_result["execution_details"].get("imaging_execution_time_ms", 0)),
                input_data={"imaging_type": imaging_analysis.get("image_type")},
                output_data=imaging_analysis,
                error_message=None,
                model_used="gpt-4o",
                tokens_used=imaging_tokens.get("total_tokens") if imaging_tokens else None,
                cost_estimate=imaging_cost
            )
            db.add(imaging_log)
            logger.info(f"[PROCESS REPORT] Created separate imaging agent log")
        
        db.commit()
        
        if extraction_result["status"] != "success":
            report.analysis_status = "failed"
            report.extracted_data = None
            db.commit()
            return
        
        extracted_data = extraction_result["data"]
        
        # Check if this is medical imaging (X-ray, MRI, CT, Dental)
        is_medical_imaging = extracted_data.get("is_medical_imaging", False)
        
        if is_medical_imaging:
            # For medical imaging, store minimal extracted data
            # The actual imaging analysis will be stored in analysis_result
            logger.info(f"[PROCESS REPORT] Medical imaging detected: {extracted_data.get('imaging_type')}")
            report.extracted_data = {
                "is_medical_imaging": True,
                "imaging_type": extracted_data.get("imaging_type"),
                "imaging_category": extracted_data.get("imaging_category"),
                "note": "Medical imaging - no raw text data to extract. Analysis stored in analysis_result."
            }
            report.report_type = extracted_data.get("imaging_type", "medical_imaging")
        else:
            # For lab reports, store full extracted data
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
        
        # Calculate cost based on token usage
        token_usage_data = analysis_result.get("token_usage")
        tokens_used = None
        cost_estimate = None
        
        if token_usage_data:
            total_tokens = token_usage_data.get("total_tokens", 0)
            prompt_tokens = token_usage_data.get("prompt_tokens", 0)
            completion_tokens = token_usage_data.get("completion_tokens", 0)
            
            # GPT-4o pricing: $2.50/1M input, $10.00/1M output
            cost_estimate = (prompt_tokens / 1_000_000 * 2.50) + (completion_tokens / 1_000_000 * 10.00)
            tokens_used = total_tokens
        
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
            model_used="gpt-4o",
            tokens_used=tokens_used,
            cost_estimate=cost_estimate
        )
        db.add(analysis_log)
        
        if analysis_result["status"] != "success":
            report.analysis_status = "failed"
            db.commit()
            return
        
        analysis_data = analysis_result["data"]
        
        # Check if this is medical imaging
        is_medical_imaging = analysis_data.get("is_medical_imaging", False)
        
        if is_medical_imaging:
            # For medical imaging, the analysis is already in extraction_result from imaging agent
            # Get the imaging analysis from the extraction phase
            imaging_analysis = None
            
            # Try to get imaging analysis from extraction_log
            imaging_log = db.query(AgentLog).filter(
                AgentLog.report_id == report_id,
                AgentLog.agent_type == "medical_imaging"
            ).order_by(AgentLog.created_at.desc()).first()
            
            if imaging_log and imaging_log.output_data:
                imaging_analysis = imaging_log.output_data
                logger.info(f"[PROCESS REPORT] Retrieved imaging analysis from log")
            
            # If we have imaging analysis, use it directly
            if imaging_analysis:
                report.analysis_result = imaging_analysis
                report.severity_level = imaging_analysis.get("severity_level", "normal")
                report.is_critical = imaging_analysis.get("is_critical", False)
                report.has_abnormalities = len(imaging_analysis.get("findings", {}).get("abnormal_findings", [])) > 0
                report.summary = imaging_analysis.get("impression", "Medical imaging analysis completed")
                report.detailed_report = json.dumps(imaging_analysis.get("findings", {}), indent=2)
                report.recommendations = imaging_analysis.get("recommendations", [])
                
                # Format abnormal findings
                abnormal_findings_list = []
                for finding in imaging_analysis.get("findings", {}).get("abnormal_findings", []):
                    abnormal_findings_list.append({
                        "finding": finding.get("finding", "Unknown"),
                        "severity": finding.get("severity", "unknown"),
                        "explanation": finding.get("characteristics", ""),
                        "action_needed": "Consult with radiologist for professional interpretation"
                    })
                report.abnormal_findings = abnormal_findings_list
            else:
                # Fallback if imaging analysis not found
                logger.warning(f"[PROCESS REPORT] Imaging analysis not found in logs")
                report.analysis_result = analysis_data
                report.severity_level = None
                report.is_critical = False
                report.has_abnormalities = False
                report.summary = "Medical imaging analysis - please refer to imaging agent logs"
                report.recommendations = ["Consult with radiologist for professional interpretation"]
                report.abnormal_findings = []
            
            # No test results to save for imaging
            logger.info(f"[PROCESS REPORT] Stored imaging analysis for {report.report_type}")
        else:
            # For lab reports, proceed with standard analysis storage
            overall = analysis_data.get("overall_assessment", {})
            test_analysis = analysis_data.get("test_analysis", [])
            
            # Don't set severity to "normal" if no test data was found
            if test_analysis and len(test_analysis) > 0:
                report.severity_level = overall.get("severity_level", "normal")
            else:
                report.severity_level = None  # No data to assess
            
            report.analysis_result = analysis_data
            report.is_critical = overall.get("is_critical", False)
            report.has_abnormalities = overall.get("has_abnormalities", False)
            report.summary = overall.get("summary")
            report.detailed_report = analysis_data.get("detailed_report")
            report.recommendations = analysis_data.get("recommendations", [])
            report.abnormal_findings = analysis_data.get("abnormal_findings", [])
            
            # Save individual test results for lab reports
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
        
        report.analysis_status = "completed"
        report.analysis_completed_at = datetime.utcnow()
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
    
    result = []
    for r in reports:
        # Calculate processing duration if completed
        processing_duration = None
        if r.analysis_completed_at:
            # Use analysis_started_at if available, otherwise fall back to upload_date
            start_time = r.analysis_started_at if r.analysis_started_at else r.upload_date
            duration_delta = r.analysis_completed_at - start_time
            processing_duration = int(duration_delta.total_seconds())
        
        result.append(
        ReportListResponse(
            id=str(r.id),
            file_name=r.file_name,
            report_type=r.report_type,
            test_date=r.test_date,
            upload_date=r.upload_date,
            analysis_status=r.analysis_status,
            severity_level=r.severity_level,
            is_critical=r.is_critical or False,
                file_size=r.file_size,
                analysis_completed_at=r.analysis_completed_at,
                processing_duration=processing_duration
            )
        )
    
    return result


@router.get("/usage-stats")
async def get_usage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get token usage and cost statistics for the current user.
    """
    # Get all agent logs for user's reports
    logs = db.query(AgentLog).join(
        MedicalReport, AgentLog.report_id == MedicalReport.id
    ).filter(
        MedicalReport.user_id == current_user.id
    ).all()
    
    # GPT-4o pricing (as of Oct 2024)
    # Input: $2.50 per 1M tokens
    # Output: $10.00 per 1M tokens
    INPUT_COST_PER_1M = 2.50
    OUTPUT_COST_PER_1M = 10.00
    
    total_input_tokens = 0
    total_output_tokens = 0
    total_cost = 0.0
    model_usage = {}
    agent_usage = {}
    
    for log in logs:
        # Use stored cost if available, otherwise estimate
        if log.cost_estimate and log.cost_estimate > 0:
            cost = log.cost_estimate
        elif log.tokens_used and isinstance(log.tokens_used, int):
            # Estimate: assume 60% input, 40% output
            input_tokens = int(log.tokens_used * 0.6)
            output_tokens = int(log.tokens_used * 0.4)
            cost = (input_tokens / 1_000_000 * INPUT_COST_PER_1M) + (output_tokens / 1_000_000 * OUTPUT_COST_PER_1M)
        else:
            input_tokens = 0
            output_tokens = 0
            cost = 0
        
        # Calculate tokens
        if log.tokens_used:
            input_tokens = int(log.tokens_used * 0.6)
            output_tokens = int(log.tokens_used * 0.4)
        else:
            input_tokens = 0
            output_tokens = 0
        
        total_input_tokens += input_tokens
        total_output_tokens += output_tokens
        total_cost += cost
        
        # Track by model
        model = log.model_used or 'gpt-4o'
        if model not in model_usage:
            model_usage[model] = {'count': 0, 'tokens': 0, 'cost': 0}
        model_usage[model]['count'] += 1
        model_usage[model]['tokens'] += (input_tokens + output_tokens)
        model_usage[model]['cost'] += cost
        
        # Track by agent type
        agent = log.agent_type or 'unknown'
        if agent not in agent_usage:
            agent_usage[agent] = {'count': 0, 'tokens': 0, 'cost': 0}
        agent_usage[agent]['count'] += 1
        agent_usage[agent]['tokens'] += (input_tokens + output_tokens)
        agent_usage[agent]['cost'] += cost
    
    # Get report count
    report_count = db.query(MedicalReport).filter(
        MedicalReport.user_id == current_user.id
    ).count()
    
    return {
        "total_reports": report_count,
        "total_processing_runs": len(logs),
        "total_input_tokens": total_input_tokens,
        "total_output_tokens": total_output_tokens,
        "total_tokens": total_input_tokens + total_output_tokens,
        "total_cost_usd": round(total_cost, 4),
        "model_breakdown": model_usage,
        "agent_breakdown": agent_usage,
        "pricing": {
            "model": "gpt-4o",
            "input_per_1m": INPUT_COST_PER_1M,
            "output_per_1m": OUTPUT_COST_PER_1M
        }
    }
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
    
    # Get test results from database
    test_results = db.query(TestResult).filter(
        TestResult.report_id == report_id
    ).all()
    
    # Format test results for response
    test_analysis = [
        {
            "test_name": tr.test_name,
            "value": tr.value,
            "unit": tr.unit,
            "reference_range": tr.reference_range,
            "is_normal": bool(tr.is_normal) if tr.is_normal is not None else True,
            "severity": tr.severity,
            "interpretation": tr.interpretation,
            "clinical_significance": tr.clinical_significance
        }
        for tr in test_results
    ]
    
    return {
        "report_id": str(report.id),
        "status": report.analysis_status,
        "severity_level": report.severity_level,
        "is_critical": report.is_critical or False,
        "has_abnormalities": report.has_abnormalities or False,
        "summary": report.summary,
        "abnormal_findings": report.abnormal_findings,
        "recommendations": report.recommendations,
        "extracted_data": report.extracted_data,
        "test_analysis": test_analysis if test_analysis else None
    }


@router.put("/{report_id}/extracted-data")
async def update_extracted_data(
    report_id: str,
    extracted_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the extracted data for a report (manual editing).
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
    
    # Update extracted data
    report.extracted_data = extracted_data
    report.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": "success",
        "message": "Extracted data updated successfully"
    }


@router.post("/{report_id}/reprocess")
async def reprocess_report(
    report_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reprocess a report using updated extracted data.
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
    
    if not report.extracted_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No extracted data available to reprocess"
        )
    
    # Reset analysis status and set new start time
    report.analysis_status = "processing"
    report.analysis_started_at = datetime.utcnow()  # Set new start time for accurate duration
    report.summary = None
    report.severity_level = None
    report.is_critical = False
    report.has_abnormalities = False
    report.recommendations = None
    report.abnormal_findings = None
    report.analysis_completed_at = None
    db.commit()
    
    # Run analysis on existing extracted data
    background_tasks.add_task(reprocess_with_extracted_data, report_id, db)
    
    return {
        "status": "processing",
        "message": "Report is being reprocessed with updated data",
        "report_id": report_id
    }


async def reprocess_with_extracted_data(report_id: str, db: Session):
    """Background task to reprocess report with existing extracted data."""
    try:
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        if not report or not report.extracted_data:
            return
        
        # Initialize analyzer
        analyzer = MedicalAnalyzerAgent(OPENAI_API_KEY)
        
        # Run analysis
        analysis_start = datetime.utcnow()
        analysis_result = await analyzer.process({
            "extracted_data": report.extracted_data,
            "patient_context": {}
        })
        
        if analysis_result["status"] != "success":
            report.analysis_status = "failed"
            db.commit()
            return
        
        analysis_data = analysis_result["data"]
        
        # Update report
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
        
        # Delete old test results
        db.query(TestResult).filter(TestResult.report_id == report_id).delete()
        
        # Save new test results
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
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        if report:
            report.analysis_status = "failed"
            db.commit()


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

