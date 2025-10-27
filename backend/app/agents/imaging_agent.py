"""
Specialized Medical Imaging Agents

Provides specialized analysis for different medical imaging types:
- X-ray analysis
- MRI analysis
- CT scan analysis
- Dental imaging analysis
"""

import logging
import base64
from typing import Dict, Any, Optional
from datetime import datetime
from openai import AsyncOpenAI

from .base_agent import BaseAgent, AgentRegistry

logger = logging.getLogger(__name__)


class MedicalImagingAgent(BaseAgent):
    """
    Specialized agent for medical imaging analysis using GPT-4o Vision.
    Handles X-rays, MRI, CT scans, and dental imaging.
    """
    
    def get_agent_type(self) -> str:
        return "medical_imaging"
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)
        
        # Imaging-specific system instructions
        self.imaging_instructions = {
            "xray": self._get_xray_instructions(),
            "mri": self._get_mri_instructions(),
            "ct_scan": self._get_ct_scan_instructions(),
            "dental": self._get_dental_instructions(),
            "general": self._get_general_imaging_instructions()
        }
    
    def _get_xray_instructions(self) -> str:
        """Instructions for X-ray analysis."""
        return """You are an expert radiologist analyzing X-ray images.

ANALYSIS FRAMEWORK:

1. TECHNICAL QUALITY ASSESSMENT:
   - Image quality (penetration, positioning, artifacts)
   - Anatomical landmarks visible
   - Any technical limitations

2. SYSTEMATIC REVIEW (by body part):
   
   CHEST X-RAY:
   - Heart size and contour
   - Lung fields (consolidation, nodules, masses, pneumothorax)
   - Pleural spaces (effusions, thickening)
   - Mediastinum (widening, masses)
   - Bones (ribs, clavicles, spine)
   - Soft tissues
   
   SKELETAL X-RAY:
   - Bone alignment and integrity
   - Fractures (location, type, displacement)
   - Joint spaces (narrowing, effusions)
   - Bone density
   - Soft tissue swelling
   - Foreign bodies
   
   ABDOMINAL X-RAY:
   - Bowel gas pattern
   - Organ shadows
   - Free air or fluid
   - Calcifications
   - Skeletal structures

3. FINDINGS:
   - Normal findings
   - Abnormal findings with location and characteristics
   - Incidental findings

4. SEVERITY ASSESSMENT:
   - NORMAL: No abnormalities
   - ATTENTION_NEEDED: Minor findings, monitoring recommended
   - URGENT: Significant findings requiring prompt attention
   - CRITICAL: Life-threatening findings requiring immediate care

5. RECOMMENDATIONS:
   - Follow-up imaging if needed
   - Clinical correlation
   - Specialist consultation
   - Urgent interventions if indicated

OUTPUT FORMAT:
Return structured JSON with:
{
  "image_type": "chest_xray|spine_xray|limb_xray|etc",
  "body_part": "specific anatomical region",
  "quality_assessment": {
    "quality": "excellent|good|adequate|poor",
    "technical_issues": ["list any issues"],
    "is_analyzable": true/false
  },
  "findings": {
    "normal_structures": ["list"],
    "abnormal_findings": [
      {
        "finding": "description",
        "location": "anatomical location",
        "severity": "mild|moderate|severe",
        "characteristics": "details"
      }
    ],
    "incidental_findings": ["list"]
  },
  "severity_level": "normal|attention_needed|urgent|critical",
  "is_critical": true/false,
  "impression": "concise summary",
  "recommendations": ["specific recommendations"],
  "differential_diagnosis": ["possible conditions if abnormal"],
  "follow_up": "recommended follow-up",
  "confidence": 0.0-1.0
}

CRITICAL RULES:
- Be thorough and systematic
- Don't miss critical findings
- Flag uncertainty
- Recommend professional interpretation
- Include disclaimer
"""
    
    def _get_mri_instructions(self) -> str:
        """Instructions for MRI analysis."""
        return """You are an expert radiologist analyzing MRI images.

ANALYSIS FRAMEWORK:

1. TECHNICAL QUALITY:
   - Sequence type (T1, T2, FLAIR, DWI, etc.)
   - Image quality and artifacts
   - Contrast enhancement (if applicable)

2. SYSTEMATIC REVIEW:
   
   BRAIN MRI:
   - Brain parenchyma (signal abnormalities, masses, edema)
   - Ventricles (size, shape, fluid)
   - Cerebral vasculature
   - Skull and meninges
   - Orbits and sinuses
   
   SPINE MRI:
   - Vertebral bodies (alignment, signal, fractures)
   - Intervertebral discs (herniation, degeneration)
   - Spinal canal (stenosis, masses)
   - Spinal cord (signal, compression)
   - Paravertebral soft tissues
   
   JOINT MRI:
   - Bone marrow signal
   - Cartilage integrity
   - Ligaments and tendons
   - Joint effusion
   - Soft tissue abnormalities

3. FINDINGS:
   - Anatomical structures
   - Signal characteristics
   - Abnormalities with precise location
   - Size measurements if applicable

4. SEVERITY ASSESSMENT:
   - NORMAL: No pathology
   - ATTENTION_NEEDED: Mild abnormalities
   - URGENT: Significant pathology
   - CRITICAL: Urgent findings (cord compression, stroke, etc.)

5. RECOMMENDATIONS:
   - Additional sequences if needed
   - Comparison with prior studies
   - Specialist consultation
   - Intervention if indicated

OUTPUT FORMAT (JSON):
{
  "image_type": "brain_mri|spine_mri|joint_mri|etc",
  "body_part": "specific region",
  "sequence_type": "T1|T2|FLAIR|DWI|contrast|unknown",
  "quality_assessment": {
    "quality": "excellent|good|adequate|poor",
    "artifacts": ["list any artifacts"],
    "is_analyzable": true/false
  },
  "findings": {
    "normal_structures": ["list"],
    "abnormal_findings": [
      {
        "finding": "description",
        "location": "precise anatomical location",
        "signal_characteristics": "T1/T2 signal",
        "size": "measurements if applicable",
        "severity": "mild|moderate|severe"
      }
    ]
  },
  "severity_level": "normal|attention_needed|urgent|critical",
  "is_critical": true/false,
  "impression": "summary",
  "recommendations": ["recommendations"],
  "differential_diagnosis": ["possible diagnoses"],
  "confidence": 0.0-1.0
}
"""
    
    def _get_ct_scan_instructions(self) -> str:
        """Instructions for CT scan analysis."""
        return """You are an expert radiologist analyzing CT scans.

ANALYSIS FRAMEWORK:

1. TECHNICAL PARAMETERS:
   - Scan type (head, chest, abdomen, etc.)
   - Contrast phase (if applicable)
   - Image quality and artifacts
   - Window settings visible

2. SYSTEMATIC REVIEW:
   
   HEAD CT:
   - Brain parenchyma (hemorrhage, infarct, mass)
   - Ventricles (size, midline shift)
   - Gray-white differentiation
   - Skull and scalp
   - Sinuses
   
   CHEST CT:
   - Lungs (nodules, infiltrates, embolism)
   - Mediastinum (masses, lymph nodes)
   - Heart and great vessels
   - Pleura (effusions, pneumothorax)
   - Chest wall and bones
   
   ABDOMEN/PELVIS CT:
   - Solid organs (liver, spleen, kidneys, pancreas)
   - Hollow viscera (bowel, bladder)
   - Vasculature
   - Lymph nodes
   - Peritoneum (fluid, masses)
   - Bones

3. FINDINGS:
   - Anatomical structures
   - Density measurements (HU) if relevant
   - Abnormalities with location and characteristics
   - Comparison with expected normal

4. SEVERITY ASSESSMENT:
   - NORMAL: No acute findings
   - ATTENTION_NEEDED: Findings requiring follow-up
   - URGENT: Significant pathology
   - CRITICAL: Life-threatening findings (hemorrhage, PE, etc.)

5. RECOMMENDATIONS:
   - Follow-up imaging
   - Additional phases if needed
   - Urgent consultation
   - Immediate intervention if indicated

OUTPUT FORMAT (JSON):
{
  "image_type": "head_ct|chest_ct|abdomen_ct|etc",
  "body_part": "specific region",
  "contrast": "with|without|unknown",
  "quality_assessment": {
    "quality": "excellent|good|adequate|poor",
    "artifacts": ["motion", "beam hardening", etc],
    "is_analyzable": true/false
  },
  "findings": {
    "normal_structures": ["list"],
    "abnormal_findings": [
      {
        "finding": "description",
        "location": "precise location",
        "density": "hypodense|isodense|hyperdense|HU value",
        "size": "measurements",
        "severity": "mild|moderate|severe"
      }
    ]
  },
  "severity_level": "normal|attention_needed|urgent|critical",
  "is_critical": true/false,
  "impression": "summary",
  "recommendations": ["recommendations"],
  "differential_diagnosis": ["possible diagnoses"],
  "confidence": 0.0-1.0
}
"""
    
    def _get_dental_instructions(self) -> str:
        """Instructions for dental imaging analysis."""
        return """You are an expert dental radiologist analyzing dental X-rays.

ANALYSIS FRAMEWORK:

1. IMAGE TYPE:
   - Bitewing (posterior teeth, crown/interproximal)
   - Periapical (complete tooth including root)
   - Panoramic (full mouth overview)
   - CBCT (3D imaging)

2. SYSTEMATIC DENTAL EXAMINATION:
   
   TEETH (by quadrant and number):
   - Crowns (caries, restorations, fractures)
   - Roots (resorption, fractures, anomalies)
   - Pulp chambers (calcification, exposure)
   - Periodontal ligament space
   
   SUPPORTING STRUCTURES:
   - Alveolar bone level
   - Bone density
   - Lamina dura integrity
   - Interdental bone height
   
   PATHOLOGY:
   - Caries (location, depth, classification)
   - Periapical pathology (abscesses, cysts)
   - Bone loss (horizontal, vertical)
   - Root resorption
   - Impacted teeth
   - TMJ abnormalities (if visible)

3. TOOTH NUMBERING:
   - Universal system (1-32)
   - FDI system (11-48)
   - Palmer notation

4. SEVERITY ASSESSMENT:
   - NORMAL: Healthy dentition
   - ATTENTION_NEEDED: Minor caries, early periodontitis
   - URGENT: Deep caries, periapical lesions, severe bone loss
   - CRITICAL: Acute infection, fractures, severe pathology

5. RECOMMENDATIONS:
   - Restorative treatment (fillings, crowns)
   - Endodontic treatment (root canal)
   - Periodontal treatment
   - Extractions if indicated
   - Referral to specialist

OUTPUT FORMAT (JSON):
{
  "image_type": "bitewing|periapical|panoramic|cbct",
  "teeth_visible": ["list of tooth numbers"],
  "quality_assessment": {
    "quality": "excellent|good|adequate|poor",
    "positioning": "optimal|acceptable|suboptimal",
    "is_analyzable": true/false
  },
  "findings": {
    "normal_teeth": ["tooth numbers"],
    "dental_findings": [
      {
        "tooth_number": "1-32 or FDI",
        "finding": "caries|restoration|periapical_lesion|etc",
        "location": "occlusal|mesial|distal|buccal|lingual",
        "severity": "mild|moderate|severe",
        "classification": "Class I-VI for caries"
      }
    ],
    "bone_findings": {
      "bone_loss": "none|mild|moderate|severe",
      "pattern": "horizontal|vertical|angular",
      "affected_areas": ["locations"]
    },
    "other_findings": ["impacted teeth", "cysts", etc]
  },
  "severity_level": "normal|attention_needed|urgent|critical",
  "is_critical": true/false,
  "impression": "summary",
  "treatment_recommendations": ["specific dental treatments"],
  "referrals": ["endodontist", "periodontist", "oral surgeon", etc],
  "confidence": 0.0-1.0
}

DENTAL TERMINOLOGY:
- Mesial: towards midline
- Distal: away from midline
- Buccal/Labial: towards cheek/lip
- Lingual/Palatal: towards tongue/palate
- Occlusal: chewing surface
- Incisal: biting edge
"""
    
    def _get_general_imaging_instructions(self) -> str:
        """General instructions for unknown imaging types."""
        return """You are an expert in medical imaging analysis.

Analyze the provided medical image systematically:

1. Identify the imaging modality (X-ray, MRI, CT, ultrasound, etc.)
2. Identify the body part or anatomical region
3. Assess image quality
4. Describe visible structures
5. Identify any abnormalities
6. Assess severity
7. Provide recommendations

Return structured JSON with your analysis.
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze medical imaging using GPT-4o Vision.
        
        Args:
            input_data: Dict containing:
                - image_data: Base64 encoded image or file bytes
                - imaging_type: xray, mri, ct_scan, dental, or auto-detect
                - body_part: Optional body part specification
                - clinical_context: Optional clinical information
                
        Returns:
            Comprehensive imaging analysis
        """
        execution_id = self.start_execution()
        
        try:
            # Extract parameters
            image_data = input_data.get("image_data")
            imaging_type = input_data.get("imaging_type", "general")
            body_part = input_data.get("body_part")
            clinical_context = input_data.get("clinical_context", "")
            
            self.log_event("imaging_analysis_started", {
                "imaging_type": imaging_type,
                "body_part": body_part
            })
            
            # Prepare image for Vision API
            if isinstance(image_data, bytes):
                base64_image = base64.b64encode(image_data).decode('utf-8')
            else:
                base64_image = image_data
            
            # Get appropriate instructions
            instructions = self.imaging_instructions.get(imaging_type, self.imaging_instructions["general"])
            
            # Build prompt
            prompt = f"""Analyze this medical image.

Imaging Type: {imaging_type.upper()}
Body Part: {body_part or "Auto-detect"}
Clinical Context: {clinical_context or "Not provided"}

Provide comprehensive analysis following the structured format."""
            
            # Call Vision API
            start_time = datetime.utcnow()
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": instructions
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
                max_tokens=4000,
                temperature=0.0
            )
            
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Extract response
            analysis_text = response.choices[0].message.content
            
            # Parse JSON response
            import json
            analysis = json.loads(analysis_text)
            
            # Extract token usage
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            } if response.usage else {}
            
            self.log_event("imaging_analysis_completed", {
                "imaging_type": analysis.get("image_type"),
                "severity": analysis.get("severity_level"),
                "is_critical": analysis.get("is_critical", False)
            })
            
            return self.create_success_response(
                data=analysis,
                execution_details={
                    "imaging_type": imaging_type,
                    "execution_time_ms": execution_time,
                    "model_used": self.model
                },
                token_usage=token_usage
            )
            
        except Exception as e:
            logger.error(f"Medical imaging analysis error: {str(e)}", exc_info=True)
            return self.handle_error(e, {"execution_id": str(execution_id)})


# Register the imaging agent
AgentRegistry.register(
    "medical_imaging",
    MedicalImagingAgent,
    capabilities=["xray_analysis", "mri_analysis", "ct_analysis", "dental_analysis", "vision_api"]
)

