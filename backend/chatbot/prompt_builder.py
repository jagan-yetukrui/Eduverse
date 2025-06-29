import logging
from typing import Dict, List, Optional, Union
from .memory_manager import MemoryManager
from .project_loader import ProjectLoader
import re
import json
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PromptBuilder:
    """
    Enhanced PromptBuilder for Edura V2:
    - Detects project context from user messages
    - Injects structured project data to prevent generic responses
    - Enforces focused, step-specific guidance
    - Prevents fallback to generic LLM behavior
    """

    def __init__(self, memory_manager, project_loader):
        self.memory_manager = memory_manager
        self.project_loader = project_loader
        self.logger = logging.getLogger(__name__)

    def build_strict_project_prompt(self, user_input: str, project: Dict, task_index: int, step_index: int) -> str:
        """
        Production-ready function that builds a strict project-focused prompt using JSON structure.
        
        Args:
            user_input: The user's message
            project: The project dictionary from JSON
            task_index: Index of the task (0-based)
            step_index: Index of the step (0-based)
            
        Returns:
            Complete prompt string for the LLM
        """
        SYSTEM_PROMPT = """You are Edura, an AI mentor inside EduVerse. Your role is to help students learn through project-based coding.

You are currently helping the user with a specific project, task, and step. Use ONLY the data provided below.
Never ask open-ended questions like "What are you trying to build?" or "Can you explain your idea more?" — you already know.

NEVER write poems, answer unrelated questions, or generate ideas outside the task scope.

If the user says something vague like "help with step 1" or "what's next", assume they are referring to the current step and respond with guidance, hints, or code help.

Always keep your tone positive, instructive, and focused on helping them learn.

Example response format:
1. What this step is about
2. Suggestions or sample structure
3. A small tip or next suggestion"""

        try:
            task = project["tasks"][task_index]
            step = task["steps"][step_index]

            title = project["project_name"]
            task_title = task["task_name"]
            task_description = task["description"]
            step_title = step["step_name"]
            step_description = step["description"]
            starter_code = step.get("starter_code", "").strip()
            guidelines = step.get("guidelines", [])
            why_explanation = step.get("why", [])

            prompt = f"""{SYSTEM_PROMPT}

🚀 Project: {title}
📌 Task: {task_title}
📍 Step: {step_title}

📝 Step Description:
{step_description}

💡 User Input:
{user_input}

{"📦 Starter Code:\n" + starter_code if starter_code else ""}

{"💡 Guidelines:\n" + "\n".join(f"• {guideline}" for guideline in guidelines) if guidelines else ""}

{"🤔 Why This Matters:\n" + "\n".join(f"• {reason}" for reason in why_explanation) if why_explanation else ""}

🧠 Your job: Help the user with this exact step. Explain what it does, give code suggestions or hints, and keep them moving forward.
"""

            return prompt

        except (IndexError, KeyError) as e:
            logger.error(f"Error building strict project prompt: {str(e)}")
            return f"{SYSTEM_PROMPT}\n\nError: Could not load project context. Please try again."

    def auto_match_project_context(self, user_input: str) -> Optional[Dict]:
        """
        Auto-match project context based on user input patterns.
        Now uses the enhanced project_loader.get_project_context() function.
        
        Args:
            user_input: The user's message
            
        Returns:
            Dictionary with project, task_index, step_index if found, None otherwise
        """
        # Use the new project_loader function
        context = self.project_loader.get_project_context(user_input)
        
        if context:
            return {
                "project": context["project"],
                "task_index": context["task_index"],
                "step_index": context["step_index"]
            }
        
        return None

    def _find_project_by_keywords(self, user_input: str) -> Optional[Dict]:
        """
        Find project context based on keywords in user input.
        DEPRECATED: Now handled by project_loader.get_project_context()
        """
        # This function is deprecated - use project_loader.get_project_context() instead
        return self.project_loader.get_project_context(user_input)

    def build_prompt(self, conversation_id: str, user_input: str, max_messages: int = 50) -> List[Dict[str, str]]:
        """
        Build enhanced prompt with project context detection and structured guidance.
        Now uses strict project prompts when context is detected.
        """
        prompt = []

        # 🔍 Detect project context from user input using the new project_loader
        context = self.project_loader.get_project_context(user_input)
        
        if context:
            # ✅ Use strict project prompt with actual step content
            strict_prompt = self.build_strict_project_prompt(
                user_input,
                context["project"],
                context["task_index"],
                context["step_index"]
            )
            
            # Add the strict prompt as a single user message
            prompt.append({
                "role": "user",
                "content": strict_prompt
            })
            
            # Add limited conversation history (last 2 turns to avoid token overflow)
            try:
                chat_history = self.memory_manager.get_last_n_turns(conversation_id, n=2)
                for msg in chat_history:
                    # Gemini requires 'user' or 'model' roles only
                    role = "user" if msg['role'] == 'user' else 'model'
                    prompt.append({
                        "role": role,
                        "content": msg['content']
                    })
            except Exception as e:
                self.logger.warning(f"Failed to load memory: {str(e)}")
            
            logger.info(f"✅ Built strict project prompt for {context['project_name']} - {context['task_name']} - {context['step_name']}")
            
        else:
            # 🎯 Build focused system instruction for generic case
            system_instruction = self._build_focused_system_instruction(None)
            system_instruction += self._get_response_guidelines(None)

            # ✅ Inject system instruction as first user message
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
            
            logger.info("ℹ️ Built generic prompt - no specific project context detected")

        return prompt

    def _detect_project_context(self, user_input: str) -> Optional[Dict[str, str]]:
        """
        Detect project context from user input using the new project_loader.
        This is now a wrapper around the enhanced project_loader functionality.
        """
        context = self.project_loader.get_project_context(user_input)
        
        if context:
            return {
                "project_id": context["project"]["project_id"],
                "task_id": f"T{context['task_index'] + 1}",
                "step_id": f"S{context['step_index'] + 1}"
            }
        
        return None

    def _find_context_by_step_type(self, step_type: str, user_input: str) -> Optional[Dict[str, str]]:
        """
        Find project context based on step type keywords.
        DEPRECATED: Now handled by project_loader.get_project_context()
        """
        # This function is deprecated - use project_loader.get_project_context() instead
        return None

    def _build_focused_system_instruction(self, detected_context: Optional[Dict[str, str]]) -> str:
        """
        Build focused system instruction based on detected context.
        """
        if detected_context:
            return (
                "You are Edura, a focused AI mentor in EduVerse.\n"
                "You are helping the user with a SPECIFIC PROJECT STEP.\n"
                "ONLY provide guidance relevant to the current project, task, and step.\n"
                "Do NOT ask general questions or offer unrelated suggestions.\n"
                "Focus on the immediate next action the user should take.\n"
            )
        else:
            return (
                "You are Edura, an AI mentor in EduVerse.\n"
                "If the user mentions a specific project or step, focus on that.\n"
                "Otherwise, help them choose a project to work on.\n"
                "Be clear, helpful, and instructional.\n"
            )

    def _get_response_guidelines(self, detected_context: Optional[Dict[str, str]]) -> str:
        """
        Get strict response guidelines based on context.
        """
        if detected_context:
            return (
                "\n🎯 RESPONSE GUIDELINES:\n"
                "1. ONLY reference the current project, task, and step\n"
                "2. Do NOT ask 'What project are you working on?' - you know this\n"
                "3. Do NOT ask for skill level or platform - it's defined by the project\n"
                "4. Give specific, actionable guidance for the current step\n"
                "5. If user is stuck, provide the next best nudge using project context\n"
                "6. Assume they've seen earlier steps unless they explicitly ask\n"
                "7. Keep responses focused and relevant to the current step\n"
            )
        else:
            return (
                "\n🎯 RESPONSE GUIDELINES:\n"
                "1. If user mentions a project, help them get started with it\n"
                "2. If no project mentioned, suggest 2-3 relevant projects\n"
                "3. Keep suggestions focused and actionable\n"
                "4. Avoid generic 'I need more context' responses\n"
            )

    def _build_detailed_project_context(self, context: Dict[str, str]) -> str:
        """
        Build detailed project context from detected or stored context.
        """
        try:
            project_id = context.get("project_id")
            task_id = context.get("task_id")
            step_id = context.get("step_id")

            context_parts = []

            # Add project details
            if project_id:
                project = self.project_loader.get_project_by_id(project_id)
                if project:
                    context_parts.append(f"📁 Project: {project.get('project_name', 'N/A')}")
                    context_parts.append(f"📝 Description: {project.get('description', 'N/A')}")
                    context_parts.append(f"🎯 Difficulty: {project.get('difficulty', 'N/A')}")

            # Add task details
            if task_id and project_id:
                task = self.project_loader.get_task_by_id(project_id, task_id)
                if task:
                    context_parts.append(f"\n📋 Task: {task.get('task_name', 'N/A')}")
                    context_parts.append(f"📄 Task Description: {task.get('description', 'N/A')}")

            # Add step details
            if step_id and task_id and project_id:
                step = self.project_loader.get_step_by_id(project_id, task_id, step_id)
                if step:
                    context_parts.append(f"\n🔧 Step: {step.get('step_name', 'N/A')}")
                    context_parts.append(f"📖 Step Description: {step.get('description', 'N/A')}")
                    
                    # Add guidelines if available
                    guidelines = step.get('guidelines', [])
                    if guidelines:
                        context_parts.append("\n💡 Guidelines:")
                        for guideline in guidelines:
                            context_parts.append(f"  • {guideline}")
                    
                    # Add starting code if available
                    starting_code = step.get('starting_code', '')
                    if starting_code:
                        context_parts.append(f"\n💻 Starting Code:\n```\n{starting_code}\n```")

            return "\n".join(context_parts)

        except Exception as e:
            logger.error(f"Error building project context: {str(e)}")
            return "Project context unavailable"

    def _build_project_context(self, context: Dict[str, str]) -> str:
        """
        Legacy method - now enhanced with detection.
        """
        return self._build_detailed_project_context(context)

    def _format_project_context(self, context: Dict) -> str:
        """
        Format project context into a readable string.
        """
        return self._build_detailed_project_context(context)

    def _has_project_context(self, context: Dict) -> bool:
        """
        Check if any project context values are set.
        """
        return any(
            context.get(key) is not None 
            for key in ['project_id', 'task_id', 'step_id']
        )

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
                "content": """You are Edura — a focused AI mentor inside Eduverse.

Your role is to help users navigate specific project steps, give targeted suggestions, and explain concepts simply.

Guidelines:
- Focus on the current project, task, and step
- Do NOT ask for project context if it's already provided
- Keep explanations short, natural, and friendly
- Avoid long lectures or unnecessary deep dives
- Use simple, casual language like a human mentor
- If user seems stuck, give a short helpful hint
- Always encourage next actionable step
- Avoid repeating the project name too many times"""
            }

            # Add project context if available
            if project_context and self._has_project_context(project_context):
                detailed_context = self._build_detailed_project_context(project_context)
                system_message["content"] += f"\n\nCurrent Project Context:\n{detailed_context}"

            return system_message

        except Exception as e:
            logger.error(f"Error building system message: {str(e)}")
            return {
                "role": "system",
                "content": "You are Edura, a helpful AI mentor in Eduverse."
            }

    def build_summarized_prompt(
        self, 
        conversation_id: str, 
        user_input: str,
        summary_length: int = 3
    ) -> List[Dict[str, str]]:
        """
        Build a summarized prompt for long conversations.
        """
        # Enhanced to include project context detection
        return self.build_prompt(conversation_id, user_input, summary_length)

    def build_personalized_prompt(
        self, 
        conversation_id: str, 
        user_input: str,
        user_profile: Dict
    ) -> List[Dict[str, str]]:
        """
        Build a personalized prompt based on user profile.
        """
        # Enhanced to include project context detection
        return self.build_prompt(conversation_id, user_input)

    def build_knowledge_graph_prompt(
        self, 
        conversation_id: str, 
        user_input: str,
        knowledge_graph: Dict
    ) -> List[Dict[str, str]]:
        """
        Build a prompt using knowledge graph context.
        """
        # Enhanced to include project context detection
        return self.build_prompt(conversation_id, user_input) 