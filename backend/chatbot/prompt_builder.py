import logging
from typing import Dict, List, Optional, Union
from .memory_manager import MemoryManager
from .project_loader import ProjectLoader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PromptBuilder:
    """
    Builds Gemini-compatible prompt for Edura V2:
    - Fully memory-based
    - System instruction & project context merged into first user message
    - Compatible with Gemini chat format
    """

    def __init__(self, memory_manager, project_loader):
        self.memory_manager = memory_manager
        self.project_loader = project_loader
        self.logger = logging.getLogger(__name__)

    def build_prompt(self, conversation_id: str, user_input: str, max_messages: int = 50) -> List[Dict[str, str]]:
        prompt = []

        # ✅ Build system + project context as first user message
        system_instruction = (
            "You are Edura, an expert AI mentor inside EduVerse.\n"
            "Your job is to guide users through coding projects.\n"
            "Be clear, helpful, instructional and friendly.\n"
            "Avoid hallucination. Use known project context when possible.\n"
        )

        try:
            context = self.memory_manager.get_project_context(conversation_id)
            if context and context.get("project_id"):
                project_context = self._build_project_context(context)
                system_instruction += f"\nProject Context:\n{project_context}\n"
        except Exception as e:
            self.logger.warning(f"Failed to load project context: {str(e)}")

        # ✅ Inject system+project context as first user message
        prompt.append({
            "role": "user",
            "content": system_instruction.strip()
        })

        # ✅ Inject past conversation history (user/assistant turns)
        try:
            chat_history = self.memory_manager.prepare_memory_for_prompt(conversation_id, max_messages=max_messages)
            for msg in chat_history:
                # Gemini requires 'user' or 'model' roles only
                role = "user" if msg['role'] == 'user' else 'model'
                prompt.append({
                    "role": role,
                    "content": msg['content']
                })
        except Exception as e:
            self.logger.warning(f"Failed to load memory: {str(e)}")

        # ✅ Finally inject the new user input
        prompt.append({
            "role": "user",
            "content": user_input
        })

        return prompt

    def _build_project_context(self, context: Dict[str, str]) -> str:
        project_id = context.get("project_id")
        task_id = context.get("task_id")
        step_id = context.get("step_id")

        output = []

        try:
            project = self.project_loader.get_project_by_id(project_id)
            output.append(f"Project: {project.get('project_name')} ({project.get('difficulty')})")

            if task_id:
                task = self.project_loader.get_task_by_id(project_id, task_id)
                output.append(f"Task: {task.get('task_name')}")

                if step_id:
                    step = self.project_loader.get_step_by_id(project_id, task_id, step_id)
                    output.append(f"Step: {step.get('step_name')}")
                    if step.get('description'):
                        output.append(f"Step Description: {step['description']}")
                    if step.get('guidelines'):
                        guidelines = '\n'.join(f"- {g}" for g in step['guidelines'])
                        output.append(f"Guidelines:\n{guidelines}")
        except Exception as e:
            self.logger.warning(f"Failed to build project context: {str(e)}")

        return "\n".join(output)

    def _format_project_context(self, context: Dict) -> str:
        """
        Format project context into a readable string.
        
        Args:
            context: Dictionary containing project context
            
        Returns:
            Formatted project context string
        """
        return (
            "Current Project Context:\n"
            f"Project ID: {context.get('project_id', 'N/A')}\n"
            f"Task ID: {context.get('task_id', 'N/A')}\n"
            f"Step ID: {context.get('step_id', 'N/A')}"
        )

    def _has_project_context(self, context: Dict) -> bool:
        """
        Check if any project context values are set.
        
        Args:
            context: Dictionary containing project context
            
        Returns:
            True if any context value is not None, False otherwise
        """
        return any(
            context.get(key) is not None 
            for key in ['project_id', 'task_id', 'step_id']
        )

    def _build_detailed_project_context(self, context: Dict) -> str:
        """
        Build detailed project context from available data.
        """
        try:
            project_id = context.get("project_id")
            task_id = context.get("task_id")
            step_id = context.get("step_id")

            context_parts = []

            # Add project details
            if project_id:
                project = self.project_loader.get_project(project_id)
                if project:
                    context_parts.append(f"Current Project: {project.get('name', 'N/A')}")
                    context_parts.append(f"Description: {project.get('description', 'N/A')}")
                    context_parts.append(f"Difficulty: {project.get('difficulty', 'N/A')}")

            # Add task details
            if task_id and project_id:
                task = self.project_loader.get_task(project_id, task_id)
                if task:
                    context_parts.append(f"\nCurrent Task: {task.get('name', 'N/A')}")
                    context_parts.append(f"Task Description: {task.get('description', 'N/A')}")

            # Add step details
            if step_id and task_id and project_id:
                step = self.project_loader.get_step(project_id, task_id, step_id)
                if step:
                    context_parts.append(f"\nCurrent Step: {step.get('name', 'N/A')}")
                    context_parts.append(f"Step Description: {step.get('description', 'N/A')}")
                    
                    # Add guidelines if available
                    guidelines = step.get('guidelines', [])
                    if guidelines:
                        context_parts.append("\nGuidelines:")
                        for guideline in guidelines:
                            context_parts.append(f"- {guideline}")

            return "\n".join(context_parts)

        except Exception as e:
            logger.error(f"Error building project context: {str(e)}")
            return "Project context unavailable"

    def _build_system_message(self, conversation_id):
        """
        Builds the system message with project context and guidelines.
        """
        try:
            # Get project context from conversation
            project_context = self.memory_manager.get_project_context(conversation_id)
            
            # Build base system message
            system_message = {
                "role": "system",
                "content": """You are Edura — a friendly but concise AI mentor inside Eduverse.

Your role is to help users navigate projects, give suggestions, and explain concepts simply.

Guidelines:
- When suggesting projects, give 3-4 relevant ideas max.
- Keep explanations short, natural, and friendly.
- Avoid long lectures or unnecessary deep dives.
- Use simple, casual language like a human mentor.
- If user seems stuck, give a short helpful hint.
- Always encourage next actionable step.
- Avoid repeating the project name too many times."""
            }

            # Add project context if available
            if project_context:
                system_message["content"] += f"\n\nCurrent Project Context:\n{project_context}"

            return system_message

        except Exception as e:
            logger.error(f"Error building system message: {str(e)}")
            return {
                "role": "system",
                "content": "You are Edura, a helpful AI mentor."
            }

    # Future extensibility methods (stubs for now)
    def build_summarized_prompt(
        self, 
        conversation_id: str, 
        user_input: str,
        summary_length: int = 3
    ) -> List[Dict[str, str]]:
        """
        Build a prompt with summarized conversation history.
        
        Args:
            conversation_id: UUID of the conversation
            user_input: Latest user message
            summary_length: Number of summary points to include
            
        Returns:
            List of message dictionaries with summarized history
        """
        # TODO: Implement summarization logic
        logger.warning("Prompt summarization not yet implemented")
        return self.build_prompt(conversation_id, user_input)

    def build_personalized_prompt(
        self, 
        conversation_id: str, 
        user_input: str,
        user_profile: Dict
    ) -> List[Dict[str, str]]:
        """
        Build a prompt with user personalization.
        
        Args:
            conversation_id: UUID of the conversation
            user_input: Latest user message
            user_profile: Dictionary containing user preferences and history
            
        Returns:
            List of message dictionaries with personalization
        """
        # TODO: Implement personalization logic
        logger.warning("Prompt personalization not yet implemented")
        return self.build_prompt(conversation_id, user_input)

    def build_knowledge_graph_prompt(
        self, 
        conversation_id: str, 
        user_input: str,
        knowledge_graph: Dict
    ) -> List[Dict[str, str]]:
        """
        Build a prompt with knowledge graph context.
        
        Args:
            conversation_id: UUID of the conversation
            user_input: Latest user message
            knowledge_graph: Dictionary containing relevant knowledge graph data
            
        Returns:
            List of message dictionaries with knowledge graph context
        """
        # TODO: Implement knowledge graph integration
        logger.warning("Knowledge graph integration not yet implemented")
        return self.build_prompt(conversation_id, user_input) 