from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import json
import logging
import os
from chatbot.conversation_manager import ConversationManager
from chatbot.memory_manager import MemoryManager
from chatbot.project_loader import ProjectLoader
from chatbot.prompt_builder import PromptBuilder
from chatbot.llm_engine import LLMEngine
from .eduverse_bot import get_edura_response, format_edura_response

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

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify backend availability.
    Public endpoint - no authentication required.
    """
    return Response({
        'status': 'healthy',
        'message': 'AI backend is running'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    """
    API endpoint to list all conversations for the authenticated user.
    """
    try:
        user_id = str(request.user.id)
        logger.info(f"Listing conversations for user: {user_id}")

        conversations = conversation_manager.list_conversations(user_id)
        return Response({
            'status': 'success',
            'conversations': conversations
        })

    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Error retrieving conversations'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request):
    """
    API endpoint to start a new conversation for the authenticated user.
    """
    try:
        user_id = str(request.user.id)
        logger.info(f"Creating conversation for user: {user_id}")

        # Check conversation limit (max 10 conversations)
        existing_conversations = conversation_manager.list_conversations(user_id)
        if len(existing_conversations) >= 10:
            logger.warning(f"User {user_id} attempted to create conversation beyond limit")
            return Response({
                'status': 'error',
                'message': 'Maximum 10 conversations allowed'
            }, status=status.HTTP_403_FORBIDDEN)

        # Create conversation with user data
        conversation = conversation_manager.create_conversation(
            user_id=user_id,
            title=request.data.get('title', 'Default Conversation'),
            project_context=request.data.get('project_context', {})
        )

        return Response({
            'status': 'success',
            'conversation': conversation
        })

    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Error creating conversation'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rename_conversation(request):
    """
    API endpoint to rename a conversation for the authenticated user.
    """
    try:
        user_id = str(request.user.id)
        conversation_id = request.data.get('conversation_id')
        new_title = request.data.get('new_title')
        
        if not conversation_id or not new_title:
            logger.error("Missing required fields for rename")
            return Response({
                'status': 'error',
                'message': 'conversation_id and new_title are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify the conversation belongs to the user
        conversations = conversation_manager.list_conversations(user_id)
        if not any(conv['conversation_id'] == conversation_id for conv in conversations):
            logger.error(f"User {user_id} attempted to rename conversation {conversation_id} they don't own")
            return Response({
                'status': 'error',
                'message': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)

        # Rename conversation
        conversation_manager.rename_conversation(
            conversation_id=conversation_id,
            new_title=new_title
        )

        return Response({
            'status': 'success',
            'message': 'Conversation renamed successfully'
        })

    except Exception as e:
        logger.error(f"Error renaming conversation: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Error renaming conversation'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_conversation(request):
    """
    API endpoint to delete a conversation for the authenticated user.
    """
    try:
        user_id = str(request.user.id)
        conversation_id = request.data.get('conversation_id')
        
        if not conversation_id:
            logger.error("Missing conversation_id in request")
            return Response({
                'status': 'error',
                'message': 'conversation_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the conversation belongs to the user
        conversations = conversation_manager.list_conversations(user_id)
        if not any(conv['conversation_id'] == conversation_id for conv in conversations):
            logger.error(f"User {user_id} attempted to delete conversation {conversation_id} they don't own")
            return Response({
                'status': 'error',
                'message': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)

        # Delete conversation
        conversation_manager.delete_conversation(conversation_id)

        return Response({
            'status': 'success',
            'message': 'Conversation deleted successfully'
        })

    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Error deleting conversation'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """
    API endpoint to send a message in a conversation for the authenticated user.
    """
    try:
        user_id = str(request.user.id)
        conversation_id = request.data.get("conversation_id")
        user_input = request.data.get("user_input")

        if not conversation_id or not user_input:
            return Response({
                "error": "Missing required fields: conversation_id and user_input"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify the conversation belongs to the user
        conversations = conversation_manager.list_conversations(user_id)
        if not any(conv['conversation_id'] == conversation_id for conv in conversations):
            logger.error(f"User {user_id} attempted to send message to conversation {conversation_id} they don't own")
            return Response({
                'status': 'error',
                'message': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)

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
        return Response({"response": response_text})
    
    except Exception as e:
        logger.exception("Error processing send_message request")
        return Response({
            "error": "Internal server error."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request):
    """
    API endpoint to get messages for a specific conversation for the authenticated user.
    """
    try:
        user_id = str(request.user.id)
        conversation_id = request.GET.get('conversation_id')
        
        if not conversation_id:
            logger.error("Missing conversation_id parameter")
            return Response({
                'status': 'error',
                'message': 'conversation_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify the conversation belongs to the user
        conversations = conversation_manager.list_conversations(user_id)
        if not any(conv['conversation_id'] == conversation_id for conv in conversations):
            logger.error(f"User {user_id} attempted to access messages for conversation {conversation_id} they don't own")
            return Response({
                'status': 'error',
                'message': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)

        # Get messages for the conversation
        messages = conversation_manager.get_messages(conversation_id)
        
        logger.info(f"Retrieved {len(messages)} messages for conversation {conversation_id}")
        
        return Response({
            'status': 'success',
            'messages': messages
        })

    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Error retrieving messages'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edura_code_analysis(request):
    """
    Edura's structured code analysis and learning guidance endpoint.
    Provides targeted feedback for software development learning.
    """
    try:
        user_id = str(request.user.id)
        
        # Extract request data
        code = request.data.get('code', '')
        step_title = request.data.get('step_title', 'Current Step')
        user_message = request.data.get('user_message', 'Can you help me improve this?')
        project_id = request.data.get('project_id')
        task_id = request.data.get('task_id')
        
        if not code:
            return Response({
                'status': 'error',
                'message': 'Code is required for analysis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get Edura's structured response
        edura_response = get_edura_response(
            user_id=user_id,
            code=code,
            step_title=step_title,
            user_message=user_message,
            project_id=project_id,
            task_id=task_id
        )
        
        # Format the response for display
        formatted_response = format_edura_response(edura_response)
        
        # Save to conversation if requested
        conversation_id = request.data.get('conversation_id')
        if conversation_id:
            # Verify conversation ownership
            conversations = conversation_manager.list_conversations(user_id)
            if any(conv['conversation_id'] == conversation_id for conv in conversations):
                conversation_manager.save_message(conversation_id, "user", user_message)
                conversation_manager.save_message(conversation_id, "edura", formatted_response)
        
        return Response({
            'status': 'success',
            'response': formatted_response,
            'analysis': edura_response.get('tutor_response', {}),
            'context': edura_response.get('context', {})
        })
        
    except Exception as e:
        logger.error(f"Error in Edura code analysis: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Error analyzing code. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)