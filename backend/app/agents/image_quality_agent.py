"""
Image Quality Assessment Agent

Intelligently evaluates the quality of uploaded medical images and provides
professional feedback for image improvement.
"""

import logging
import base64
import json
from typing import Dict, Any
from datetime import datetime
from openai import AsyncOpenAI

from .base_agent import BaseAgent, AgentRegistry

logger = logging.getLogger(__name__)


class ImageQualityAgent(BaseAgent):
    """
    AI-powered image quality assessment agent for medical images.
    
    Evaluates:
    - Sharpness and blur
    - Brightness and contrast
    - Resolution and clarity
    - Artifacts and noise
    - Lighting conditions
    - Obstruction or glare
    - Overall medical diagnostic quality
    """
    
    def get_agent_type(self) -> str:
        return "image_quality"
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)
        
        # Quality assessment instructions
        self.system_instructions = """You are an expert medical imaging quality assessor specializing in evaluating the diagnostic quality of medical images.

PRIMARY MISSION: Assess the technical quality of medical images and determine if they are suitable for clinical analysis.

QUALITY ASSESSMENT CRITERIA:

1. **SHARPNESS & BLUR**:
   - Edge definition
   - Detail clarity
   - Motion blur
   - Out-of-focus areas
   
2. **BRIGHTNESS & CONTRAST**:
   - Proper exposure
   - Dynamic range
   - Over/underexposure
   - Adequate contrast for diagnosis

3. **RESOLUTION & CLARITY**:
   - Image resolution
   - Pixel density
   - Detail preservation
   - Adequate size for analysis

4. **ARTIFACTS & NOISE**:
   - Digital noise
   - Compression artifacts
   - Scan lines or banding
   - Interference patterns

5. **LIGHTING & POSITIONING**:
   - Even illumination
   - Glare or reflections
   - Shadows obscuring details
   - Proper positioning

6. **OBSTRUCTIONS**:
   - Jewelry or metal objects
   - Clothing interference
   - Markers or labels obscuring anatomy
   - Foreign objects

7. **MEDICAL DIAGNOSTIC SUITABILITY**:
   - Can anatomical structures be identified?
   - Are abnormalities detectable?
   - Is the image orientation correct?
   - Is critical information visible?

OUTPUT FORMAT (JSON):
{
  "overall_quality": "excellent|good|acceptable|poor|unusable",
  "is_acceptable_for_analysis": true/false,
  "quality_score": 0-100,
  "detailed_assessment": {
    "sharpness": {
      "score": 0-10,
      "status": "excellent|good|acceptable|poor",
      "issues": ["list of issues"]
    },
    "brightness": {
      "score": 0-10,
      "status": "excellent|good|acceptable|poor",
      "issues": ["list of issues"]
    },
    "resolution": {
      "score": 0-10,
      "status": "excellent|good|acceptable|poor",
      "issues": ["list of issues"]
    },
    "artifacts": {
      "score": 0-10,
      "status": "none|minimal|moderate|severe",
      "issues": ["list of issues"]
    },
    "lighting": {
      "score": 0-10,
      "status": "excellent|good|acceptable|poor",
      "issues": ["list of issues"]
    },
    "obstructions": {
      "score": 0-10,
      "detected": ["list of obstructions"],
      "severity": "none|minor|moderate|severe"
    }
  },
  "issues_found": [
    {
      "issue": "Description of issue",
      "severity": "critical|major|minor",
      "impact": "How this affects diagnosis",
      "recommendation": "Specific action to fix"
    }
  ],
  "user_feedback": {
    "title": "Professional feedback title",
    "message": "Clear explanation for user",
    "recommendations": ["Specific steps to improve"],
    "can_retry": true/false
  },
  "technical_details": {
    "estimated_resolution": "width x height",
    "image_format": "detected format",
    "compression_level": "low|medium|high"
  }
}

FEEDBACK GUIDELINES:
- Be clear and specific about quality issues
- Provide actionable recommendations
- Use patient-friendly language
- Explain WHY quality matters for medical analysis
- Suggest concrete steps to improve
- Be encouraging but honest

ACCEPTANCE THRESHOLDS:
- Quality score ≥ 60: Acceptable for analysis
- Quality score 40-59: Marginal, may work but recommend retake
- Quality score < 40: Not suitable, must retake

CRITICAL RULES:
- Focus on diagnostic quality, not aesthetics
- Prioritize clinically relevant features
- Flag critical issues that prevent diagnosis
- Suggest specific improvements (not vague "take better photo")
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess the quality of a medical image.
        
        Args:
            input_data: Dict containing:
                - image_data: Base64 encoded image or bytes
                - image_type: Type of image (optional)
                - expected_content: What should be in the image (optional)
                
        Returns:
            Comprehensive quality assessment
        """
        execution_id = self.start_execution()
        
        try:
            # Extract parameters
            image_data = input_data.get("image_data")
            image_type = input_data.get("image_type", "medical image")
            expected_content = input_data.get("expected_content", "medical content")
            
            self.log_event("quality_assessment_started", {
                "image_type": image_type
            })
            
            # Prepare image for Vision API
            if isinstance(image_data, bytes):
                base64_image = base64.b64encode(image_data).decode('utf-8')
            else:
                base64_image = image_data
            
            # Build assessment prompt
            prompt = f"""Assess the technical quality of this {image_type}.

Expected Content: {expected_content}

Perform comprehensive quality assessment following the specified criteria and return detailed JSON analysis."""
            
            # Call Vision API for quality assessment
            start_time = datetime.utcnow()
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self.system_instructions
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
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
                response_format={"type": "json_object"},
                max_tokens=2000,
                temperature=0.1  # Low temperature for consistent assessment
            )
            
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Parse response
            assessment_text = response.choices[0].message.content
            assessment = json.loads(assessment_text)
            
            # Extract token usage
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else {}
            
            self.log_event("quality_assessment_completed", {
                "overall_quality": assessment.get("overall_quality"),
                "quality_score": assessment.get("quality_score"),
                "is_acceptable": assessment.get("is_acceptable_for_analysis")
            })
            
            return self.create_success_response(
                data=assessment,
                execution_details={
                    "execution_time_ms": execution_time,
                    "model_used": self.model,
                    "image_type": image_type
                },
                token_usage=token_usage
            )
            
        except Exception as e:
            logger.error(f"Image quality assessment error: {str(e)}", exc_info=True)
            return self.handle_error(e, {"execution_id": str(execution_id)})


# Register the agent
AgentRegistry.register(
    "image_quality",
    ImageQualityAgent,
    capabilities=["quality_assessment", "image_validation", "user_feedback"]
)

