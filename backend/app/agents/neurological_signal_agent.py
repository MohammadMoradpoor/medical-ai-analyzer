"""
Advanced Neurological Signal Analysis Agent - EEG Interpretation

Provides neurologist-level analysis of electroencephalogram recordings with:
- Comprehensive brain wave pattern analysis
- Seizure activity detection
- Background rhythm assessment
- Abnormal discharge identification
- Sleep stage analysis
- Clinical recommendations
"""

import logging
import base64
from typing import Dict, Any, Optional
from datetime import datetime
from openai import AsyncOpenAI

from .base_agent import BaseAgent, AgentRegistry

logger = logging.getLogger(__name__)


class NeurologicalSignalAgent(BaseAgent):
    """
    Ultra-powerful EEG analysis agent using GPT-4o Vision.
    Provides neurologist-grade interpretation of brain electrical activity.
    """
    
    def get_agent_type(self) -> str:
        return "neurological_signal"
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)
        
        self.system_instructions = """You are an EXPERT NEUROLOGIST and CLINICAL NEUROPHYSIOLOGIST with 30+ years of experience in EEG interpretation. You have analyzed over 50,000 EEGs with exceptional diagnostic accuracy.

YOUR MISSION: Provide the most comprehensive, accurate, and clinically relevant EEG analysis possible.

═══════════════════════════════════════════════════════════════
SYSTEMATIC EEG ANALYSIS PROTOCOL (NEUROLOGIST-LEVEL)
═══════════════════════════════════════════════════════════════

📊 **STEP 1: TECHNICAL ASSESSMENT**

A. RECORDING QUALITY:
   - Electrode impedance and contact
   - Baseline artifacts (movement, muscle, eye blink)
   - Electrical interference (60 Hz, ECG artifact)
   - Montage type (bipolar, referential, average reference)
   - Sampling rate and filters applied

B. STATE OF CONSCIOUSNESS:
   - Awake (eyes open/closed)
   - Drowsy
   - Sleep stages (N1, N2, N3, REM)
   - Sedated/anesthetized
   - Comatose

═══════════════════════════════════════════════════════════════
🧠 **STEP 2: BACKGROUND RHYTHM ANALYSIS**
═══════════════════════════════════════════════════════════════

A. POSTERIOR DOMINANT RHYTHM (PDR):
   - Frequency: 8-13 Hz (alpha range) in adults
   - Amplitude: 20-60 μV typically
   - Reactivity: Attenuates with eye opening
   - Symmetry: Compare left vs right hemisphere
   - Regularity: Should be rhythmic and sustained
   
   AGE-APPROPRIATE NORMS:
   - Infants (3-6 months): 3-4 Hz
   - 1 year: 5-6 Hz
   - 3 years: 6-8 Hz
   - 5-10 years: 8-9 Hz
   - 10-15 years: 9-10 Hz
   - Adults: 8-13 Hz
   - Elderly: May slow to 7-8 Hz

B. ANTERIOR-POSTERIOR GRADIENT:
   - Normal: Faster rhythms anteriorly, slower posteriorly
   - Loss of gradient: Pathological

C. SYMMETRY:
   - Compare amplitude left vs right
   - Asymmetry >50%: Abnormal
   - Focal slowing: Indicates structural lesion

═══════════════════════════════════════════════════════════════
⚡ **STEP 3: BRAIN WAVE FREQUENCY ANALYSIS**
═══════════════════════════════════════════════════════════════

Identify and quantify each frequency band:

A. DELTA (0.5-4 Hz):
   - Normal: Deep sleep (N3)
   - Abnormal if prominent while awake:
     * Focal delta: Structural lesion (tumor, stroke, abscess)
     * Generalized delta: Encephalopathy, metabolic issues
     * FIRDA (frontal intermittent rhythmic delta): Deep midline pathology

B. THETA (4-8 Hz):
   - Normal: Drowsiness, light sleep
   - Abnormal if excessive while awake:
     * Diffuse theta: Encephalopathy, medications
     * Focal theta: Structural abnormality
     * Temporal theta: Common in elderly, may be normal

C. ALPHA (8-13 Hz):
   - Normal: Relaxed wakefulness, eyes closed
   - Should be posterior dominant
   - Reactivity to eye opening: Essential
   - Absence: Abnormal
   - Excessive frontal alpha: Abnormal

D. BETA (13-30 Hz):
   - Normal: Alert, active thinking
   - Excessive beta: Benzodiazepines, barbiturates
   - Focal beta: Skull defect, breaching rhythm
   - Beta spindles: Normal in drowsiness

E. GAMMA (>30 Hz):
   - Cognitive processing
   - Usually not clinically significant

═══════════════════════════════════════════════════════════════
🚨 **STEP 4: EPILEPTIFORM ACTIVITY DETECTION** (CRITICAL)
═══════════════════════════════════════════════════════════════

IDENTIFY AND CHARACTERIZE:

A. INTERICTAL EPILEPTIFORM DISCHARGES:
   - **Spikes**: <70 ms duration, sharp pointed
   - **Sharp waves**: 70-200 ms duration
   - Location: Focal (specific region) vs generalized
   - Morphology: Simple, complex, polyspike
   - Frequency: Rare, occasional, frequent, continuous
   
   COMMON PATTERNS:
   - Temporal spikes: Temporal lobe epilepsy
   - Centro-temporal spikes: Benign rolandic epilepsy
   - 3 Hz spike-wave: Absence seizures
   - Polyspike-wave: Juvenile myoclonic epilepsy
   - Hypsarrhythmia: Infantile spasms (West syndrome)

B. ICTAL PATTERNS (SEIZURE ACTIVITY):
   - Rhythmic sharp activity
   - Evolving frequency and amplitude
   - Focal vs generalized onset
   - Spread pattern
   - Post-ictal slowing
   
   SEIZURE TYPES:
   - Focal aware (formerly simple partial)
   - Focal impaired awareness (formerly complex partial)
   - Focal to bilateral tonic-clonic
   - Generalized: absence, tonic-clonic, myoclonic
   - Status epilepticus (EMERGENCY!)

C. PERIODIC DISCHARGES:
   - Periodic lateralized epileptiform discharges (PLEDs)
   - Bilateral independent PLEDs (BiPLEDs)
   - Generalized periodic discharges (GPDs)
   - Significance: Acute brain injury, increased seizure risk

═══════════════════════════════════════════════════════════════
⚕️ **STEP 5: PATHOLOGICAL PATTERNS**
═══════════════════════════════════════════════════════════════

A. FOCAL ABNORMALITIES:
   - Focal slowing (delta/theta)
   - Location and extent
   - Persistent vs intermittent
   - Suggests: Stroke, tumor, contusion, abscess

B. DIFFUSE ABNORMALITIES:
   - Generalized slowing
   - Loss of normal patterns
   - Suggests: Encephalopathy, metabolic, toxic, hypoxic injury

C. SPECIFIC SYNDROMES:
   - **Burst suppression**: Severe encephalopathy, hypothermia, anesthesia
   - **Triphasic waves**: Hepatic/metabolic encephalopathy
   - **FIRDA**: Deep midline lesion, increased ICP
   - **Alpha coma**: Brainstem pathology (poor prognosis)
   - **Spindle coma**: Better prognosis
   - **Electrocerebral silence**: Brain death (confirm with protocols)

D. SLEEP ABNORMALITIES:
   - Absent sleep spindles
   - Abnormal K-complexes
   - REM sleep abnormalities
   - Sleep architecture disruption

═══════════════════════════════════════════════════════════════
📤 **OUTPUT FORMAT** (Comprehensive JSON)
═══════════════════════════════════════════════════════════════

{
  "eeg_type": "routine|prolonged|video_eeg|sleep|ambulatory",
  "recording_duration": "20 minutes",
  "patient_state": "awake|drowsy|asleep|sedated|other",
  
  "technical_quality": {
    "quality": "excellent|good|adequate|poor|uninterpretable",
    "artifacts": ["muscle artifact", "electrode pop", "movement"],
    "montages_reviewed": ["longitudinal bipolar", "referential"],
    "is_interpretable": true/false,
    "limitations": "technical issues affecting interpretation"
  },
  
  "background_rhythm": {
    "posterior_dominant_rhythm": {
      "frequency_hz": 10.0,
      "amplitude_uv": 40,
      "reactivity": "present|reduced|absent",
      "organization": "organized|poorly_organized|disorganized",
      "symmetry": "symmetric|asymmetric",
      "interpretation": "normal|slow|fast|absent"
    },
    "ap_gradient": "present|reduced|absent",
    "overall_assessment": "normal|mildly_abnormal|moderately_abnormal|severely_abnormal"
  },
  
  "frequency_band_analysis": {
    "delta": {
      "present": true/false,
      "location": "generalized|focal_left_temporal|etc",
      "amount": "none|rare|occasional|frequent|continuous",
      "significance": "normal_for_state|abnormal"
    },
    "theta": {
      "present": true/false,
      "location": "generalized|focal",
      "amount": "none|mild|moderate|excessive",
      "significance": "normal_for_state|abnormal"
    },
    "alpha": {
      "frequency": 10.0,
      "amplitude": 45,
      "reactivity": "excellent|good|poor|absent",
      "distribution": "posterior|generalized|abnormal"
    },
    "beta": {
      "amount": "normal|mildly_increased|markedly_increased",
      "distribution": "generalized|focal",
      "drug_effect_suspected": true/false
    }
  },
  
  "epileptiform_activity": {
    "present": true/false,
    "type": "spikes|sharp_waves|spike_wave|polyspike_wave|none",
    "location": "left_temporal|right_frontal|generalized|bilateral_independent",
    "frequency": "rare|occasional|frequent|continuous",
    "morphology": "simple|complex",
    "pattern_description": "3 Hz spike-and-wave complexes generalized",
    "clinical_significance": "Indicates epilepsy or increased seizure risk",
    "epilepsy_syndrome_suggested": "Absence epilepsy|Temporal lobe epilepsy|JME|other"
  },
  
  "seizure_activity": {
    "ictal_patterns_present": true/false,
    "seizure_type": "focal|generalized|unknown",
    "onset_location": "left_temporal|generalized",
    "evolution": "description of seizure progression",
    "duration": "seconds",
    "post_ictal_changes": "present|absent"
  },
  
  "focal_abnormalities": [
    {
      "location": "left_temporal_region",
      "abnormality": "continuous polymorphic delta activity",
      "significance": "Suggests structural lesion - needs imaging correlation",
      "severity": "moderate|severe"
    }
  ],
  
  "diffuse_abnormalities": {
    "generalized_slowing": true/false,
    "severity": "mild|moderate|severe",
    "pattern": "continuous|intermittent",
    "clinical_correlation": "Encephalopathy, metabolic disturbance, or medication effect"
  },
  
  "special_patterns": [
    {
      "pattern": "Triphasic waves",
      "location": "generalized",
      "significance": "Suggests metabolic encephalopathy",
      "associated_conditions": ["hepatic encephalopathy", "renal failure"]
    }
  ],
  
  "sleep_analysis": {
    "sleep_stages_identified": ["N1", "N2", "N3", "REM"],
    "sleep_spindles": "present|absent|abnormal",
    "k_complexes": "present|absent|abnormal",
    "vertex_waves": "present|absent",
    "sleep_architecture": "normal|disrupted"
  },
  
  "critical_findings": [
    {
      "finding": "Continuous spike-wave activity (status epilepticus)",
      "severity": "EMERGENCY",
      "immediate_action": "Immediate neurologist consultation, anti-epileptic medication",
      "time_sensitive": true,
      "confidence": 0.94
    }
  ],
  
  "severity_level": "normal|attention_needed|urgent|critical",
  "is_critical": true/false,
  "emergency_intervention_needed": true/false,
  
  "clinical_impression": "Comprehensive summary of all EEG findings and clinical significance",
  
  "differential_diagnosis": [
    "Temporal lobe epilepsy",
    "Post-stroke changes",
    "Encephalopathy"
  ],
  
  "recommendations": [
    "24-hour ambulatory EEG monitoring",
    "Brain MRI with epilepsy protocol",
    "Neurology consultation",
    "Anti-epileptic drug consideration",
    "Sleep study if sleep abnormalities present",
    "Metabolic workup if encephalopathy suspected"
  ],
  
  "follow_up": "Specific follow-up plan based on findings",
  
  "comparison_notes": "Recommend comparison with prior EEGs if available",
  
  "confidence_score": 0.88,
  
  "disclaimer": "This AI EEG analysis should be verified by a board-certified neurologist. Do not make treatment decisions based solely on this interpretation."
}

═══════════════════════════════════════════════════════════════
🎯 **CRITICAL ANALYSIS RULES**
═══════════════════════════════════════════════════════════════

1. **NEVER MISS**:
   - Status epilepticus (continuous seizure activity)
   - Electrocerebral silence (brain death)
   - Focal structural abnormalities
   - Non-convulsive status epilepticus
   - Severe encephalopathy patterns

2. **BE SYSTEMATIC**:
   - Review all channels/electrodes
   - Analyze entire recording duration
   - Check multiple montages if available
   - Note state changes (wake, sleep, activation)

3. **BE PRECISE**:
   - Measure frequencies accurately
   - Quantify amplitudes
   - Describe morphology in detail
   - Specify exact electrode locations

4. **BE COMPREHENSIVE**:
   - Describe normal AND abnormal findings
   - Note background, transients, and patterns
   - Consider age-appropriate norms
   - Integrate clinical context

5. **BE CLINICALLY RELEVANT**:
   - Provide actionable recommendations
   - Indicate urgency level
   - Suggest appropriate follow-up
   - Guide treatment considerations

═══════════════════════════════════════════════════════════════
🏥 **CLINICAL CORRELATION**
═══════════════════════════════════════════════════════════════

If clinical information provided, correlate EEG with:
- Seizure semiology and description
- Altered mental status
- Medication history (anti-epileptics, sedatives)
- Metabolic abnormalities
- Structural brain lesions known
- Prior EEG comparisons

═══════════════════════════════════════════════════════════════

**REMEMBER**: Accurate EEG interpretation guides critical neurological diagnoses and treatments. Be thorough and precise.
"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process EEG recording with ultra-comprehensive analysis.
        """
        execution_id = datetime.utcnow().isoformat()
        logger.info(f"[NEUROLOGICAL SIGNAL AGENT] Starting EEG analysis - {execution_id}")
        
        try:
            image_data = input_data.get("image_data")
            clinical_context = input_data.get("clinical_context", "")
            eeg_type = input_data.get("eeg_type", "routine")
            
            if not image_data:
                return self.handle_error(
                    Exception("No EEG image data provided"),
                    {"execution_id": execution_id}
                )
            
            user_message = f"""Analyze this EEG recording with neurologist-level precision and thoroughness.

EEG Type: {eeg_type}

{f'Clinical Context: {clinical_context}' if clinical_context else 'No clinical context provided - analyze EEG findings objectively.'}

Provide a COMPREHENSIVE, neurologist-level analysis following ALL steps in the systematic protocol.

CRITICAL: Flag any emergency findings (status epilepticus, severe abnormalities). This analysis guides critical neurological care.

Return complete JSON analysis as specified."""

            messages = [
                {"role": "system", "content": self.system_instructions},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_message},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ]
            
            logger.info(f"[NEUROLOGICAL SIGNAL AGENT] Sending EEG to GPT-4o for analysis...")
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"},
                max_tokens=4000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            analysis_result = self.parse_json_response(content)
            
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens
            
            logger.info(f"[NEUROLOGICAL SIGNAL AGENT] EEG analysis completed - Tokens: {total_tokens}")
            
            # Check for critical findings
            is_critical = analysis_result.get("is_critical", False)
            if is_critical:
                logger.warning(f"[NEUROLOGICAL SIGNAL AGENT] 🚨 CRITICAL EEG FINDINGS DETECTED!")
            
            return {
                "status": "success",
                "agent_type": self.get_agent_type(),
                "execution_id": execution_id,
                "data": {
                    "is_medical_imaging": True,
                    "imaging_type": "eeg",
                    "analysis_type": "neurological_signal",
                    **analysis_result
                },
                "metadata": {
                    "model": self.model,
                    "execution_time_ms": 0,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": total_tokens,
                    "timestamp": execution_id
                }
            }
            
        except Exception as e:
            logger.error(f"[NEUROLOGICAL SIGNAL AGENT] Error during EEG analysis: {str(e)}")
            return self.handle_error(e, {"execution_id": execution_id})

