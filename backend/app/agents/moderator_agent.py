"""
Medical Analysis Moderator Agent

Orchestrates all medical analysis operations including:
- Image classification and routing
- Analysis coordination between specialized agents
- Quality verification
- Report generation
"""

import logging
import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from openai import AsyncOpenAI

from .base_agent import BaseAgent, AgentRegistry
from .tools import ToolsManager

logger = logging.getLogger(__name__)


class ModeratorAgent(BaseAgent):
    """
    AI-powered moderator agent that orchestrates medical image analysis.
    
    This agent:
    1. Determines the type of medical input (lab report, X-ray, MRI, CT, dental)
    2. Routes to appropriate specialized agents
    3. Coordinates multi-step analysis pipelines
    4. Verifies quality and completeness
    5. Generates comprehensive reports
    """
    
    def get_agent_type(self) -> str:
        return "moderator"
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)
        
        # Phase-specific system instructions
        self.system_instructions = {
            "CLASSIFY": self._get_classification_instructions(),
            "ANALYZE": self._get_analysis_instructions(),
            "VERIFY": self._get_verification_instructions(),
            "REPORT": self._get_report_instructions()
        }
        
    def _get_classification_instructions(self) -> str:
        """Get instructions for file classification phase."""
        return """You are a medical AI moderator specializing in classifying medical files.

PRIMARY MISSION: Accurately identify the type of medical data to route to appropriate specialized agents.

CLASSIFICATION CATEGORIES:
1. LAB_REPORT - Laboratory test results (blood, urine, etc.)
2. XRAY - X-ray imaging (chest, spine, limbs, etc.)
3. MRI - MRI scans (brain, spine, joints, soft tissue)
4. CT_SCAN - CT/CAT scans (head, chest, abdomen, etc.)
5. DENTAL - Dental X-rays (bitewing, periapical, panoramic)
6. ULTRASOUND - Ultrasound imaging
7. PATHOLOGY - Pathology reports
8. OTHER - Other medical documents

DETECTION CRITERIA:
For LAB REPORTS: Look for test names, values, reference ranges, units
For IMAGING: Look for anatomical structures, imaging markers, DICOM data
For DENTAL: Look for teeth, dental structures, tooth numbers

OUTPUT FORMAT:
Return JSON with:
{
  "category": "LAB_REPORT|XRAY|MRI|CT_SCAN|DENTAL|ULTRASOUND|PATHOLOGY|OTHER",
  "subcategory": "specific type (e.g., chest_xray, brain_mri, blood_test)",
  "body_part": "body part being imaged (if applicable)",
  "confidence": 0.0-1.0,
  "reasoning": "explanation of classification",
  "is_medical": true/false,
  "is_analyzable": true/false,
  "recommended_agent": "agent to route to"
}

IMPORTANT:
- Be accurate - incorrect classification leads to analysis failures
- Flag low quality images that cannot be analyzed
- Identify non-medical content and mark is_medical=false
"""
    
    def _get_analysis_instructions(self) -> str:
        """Get instructions for analysis coordination phase."""
        return """You are a medical AI moderator coordinating specialized analysis.

PRIMARY MISSION: Orchestrate the analysis pipeline using specialized agents and tools.

AVAILABLE TOOLS:
- analyze_xray: Analyze X-ray images
- analyze_mri: Analyze MRI scans  
- analyze_ct_scan: Analyze CT scans
- analyze_dental: Analyze dental X-rays
- extract_lab_data: Extract lab test data
- verify_image_quality: Check image quality
- detect_image_type: Auto-detect image type

ANALYSIS WORKFLOW:
1. Verify input quality (use verify_image_quality if needed)
2. Detect specific type (use detect_image_type if unsure)
3. Call appropriate analysis tool
4. Extract key findings
5. Determine severity level
6. Generate recommendations

SEVERITY LEVELS:
- NORMAL: No abnormalities detected
- ATTENTION_NEEDED: Minor findings requiring monitoring
- URGENT: Significant findings requiring prompt attention
- CRITICAL: Severe findings requiring immediate medical care

OUTPUT FORMAT:
Return structured analysis with:
{
  "analysis_type": "xray|mri|ct_scan|dental|lab_report",
  "findings": "detailed findings",
  "abnormalities": ["list of abnormalities"],
  "severity_level": "normal|attention_needed|urgent|critical",
  "is_critical": true/false,
  "recommendations": ["list of recommendations"],
  "confidence": 0.0-1.0,
  "quality_assessment": "image/data quality notes",
  "follow_up_needed": true/false
}

CRITICAL RULES:
- Always verify quality before analysis
- Be conservative with severity classification
- Include medical disclaimer
- Flag uncertain findings
- Recommend professional consultation
"""
    
    def _get_verification_instructions(self) -> str:
        """Get instructions for verification phase."""
        return """You are a medical AI moderator verifying analysis results.

PRIMARY MISSION: Verify completeness and accuracy of analysis results.

VERIFICATION CHECKLIST:
✓ All required fields populated
✓ Severity level justified by findings  
✓ Recommendations align with findings
✓ No contradictions in analysis
✓ Medical disclaimer included
✓ Quality assessment performed
✓ Professional consultation recommended when appropriate

VERIFICATION ACTIONS:
- Review analysis for completeness
- Check logical consistency
- Validate severity classification
- Ensure recommendations are actionable
- Add medical disclaimer if missing

OUTPUT FORMAT:
{
  "verified": true/false,
  "issues": ["list of issues found"],
  "corrections_made": ["list of corrections"],
  "final_analysis": "corrected analysis"
}
"""
    
    def _get_report_instructions(self) -> str:
        """Get instructions for report generation phase."""
        return """You are a medical AI moderator generating final reports.

PRIMARY MISSION: Create comprehensive, patient-friendly medical reports.

REPORT STRUCTURE:
1. EXECUTIVE SUMMARY - Brief overview (2-3 sentences)
2. KEY FINDINGS - Main observations
3. DETAILED ANALYSIS - In-depth findings
4. ABNORMALITIES - Any concerning findings
5. SEVERITY ASSESSMENT - Overall classification
6. RECOMMENDATIONS - Next steps
7. MEDICAL DISCLAIMER - Standard disclaimer

WRITING GUIDELINES:
- Use patient-friendly language
- Explain medical terms
- Be clear and direct
- Avoid unnecessary jargon
- Be empathetic and supportive
- Maintain professional tone

OUTPUT FORMAT:
{
  "executive_summary": "brief overview",
  "key_findings": ["list of key findings"],
  "detailed_analysis": "comprehensive analysis",
  "abnormalities": [{"finding": "...", "severity": "...", "explanation": "..."}],
  "severity_level": "normal|attention_needed|urgent|critical",
  "recommendations": ["actionable recommendations"],
  "disclaimer": "medical disclaimer text"
}
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process medical data through complete analysis pipeline.
        
        Args:
            input_data: Dict containing:
                - file_content: File bytes or path
                - file_type: pdf, image, xray, mri, etc.
                - context: Additional context
                - db: Database session (optional)
                - report_id: Report ID for tracking (optional)
                
        Returns:
            Complete analysis results
        """
        execution_id = self.start_execution()
        
        try:
            # Extract parameters
            file_content = input_data.get("file_content")
            file_type = input_data.get("file_type", "image")
            context = input_data.get("context", {})
            db = input_data.get("db")
            report_id = input_data.get("report_id")
            
            self.log_event("analysis_started", {
                "file_type": file_type,
                "execution_id": str(execution_id)
            })
            
            # Initialize tools manager
            tool_calls = []
            tools_manager = None
            if db and report_id:
                tools_manager = ToolsManager(
                    db=db,
                    report_id=report_id,
                    context=context,
                    tool_calls=tool_calls,
                    api_key=self.api_key
                )
            
            # Phase 1: Classification
            self.log_event("phase_started", {"phase": "classification"})
            classification_result = await self._execute_phase(
                phase="CLASSIFY",
                input_data={"file_content": file_content, "file_type": file_type},
                tools=[] if not tools_manager else [tools_manager.create_detect_image_type_tool()],
                context=context
            )
            
            if classification_result["status"] != "success":
                return classification_result
            
            classification = classification_result["data"]
            
            # Check if medical and analyzable
            if not classification.get("is_medical", True):
                return self.create_success_response(
                    data={
                        "classification": classification,
                        "analysis": None,
                        "message": "File does not appear to contain medical data"
                    }
                )
            
            if not classification.get("is_analyzable", True):
                return self.create_success_response(
                    data={
                        "classification": classification,
                        "analysis": None,
                        "message": "Image quality is insufficient for analysis"
                    }
                )
            
            # Phase 2: Analysis
            self.log_event("phase_started", {"phase": "analysis", "category": classification.get("category")})
            
            # Get appropriate tools based on classification
            analysis_tools = []
            if tools_manager:
                category = classification.get("category", "OTHER")
                if category == "XRAY":
                    analysis_tools = [tools_manager.create_analyze_xray_tool()]
                elif category == "MRI":
                    analysis_tools = [tools_manager.create_analyze_mri_tool()]
                elif category == "CT_SCAN":
                    analysis_tools = [tools_manager.create_analyze_ct_scan_tool()]
                elif category == "DENTAL":
                    analysis_tools = [tools_manager.create_analyze_dental_tool()]
                elif category == "LAB_REPORT":
                    analysis_tools = [tools_manager.create_extract_lab_data_tool()]
                else:
                    analysis_tools = tools_manager.get_all_tools()
            
            analysis_result = await self._execute_phase(
                phase="ANALYZE",
                input_data={
                    "file_content": file_content,
                    "classification": classification
                },
                tools=analysis_tools,
                context=context
            )
            
            if analysis_result["status"] != "success":
                return analysis_result
            
            analysis = analysis_result["data"]
            
            # Phase 3: Verification
            self.log_event("phase_started", {"phase": "verification"})
            verification_result = await self._execute_phase(
                phase="VERIFY",
                input_data={"analysis": analysis, "classification": classification},
                tools=[],
                context=context
            )
            
            if verification_result["status"] != "success":
                return verification_result
            
            verified_analysis = verification_result["data"].get("final_analysis", analysis)
            
            # Phase 4: Report Generation
            self.log_event("phase_started", {"phase": "report"})
            report_result = await self._execute_phase(
                phase="REPORT",
                input_data={"analysis": verified_analysis, "classification": classification},
                tools=[],
                context=context
            )
            
            if report_result["status"] != "success":
                return report_result
            
            final_report = report_result["data"]
            
            # Combine all results
            self.log_event("analysis_completed", {
                "severity": final_report.get("severity_level"),
                "category": classification.get("category")
            })
            
            return self.create_success_response(
                data={
                    "classification": classification,
                    "analysis": verified_analysis,
                    "report": final_report,
                    "tool_calls": tool_calls
                },
                execution_details={
                    "phases_executed": ["classify", "analyze", "verify", "report"],
                    "classification_confidence": classification.get("confidence"),
                    "analysis_confidence": verified_analysis.get("confidence")
                }
            )
            
        except Exception as e:
            logger.error(f"Moderator agent error: {str(e)}", exc_info=True)
            return self.handle_error(e, {"execution_id": str(execution_id)})
    
    async def _execute_phase(
        self,
        phase: str,
        input_data: Dict[str, Any],
        tools: List,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a single phase of the analysis pipeline.
        
        Args:
            phase: Phase name (CLASSIFY, ANALYZE, VERIFY, REPORT)
            input_data: Input data for this phase
            tools: Tools available for this phase (not used in simplified version)
            context: Execution context
            
        Returns:
            Phase execution results
        """
        try:
            # Get phase-specific instructions
            instructions = self.system_instructions.get(phase, "")
            
            # Build prompt
            prompt = self._build_prompt(phase, input_data, context)
            
            # Execute using standard OpenAI API
            start_time = datetime.utcnow()
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": instructions},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.0,
                max_tokens=4000
            )
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Extract response
            response_text = response.choices[0].message.content
            
            # Extract token usage
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else {}
            
            # Parse response
            result = self._parse_response(response_text, phase)
            
            logger.info(f"Phase {phase} completed in {execution_time}ms with {token_usage.get('total_tokens', 0)} tokens")
            
            return self.create_success_response(
                data=result,
                execution_details={
                    "phase": phase,
                    "execution_time_ms": execution_time
                },
                token_usage=token_usage
            )
            
        except Exception as e:
            logger.error(f"Phase {phase} error: {str(e)}", exc_info=True)
            return self.handle_error(e, {"phase": phase})
    
    def _build_prompt(self, phase: str, input_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Build prompt for a specific phase."""
        if phase == "CLASSIFY":
            return f"""Classify the following medical data:

File Type: {input_data.get('file_type')}
Additional Context: {json.dumps(context, indent=2)}

Analyze the data and return classification in JSON format."""

        elif phase == "ANALYZE":
            return f"""Analyze the following medical data:

Classification: {json.dumps(input_data.get('classification'), indent=2)}
Additional Context: {json.dumps(context, indent=2)}

Perform comprehensive analysis and return results in JSON format."""

        elif phase == "VERIFY":
            return f"""Verify the following analysis results:

Analysis: {json.dumps(input_data.get('analysis'), indent=2)}
Classification: {json.dumps(input_data.get('classification'), indent=2)}

Review for completeness, accuracy, and consistency. Return verification results in JSON format."""

        elif phase == "REPORT":
            return f"""Generate final medical report:

Analysis: {json.dumps(input_data.get('analysis'), indent=2)}
Classification: {json.dumps(input_data.get('classification'), indent=2)}

Create a comprehensive, patient-friendly report in JSON format."""

        return "Analyze the provided medical data."
    
    def _parse_response(self, response: str, phase: str) -> Dict[str, Any]:
        """Parse agent response into structured data."""
        try:
            # Try to parse as JSON
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback: return as text
            return {
                "response": response,
                "phase": phase,
                "parsed": False
            }


# Register the moderator agent
AgentRegistry.register(
    "moderator",
    ModeratorAgent,
    capabilities=["orchestration", "classification", "verification", "reporting"]
)

