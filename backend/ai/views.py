from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging
from .eduverse_bot import EduVerseBot

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the bot
bot = EduVerseBot()

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
        required_fields = ['project', 'task', 'step', 'guidelines', 'why', 'user_question', 'user_profile']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return JsonResponse({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=400)
        
        # Process the chat request
        response_text = bot.process_chat(data)
        
        # Return the response
        return JsonResponse({
            'status': 'success',
            'response': response_text
        })
        
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