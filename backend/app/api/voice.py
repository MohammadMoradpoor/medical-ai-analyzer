"""Voice Message API - Audio transcription and TTS"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import os
import uuid
import io
from openai import AsyncOpenAI
import logging

from ..db.session import get_db
from ..db.models import User, MedicalReport
from ..auth.dependencies import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not found - voice features will be unavailable")
    client = None
else:
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)


class TextToSpeechRequest(BaseModel):
    text: str


@router.post("/{report_id}/chat/voice")
async def transcribe_voice_message(
    report_id: str,
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Transcribe voice message using OpenAI Whisper API.
    
    Returns:
        - transcription: The transcribed text
        - duration: Audio duration in seconds
        - language: Detected language
    """
    try:
        # Check if OpenAI client is available
        if not client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Voice transcription service not configured"
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
        
        # Validate file type
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an audio file"
            )
        
        # Read audio file
        audio_content = await audio.read()
        
        # Save temporarily for processing
        temp_filename = f"temp_audio_{uuid.uuid4()}.webm"
        temp_path = f"/tmp/{temp_filename}"
        
        try:
            with open(temp_path, 'wb') as f:
                f.write(audio_content)
            
            logger.info(f"[VOICE] Transcribing audio for report {report_id}")
            
            # Transcribe using OpenAI Whisper
            with open(temp_path, 'rb') as audio_file:
                transcription_response = await client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                    language="en"  # Can be auto-detected by removing this parameter
                )
            
            transcription_text = transcription_response.text
            detected_language = transcription_response.language if hasattr(transcription_response, 'language') else 'en'
            duration = transcription_response.duration if hasattr(transcription_response, 'duration') else 0
            
            logger.info(f"[VOICE] Transcription successful: {len(transcription_text)} characters")
            
            return {
                "transcription": transcription_text,
                "language": detected_language,
                "duration": duration,
                "status": "success"
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[VOICE] Transcription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}"
        )


@router.post("/{report_id}/chat/text-to-speech")
async def text_to_speech(
    report_id: str,
    request: TextToSpeechRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Convert text to speech using OpenAI TTS API.
    Uses 'nova' voice - a warm, professional female voice suitable for medical content.
    
    Returns: Audio stream (MP3)
    """
    try:
        # Check if OpenAI client is available
        if not client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Text-to-speech service not configured"
            )
        
        # Verify report access
        report = db.query(MedicalReport).filter(
            MedicalReport.id == report_id,
            MedicalReport.user_id == current_user.id
        ).first()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        # Validate text
        if not request.text or len(request.text) > 4000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text must be between 1 and 4000 characters"
            )
        
        logger.info(f"[TTS] Converting {len(request.text)} characters to speech")
        
        # Generate speech using OpenAI TTS
        # Voice options: alloy, echo, fable, onyx, nova, shimmer
        # 'nova' - Warm, professional female voice (best for medical)
        response = await client.audio.speech.create(
            model="tts-1",  # Standard quality, fast
            voice="nova",   # Professional female voice
            input=request.text,
            speed=0.95  # Slightly slower for clarity
        )
        
        # Stream the audio response
        audio_data = response.content
        
        logger.info(f"[TTS] Audio generated successfully")
        
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[TTS] Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-speech failed: {str(e)}"
        )

