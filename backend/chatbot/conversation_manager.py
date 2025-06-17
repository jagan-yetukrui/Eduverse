import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConversationManager:
    def __init__(self, conversations_dir: str = "backend/chatbot/conversations"):
        """Initialize the ConversationManager with the specified conversations directory."""
        self.conversations_dir = conversations_dir
        self._ensure_conversations_dir()

    def _ensure_conversations_dir(self) -> None:
        """Ensure the conversations directory exists."""
        os.makedirs(self.conversations_dir, exist_ok=True)

    def _get_conversation_path(self, conversation_id: str) -> str:
        """Get the full path for a conversation file."""
        return os.path.join(self.conversations_dir, f"{conversation_id}.json")

    def _get_current_timestamp(self) -> str:
        """Get current UTC timestamp in ISO format."""
        return datetime.utcnow().isoformat()

    def create_conversation(self, user_id: str, title: str, project_context: Dict) -> Dict:
        """
        Create a new conversation file.
        
        Args:
            user_id: The ID of the user
            title: The title of the conversation
            project_context: Dictionary containing project context information
            
        Returns:
            Dict containing the full conversation object
        """
        try:
            conversation_id = str(uuid.uuid4())
            timestamp = self._get_current_timestamp()
            
            conversation = {
                "conversation_id": conversation_id,
                "user_id": user_id,
                "title": title,
                "created_at": timestamp,
                "updated_at": timestamp,
                "project_context": project_context,
                "messages": []
            }
            
            file_path = self._get_conversation_path(conversation_id)
            with open(file_path, 'w') as f:
                json.dump(conversation, f, indent=2)
            
            logger.info(f"Created new conversation: {conversation_id}")
            return conversation
            
        except Exception as e:
            logger.error(f"Error creating conversation: {str(e)}")
            raise

    def load_conversation(self, conversation_id: str) -> Dict:
        """
        Load a conversation from its JSON file.
        
        Args:
            conversation_id: The ID of the conversation to load
            
        Returns:
            Dict containing the full conversation data
        """
        try:
            file_path = self._get_conversation_path(conversation_id)
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Conversation {conversation_id} not found")
            
            with open(file_path, 'r') as f:
                conversation = json.load(f)
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error loading conversation {conversation_id}: {str(e)}")
            raise

    def save_message(self, conversation_id: str, role: str, content: str) -> None:
        """
        Append a new message to the conversation.
        
        Args:
            conversation_id: The ID of the conversation
            role: The role of the message sender ('user' or 'edura')
            content: The message content
        """
        try:
            conversation = self.load_conversation(conversation_id)
            
            message = {
                "role": role,
                "content": content,
                "timestamp": self._get_current_timestamp()
            }
            
            conversation["messages"].append(message)
            conversation["updated_at"] = self._get_current_timestamp()
            
            file_path = self._get_conversation_path(conversation_id)
            with open(file_path, 'w') as f:
                json.dump(conversation, f, indent=2)
            
            logger.info(f"Saved new message to conversation {conversation_id}")
            
        except Exception as e:
            logger.error(f"Error saving message to conversation {conversation_id}: {str(e)}")
            raise

    def rename_conversation(self, conversation_id: str, new_title: str) -> None:
        """
        Rename a conversation.
        
        Args:
            conversation_id: The ID of the conversation
            new_title: The new title for the conversation
        """
        try:
            conversation = self.load_conversation(conversation_id)
            conversation["title"] = new_title
            conversation["updated_at"] = self._get_current_timestamp()
            
            file_path = self._get_conversation_path(conversation_id)
            with open(file_path, 'w') as f:
                json.dump(conversation, f, indent=2)
            
            logger.info(f"Renamed conversation {conversation_id} to '{new_title}'")
            
        except Exception as e:
            logger.error(f"Error renaming conversation {conversation_id}: {str(e)}")
            raise

    def delete_conversation(self, conversation_id: str) -> None:
        """
        Delete a conversation file.
        
        Args:
            conversation_id: The ID of the conversation to delete
        """
        try:
            file_path = self._get_conversation_path(conversation_id)
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted conversation {conversation_id}")
            else:
                raise FileNotFoundError(f"Conversation {conversation_id} not found")
                
        except Exception as e:
            logger.error(f"Error deleting conversation {conversation_id}: {str(e)}")
            raise

    def list_conversations(self, user_id: str) -> List[Dict]:
        """
        List all conversations for a user.
        
        Args:
            user_id: The ID of the user
            
        Returns:
            List of conversation summaries (id, title, created_at, updated_at)
        """
        try:
            conversations = []
            for filename in os.listdir(self.conversations_dir):
                if not filename.endswith('.json'):
                    continue
                    
                file_path = os.path.join(self.conversations_dir, filename)
                with open(file_path, 'r') as f:
                    conversation = json.load(f)
                    
                if conversation["user_id"] == user_id:
                    summary = {
                        "id": conversation["conversation_id"],
                        "title": conversation["title"],
                        "created_at": conversation["created_at"],
                        "updated_at": conversation["updated_at"]
                    }
                    conversations.append(summary)
            
            # Sort conversations by updated_at timestamp (newest first)
            conversations.sort(key=lambda x: x["updated_at"], reverse=True)
            return conversations
            
        except Exception as e:
            logger.error(f"Error listing conversations for user {user_id}: {str(e)}")
            raise 