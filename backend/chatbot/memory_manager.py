import os
import json
import logging
from typing import Dict, List, Optional, Union
from datetime import datetime
from .conversation_manager import ConversationManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MemoryManager:
    """
    Memory Manager for Edura v2 that prepares conversation history for LLM prompt generation.
    
    This class handles:
    - Loading and formatting conversation history
    - Message trimming based on configurable limits
    - Project context extraction
    - Future extensibility for summarization and token estimation
    """
    
    def __init__(self, conversations_dir: str = "backend/chatbot/conversations"):
        """
        Initialize the MemoryManager.
        
        Args:
            conversations_dir: Path to the directory containing conversation files
        """
        self.conversation_manager = ConversationManager(conversations_dir)
        logger.info(f"Initialized MemoryManager with conversations directory: {conversations_dir}")

    def prepare_memory_for_prompt(
        self, 
        conversation_id: str, 
        max_messages: int = 50
    ) -> List[Dict[str, str]]:
        """
        Prepare conversation memory for prompt building.
        
        Args:
            conversation_id: The conversation ID
            max_messages: Maximum number of messages to include
            
        Returns:
            List of message dictionaries formatted for prompt
        """
        try:
            conversation = self.conversation_manager.load_conversation(conversation_id)
            messages = conversation.get("messages", [])
            
            # Get only the last N messages to prevent token overflow
            if len(messages) > max_messages:
                messages = messages[-max_messages:]
                logger.info(f"Truncated conversation history to last {max_messages} messages")
            
            # Format messages for prompt
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            logger.info(f"Prepared {len(formatted_messages)} messages for prompt")
            return formatted_messages
            
        except Exception as e:
            logger.error(f"Error preparing memory for conversation {conversation_id}: {str(e)}")
            return []

    def get_last_n_turns(self, conversation_id: str, n: int = 2) -> List[Dict[str, str]]:
        """
        Get only the last N turns of conversation to keep prompts focused.
        
        Args:
            conversation_id: The conversation ID
            n: Number of turns to get (default: 2)
            
        Returns:
            List of the last N message dictionaries
        """
        try:
            conversation = self.conversation_manager.load_conversation(conversation_id)
            messages = conversation.get("messages", [])
            
            # Get only the last N turns
            if len(messages) > n:
                messages = messages[-n:]
                logger.info(f"Using only last {n} conversation turns to keep prompt focused")
            
            # Format messages for prompt
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            return formatted_messages
            
        except Exception as e:
            logger.error(f"Error getting last {n} turns for conversation {conversation_id}: {str(e)}")
            return []

    def get_project_context(self, conversation_id: str) -> Dict:
        """
        Extract project context from a conversation.
        
        Args:
            conversation_id: UUID of the conversation
            
        Returns:
            Dictionary containing project context:
            {
                "project_id": str or None,
                "task_id": str or None,
                "step_id": str or None
            }
            
        Raises:
            FileNotFoundError: If conversation file doesn't exist
            ValueError: If conversation data is invalid
        """
        try:
            conversation = self.conversation_manager.load_conversation(conversation_id)
            project_context = conversation.get("project_context", {})
            
            # Ensure all expected keys exist
            default_context = {
                "project_id": None,
                "task_id": None,
                "step_id": None
            }
            project_context = {**default_context, **project_context}
            
            logger.info(f"Retrieved project context for conversation {conversation_id}")
            return project_context
            
        except Exception as e:
            logger.error(f"Error getting project context for conversation {conversation_id}: {str(e)}")
            raise

    # Future extensibility methods (stubs for now)
    def estimate_tokens(self, messages: List[Dict[str, str]]) -> int:
        """
        Estimate the number of tokens in the conversation history.
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            Estimated token count
        """
        # TODO: Implement token estimation logic
        logger.warning("Token estimation not yet implemented")
        return 0

    def generate_summary(self, conversation_id: str) -> str:
        """
        Generate a summary of the conversation.
        
        Args:
            conversation_id: UUID of the conversation
            
        Returns:
            String containing conversation summary
        """
        # TODO: Implement summarization logic
        logger.warning("Conversation summarization not yet implemented")
        return ""

    def generate_embeddings(self, messages: List[Dict[str, str]]) -> List[List[float]]:
        """
        Generate embeddings for conversation messages.
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            List of embedding vectors
        """
        # TODO: Implement embedding generation logic
        logger.warning("Embedding generation not yet implemented")
        return [] 