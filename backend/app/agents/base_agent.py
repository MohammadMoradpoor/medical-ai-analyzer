"""
Base Agent Framework for Medical AI Analysis System

Provides foundation for all agents with tool registration, execution tracking,
and error handling capabilities.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Callable
from datetime import datetime
from uuid import UUID, uuid4
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Enhanced base class for all agents in the medical analysis system.
    
    Features:
    - Tool registration and management
    - Execution context tracking
    - Structured error handling
    - Token usage monitoring
    - Extensible design for any analysis type
    """
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        """
        Initialize the agent with OpenAI API key and model.
        
        Args:
            api_key: OpenAI API key for authentication
            model: Model to use (default: gpt-4o with vision capabilities)
        """
        self.api_key = api_key
        self.model = model
        self.agent_type = self.get_agent_type()
        self.tools: List[Callable] = []
        self.execution_id: Optional[UUID] = None
        
    @property
    @abstractmethod
    def get_agent_type(self) -> str:
        """Return the agent type identifier."""
        pass
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main functionality.
        
        Args:
            input_data: Input data for processing containing:
                - file_content: bytes or file path
                - file_type: Type of file (pdf, image, xray, mri, etc.)
                - context: Additional context for analysis
                
        Returns:
            Dict containing:
                - status: "success" | "failure" | "pending"
                - data: Processed results
                - error: Error message if status is "failure"
                - execution_details: Detailed execution trace
                - token_usage: Token usage statistics
        """
        pass
    
    def register_tool(self, tool: Callable) -> None:
        """
        Register a tool for the agent to use.
        
        Args:
            tool: Function tool decorated with @function_tool
        """
        self.tools.append(tool)
        logger.info(f"Agent {self.agent_type} registered tool: {tool.__name__}")
    
    def register_tools(self, tools: List[Callable]) -> None:
        """
        Register multiple tools at once.
        
        Args:
            tools: List of function tools
        """
        for tool in tools:
            self.register_tool(tool)
    
    def start_execution(self) -> UUID:
        """
        Start a new execution session and return execution ID.
        
        Returns:
            UUID for tracking this execution
        """
        self.execution_id = uuid4()
        logger.info(f"Agent {self.agent_type} started execution: {self.execution_id}")
        return self.execution_id
    
    def log_event(self, event: str, payload: Dict[str, Any] = None) -> None:
        """
        Log an agent event for auditing purposes.
        
        Args:
            event: Description of the event
            payload: Optional additional data
        """
        logger.info(
            f"Agent {self.agent_type} event: {event}",
            extra={
                "agent_type": self.agent_type,
                "event": event,
                "payload": payload or {},
                "execution_id": str(self.execution_id) if self.execution_id else None,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    def handle_error(self, error: Exception, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Handle errors that occur during agent execution.
        
        Args:
            error: The exception that occurred
            context: Optional execution context
            
        Returns:
            Error response dictionary
        """
        error_msg = f"Agent {self.agent_type} failed: {str(error)}"
        logger.error(error_msg, exc_info=True)
        
        return {
            "status": "failure",
            "error": error_msg,
            "error_type": type(error).__name__,
            "data": None,
            "execution_id": str(self.execution_id) if self.execution_id else None,
            "context": context or {},
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def create_success_response(
        self, 
        data: Any, 
        execution_details: Dict[str, Any] = None,
        token_usage: Dict[str, int] = None
    ) -> Dict[str, Any]:
        """
        Create a standardized success response.
        
        Args:
            data: The result data
            execution_details: Detailed execution information
            token_usage: Token usage statistics
            
        Returns:
            Standardized success response
        """
        return {
            "status": "success",
            "data": data,
            "error": None,
            "execution_id": str(self.execution_id) if self.execution_id else None,
            "execution_details": execution_details or {},
            "token_usage": token_usage or {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }


class AgentRegistry:
    """
    Enhanced registry for managing agent types and instantiation.
    Supports dynamic agent discovery and validation.
    """
    
    _agents: Dict[str, type] = {}
    _agent_capabilities: Dict[str, List[str]] = {}
    
    @classmethod
    def register(
        cls, 
        agent_type: str, 
        agent_class: type,
        capabilities: List[str] = None
    ) -> None:
        """
        Register an agent class for a specific type.
        
        Args:
            agent_type: Type identifier for the agent
            agent_class: Agent class to register
            capabilities: List of capabilities this agent provides
        """
        cls._agents[agent_type] = agent_class
        cls._agent_capabilities[agent_type] = capabilities or []
        logger.info(f"Registered agent: {agent_type} with capabilities: {capabilities}")
        
    @classmethod
    def get_agent(cls, agent_type: str, api_key: str, **kwargs) -> BaseAgent:
        """
        Create an agent instance for the given type.
        
        Args:
            agent_type: Type of agent to create
            api_key: OpenAI API key
            **kwargs: Additional arguments for agent initialization
            
        Returns:
            Agent instance
            
        Raises:
            ValueError: If agent type is not registered
        """
        if agent_type not in cls._agents:
            available = ', '.join(cls._agents.keys())
            raise ValueError(
                f"Unknown agent type: {agent_type}. "
                f"Available agents: {available}"
            )
            
        agent_class = cls._agents[agent_type]
        return agent_class(api_key, **kwargs)
    
    @classmethod
    def list_agent_types(cls) -> List[str]:
        """Return list of registered agent types."""
        return list(cls._agents.keys())
    
    @classmethod
    def get_agent_capabilities(cls, agent_type: str) -> List[str]:
        """Get capabilities of a specific agent type."""
        return cls._agent_capabilities.get(agent_type, [])
    
    @classmethod
    def find_agent_by_capability(cls, capability: str) -> List[str]:
        """
        Find all agents that provide a specific capability.
        
        Args:
            capability: Capability to search for
            
        Returns:
            List of agent types that provide this capability
        """
        return [
            agent_type 
            for agent_type, caps in cls._agent_capabilities.items()
            if capability in caps
        ]
