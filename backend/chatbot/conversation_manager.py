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

    def get_messages(self, conversation_id: str) -> List[Dict]:
        """
        Get messages from a conversation.
        
        Args:
            conversation_id: The ID of the conversation
            
        Returns:
            List of message dictionaries
        """
        try:
            conversation = self.load_conversation(conversation_id)
            messages = conversation.get("messages", [])
            logger.info(f"Retrieved {len(messages)} messages for conversation {conversation_id}")
            return messages
            
        except Exception as e:
            logger.error(f"Error getting messages for conversation {conversation_id}: {str(e)}")
            return []

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
                        "conversation_id": conversation["conversation_id"],
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

    def update_project_context(self, conversation_id: str, project_context: Dict) -> None:
        """
        Update the project context for a conversation.
        
        Args:
            conversation_id: The ID of the conversation
            project_context: New project context information
        """
        try:
            conversation = self.load_conversation(conversation_id)
            conversation["project_context"] = project_context
            conversation["updated_at"] = self._get_current_timestamp()
            
            file_path = self._get_conversation_path(conversation_id)
            with open(file_path, 'w') as f:
                json.dump(conversation, f, indent=2)
            
            logger.info(f"Updated project context for conversation {conversation_id}")
            
        except Exception as e:
            logger.error(f"Error updating project context for conversation {conversation_id}: {str(e)}")
            raise

    def get_project_context(self, conversation_id: str) -> Optional[Dict]:
        """
        Get the current project context for a conversation.
        
        Args:
            conversation_id: The ID of the conversation
            
        Returns:
            Project context dictionary or None if not found
        """
        try:
            conversation = self.load_conversation(conversation_id)
            return conversation.get("project_context")
        except Exception as e:
            logger.error(f"Error getting project context for conversation {conversation_id}: {str(e)}")
            return None

    def create_project_conversation(self, user_id: str, project: Dict, task_index: int = 0, step_index: int = 0) -> Dict:
        """
        Create a new conversation specifically for a project with task and step context.
        
        Args:
            user_id: The ID of the user
            project: The project dictionary
            task_index: Index of the current task (0-based)
            step_index: Index of the current step (0-based)
            
        Returns:
            Dict containing the full conversation object
        """
        try:
            project_context = {
                "project": project,
                "task_index": task_index,
                "step_index": step_index,
                "project_name": project.get("project_name", "Unknown Project"),
                "current_task": project["tasks"][task_index]["task_name"] if project["tasks"] else "Unknown Task",
                "current_step": project["tasks"][task_index]["steps"][step_index]["step_name"] if project["tasks"] and project["tasks"][task_index]["steps"] else "Unknown Step"
            }
            
            title = f"{project.get('project_name', 'Project')} - {project_context['current_task']} - {project_context['current_step']}"
            
            return self.create_conversation(user_id, title, project_context)
            
        except Exception as e:
            logger.error(f"Error creating project conversation: {str(e)}")
            raise

    def advance_to_next_step(self, conversation_id: str) -> bool:
        """
        Advance the conversation to the next step in the project.
        
        Args:
            conversation_id: The ID of the conversation
            
        Returns:
            True if advanced successfully, False if at the end
        """
        try:
            conversation = self.load_conversation(conversation_id)
            project_context = conversation.get("project_context", {})
            
            if not project_context or "project" not in project_context:
                return False
            
            project = project_context["project"]
            current_task_index = project_context.get("task_index", 0)
            current_step_index = project_context.get("step_index", 0)
            
            # Check if there's a next step in the current task
            if current_step_index + 1 < len(project["tasks"][current_task_index]["steps"]):
                # Move to next step in same task
                new_step_index = current_step_index + 1
                new_task_index = current_task_index
            elif current_task_index + 1 < len(project["tasks"]):
                # Move to first step of next task
                new_task_index = current_task_index + 1
                new_step_index = 0
            else:
                # At the end of the project
                return False
            
            # Update project context
            new_context = {
                "project": project,
                "task_index": new_task_index,
                "step_index": new_step_index,
                "project_name": project.get("project_name", "Unknown Project"),
                "current_task": project["tasks"][new_task_index]["task_name"],
                "current_step": project["tasks"][new_task_index]["steps"][new_step_index]["step_name"]
            }
            
            self.update_project_context(conversation_id, new_context)
            
            # Update conversation title
            new_title = f"{project.get('project_name', 'Project')} - {new_context['current_task']} - {new_context['current_step']}"
            self.rename_conversation(conversation_id, new_title)
            
            logger.info(f"Advanced conversation {conversation_id} to task {new_task_index}, step {new_step_index}")
            return True
            
        except Exception as e:
            logger.error(f"Error advancing conversation {conversation_id}: {str(e)}")
            return False

    def get_current_step_info(self, conversation_id: str) -> Optional[Dict]:
        """
        Get detailed information about the current step.
        
        Args:
            conversation_id: The ID of the conversation
            
        Returns:
            Dictionary with current step information or None if not found
        """
        try:
            conversation = self.load_conversation(conversation_id)
            project_context = conversation.get("project_context", {})
            
            if not project_context or "project" not in project_context:
                return None
            
            project = project_context["project"]
            task_index = project_context.get("task_index", 0)
            step_index = project_context.get("step_index", 0)
            
            if task_index >= len(project["tasks"]) or step_index >= len(project["tasks"][task_index]["steps"]):
                return None
            
            task = project["tasks"][task_index]
            step = task["steps"][step_index]
            
            return {
                "project_name": project.get("project_name"),
                "task_name": task["task_name"],
                "task_description": task["description"],
                "step_name": step["step_name"],
                "step_description": step["description"],
                "guidelines": step.get("guidelines", []),
                "why": step.get("why", []),
                "starter_code": step.get("starter_code", ""),
                "task_index": task_index,
                "step_index": step_index,
                "total_tasks": len(project["tasks"]),
                "total_steps_in_task": len(task["steps"])
            }
            
        except Exception as e:
            logger.error(f"Error getting current step info for conversation {conversation_id}: {str(e)}")
            return None 