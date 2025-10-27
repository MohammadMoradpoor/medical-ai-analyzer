# Medical AI Analyzer - Powerful Agentic Architecture

## 🎯 Overview

This document describes the **powerful, extensible agentic system** for medical analysis, inspired by enterprise-grade workflow automation systems. The architecture supports **any type of medical analysis** through a modular, tool-based approach orchestrated by a central moderator agent.

---

## 🏗️ Architecture Components

### 1. **Base Agent Framework** (`base_agent.py`)

The foundation of all agents, providing:

- **Tool Registration System**: Dynamic tool loading and management
- **Execution Tracking**: UUID-based execution tracing
- **Structured Error Handling**: Consistent error responses
- **Token Usage Monitoring**: Built-in cost tracking
- **Agent Registry**: Central registration and discovery system

```python
from agents import BaseAgent, AgentRegistry

# All agents inherit from BaseAgent
class MyCustomAgent(BaseAgent):
    def get_agent_type(self) -> str:
        return "my_agent"
    
    async def process(self, input_data):
        # Your agent logic here
        pass

# Register with capabilities
AgentRegistry.register(
    "my_agent", 
    MyCustomAgent,
    capabilities=["custom_analysis", "specialized_task"]
)
```

---

### 2. **Moderator Agent** (`moderator_agent.py`)

The **orchestrator** that coordinates all medical analysis operations:

#### **Responsibilities:**
- Classification of medical inputs
- Routing to specialized agents
- Multi-phase pipeline execution
- Quality verification
- Report generation

#### **Execution Phases:**

1. **CLASSIFY** - Determine input type (lab report, X-ray, MRI, CT, dental)
2. **ANALYZE** - Route to specialized agents and execute analysis
3. **VERIFY** - Validate completeness and accuracy
4. **REPORT** - Generate comprehensive patient-friendly reports

#### **Usage:**

```python
from agents import ModeratorAgent

moderator = ModeratorAgent(api_key="your-openai-key")

result = await moderator.process({
    "file_content": image_bytes,
    "file_type": "image",
    "context": {"patient_id": "12345"},
    "db": db_session,
    "report_id": report_uuid
})

# Result structure:
{
    "status": "success",
    "data": {
        "classification": {...},
        "analysis": {...},
        "report": {...}
    },
    "execution_details": {...},
    "token_usage": {...}
}
```

---

### 3. **Medical Imaging Agent** (`imaging_agent.py`)

Specialized agent for **medical imaging analysis** using GPT-4o Vision API:

#### **Supported Imaging Types:**

| Type | Description | Capabilities |
|------|-------------|--------------|
| **X-ray** | Radiograph imaging | Fractures, bone density, soft tissue, pathology |
| **MRI** | Magnetic resonance | Brain, spine, joints, soft tissue abnormalities |
| **CT Scan** | Computed tomography | Cross-sectional pathology, detailed anatomy |
| **Dental** | Dental radiography | Cavities, root issues, bone loss, tooth conditions |
| **General** | Auto-detect | Automatic imaging type detection |

#### **Analysis Framework:**

Each imaging type follows a **systematic review protocol**:

1. **Technical Quality Assessment**
2. **Anatomical Structure Review**  
3. **Abnormality Detection**
4. **Severity Classification**
5. **Recommendations Generation**

#### **Usage:**

```python
from agents import MedicalImagingAgent

imaging_agent = MedicalImagingAgent(api_key="your-key")

# Analyze X-ray
result = await imaging_agent.process({
    "image_data": base64_encoded_image,
    "imaging_type": "xray",  # or "mri", "ct_scan", "dental"
    "body_part": "chest",
    "clinical_context": "Patient presents with chest pain"
})

# Result includes:
{
    "image_type": "chest_xray",
    "quality_assessment": {...},
    "findings": {
        "normal_structures": [...],
        "abnormal_findings": [...]
    },
    "severity_level": "normal|attention_needed|urgent|critical",
    "impression": "Concise summary",
    "recommendations": [...]
}
```

---

### 4. **Tools Manager** (`tools.py`)

Provides **comprehensive toolset** for agents:

#### **Tool Categories:**

**Imaging Analysis Tools:**
- `analyze_xray()`
- `analyze_mri()`
- `analyze_ct_scan()`
- `analyze_dental()`
- `verify_image_quality()`
- `detect_image_type()`

**Data Extraction Tools:**
- `extract_lab_data()`

**Report Generation Tools:**
- `generate_radiology_report()`

#### **Usage:**

```python
from agents import ToolsManager

tools_manager = ToolsManager(
    db=db_session,
    report_id=report_id,
    context={},
    tool_calls=[],
    api_key=api_key
)

# Get tools for specific purpose
imaging_tools = tools_manager.get_imaging_tools()
all_tools = tools_manager.get_all_tools()
```

---

### 5. **Enhanced Document Extractor** (`document_extractor_agent.py`)

Now **intelligently routes** to specialized agents:

#### **Workflow:**

1. **Detect Content Type** (lab report vs medical imaging)
2. **Route to Specialist**:
   - Lab reports → Standard extraction
   - X-ray/MRI/CT/Dental → `MedicalImagingAgent`
3. **Extract Structured Data**
4. **Return Comprehensive Results**

#### **Automatic Routing:**

```python
# The extractor automatically detects and routes
extractor = DocumentExtractorAgent(api_key="your-key")

# For an X-ray image, it automatically:
# 1. Detects it's an X-ray
# 2. Routes to MedicalImagingAgent  
# 3. Gets specialized radiological analysis
# 4. Returns structured findings

result = await extractor.process({
    "file_content": image_bytes,
    "file_type": "image"
})
```

---

## 🔧 Integration with Existing System

The new agent system is **fully compatible** with your existing codebase:

### **reports.py Integration:**

```python
# In process_medical_report function:

# Step 2: Document Extraction (now with imaging support)
extractor = DocumentExtractorAgent(OPENAI_API_KEY)
extraction_result = await extractor.process({
    "file_content": file_content,
    "file_type": file_type  # "pdf" or "image"
})

# If it's medical imaging, extraction_result contains:
# - Specialized radiological analysis
# - Structured findings
# - Severity classification  
# - Professional recommendations

# The rest of your pipeline continues as normal!
```

---

## 🎨 Key Features

### **1. Extensibility**

Add new agents easily:

```python
class NewSpecializedAgent(BaseAgent):
    def get_agent_type(self) -> str:
        return "new_agent"
    
    async def process(self, input_data):
        # Your logic
        pass

# Register with capabilities
AgentRegistry.register(
    "new_agent",
    NewSpecializedAgent,
    capabilities=["new_capability"]
)
```

### **2. Tool System**

Agents can use any registered tools:

```python
# Tools are function decorators
from agents import function_tool

@function_tool(name_override="my_custom_tool")
def my_tool(param1: str, param2: int) -> Dict[str, Any]:
    """Tool description for AI."""
    return {"result": "..."}

# Register with agent
agent.register_tool(my_tool)
```

### **3. Execution Tracking**

Every execution is tracked:

```python
execution_id = agent.start_execution()
# All logs include this execution_id for tracing

agent.log_event("custom_event", {"data": "..."})
# Logs with execution_id, timestamp, agent_type
```

### **4. Token Usage Monitoring**

Built-in cost tracking:

```python
result = await agent.process({...})

# Result includes token usage
token_usage = result["token_usage"]
# {
#   "prompt_tokens": 1250,
#   "completion_tokens": 830, 
#   "total_tokens": 2080
# }

# Calculate cost
cost = (token_usage["prompt_tokens"] / 1_000_000 * 2.50) + \
       (token_usage["completion_tokens"] / 1_000_000 * 10.00)
```

---

## 🚀 Usage Examples

### **Example 1: Analyze Chest X-ray**

```python
from agents import MedicalImagingAgent

agent = MedicalImagingAgent(api_key="sk-...")

result = await agent.process({
    "image_data": chest_xray_base64,
    "imaging_type": "xray",
    "body_part": "chest",
    "clinical_context": "Follow-up for pneumonia"
})

print(result["data"]["findings"])
print(result["data"]["severity_level"])
print(result["data"]["recommendations"])
```

### **Example 2: Analyze Dental X-ray**

```python
result = await agent.process({
    "image_data": dental_xray_base64,
    "imaging_type": "dental",
    "dental_type": "bitewing"
})

# Get tooth-specific findings
for finding in result["data"]["findings"]["dental_findings"]:
    tooth_num = finding["tooth_number"]
    condition = finding["finding"]
    severity = finding["severity"]
    print(f"Tooth #{tooth_num}: {condition} ({severity})")
```

### **Example 3: Analyze Brain MRI**

```python
result = await agent.process({
    "image_data": brain_mri_base64,
    "imaging_type": "mri",
    "body_part": "brain",
    "contrast_used": True
})

# Get detailed brain analysis
findings = result["data"]["findings"]["abnormal_findings"]
for finding in findings:
    location = finding["location"]
    signal = finding["signal_characteristics"]
    print(f"{location}: {signal}")
```

### **Example 4: Complete Pipeline with Moderator**

```python
from agents import ModeratorAgent

moderator = ModeratorAgent(api_key="sk-...")

# Automatically classifies, analyzes, verifies, and reports
result = await moderator.process({
    "file_content": medical_image_bytes,
    "file_type": "image",
    "context": {
        "patient_age": 45,
        "clinical_history": "Chronic back pain"
    }
})

# Get complete analysis
classification = result["data"]["classification"]
analysis = result["data"]["analysis"]
report = result["data"]["report"]

print(f"Detected: {classification['category']}")
print(f"Severity: {analysis['severity_level']}")
print(f"Summary: {report['executive_summary']}")
```

---

## 🔬 Supported Medical Imaging Analysis

### **X-ray Analysis Capabilities:**

- ✅ Chest X-rays (heart, lungs, mediastinum)
- ✅ Skeletal X-rays (fractures, alignment, bone density)
- ✅ Abdominal X-rays (bowel, organs, free air)
- ✅ Spine X-rays (vertebrae, disc spaces, alignment)
- ✅ Joint X-rays (arthritis, effusions, alignment)

### **MRI Analysis Capabilities:**

- ✅ Brain MRI (parenchyma, ventricles, vasculature)
- ✅ Spine MRI (cord, discs, vertebrae, stenosis)
- ✅ Joint MRI (cartilage, ligaments, bone marrow)
- ✅ Soft tissue MRI (masses, signal abnormalities)

### **CT Scan Analysis Capabilities:**

- ✅ Head CT (hemorrhage, infarct, mass effect)
- ✅ Chest CT (nodules, infiltrates, PE)
- ✅ Abdomen CT (organs, masses, fluid)
- ✅ Spine CT (fractures, alignment, canal stenosis)

### **Dental Imaging Capabilities:**

- ✅ Bitewing X-rays (caries, bone level)
- ✅ Periapical X-rays (roots, periapical pathology)
- ✅ Panoramic X-rays (full dentition overview)
- ✅ CBCT (3D dental imaging)

---

## 📊 Output Formats

### **Imaging Analysis Output:**

```json
{
  "image_type": "chest_xray",
  "body_part": "chest",
  "quality_assessment": {
    "quality": "excellent",
    "technical_issues": [],
    "is_analyzable": true
  },
  "findings": {
    "normal_structures": [
      "Heart size normal",
      "Lung fields clear bilaterally"
    ],
    "abnormal_findings": [
      {
        "finding": "Small right pleural effusion",
        "location": "Right costophrenic angle",
        "severity": "mild",
        "characteristics": "Blunting of right costophrenic angle"
      }
    ]
  },
  "severity_level": "attention_needed",
  "is_critical": false,
  "impression": "Mild right pleural effusion. Otherwise unremarkable chest X-ray.",
  "recommendations": [
    "Clinical correlation recommended",
    "Follow-up X-ray in 4-6 weeks if clinically indicated",
    "Consider ultrasound if symptomatic"
  ],
  "differential_diagnosis": [
    "Simple pleural effusion",
    "Post-inflammatory change"
  ],
  "confidence": 0.92
}
```

---

## 🛡️ Error Handling

Robust error handling at every level:

```python
try:
    result = await agent.process({...})
    
    if result["status"] == "failure":
        error = result["error"]
        error_type = result["error_type"]
        execution_id = result["execution_id"]
        
        logger.error(f"Agent failed: {error}")
        # Handle error appropriately
        
except Exception as e:
    # Unexpected errors are caught and logged
    logger.error(f"Unexpected error: {e}")
```

---

## 🎯 Best Practices

1. **Always specify context** when available (patient age, clinical history)
2. **Use appropriate imaging_type** for better analysis
3. **Include body_part** for anatomical context
4. **Monitor token usage** for cost optimization
5. **Log execution_ids** for tracing and debugging
6. **Handle errors gracefully** with fallback mechanisms

---

## 🔮 Future Enhancements

The architecture is designed to support:

- [ ] Multi-image comparison (follow-up studies)
- [ ] DICOM metadata extraction
- [ ] 3D reconstruction analysis
- [ ] Video/cine analysis (echo, fluoro)
- [ ] AI-assisted measurements
- [ ] Template-based reporting
- [ ] Custom agent plugins
- [ ] Real-time streaming analysis

---

## 📝 Summary

This powerful agentic architecture provides:

✅ **Comprehensive medical imaging analysis** (X-ray, MRI, CT, Dental)
✅ **Intelligent routing** to specialized agents
✅ **Extensible tool system** for any analysis type
✅ **Professional-grade** radiologist-style reports
✅ **Built-in cost tracking** and execution monitoring
✅ **Easy integration** with existing systems
✅ **Production-ready** error handling and logging

**The system now handles ANY type of medical analysis through modular, specialized agents orchestrated by a central moderator!** 🎉

