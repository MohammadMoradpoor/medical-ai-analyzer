"""
Report Chat Agent - Interactive Q&A about medical reports

Provides context-aware conversational AI for answering questions about
specific medical reports, test results, and imaging studies.
"""

import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from openai import AsyncOpenAI

from .base_agent import BaseAgent, AgentRegistry

logger = logging.getLogger(__name__)


class ReportChatAgent(BaseAgent):
    """
    Specialized agent for interactive Q&A about medical reports.
    
    Features:
    - Context-aware responses using full report data
    - Conversation history tracking
    - Source citation for answers
    - Confidence scoring
    - Specialized medical knowledge
    - Patient-friendly explanations
    """
    
    def get_agent_type(self) -> str:
        return "report_chat"
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)
        
        # System instructions for medical Q&A
        self.system_instructions = """You are an expert medical AI assistant specializing in explaining medical test results and imaging findings.

PRIMARY MISSION: Answer user questions about their specific medical report with accurate, helpful, patient-friendly explanations.

CAPABILITIES:
1. **Explain Test Results**: Clarify what specific test values mean
2. **Interpret Findings**: Explain imaging findings or lab abnormalities
3. **Severity Context**: Help understand severity classifications
4. **Recommendations**: Elaborate on suggested next steps
5. **Medical Terms**: Define and explain medical terminology
6. **Comparisons**: Compare values to normal ranges
7. **Implications**: Discuss clinical significance
8. **Follow-up Questions**: Answer follow-up and clarification questions

COMMUNICATION PRINCIPLES:
- Use clear, patient-friendly language
- Avoid unnecessary medical jargon
- When using medical terms, provide clear explanations
- Be empathetic and supportive
- Be honest about limitations and uncertainties
- Always recommend professional medical consultation
- Reference specific parts of the report when answering

ANSWER STRUCTURE:
1. **Direct Answer**: Address the question directly
2. **Context**: Provide relevant context from the report
3. **Explanation**: Explain in simple terms
4. **Source**: Reference which part of the report this comes from
5. **Disclaimer**: Remind about professional consultation when appropriate

CRITICAL RULES:
- NEVER diagnose diseases (only explain test results)
- NEVER provide treatment advice (only explain recommendations)
- ALWAYS cite sources from the report
- ALWAYS be conservative and cautious
- ALWAYS recommend consulting healthcare providers for medical decisions
- Be honest if you don't know or if information is missing
- Maintain conversation context across multiple messages

FORBIDDEN:
- Do NOT speculate beyond the report data
- Do NOT provide definitive diagnoses
- Do NOT recommend specific medications
- Do NOT contradict or dismiss medical recommendations
- Do NOT provide false reassurance

RESPONSE FORMAT:
You MUST respond in JSON format with the following structure:
{
  "answer": "Your detailed answer to the question",
  "sources": ["List of specific report sections referenced"],
  "confidence": 0.0-1.0,
  "follow_up_suggestions": ["Suggested follow-up questions"],
  "medical_terms_explained": {"term": "definition"},
  "requires_professional_consultation": true/false
}

CRITICAL: Always return valid JSON matching this exact structure.
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a chat question about a medical report.
        
        Args:
            input_data: Dict containing:
                - question: User's question
                - report_context: Full report data for context
                - conversation_history: Previous messages
                - user_context: Optional user information
                
        Returns:
            AI-generated answer with metadata
        """
        execution_id = self.start_execution()
        
        try:
            # Extract parameters
            question = input_data.get("question", "")
            report_context = input_data.get("report_context", {})
            conversation_history = input_data.get("conversation_history", [])
            user_context = input_data.get("user_context", {})
            
            if not question:
                return {
                    "status": "failure",
                    "error": "No question provided"
                }
            
            self.log_event("chat_question_received", {
                "question_length": len(question),
                "has_history": len(conversation_history) > 0
            })
            
            # Build comprehensive context
            context_prompt = self._build_context_prompt(report_context, user_context)
            
            # Build conversation messages
            messages = [
                {"role": "system", "content": self.system_instructions},
                {"role": "system", "content": f"REPORT CONTEXT:\n{context_prompt}"}
            ]
            
            # Add conversation history
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
            
            # Add current question with JSON format reminder
            messages.append({
                "role": "user",
                "content": f"{question}\n\nPlease respond in JSON format as specified in the system instructions."
            })
            
            # Call OpenAI API
            start_time = datetime.utcnow()
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3,  # Slightly creative for natural conversation
                max_tokens=2000
            )
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Extract response
            response_text = response.choices[0].message.content
            
            # Parse JSON response
            try:
                parsed_response = json.loads(response_text)
            except json.JSONDecodeError:
                # Fallback if not valid JSON
                parsed_response = {
                    "answer": response_text,
                    "sources": [],
                    "confidence": 0.8,
                    "follow_up_suggestions": [],
                    "medical_terms_explained": {},
                    "requires_professional_consultation": True
                }
            
            # Extract token usage
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else {}
            
            # Calculate cost
            cost = (
                (token_usage.get("prompt_tokens", 0) / 1_000_000 * 2.50) +
                (token_usage.get("completion_tokens", 0) / 1_000_000 * 10.00)
            )
            
            self.log_event("chat_answer_generated", {
                "answer_length": len(parsed_response.get("answer", "")),
                "confidence": parsed_response.get("confidence"),
                "execution_time_ms": execution_time
            })
            
            return self.create_success_response(
                data={
                    "answer": parsed_response.get("answer", ""),
                    "sources": parsed_response.get("sources", []),
                    "confidence": parsed_response.get("confidence", 0.8),
                    "follow_up_suggestions": parsed_response.get("follow_up_suggestions", []),
                    "medical_terms_explained": parsed_response.get("medical_terms_explained", {}),
                    "requires_professional_consultation": parsed_response.get("requires_professional_consultation", True),
                    "cost_estimate": cost
                },
                execution_details={
                    "execution_time_ms": execution_time,
                    "question": question[:200],
                    "context_size": len(context_prompt)
                },
                token_usage=token_usage
            )
            
        except Exception as e:
            logger.error(f"Chat agent error: {str(e)}", exc_info=True)
            return self.handle_error(e, {"execution_id": str(execution_id)})
    
    def _build_context_prompt(self, report_context: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """
        Build comprehensive context about the report for the AI.
        
        Args:
            report_context: Full report data including analysis, findings, etc.
            user_context: Optional user information
            
        Returns:
            Formatted context string
        """
        context_parts = []
        
        # Report type and metadata
        report_type = report_context.get("report_type", "Unknown")
        context_parts.append(f"REPORT TYPE: {report_type}")
        
        # Check if medical imaging
        is_imaging = report_context.get("extracted_data", {}).get("is_medical_imaging", False)
        
        if is_imaging:
            # Medical imaging context
            context_parts.append("\nREPORT CATEGORY: Medical Imaging Study")
            
            imaging_type = report_context.get("extracted_data", {}).get("imaging_type", "Unknown")
            context_parts.append(f"IMAGING TYPE: {imaging_type}")
            
            # Analysis results
            analysis_result = report_context.get("analysis_result", {})
            if analysis_result:
                context_parts.append(f"\nIMAGE TYPE: {analysis_result.get('image_type', 'Unknown')}")
                context_parts.append(f"BODY PART: {analysis_result.get('body_part', 'Unknown')}")
                
                # Quality assessment
                quality = analysis_result.get("quality_assessment", {})
                if quality:
                    context_parts.append(f"\nQUALITY: {quality.get('quality', 'Unknown')}")
                    if quality.get("technical_issues"):
                        context_parts.append(f"TECHNICAL ISSUES: {', '.join(quality['technical_issues'])}")
                
                # Findings
                findings = analysis_result.get("findings", {})
                if findings:
                    normal_structures = findings.get("normal_structures", [])
                    if normal_structures:
                        context_parts.append(f"\nNORMAL STRUCTURES:")
                        for structure in normal_structures:
                            context_parts.append(f"  - {structure}")
                    
                    abnormal_findings = findings.get("abnormal_findings", [])
                    if abnormal_findings:
                        context_parts.append(f"\nABNORMAL FINDINGS:")
                        for finding in abnormal_findings:
                            context_parts.append(f"  - {finding.get('finding', 'Unknown')}")
                            context_parts.append(f"    Location: {finding.get('location', 'Unknown')}")
                            context_parts.append(f"    Severity: {finding.get('severity', 'Unknown')}")
                
                # Impression
                impression = analysis_result.get("impression", "")
                if impression:
                    context_parts.append(f"\nIMPRESSION: {impression}")
                
                # Recommendations
                recommendations = analysis_result.get("recommendations", [])
                if recommendations:
                    context_parts.append(f"\nRECOMMENDATIONS:")
                    for rec in recommendations:
                        context_parts.append(f"  - {rec}")
        
        else:
            # Lab report context
            context_parts.append("\nREPORT CATEGORY: Laboratory Test Results")
            
            # Extracted data
            extracted_data = report_context.get("extracted_data", {})
            
            # Patient info
            patient_info = extracted_data.get("patient_info", {})
            if patient_info:
                context_parts.append(f"\nPATIENT INFO:")
                if patient_info.get("name"):
                    context_parts.append(f"  Name: {patient_info['name']}")
                if patient_info.get("age"):
                    context_parts.append(f"  Age: {patient_info['age']}")
                if patient_info.get("gender"):
                    context_parts.append(f"  Gender: {patient_info['gender']}")
            
            # Report info
            report_info = extracted_data.get("report_info", {})
            if report_info:
                context_parts.append(f"\nREPORT INFO:")
                if report_info.get("test_date"):
                    context_parts.append(f"  Test Date: {report_info['test_date']}")
                if report_info.get("lab_name"):
                    context_parts.append(f"  Lab: {report_info['lab_name']}")
            
            # Test results
            test_analysis = report_context.get("test_analysis", [])
            if test_analysis:
                context_parts.append(f"\nTEST RESULTS ({len(test_analysis)} tests):")
                for test in test_analysis:
                    test_name = test.get("test_name", "Unknown")
                    value = test.get("value", "N/A")
                    reference_range = test.get("reference_range", "N/A")
                    is_normal = test.get("is_normal", True)
                    status = "✓ NORMAL" if is_normal else "⚠ ABNORMAL"
                    
                    context_parts.append(f"  - {test_name}: {value} (Reference: {reference_range}) [{status}]")
                    
                    if test.get("interpretation"):
                        context_parts.append(f"    Interpretation: {test['interpretation']}")
        
        # Overall assessment
        severity_level = report_context.get("severity_level", "unknown")
        is_critical = report_context.get("is_critical", False)
        has_abnormalities = report_context.get("has_abnormalities", False)
        
        context_parts.append(f"\nOVERALL ASSESSMENT:")
        context_parts.append(f"  Severity Level: {severity_level.upper()}")
        context_parts.append(f"  Critical: {'Yes' if is_critical else 'No'}")
        context_parts.append(f"  Abnormalities: {'Yes' if has_abnormalities else 'No'}")
        
        # Summary
        summary = report_context.get("summary", "")
        if summary:
            context_parts.append(f"\nSUMMARY: {summary}")
        
        # Abnormal findings
        abnormal_findings = report_context.get("abnormal_findings", [])
        if abnormal_findings:
            context_parts.append(f"\nABNORMAL FINDINGS:")
            for finding in abnormal_findings:
                context_parts.append(f"  - {finding.get('finding', 'Unknown')}")
                if finding.get("explanation"):
                    context_parts.append(f"    {finding['explanation']}")
        
        # Recommendations
        recommendations = report_context.get("recommendations", [])
        if recommendations:
            context_parts.append(f"\nRECOMMENDATIONS:")
            for rec in recommendations:
                context_parts.append(f"  - {rec}")
        
        return "\n".join(context_parts)
    
    async def generate_suggested_questions(self, report_context: Dict[str, Any]) -> List[str]:
        """
        Generate smart suggested questions based on the report content.
        
        Args:
            report_context: Full report data
            
        Returns:
            List of suggested questions
        """
        try:
            # Build context
            context_prompt = self._build_context_prompt(report_context, {})
            
            prompt = f"""Based on this medical report, generate 3 helpful questions a patient might want to ask.

{context_prompt}

Generate questions that:
- Help understand the results
- Clarify medical terms
- Address any concerns
- Explore recommendations
- Understand next steps

You must return your response in JSON format with this structure:
{{"questions": ["Question 1", "Question 2", "Question 3"]}}"""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful medical AI assistant. Always respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=500
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get("questions", [])
            
        except Exception as e:
            logger.error(f"Error generating suggested questions: {str(e)}")
            # Return fallback questions (3 questions)
            return [
                "What do my test results mean?",
                "Are any of my results concerning?",
                "What should I do next?"
            ]


# Register the chat agent
AgentRegistry.register(
    "report_chat",
    ReportChatAgent,
    capabilities=["qa", "conversation", "explanation", "medical_education"]
)

