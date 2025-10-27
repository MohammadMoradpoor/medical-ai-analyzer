"""
Document Extractor Agent - Extracts medical test data from PDFs and images
"""

import logging
import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import PyPDF2
import io
from openai import AsyncOpenAI
from .base_agent import BaseAgent, AgentRegistry

logger = logging.getLogger(__name__)


class DocumentExtractorAgent(BaseAgent):
    """
    AI-powered document extractor agent for medical test reports.
    Extracts structured data from PDFs and images using OpenAI.
    """
    
    def get_agent_type(self) -> str:
        return "document_extractor"
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = AsyncOpenAI(api_key=api_key)
        
        # System instructions for extraction
        self.system_instructions = """You are an expert medical document analyst specializing in extracting data from lab reports and medical test results.

PRIMARY MISSION: Extract 100% of medical information with PERFECT accuracy.

EXTRACTION REQUIREMENTS:

📋 **GENERAL INFORMATION**:
- Patient name (if present)
- Test date
- Lab/Hospital name
- Doctor name (if present)
- Report type (blood test, urine test, imaging, etc.)

🔬 **TEST RESULTS**:
For EACH test, extract:
- Test name (exact as written)
- Test value (with units)
- Reference range (normal range)
- Units of measurement
- Any flags (H for high, L for low, etc.)

💡 **CRITICAL INFORMATION**:
- Any abnormal values
- Critical or urgent flags
- Doctor's notes or comments
- Interpretations or diagnoses

🎯 **OUTPUT FORMAT**:
Return a JSON object with:
{
  "patient_info": {
    "name": "...",
    "age": "...",
    "gender": "..."
  },
  "report_info": {
    "test_date": "YYYY-MM-DD",
    "lab_name": "...",
    "doctor_name": "...",
    "report_type": "..."
  },
  "test_results": [
    {
      "test_name": "...",
      "value": "...",
      "unit": "...",
      "reference_range": "...",
      "is_normal": true/false,
      "flag": "H/L/N",
      "category": "hematology/biochemistry/etc"
    }
  ],
  "abnormal_findings": ["..."],
  "doctor_notes": "...",
  "extraction_notes": ["Any extraction challenges or ambiguities"]
}

⚠️ **ACCURACY RULES**:
- NEVER guess or estimate values
- Extract EXACTLY as written in the document
- Use null for missing information
- Flag any unclear or ambiguous data
- Preserve original units and formatting
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a medical document and extract structured data.
        
        Args:
            input_data: Dict with:
                - file_content: bytes of the file
                - file_type: 'pdf' or 'image'
                
        Returns:
            Dict with extraction results
        """
        try:
            file_content = input_data.get("file_content")
            file_type = input_data.get("file_type", "pdf")
            
            self.log_event("extraction_started", {"file_type": file_type})
            
            # Extract text from document
            ocr_token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            
            if file_type == "pdf":
                text = self._extract_text_from_pdf(file_content)
            else:
                # For images, we'll use OCR or direct vision API
                text, ocr_token_usage = await self._extract_text_from_image(file_content)
            
            if not text:
                return {
                    "status": "failure",
                    "error": "Could not extract text from document",
                    "data": None
                }
            
            # Use AI to extract structured data
            extracted_data, structure_token_usage = await self._extract_structured_data(text)
            
            # Combine token usage from OCR and structuring
            total_token_usage = {
                "prompt_tokens": ocr_token_usage["prompt_tokens"] + structure_token_usage["prompt_tokens"],
                "completion_tokens": ocr_token_usage["completion_tokens"] + structure_token_usage["completion_tokens"],
                "total_tokens": ocr_token_usage["total_tokens"] + structure_token_usage["total_tokens"]
            }
            
            self.log_event("extraction_completed", {
                "tests_found": len(extracted_data.get("test_results", []))
            })
            
            return {
                "status": "success",
                "data": extracted_data,
                "error": None,
                "token_usage": total_token_usage
            }
            
        except Exception as e:
            logger.error(f"Document extraction failed: {str(e)}", exc_info=True)
            return self.handle_error(e)
    
    def _extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text from PDF file."""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            
            return text
        except Exception as e:
            logger.error(f"PDF extraction error: {str(e)}")
            return ""
    
    async def _extract_text_from_image(self, image_content: bytes) -> str:
        """Extract text from image using OpenAI Vision API."""
        try:
            import base64
            base64_image = base64.b64encode(image_content).decode('utf-8')
            
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Extract ALL text from this medical document image in its original language. 
                                
Return the complete text exactly as written, preserving:
- All test names and values
- All dates and patient information  
- All lab/hospital names
- All reference ranges
- All medical terminology
- Original language (do not translate)

Return the extracted text, not JSON. Include everything visible in the image."""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=4000,
                temperature=0.0
            )
            
            extracted_text = response.choices[0].message.content
            
            # Extract token usage
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            
            return extracted_text or "", token_usage
            
        except Exception as e:
            logger.error(f"Image text extraction error: {str(e)}")
            return "", {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    
    async def _extract_structured_data(self, text: str) -> Dict[str, Any]:
        """Use AI to extract structured data from text."""
        try:
            user_prompt = f"""Analyze this medical test report and extract all information in structured JSON format.

DOCUMENT TEXT:
{text}

Extract all test results, patient information, and abnormal findings following the specified JSON format. Return your response as a valid JSON object."""
            
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.system_instructions},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.0  # Deterministic extraction
            )
            
            extracted_data = json.loads(response.choices[0].message.content)
            
            # Extract token usage
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            
            return extracted_data, token_usage
            
        except Exception as e:
            logger.error(f"AI extraction failed: {str(e)}")
            return {}, {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}


# Register the agent
AgentRegistry.register("document_extractor", DocumentExtractorAgent)

