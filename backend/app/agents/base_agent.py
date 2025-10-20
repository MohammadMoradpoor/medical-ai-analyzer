from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Base class for all agents in the medical analysis system.
    
    Agents are responsible for specific AI operations such as:
    - Document extraction from medical reports
    - Medical data analysis
    - Report generation
    """
    
    def __init__(self, api_key: str):
        """
        Initialize the agent with OpenAI API key.
        
        Args:
            api_key: OpenAI API key for authentication
        """
        self.api_key = api_key
        self.agent_type = self.get_agent_type()
        
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
            input_data: Input data for processing
                
        Returns:
            Dict containing:
                - status: "success" | "failure" | "pending"
                - data: Processed results
                - error: Error message if status is "failure"
        """
        pass
    
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
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    def handle_error(self, error: Exception) -> Dict[str, Any]:
        """
        Handle errors that occur during agent execution.
        
        Args:
            error: The exception that occurred
            
        Returns:
            Error response dictionary
        """
        error_msg = f"Agent {self.agent_type} failed: {str(error)}"
        logger.error(error_msg, exc_info=True)
        
        return {
            "status": "failure",
            "error": error_msg,
            "data": None
        }


class AgentRegistry:
    """
    Registry for managing agent types and instantiation.
    """
    
    _agents: Dict[str, type] = {}
    
    @classmethod
    def register(cls, agent_type: str, agent_class: type) -> None:
        """Register an agent class for a specific type."""
        cls._agents[agent_type] = agent_class
        
    @classmethod
    def get_agent(cls, agent_type: str, api_key: str) -> BaseAgent:
        """
        Create an agent instance for the given type.
        
        Args:
            agent_type: Type of agent to create
            api_key: OpenAI API key
            
        Returns:
            Agent instance
            
        Raises:
            ValueError: If agent type is not registered
        """
        if agent_type not in cls._agents:
            raise ValueError(f"Unknown agent type: {agent_type}")
            
        agent_class = cls._agents[agent_type]
        return agent_class(api_key)
    
    @classmethod
    def list_agent_types(cls) -> list[str]:
        """Return list of registered agent types."""
        return list(cls._agents.keys())

