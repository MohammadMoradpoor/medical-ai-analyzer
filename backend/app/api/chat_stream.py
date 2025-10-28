"""Chat streaming endpoints for real-time AI responses"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import os
import uuid
import json
import logging
import asyncio

from ..db.session import get_db
from ..db.models import User, MedicalReport, ChatMessage, TestResult
from ..auth.dependencies import get_current_user
from openai import AsyncOpenAI

router = APIRouter()
logger = logging.getLogger(__name__)

# Get OpenAI API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


async def stream_chat_response(
    report_id: str,
    question: str,
    conversation_id: str,
    report_context: dict,
    conversation_history: list,
    user_id: str,
    db: Session
):
    """
    Stream AI response chunks in real-time.
    """
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    # Build system instructions
    system_instructions = """You are an expert medical AI assistant specializing in explaining medical test results and imaging findings.

PRIMARY MISSION: Answer user questions about their specific medical report with accurate, helpful, patient-friendly explanations.

CAPABILITIES:
- Explain test results and imaging findings
- Interpret abnormalities and severity
- Clarify medical terminology
- Provide context from the report
- Suggest relevant follow-up questions

COMMUNICATION PRINCIPLES:
- Use clear, patient-friendly language
- Be empathetic and supportive
- Reference specific parts of the report
- Recommend professional consultation when appropriate
- Be honest about limitations

CRITICAL RULES:
- NEVER diagnose diseases (only explain test results)
- NEVER provide treatment advice (only explain recommendations)
- ALWAYS recommend consulting healthcare providers
- Be conservative and cautious"""
    
    # Build context prompt
    context_parts = []
    
    # Report type and metadata
    report_type = report_context.get("report_type", "Unknown")
    context_parts.append(f"REPORT TYPE: {report_type}")
    
    # Check if medical imaging
    is_imaging = report_context.get("extracted_data", {}).get("is_medical_imaging", False)
    
    if is_imaging:
        context_parts.append("\nREPORT CATEGORY: Medical Imaging Study")
        analysis_result = report_context.get("analysis_result", {})
        if analysis_result:
            context_parts.append(f"IMAGE TYPE: {analysis_result.get('image_type', 'Unknown')}")
            context_parts.append(f"SEVERITY: {report_context.get('severity_level', 'Unknown')}")
            if analysis_result.get("impression"):
                context_parts.append(f"IMPRESSION: {analysis_result['impression']}")
    else:
        context_parts.append("\nREPORT CATEGORY: Laboratory Test Results")
        test_analysis = report_context.get("test_analysis", [])
        if test_analysis:
            context_parts.append(f"\nTEST RESULTS ({len(test_analysis)} tests):")
            for test in test_analysis[:10]:  # First 10 tests
                context_parts.append(
                    f"  - {test.get('test_name')}: {test.get('value')} "
                    f"(Ref: {test.get('reference_range')}) "
                    f"[{'NORMAL' if test.get('is_normal') else 'ABNORMAL'}]"
                )
    
    context_prompt = "\n".join(context_parts)
    
    # Build messages
    messages = [
        {"role": "system", "content": system_instructions},
        {"role": "system", "content": f"REPORT CONTEXT:\n{context_prompt}"}
    ]
    
    # Add conversation history
    for msg in conversation_history[-10:]:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })
    
    # Add current question
    messages.append({
        "role": "user",
        "content": question
    })
    
    # Track accumulated response
    full_response = ""
    sources = []
    medical_terms = {}
    
    try:
        # Stream from OpenAI
        stream = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            stream=True,
            temperature=0.3,
            max_tokens=2000
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                
                # Send chunk to client
                yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"
        
        # Send completion signal
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
        # Extract medical terms and sources from the response using simple parsing
        sources = []
        medical_terms = {}
        
        # Try to extract sources from response (look for references)
        if "test result" in full_response.lower() or "report" in full_response.lower():
            sources.append("Test Results")
        if "reference range" in full_response.lower():
            sources.append("Reference Ranges")
        if "abnormal" in full_response.lower():
            sources.append("Abnormal Findings")
        if "recommendation" in full_response.lower():
            sources.append("Recommendations")
        
        # Calculate token usage and cost
        # Note: We'll estimate if not available from stream
        # GPT-4o pricing: $2.50/1M input, $10.00/1M output
        estimated_input_tokens = len(full_response.split()) * 1.3  # Rough estimate
        estimated_output_tokens = len(full_response.split())
        total_tokens = int(estimated_input_tokens + estimated_output_tokens)
        cost_estimate = (estimated_input_tokens / 1_000_000 * 2.50) + (estimated_output_tokens / 1_000_000 * 10.00)
        
        # Save complete message to database with metadata
        assistant_message = ChatMessage(
            report_id=report_id,
            user_id=user_id,
            role="assistant",
            content=full_response,
            message_type="answer",
            conversation_id=conversation_id,
            model_used="gpt-4o",
            tokens_used=total_tokens,
            cost_estimate=cost_estimate,
            sources=sources if sources else None,
            created_at=datetime.utcnow()
        )
        
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        
        # Send final message ID
        yield f"data: {json.dumps({'type': 'message_id', 'message_id': str(assistant_message.id)})}\n\n"
        
    except Exception as e:
        logger.error(f"[CHAT STREAM] Error: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"


@router.post("/{report_id}/chat/stream")
async def stream_chat_message(
    report_id: str,
    question_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream AI chat response in real-time (like ChatGPT).
    """
    question = question_data.get("question", "")
    conversation_id = question_data.get("conversation_id")
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is required"
        )
    
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
    
    if report.analysis_status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report analysis must be completed before asking questions"
        )
    
    # Generate conversation ID if not provided
    if not conversation_id:
        conversation_id = f"conv_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:8]}"
    
    # Save user's question
    user_message = ChatMessage(
        report_id=report_id,
        user_id=current_user.id,
        role="user",
        content=question,
        message_type="question",
        conversation_id=conversation_id,
        created_at=datetime.utcnow()
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    logger.info(f"[CHAT STREAM] User {current_user.id} asked streaming question about report {report_id}")
    
    # Get conversation history
    conversation_history = db.query(ChatMessage).filter(
        ChatMessage.report_id == report_id,
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    # Build history for AI (excluding current question)
    history_for_ai = [
        {"role": msg.role, "content": msg.content}
        for msg in conversation_history[:-1]
    ]
    
    # Build report context
    test_results = db.query(TestResult).filter(
        TestResult.report_id == report_id
    ).all()
    
    report_context = {
        "report_type": report.report_type,
        "severity_level": report.severity_level,
        "is_critical": report.is_critical,
        "has_abnormalities": report.has_abnormalities,
        "summary": report.summary,
        "extracted_data": report.extracted_data,
        "analysis_result": report.analysis_result,
        "abnormal_findings": report.abnormal_findings,
        "recommendations": report.recommendations,
        "test_analysis": [
            {
                "test_name": tr.test_name,
                "value": tr.value,
                "unit": tr.unit,
                "reference_range": tr.reference_range,
                "is_normal": bool(tr.is_normal) if tr.is_normal is not None else True,
                "severity": tr.severity,
                "interpretation": tr.interpretation
            }
            for tr in test_results
        ] if test_results else []
    }
    
    return StreamingResponse(
        stream_chat_response(
            report_id=report_id,
            question=question,
            conversation_id=conversation_id,
            report_context=report_context,
            conversation_history=history_for_ai,
            user_id=str(current_user.id),
            db=db
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

