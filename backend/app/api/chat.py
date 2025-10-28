"""Chat API endpoints for interactive Q&A about medical reports"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict
import os
import uuid
import json
import logging
import asyncio

from ..db.session import get_db
from ..db.models import User, MedicalReport, ChatMessage, TestResult
from ..auth.dependencies import get_current_user
from ..agents.report_chat_agent import ReportChatAgent

router = APIRouter()
logger = logging.getLogger(__name__)

# Get OpenAI API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# Pydantic models
class ChatQuestionRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    message_type: Optional[str]
    confidence_score: Optional[float]
    sources: Optional[List[str]]
    follow_up_suggestions: Optional[List[str]]
    medical_terms_explained: Optional[Dict[str, str]]
    tokens_used: Optional[int]
    cost_estimate: Optional[float]
    is_helpful: Optional[bool]
    user_rating: Optional[int]
    conversation_id: Optional[str]
    created_at: datetime


class SuggestedQuestionsResponse(BaseModel):
    questions: List[str]


@router.post("/{report_id}/chat", response_model=ChatMessageResponse)
async def send_chat_message(
    report_id: str,
    request: ChatQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a chat message and get AI response about the medical report.
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
    
    # Check if report analysis is complete
    if report.analysis_status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report analysis must be completed before asking questions"
        )
    
    # Get or create conversation ID
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    # Save user's question
    user_message = ChatMessage(
        report_id=report_id,
        user_id=current_user.id,
        role="user",
        content=request.question,
        message_type="question",
        conversation_id=conversation_id,
        created_at=datetime.utcnow()
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    logger.info(f"[CHAT] User {current_user.id} asked question about report {report_id}")
    
    # Get conversation history
    conversation_history = db.query(ChatMessage).filter(
        ChatMessage.report_id == report_id,
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    # Build conversation history for AI (excluding current question)
    history_for_ai = [
        {
            "role": msg.role,
            "content": msg.content
        }
        for msg in conversation_history[:-1]  # Exclude the current question we just added
    ]
    
    # Build report context
    report_context = {
        "report_id": str(report.id),
        "report_type": report.report_type,
        "severity_level": report.severity_level,
        "is_critical": report.is_critical,
        "has_abnormalities": report.has_abnormalities,
        "summary": report.summary,
        "extracted_data": report.extracted_data,
        "analysis_result": report.analysis_result,
        "abnormal_findings": report.abnormal_findings,
        "recommendations": report.recommendations
    }
    
    # Get test results if lab report
    test_results = db.query(TestResult).filter(
        TestResult.report_id == report_id
    ).all()
    
    if test_results:
        report_context["test_analysis"] = [
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
    
    # Initialize chat agent
    chat_agent = ReportChatAgent(api_key=OPENAI_API_KEY)
    
    # Get AI response
    try:
        start_time = datetime.utcnow()
        result = await chat_agent.process({
            "question": request.question,
            "report_context": report_context,
            "conversation_history": history_for_ai,
            "user_context": {
                "user_id": str(current_user.id),
                "username": current_user.username
            }
        })
        execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        if result["status"] != "success":
            # Delete user message if AI failed
            db.delete(user_message)
            db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to generate response")
            )
        
        # Extract response data
        response_data = result["data"]
        token_usage = result.get("token_usage", {})
        
        # Save assistant's response
        assistant_message = ChatMessage(
            report_id=report_id,
            user_id=current_user.id,
            role="assistant",
            content=response_data["answer"],
            message_type="answer",
            conversation_id=conversation_id,
            parent_message_id=user_message.id,
            model_used="gpt-4o",
            tokens_used=token_usage.get("total_tokens"),
            cost_estimate=response_data.get("cost_estimate"),
            confidence_score=response_data.get("confidence"),
            sources=response_data.get("sources"),
            context_used={
                "report_type": report.report_type,
                "severity_level": report.severity_level,
                "conversation_length": len(history_for_ai) + 1
            },
            created_at=datetime.utcnow()
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        
        logger.info(f"[CHAT] Generated response in {execution_time}ms using {token_usage.get('total_tokens', 0)} tokens")
        
        return ChatMessageResponse(
            id=str(assistant_message.id),
            role=assistant_message.role,
            content=assistant_message.content,
            message_type=assistant_message.message_type,
            confidence_score=assistant_message.confidence_score,
            sources=assistant_message.sources,
            follow_up_suggestions=response_data.get("follow_up_suggestions"),
            medical_terms_explained=response_data.get("medical_terms_explained"),
            tokens_used=assistant_message.tokens_used,
            cost_estimate=assistant_message.cost_estimate,
            is_helpful=assistant_message.is_helpful,
            user_rating=assistant_message.user_rating,
            conversation_id=assistant_message.conversation_id,
            created_at=assistant_message.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CHAT] Error generating response: {str(e)}", exc_info=True)
        
        # Delete user message if processing failed
        try:
            db.delete(user_message)
            db.commit()
        except:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(e)}"
        )


@router.get("/{report_id}/chat/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    report_id: str,
    conversation_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """
    Get chat message history for a report.
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
    
    # Build query
    query = db.query(ChatMessage).filter(
        ChatMessage.report_id == report_id
    )
    
    # Filter by conversation if specified
    if conversation_id:
        query = query.filter(ChatMessage.conversation_id == conversation_id)
    
    # Get messages
    messages = query.order_by(ChatMessage.created_at.asc()).limit(limit).all()
    
    return [
        ChatMessageResponse(
            id=str(msg.id),
            role=msg.role,
            content=msg.content,
            message_type=msg.message_type,
            confidence_score=msg.confidence_score,
            sources=msg.sources,
            follow_up_suggestions=None,  # Only on latest message
            medical_terms_explained=None,  # Only on latest message
            tokens_used=msg.tokens_used,
            cost_estimate=msg.cost_estimate,
            is_helpful=msg.is_helpful,
            user_rating=msg.user_rating,
            conversation_id=msg.conversation_id,
            created_at=msg.created_at
        )
        for msg in messages
    ]


@router.get("/{report_id}/chat/suggested-questions", response_model=SuggestedQuestionsResponse)
async def get_suggested_questions(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated suggested questions about the report.
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
    
    if report.analysis_status != "completed":
        # Return basic questions if analysis not complete (3 questions)
        return SuggestedQuestionsResponse(
            questions=[
                "What is the status of my report analysis?",
                "When will my results be ready?",
                "What information was uploaded?"
            ]
        )
    
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
                "is_normal": bool(tr.is_normal) if tr.is_normal is not None else True
            }
            for tr in test_results
        ] if test_results else []
    }
    
    # Generate suggested questions
    chat_agent = ReportChatAgent(api_key=OPENAI_API_KEY)
    
    try:
        questions = await chat_agent.generate_suggested_questions(report_context)
        return SuggestedQuestionsResponse(questions=questions)
    except Exception as e:
        logger.error(f"Error generating suggested questions: {str(e)}")
        
        # Return context-aware fallback questions (3 questions)
        if report.is_critical:
            fallback_questions = [
                "What makes my results critical?",
                "What should I do immediately?",
                "Which findings are most concerning?"
            ]
        elif report.has_abnormalities:
            fallback_questions = [
                "Which of my results are abnormal?",
                "What do the abnormal findings mean?",
                "What are the next steps?"
            ]
        else:
            fallback_questions = [
                "What do my results indicate overall?",
                "Are all my test values normal?",
                "What should I monitor going forward?"
            ]
        
        return SuggestedQuestionsResponse(questions=fallback_questions)


@router.post("/{report_id}/chat/{conversation_id}/generate-title")
async def generate_conversation_title(
    report_id: str,
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an LLM-powered title for a conversation.
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
    
    # Get conversation messages
    messages = db.query(ChatMessage).filter(
        ChatMessage.report_id == report_id,
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at.asc()).limit(10).all()  # First 10 messages
    
    if not messages:
        return {"title": "New Conversation"}
    
    # Generate title using LLM
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        # Build context from first few messages
        context = "\n".join([
            f"{msg.role.upper()}: {msg.content[:200]}"
            for msg in messages[:4]
        ])
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Generate a concise, descriptive title (max 6 words) for this conversation. Return only the title in JSON format."
                },
                {
                    "role": "user",
                    "content": f"Generate a short title for this conversation:\n\n{context}\n\nReturn JSON: {{\"title\": \"your title here\"}}"
                }
            ],
            response_format={"type": "json_object"},
            max_tokens=50,
            temperature=0.7
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        title = result.get("title", "Conversation")
        
        logger.info(f"[CHAT] Generated title for conversation {conversation_id}: {title}")
        
        return {"title": title}
        
    except Exception as e:
        logger.error(f"Error generating conversation title: {str(e)}")
        # Fallback: Use first question
        first_user_msg = next((m for m in messages if m.role == "user"), None)
        if first_user_msg:
            title = first_user_msg.content.split('\n')[0][:40]
            return {"title": title + "..." if len(first_user_msg.content) > 40 else title}
        return {"title": "Medical Chat"}


@router.post("/{report_id}/chat/{message_id}/feedback")
async def submit_chat_feedback(
    report_id: str,
    message_id: str,
    feedback: Dict[str, bool],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit user feedback (helpful/not helpful) for a chat message.
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
    
    # Get message
    message = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.report_id == report_id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only allow feedback on assistant messages
    if message.role != "assistant":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback can only be provided for AI responses"
        )
    
    # Update feedback
    is_helpful = feedback.get("is_helpful", True)
    message.is_helpful = is_helpful
    message.user_rating = 5 if is_helpful else 1
    message.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(message)
    
    logger.info(f"[CHAT FEEDBACK] User {current_user.id} marked message {message_id} as {'helpful' if is_helpful else 'not helpful'}")
    
    return {
        "message": "Feedback recorded successfully",
        "is_helpful": message.is_helpful,
        "user_rating": message.user_rating
    }


@router.delete("/{report_id}/chat/{message_id}")
async def delete_chat_message(
    report_id: str,
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific chat message.
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
    
    # Get message
    message = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.report_id == report_id,
        ChatMessage.user_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Delete message
    db.delete(message)
    db.commit()
    
    return {"message": "Chat message deleted successfully"}


@router.delete("/{report_id}/chat")
async def clear_chat_history(
    report_id: str,
    conversation_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all chat history for a report (or specific conversation).
    """
    logger.info(f"[CHAT DELETE] Attempting to delete chat for report {report_id}, conversation: {conversation_id}")
    
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
    
    # Build query
    query = db.query(ChatMessage).filter(
        ChatMessage.report_id == report_id
    )
    
    # Filter by conversation if specified
    if conversation_id:
        logger.info(f"[CHAT DELETE] Filtering by conversation_id: {conversation_id}")
        query = query.filter(ChatMessage.conversation_id == conversation_id)
    
    # Count before delete
    count_before = query.count()
    logger.info(f"[CHAT DELETE] Found {count_before} messages to delete")
    
    # Delete messages
    deleted_count = query.delete()
    db.commit()
    
    logger.info(f"[CHAT DELETE] Successfully deleted {deleted_count} messages")
    
    return {
        "message": f"Deleted {deleted_count} chat message(s)",
        "deleted_count": deleted_count
    }


@router.get("/chat/counts")
async def get_all_chat_counts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get conversation counts for all reports.
    Returns a map of report_id -> conversation_count.
    """
    # Get all messages for user
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).all()
    
    # Group by report and count unique conversations
    report_counts = {}
    for message in messages:
        report_id = str(message.report_id)
        if report_id not in report_counts:
            report_counts[report_id] = set()
        if message.conversation_id:
            report_counts[report_id].add(message.conversation_id)
    
    # Convert sets to counts
    return {
        report_id: len(conv_set)
        for report_id, conv_set in report_counts.items()
    }


@router.get("/{report_id}/chat/stats")
async def get_chat_stats(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get chat statistics for a report.
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
    
    # Get all messages for this report
    messages = db.query(ChatMessage).filter(
        ChatMessage.report_id == report_id
    ).all()
    
    # Calculate statistics
    total_messages = len(messages)
    user_questions = len([m for m in messages if m.role == "user"])
    ai_responses = len([m for m in messages if m.role == "assistant"])
    total_tokens = sum(m.tokens_used for m in messages if m.tokens_used)
    total_cost = sum(m.cost_estimate for m in messages if m.cost_estimate)
    
    # Get unique conversations
    conversations = set(m.conversation_id for m in messages if m.conversation_id)
    
    # Average confidence
    confidences = [m.confidence_score for m in messages if m.confidence_score is not None]
    avg_confidence = sum(confidences) / len(confidences) if confidences else None
    
    return {
        "total_messages": total_messages,
        "user_questions": user_questions,
        "ai_responses": ai_responses,
        "conversations_count": len(conversations),
        "total_tokens_used": total_tokens,
        "total_cost_usd": round(total_cost, 4) if total_cost else 0,
        "average_confidence": round(avg_confidence, 2) if avg_confidence else None,
        "last_message_at": max(m.created_at for m in messages).isoformat() if messages else None
    }

