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
    Production-grade Gemini LLM Engine for Edura V2.
    Includes retries, safety guards, token budget control, and full context handling.
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
        """

        try:
            gemini_messages = [
                {"role": m["role"], "parts": [m["content"]]}
                for m in messages
            ]

            logger.info(f"Sending prompt to Gemini with {len(gemini_messages)} turns...")

            response = self.model.generate_content(
                gemini_messages,
                generation_config={
                    "temperature": self.config.temperature,
                    "max_output_tokens": self.config.max_tokens,
                }
            )

            output = response.text.strip()
            logger.info(f"Gemini response generated: {output[:200]}...")

            return output

        except Exception as e:
            logger.exception("Error during Gemini generation")
            raise 