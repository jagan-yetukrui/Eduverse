from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging
import os
from chatbot.conversation_manager import ConversationManager
from chatbot.memory_manager import MemoryManager
from chatbot.project_loader import ProjectLoader
from chatbot.prompt_builder import PromptBuilder
from chatbot.llm_engine import LLMEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize managers
conversation_manager = ConversationManager()
memory_manager = MemoryManager()

# Initialize ProjectLoader with correct data path
data_folder_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ai', 'Data')
project_loader = ProjectLoader(data_folder_path)

# Initialize PromptBuilder with both managers
prompt_builder = PromptBuilder(memory_manager, project_loader)

# Initialize LLM Engine
llm_engine = LLMEngine()

@csrf_exempt
@require_http_methods(["GET"])
def list_conversations(request):
    """
    API endpoint to list all conversations for a user.
    """
    try:
        user_id = request.GET.get('user_id')
        if not user_id:
            logger.error("Missing user_id parameter")
            return JsonResponse({
                'status': 'error',
                'message': 'user_id is required'
            }, status=400)

        conversations = conversation_manager.list_conversations(user_id)
        return JsonResponse({
            'status': 'success',
            'conversations': conversations
        })

    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Error retrieving conversations'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def start_conversation(request):
    """
    API endpoint to start a new conversation.
    """
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        if not data.get('user_id'):
            logger.error("Missing user_id in request")
            return JsonResponse({
                'status': 'error',
                'message': 'user_id is required'
            }, status=400)

        # Check conversation limit (max 10 conversations)
        existing_conversations = conversation_manager.list_conversations(data['user_id'])
        if len(existing_conversations) >= 10:
            logger.warning(f"User {data['user_id']} attempted to create conversation beyond limit")
            return JsonResponse({
                'status': 'error',
                'message': 'Maximum 10 conversations allowed'
            }, status=403)

        # Create conversation with provided data
        conversation = conversation_manager.create_conversation(
            user_id=data['user_id'],
            title=data.get('title', 'Default Conversation'),
            project_context=data.get('project_context', {})
        )

        return JsonResponse({
            'status': 'success',
            'conversation': conversation
        })

    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Error creating conversation'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def rename_conversation(request):
    """
    API endpoint to rename a conversation.
    """
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        if not data.get('conversation_id') or not data.get('new_title'):
            logger.error("Missing required fields for rename")
            return JsonResponse({
                'status': 'error',
                'message': 'conversation_id and new_title are required'
            }, status=400)

        # Rename conversation
        conversation_manager.rename_conversation(
            conversation_id=data['conversation_id'],
            new_title=data['new_title']
        )

        return JsonResponse({
            'status': 'success',
            'message': 'Conversation renamed successfully'
        })

    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Error renaming conversation: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Error renaming conversation'
        }, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_conversation(request):
    """
    API endpoint to delete a conversation.
    """
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        conversation_id = data.get('conversation_id')
        
        if not user_id or not conversation_id:
            logger.error("Missing user_id or conversation_id in request")
            return JsonResponse({
                'status': 'error',
                'message': 'user_id and conversation_id are required'
            }, status=400)

        # Delete conversation
        conversation_manager.delete_conversation(conversation_id)

        return JsonResponse({
            'status': 'success',
            'message': 'Conversation deleted successfully'
        })

    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Error deleting conversation'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def bot_endpoint(request):
    """
    API endpoint for the Edura chatbot.
    Accepts POST requests with project-based learning context.
    """
    try:
        # Parse the request body
        data = json.loads(request.body)
        
        # Log the incoming request
        logger.info(f"Received chat request: {data}")
        
        # Validate required fields
        required_fields = ['user_question', 'user_profile']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            return JsonResponse({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=400)
        
        # Validate user_profile structure
        if not isinstance(data.get('user_profile'), dict):
            logger.error("Invalid user_profile format")
            return JsonResponse({
                'status': 'error',
                'message': 'user_profile must be an object'
            }, status=400)
            
        # Extract user data
        user_input = data.get('user_question')
        user_id = data['user_profile'].get('id')
        
        if not user_id:
            logger.error("Missing user_id in user_profile")
            return JsonResponse({
                'status': 'error',
                'message': 'user_id is required in user_profile'
            }, status=400)
        
        # Get or create conversation
        try:
            user_conversations = conversation_manager.list_conversations(user_id)
            
            if user_conversations:
                conversation_id = user_conversations[0]["conversation_id"]
                logger.info(f"Using existing conversation: {conversation_id}")
            else:
                # Create new conversation with project context if available
                project_context = {
                    "project_id": data.get('project'),
                    "task_id": data.get('task'),
                    "step_id": data.get('step')
                }
                
                conversation = conversation_manager.create_conversation(
                    user_id=user_id,
                    title="Default Conversation",
                    project_context=project_context
                )
                conversation_id = conversation["conversation_id"]
                logger.info(f"Created new conversation: {conversation_id}")
        
            # Build and send prompt to LLM
            full_prompt = prompt_builder.build_prompt(conversation_id, user_input)
            ai_response = llm_engine.generate_response(full_prompt)
            
            # Save messages to conversation
            conversation_manager.save_message(conversation_id, "user", user_input)
            conversation_manager.save_message(conversation_id, "edura", ai_response)
            
            # Generate suggestions
            suggestions = [
                "What's the next step in my learning journey?",
                "Can you explain that in more detail?",
                "Show me some examples"
            ]
            
            # Return the response
            return JsonResponse({
                'status': 'success',
                'response': ai_response,
                'suggestions': suggestions
            })
            
        except Exception as e:
            logger.error(f"Error in AI processing pipeline: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'Error processing your request. Please try again.'
            }, status=500)
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON in request body'
        }, status=400)
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'An error occurred while processing your request'
        }, status=500)

@csrf_exempt
def send_message(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        data = json.loads(request.body)
        conversation_id = data.get("conversation_id")
        user_input = data.get("user_input")
        user_id = data.get("user_id")

        if not conversation_id or not user_input or not user_id:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Save user message to conversation
        conversation_manager.save_message(conversation_id, "user", user_input)

        # Build full prompt using memory, projects, context
        prompt = prompt_builder.build_prompt(
            conversation_id=conversation_id,
            user_input=user_input,
            max_messages=50
        )

        # Call Gemini through LLM Engine
        response_text = llm_engine.generate_response(prompt)

        # Save assistant response back to memory
        conversation_manager.save_message(conversation_id, "assistant", response_text)

        # Return response to frontend
        return JsonResponse({"response": response_text})
    
    except Exception as e:
        logging.exception("Error processing send_message request")
        return JsonResponse({"error": "Internal server error."}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_messages(request):
    """
    API endpoint to get messages for a specific conversation.
    """
    try:
        conversation_id = request.GET.get('conversation_id')
        if not conversation_id:
            logger.error("Missing conversation_id parameter")
            return JsonResponse({
                'status': 'error',
                'message': 'conversation_id is required'
            }, status=400)

        # Get messages for the conversation
        messages = conversation_manager.get_messages(conversation_id)
        
        logger.info(f"Retrieved {len(messages)} messages for conversation {conversation_id}")
        
        return JsonResponse({
            'status': 'success',
            'messages': messages
        })

    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Error retrieving messages'
        }, status=500)