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
from .imaging_agent import MedicalImagingAgent

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
                ocr_token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            else:
                # For images, check if it's signal analysis (ECG/EEG) first
                image_result = await self._extract_text_from_image(file_content)
                
                # Check if this was routed to a signal agent (returns full result instead of text)
                if isinstance(image_result, dict) and image_result.get("status") == "success":
                    # Signal agent handled it completely - return directly
                    return image_result
                
                # Otherwise it's a tuple (text, token_usage) for normal image processing
                text, ocr_token_usage = image_result
            
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
            
            # Check if this was medical imaging analysis
            is_medical_imaging = extracted_data.get("is_medical_imaging", False)
            
            # Prepare execution details
            execution_details = {}
            
            # If imaging analysis was performed, include it in execution details
            if is_medical_imaging and hasattr(self, '_last_imaging_analysis'):
                logger.info("[DOCUMENT EXTRACTOR] Including imaging analysis in execution details")
                execution_details["imaging_analysis"] = self._last_imaging_analysis
                execution_details["imaging_token_usage"] = self._last_imaging_token_usage
                execution_details["imaging_execution_time_ms"] = self._last_imaging_execution_time
            
            self.log_event("extraction_completed", {
                "tests_found": len(extracted_data.get("test_results", [])),
                "is_medical_imaging": is_medical_imaging
            })
            
            return {
                "status": "success",
                "data": extracted_data,
                "error": None,
                "token_usage": total_token_usage,
                "execution_details": execution_details
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
    
    async def _extract_text_from_image(self, image_content: bytes) -> tuple:
        """
        Extract text/data from image using OpenAI Vision API.
        Now enhanced to detect and handle medical imaging properly.
        """
        try:
            import base64
            base64_image = base64.b64encode(image_content).decode('utf-8')
            
            # First, detect what type of medical content this is
            detection_response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Quickly identify what type of medical content this is:
1. LAB_REPORT - Contains test results with values and reference ranges
2. XRAY - X-ray radiograph image (bones, chest, etc.)
3. MRI - MRI scan image
4. CT_SCAN - CT/CAT scan image
5. DENTAL - Dental X-ray or imaging
6. ULTRASOUND - Ultrasound image
7. ECG or EKG - Electrocardiogram (cardiac rhythm tracing with P-QRS-T waves)
8. EEG - Electroencephalogram (brain wave recording, multiple channels)
9. OTHER_MEDICAL - Other medical document

Return ONLY the category name (e.g., "LAB_REPORT" or "XRAY" or "ECG" or "EEG")."""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "low"  # Low detail for quick detection
                                }
                            }
                        ]
                    }
                ],
                max_tokens=50,
                temperature=0.0
            )
            
            detected_type = detection_response.choices[0].message.content.strip().upper()
            logger.info(f"[DOCUMENT EXTRACTOR] Detected image type: {detected_type}")
            
            # Generate execution ID for this operation
            from uuid import uuid4
            execution_id = uuid4()
            
            # Route to specialized agents based on type
            if detected_type in ["ECG", "EKG"]:
                logger.info(f"[DOCUMENT EXTRACTOR] Routing to CardiacSignalAgent for ECG analysis")
                
                from .cardiac_signal_agent import CardiacSignalAgent
                signal_agent = CardiacSignalAgent(api_key=self.api_key)
                
                signal_start = datetime.utcnow()
                signal_result = await signal_agent.process({
                    "image_data": base64_image,
                    "ecg_type": "12_lead"
                })
                signal_execution_time = (datetime.utcnow() - signal_start).total_seconds() * 1000
                
                if signal_result["status"] == "success":
                    return {
                        "status": "success",
                        "agent_type": self.get_agent_type(),
                        "execution_id": str(execution_id),
                        "data": signal_result["data"],
                        "metadata": {
                            "extraction_method": "cardiac_signal_analysis",
                            "model_used": self.model,
                            "signal_analysis_time_ms": signal_execution_time,
                            **signal_result.get("metadata", {})
                        }
                    }
            
            elif detected_type in ["EEG"]:
                logger.info(f"[DOCUMENT EXTRACTOR] Routing to NeurologicalSignalAgent for EEG analysis")
                
                from .neurological_signal_agent import NeurologicalSignalAgent
                neuro_agent = NeurologicalSignalAgent(api_key=self.api_key)
                
                neuro_start = datetime.utcnow()
                neuro_result = await neuro_agent.process({
                    "image_data": base64_image,
                    "eeg_type": "routine"
                })
                neuro_execution_time = (datetime.utcnow() - neuro_start).total_seconds() * 1000
                
                if neuro_result["status"] == "success":
                    return {
                        "status": "success",
                        "agent_type": self.get_agent_type(),
                        "execution_id": str(execution_id),
                        "data": neuro_result["data"],
                        "metadata": {
                            "extraction_method": "neurological_signal_analysis",
                            "model_used": self.model,
                            "eeg_analysis_time_ms": neuro_execution_time,
                            **neuro_result.get("metadata", {})
                        }
                    }
            
            # If it's medical imaging (not lab report), use specialized imaging agent
            elif detected_type in ["XRAY", "MRI", "CT_SCAN", "DENTAL", "ULTRASOUND"]:
                logger.info(f"[DOCUMENT EXTRACTOR] Routing to MedicalImagingAgent for {detected_type}")
                
                # Map detected type to imaging agent type
                imaging_type_map = {
                    "XRAY": "xray",
                    "MRI": "mri", 
                    "CT_SCAN": "ct_scan",
                    "DENTAL": "dental",
                    "ULTRASOUND": "general"
                }
                
                imaging_type = imaging_type_map.get(detected_type, "general")
                
                # Use the specialized imaging agent
                imaging_agent = MedicalImagingAgent(api_key=self.api_key)
                
                imaging_start = datetime.utcnow()
                imaging_result = await imaging_agent.process({
                    "image_data": base64_image,
                    "imaging_type": imaging_type
                })
                imaging_execution_time = (datetime.utcnow() - imaging_start).total_seconds() * 1000
                
                if imaging_result["status"] == "success":
                    import json
                    # For medical imaging, we don't extract "text data"
                    # Instead, we return a special marker and store the analysis directly
                    analysis_data = imaging_result["data"]
                    
                    # Store imaging analysis for later retrieval
                    self._last_imaging_analysis = analysis_data
                    self._last_imaging_token_usage = imaging_result.get("token_usage", {})
                    self._last_imaging_execution_time = imaging_execution_time
                    
                    logger.info(f"[DOCUMENT EXTRACTOR] Stored imaging analysis: {analysis_data.get('image_type')}, severity: {analysis_data.get('severity_level')}")
                    
                    # Return special marker indicating this is imaging analysis, not text extraction
                    # The structured data will be stored directly in report.analysis_result
                    extracted_text = f"__MEDICAL_IMAGING_ANALYSIS__:{detected_type}:{analysis_data.get('image_type', 'unknown')}"
                    
                    token_usage = imaging_result.get("token_usage", {
                        "prompt_tokens": 0,
                        "completion_tokens": 0,
                        "total_tokens": 0
                    })
                    
                    return extracted_text, token_usage
                else:
                    logger.warning(f"[DOCUMENT EXTRACTOR] Imaging agent failed, falling back to standard extraction")
            
            # For lab reports or if imaging agent failed, use standard extraction
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """You are analyzing a medical document/image. 

If this is a LAB REPORT or contains TEXT:
- Extract ALL text including test names, values, reference ranges
- Extract patient information
- Extract dates, lab names, doctor names

If this is MEDICAL IMAGING without specialized analysis:
- Describe what you see in the image
- Note body part being imaged
- Describe any visible abnormalities
- Note any areas of concern

Return ALL information you can extract or observe. Be detailed and thorough."""
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
            logger.error(f"Image text extraction error: {str(e)}", exc_info=True)
            return "", {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    
    async def _extract_structured_data(self, text: str) -> tuple:
        """Use AI to extract structured data from text."""
        try:
            # Check if this is medical imaging analysis (not text-based lab report)
            if text.startswith("__MEDICAL_IMAGING_ANALYSIS__:"):
                logger.info("[DOCUMENT EXTRACTOR] Detected medical imaging analysis - no raw data extraction needed")
                
                # Parse the marker to get imaging type
                parts = text.split(":")
                imaging_category = parts[1] if len(parts) > 1 else "unknown"
                imaging_type = parts[2] if len(parts) > 2 else "unknown"
                
                # Return minimal structure indicating this is imaging analysis
                # No raw data to extract - the analysis will be stored directly in report.analysis_result
                return {
                    "is_medical_imaging": True,
                    "imaging_category": imaging_category,
                    "imaging_type": imaging_type,
                    "patient_info": None,
                    "report_info": {
                        "report_type": imaging_type,
                        "imaging_analysis": True
                    },
                    "test_results": [],
                    "note": "Medical imaging analysis - no extractable text data. See analysis_result for findings."
                }, {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            
            # For lab reports and text-based documents, proceed with standard extraction
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

