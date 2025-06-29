import os
import logging
from typing import Dict, List
from dataclasses import dataclass
from enum import Enum

import google.generativeai as genai
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API Key from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

# Define supported models
class ModelType(Enum):
    GEMINI_1_5 = "gemini-1.5-pro"
    GEMINI_1_5_FLASH = "gemini-1.5-flash"  # Future-proof

@dataclass
class ModelConfig:
    name: str
    temperature: float = 0.7
    max_tokens: int = 8192

MODEL_CONFIGS = {
    ModelType.GEMINI_1_5: ModelConfig(name="gemini-1.5-pro", temperature=0.7),
    ModelType.GEMINI_1_5_FLASH: ModelConfig(name="gemini-1.5-flash", temperature=0.7),
}

class LLMEngine:
    """
    Enhanced Gemini LLM Engine for Edura V2.
    Includes retries, safety guards, token budget control, and structured response handling.
    """

    def __init__(self, model_type: ModelType = ModelType.GEMINI_1_5):
        self.model_type = model_type
        self.config = MODEL_CONFIGS[model_type]
        self.model = genai.GenerativeModel(self.config.name)
        logger.info(f"Initialized LLM Engine with model: {self.config.name}")

    @retry(
        wait=wait_exponential(multiplier=1, min=1, max=10),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    def generate_response(self, messages: List[Dict[str, str]]) -> str:
        """
        Generates response with full retry, logging, and input/output validation.
        Enhanced to prevent generic responses and ensure focused guidance.
        """

        try:
            # 🔍 Validate input messages
            self._validate_messages(messages)
            
            # 🎯 Check for project context in system instruction
            has_project_context = self._check_project_context(messages)
            
            gemini_messages = [
                {"role": m["role"], "parts": [m["content"]]}
                for m in messages
            ]

            logger.info(f"Sending prompt to Gemini with {len(gemini_messages)} turns...")
            logger.info(f"Project context detected: {has_project_context}")

            # 🔍 DEBUG: Print the actual prompt being sent to Gemini
            print("\n" + "="*80)
            print("🔍 FINAL PROMPT BEING SENT TO GEMINI")
            print("="*80)
            for i, msg in enumerate(messages):
                print(f"\n[{i+1}] {msg['role'].upper()}:")
                print(f"{msg['content']}")
                if i == 0 and has_project_context:
                    # Check if step content is in the first message
                    if "📝 Step Description:" in msg['content']:
                        print("✅ Step description found in prompt")
                    else:
                        print("❌ Step description MISSING from prompt")
                    if "📦 Starter Code:" in msg['content']:
                        print("✅ Starter code found in prompt")
                    else:
                        print("❌ Starter code MISSING from prompt")
            print("="*80)

            response = self.model.generate_content(
                gemini_messages,
                generation_config={
                    "temperature": self.config.temperature,
                    "max_output_tokens": self.config.max_tokens,
                }
            )

            output = response.text.strip()
            logger.info(f"Gemini response generated: {output[:200]}...")

            # 🔍 Validate response quality
            validated_output = self._validate_response_quality(output, has_project_context)
            
            return validated_output

        except Exception as e:
            logger.exception("Error during Gemini generation")
            raise

    def _validate_messages(self, messages: List[Dict[str, str]]) -> None:
        """
        Validate input messages for proper structure and content.
        """
        if not messages:
            raise ValueError("Empty messages list provided")
        
        for i, message in enumerate(messages):
            if not isinstance(message, dict):
                raise ValueError(f"Message {i} is not a dictionary")
            
            if "role" not in message or "content" not in message:
                raise ValueError(f"Message {i} missing required fields: role, content")
            
            if not message["content"].strip():
                logger.warning(f"Empty content in message {i}")

    def _check_project_context(self, messages: List[Dict[str, str]]) -> bool:
        """
        Check if the prompt contains project context.
        """
        for message in messages:
            content = message.get("content", "").lower()
            # Look for project context indicators
            if any(indicator in content for indicator in [
                "project:", "task:", "step:", "📁 project", "📋 task", "🔧 step"
            ]):
                return True
        return False

    def _validate_response_quality(self, response: str, has_project_context: bool) -> str:
        """
        Validate and potentially enhance response quality.
        """
        response_lower = response.lower()
        
        # 🚫 Check for generic response patterns
        generic_patterns = [
            "i need more context",
            "what project are you working on",
            "could you provide more details",
            "i don't have enough information",
            "please tell me more about",
            "what kind of project",
            "what programming language",
            "what's your skill level"
        ]
        
        # If project context was provided but response is generic
        if has_project_context and any(pattern in response_lower for pattern in generic_patterns):
            logger.warning("Detected generic response despite project context")
            # Add a reminder to focus on the project
            enhanced_response = (
                f"{response}\n\n"
                "💡 **Reminder**: I can see you're working on a specific project step. "
                "Let me focus on helping you with that particular task. "
                "If you need help with the current step, just let me know!"
            )
            return enhanced_response
        
        # ✅ Check for focused response indicators
        focused_patterns = [
            "in this step",
            "for this task",
            "in your project",
            "next, you should",
            "try this approach",
            "here's how to"
        ]
        
        if has_project_context and any(pattern in response_lower for pattern in focused_patterns):
            logger.info("Response shows good focus on project context")
        
        return response

    def generate_structured_response(self, messages: List[Dict[str, str]], response_format: str = "natural") -> Dict[str, str]:
        """
        Generate structured response with specific format requirements.
        """
        raw_response = self.generate_response(messages)
        
        if response_format == "natural":
            return {"response": raw_response}
        elif response_format == "analysis":
            # Parse response for analysis structure
            return self._parse_analysis_response(raw_response)
        else:
            return {"response": raw_response}

    def _parse_analysis_response(self, response: str) -> Dict[str, str]:
        """
        Parse response for structured analysis format.
        """
        # This would parse the response into structured components
        # For now, return the raw response
        return {
            "analysis": response,
            "improvements": [],
            "next_steps": []
        }

    def generate_with_safety_checks(self, messages: List[Dict[str, str]], safety_level: str = "medium") -> str:
        """
        Generate response with enhanced safety checks.
        """
        # Add safety instructions based on level
        if safety_level == "high":
            safety_instruction = {
                "role": "user",
                "content": "IMPORTANT: Only provide guidance related to the current project step. Do not ask for general context or offer unrelated suggestions."
            }
            messages.insert(1, safety_instruction)  # Insert after system message
        
        return self.generate_response(messages) 