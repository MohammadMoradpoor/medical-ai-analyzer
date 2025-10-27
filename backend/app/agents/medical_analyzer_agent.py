"""
Medical Analyzer Agent - Analyzes medical test results and provides insights
"""

import logging
import json
from typing import Dict, Any, List
from datetime import datetime
from openai import AsyncOpenAI
from .base_agent import BaseAgent, AgentRegistry

logger = logging.getLogger(__name__)


class MedicalAnalyzerAgent(BaseAgent):
    """
    AI-powered medical analyzer that interprets test results and provides insights.
    """
    
    def get_agent_type(self) -> str:
        return "medical_analyzer"
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = AsyncOpenAI(api_key=api_key)
        
        # System instructions for medical analysis
        self.system_instructions = """You are an expert medical AI assistant specializing in medical test analysis, laboratory results interpretation, and medical imaging analysis.

PRIMARY MISSION: Provide accurate, comprehensive analysis of medical data (lab tests AND medical imaging) with clear explanations for patients.

ANALYSIS FRAMEWORK:

🔍 **ASSESSMENT METHODOLOGY**:

FOR LAB TEST RESULTS:
1. Review each test result against reference ranges
2. Identify any abnormal values
3. Assess clinical significance of findings
4. Determine severity level
5. Consider test results holistically

FOR MEDICAL IMAGING (X-Ray, MRI, CT, Dental, Ultrasound):
1. Analyze the visual findings described
2. Identify any abnormalities, fractures, masses, or pathology
3. Assess severity and urgency
4. Provide interpretation of imaging findings
5. Give recommendations for follow-up

⚠️ **SEVERITY CLASSIFICATION**:
- **NORMAL**: All values within reference ranges, no concerns
- **ATTENTION_NEEDED**: Minor abnormalities that should be monitored
- **URGENT**: Significant abnormalities requiring prompt medical attention
- **CRITICAL**: Severe abnormalities requiring immediate medical intervention

📊 **ANALYSIS OUTPUT FORMAT**:
{
  "overall_assessment": {
    "severity_level": "normal|attention_needed|urgent|critical",
    "is_critical": true/false,
    "has_abnormalities": true/false,
    "summary": "Brief overall assessment (2-3 sentences)"
  },
  "test_analysis": [
    {
      "test_name": "...",
      "value": "...",
      "reference_range": "...",
      "is_normal": true/false,
      "deviation": "...",
      "severity": "normal|mild|moderate|severe",
      "interpretation": "What this result means",
      "clinical_significance": "Why this matters",
      "possible_causes": ["if abnormal"]
    }
  ],
  "abnormal_findings": [
    {
      "finding": "...",
      "severity": "...",
      "explanation": "...",
      "action_needed": "..."
    }
  ],
  "recommendations": [
    "Specific actionable recommendations"
  ],
  "detailed_report": "Comprehensive analysis paragraph",
  "disclaimer": "Standard medical disclaimer"
}

💡 **COMMUNICATION PRINCIPLES**:
- Use clear, patient-friendly language
- Avoid excessive medical jargon
- Explain complex concepts simply
- Provide context for abnormal values
- Be specific in recommendations
- Always include appropriate medical disclaimers

🚨 **CRITICAL RULES**:
- Never diagnose diseases (only interpret test results)
- Always recommend consulting with a healthcare provider
- Flag critical values prominently
- Be cautious and conservative in assessments
- Include disclaimer about not replacing professional medical advice
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze extracted medical test data.
        
        Args:
            input_data: Dict with:
                - extracted_data: Structured test data from extractor
                - patient_context: Optional patient information
                
        Returns:
            Dict with analysis results
        """
        try:
            extracted_data = input_data.get("extracted_data", {})
            patient_context = input_data.get("patient_context", {})
            
            self.log_event("analysis_started", {
                "test_count": len(extracted_data.get("test_results", []))
            })
            
            # Perform AI analysis
            analysis_result, token_usage = await self._analyze_test_results(
                extracted_data,
                patient_context
            )
            
            self.log_event("analysis_completed", {
                "severity": analysis_result.get("overall_assessment", {}).get("severity_level"),
                "abnormalities_found": len(analysis_result.get("abnormal_findings", []))
            })
            
            return {
                "status": "success",
                "data": analysis_result,
                "error": None,
                "token_usage": token_usage
            }
            
        except Exception as e:
            logger.error(f"Medical analysis failed: {str(e)}", exc_info=True)
            return self.handle_error(e)
    
    async def _analyze_test_results(
        self,
        extracted_data: Dict[str, Any],
        patient_context: Dict[str, Any]
    ) -> tuple:
        """
        Use AI to analyze test results and provide medical insights.
        
        For medical imaging, the analysis is already complete - we just format it.
        For lab reports, we perform comprehensive interpretation.
        """
        try:
            # Check if this is medical imaging analysis (already analyzed by imaging agent)
            if extracted_data.get("is_medical_imaging"):
                logger.info("[MEDICAL ANALYZER] Detected medical imaging - analysis already complete")
                
                # Medical imaging analysis is already done by the imaging agent
                # We just need to format it for storage
                imaging_type = extracted_data.get("imaging_type", "unknown")
                
                return {
                    "is_medical_imaging": True,
                    "imaging_type": imaging_type,
                    "overall_assessment": {
                        "severity_level": "normal",  # Will be updated from imaging results
                        "is_critical": False,
                        "has_abnormalities": False,
                        "summary": f"Medical imaging analysis completed for {imaging_type}. See imaging analysis results for detailed findings."
                    },
                    "test_analysis": [],  # No lab tests for imaging
                    "abnormal_findings": [],
                    "recommendations": [
                        "Refer to imaging analysis section for detailed radiological findings",
                        "Consult with a radiologist for professional interpretation"
                    ],
                    "detailed_report": f"This is a medical imaging study ({imaging_type}). The radiological analysis has been performed by the specialized imaging agent. Please refer to the imaging analysis section for comprehensive findings, impression, and recommendations.",
                    "disclaimer": (
                        "This imaging analysis is provided by AI for informational purposes only. "
                        "It is not a substitute for professional radiological interpretation. "
                        "Always consult with a qualified radiologist or healthcare professional "
                        "for proper medical diagnosis and treatment."
                    ),
                    "note": "Medical imaging - raw data extraction not applicable"
                }, {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            
            # For lab reports and text-based documents, proceed with standard analysis
            # Prepare the analysis prompt
            user_prompt = f"""Analyze the following medical test results and provide a comprehensive interpretation in JSON format.

PATIENT CONTEXT:
{json.dumps(patient_context, indent=2) if patient_context else "Not provided"}

EXTRACTED TEST DATA:
{json.dumps(extracted_data, indent=2)}

Please provide your analysis as a structured JSON object with:
1. Overall assessment of health status
2. Detailed analysis of each test result
3. Identification of any abnormal findings
4. Clinical significance of results
5. Actionable recommendations
6. Clear severity classification

Remember to:
- Use patient-friendly language
- Explain what abnormal values mean
- Provide context for understanding results
- Include appropriate medical disclaimers
- Be thorough but concise
- Return the response in JSON format
"""
            
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.system_instructions},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1  # Slightly higher for more natural language
            )
            
            analysis_result = json.loads(response.choices[0].message.content)
            
            # Extract token usage from OpenAI response
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else None
            
            # Add standard medical disclaimer if not present
            if "disclaimer" not in analysis_result:
                analysis_result["disclaimer"] = (
                    "This analysis is for informational purposes only and should not be "
                    "considered as medical advice. Please consult with a qualified healthcare "
                    "professional for proper interpretation of your test results and any "
                    "necessary medical treatment."
                )
            
            return analysis_result, token_usage
            
        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            raise


# Register the agent
AgentRegistry.register("medical_analyzer", MedicalAnalyzerAgent)

