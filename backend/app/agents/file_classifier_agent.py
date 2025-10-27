"""
File Classifier Agent - Identifies and validates uploaded files
"""

import logging
import io
from typing import Dict, Any
from datetime import datetime
from openai import AsyncOpenAI
from .base_agent import BaseAgent, AgentRegistry
import PyPDF2
from PIL import Image

logger = logging.getLogger(__name__)


class FileClassifierAgent(BaseAgent):
    """
    AI-powered file classifier that identifies file types and validates medical content.
    """
    
    def get_agent_type(self) -> str:
        return "file_classifier"
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = AsyncOpenAI(api_key=api_key)
        
        self.system_instructions = """You are an expert file classification AI specializing in medical documents.

YOUR MISSION: Identify file types and validate if content is medical-related.

CLASSIFICATION TASKS:
1. Determine file format (PDF, Image, etc.)
2. Identify if content is medical-related
3. Detect document type (lab report, prescription, imaging, etc.)
4. Extract basic metadata (language, quality, readability)
5. Assess if file is processable

RETURN JSON with:
{
  "is_medical": true/false,
  "file_type": "pdf/image/unknown",
  "document_type": "blood_test/urine_test/x_ray/mri/ct_scan/ultrasound/dental_xray/dental_imaging/pathology/prescription/ecg/ekg/other",
  "imaging_type": "chest_xray/dental_xray/brain_mri/spine_ct/abdominal_ultrasound/etc" (if medical imaging),
  "body_part": "chest/head/spine/abdomen/dental/etc" (if imaging),
  "language": "english/spanish/french/arabic/etc",
  "quality": "high/medium/low",
  "is_processable": true/false,
  "confidence": 0-100,
  "metadata": {
    "pages": 1,
    "has_tables": true/false,
    "has_images": true/false,
    "detected_sections": ["patient info", "test results", "lab name"]
  },
  "rejection_reason": "if not medical or not processable",
  "recommendations": ["suggestions for user if needed"]
}

IMPORTANT: For medical imaging (X-Ray, MRI, CT, Dental), mark as processable and medical!

VALIDATION RULES:
- Reject non-medical content (recipes, invoices, personal photos, etc.)
- Accept all medical test results, lab reports, prescriptions, medical imaging
- Support multiple languages (English, Spanish, French, Arabic, etc.)
- Handle poor quality images with appropriate warnings
- Flag unreadable or corrupted files
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify and validate an uploaded file.
        
        Args:
            input_data: Dict with:
                - file_content: bytes of the file
                - file_type: 'pdf' or 'image'
                - file_name: original filename
                
        Returns:
            Dict with classification results
        """
        try:
            file_content = input_data.get("file_content")
            file_type = input_data.get("file_type", "unknown")
            file_name = input_data.get("file_name", "unknown")
            
            self.log_event("classification_started", {
                "file_type": file_type,
                "file_name": file_name
            })
            
            # Get file metadata
            metadata = self._extract_file_metadata(file_content, file_type)
            
            # Use AI to classify the file
            classification, token_usage = await self._classify_with_ai(file_content, file_type, metadata)
            
            # Add metadata to classification
            classification["metadata"] = metadata
            
            self.log_event("classification_completed", {
                "is_medical": classification.get("is_medical"),
                "document_type": classification.get("document_type"),
                "is_processable": classification.get("is_processable")
            })
            
            return {
                "status": "success",
                "data": classification,
                "error": None,
                "token_usage": token_usage
            }
            
        except Exception as e:
            logger.error(f"File classification failed: {str(e)}", exc_info=True)
            return self.handle_error(e)
    
    def _extract_file_metadata(self, file_content: bytes, file_type: str) -> Dict[str, Any]:
        """Extract basic file metadata."""
        metadata = {
            "file_size_bytes": len(file_content),
            "file_size_kb": round(len(file_content) / 1024, 2)
        }
        
        try:
            if file_type == "pdf":
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                metadata["pages"] = len(pdf_reader.pages)
                metadata["has_text"] = any(page.extract_text().strip() for page in pdf_reader.pages)
            elif file_type == "image":
                image = Image.open(io.BytesIO(file_content))
                metadata["image_format"] = image.format
                metadata["image_size"] = image.size
                metadata["image_mode"] = image.mode
        except Exception as e:
            logger.error(f"Metadata extraction error: {str(e)}")
            
        return metadata
    
    async def _classify_with_ai(self, file_content: bytes, file_type: str, metadata: Dict) -> Dict[str, Any]:
        """Use AI to classify and validate the file."""
        try:
            # For images, use vision API
            if file_type == "image":
                import base64
                base64_image = base64.b64encode(file_content).decode('utf-8')
                
                response = await self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": self.system_instructions},
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"""Analyze this image and classify it. Return your response as a JSON object.

File Metadata:
{metadata}

Determine:
1. Is this a medical document/test result?
2. What type of medical document is it?
3. What language is it in?
4. Is the quality sufficient for processing?
5. Can we extract useful information from it?
"""
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.0
                )
            else:
                # For PDFs, analyze text content
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                # Get first few pages of text
                text_sample = ""
                for page_num in range(min(3, len(pdf_reader.pages))):
                    text_sample += pdf_reader.pages[page_num].extract_text() + "\n"
                
                text_sample = text_sample[:2000]  # Limit to first 2000 chars
                
                response = await self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": self.system_instructions},
                        {
                            "role": "user",
                            "content": f"""Analyze this PDF document and classify it. Return your response as a JSON object.

File Metadata:
{metadata}

Document Text Sample:
{text_sample}

Determine:
1. Is this a medical document/test result?
2. What type of medical document is it?
3. What language is it in?
4. Is the quality sufficient for processing?
5. Can we extract useful information from it?
"""
                        }
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.0
                )
            
            import json
            classification = json.loads(response.choices[0].message.content)
            
            # Extract token usage from OpenAI response
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            
            return classification, token_usage
            
        except Exception as e:
            logger.error(f"AI classification failed: {str(e)}")
            # Return safe default with zero tokens
            return {
                "is_medical": True,  # Assume medical to allow processing
                "file_type": file_type,
                "document_type": "unknown",
                "language": "unknown",
                "quality": "medium",
                "is_processable": True,
                "confidence": 50,
                "metadata": metadata,
                "rejection_reason": None,
                "recommendations": []
            }, {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}


# Register the agent
AgentRegistry.register("file_classifier", FileClassifierAgent)

