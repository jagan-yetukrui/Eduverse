from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def bot_endpoint(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            message = data.get('message', '')
            user_id = data.get('user_id', 'default_user')
            
            print(f"Received message: {message} from user: {user_id}")
            
            # Simple response logic
            if "hello" in message.lower():
                response_text = "Hello! I'm Edura, your AI educational mentor. How can I help you today?"
            elif "project" in message.lower():
                response_text = "I can help you with project suggestions! What kind of project are you interested in?"
            elif "help" in message.lower():
                response_text = "I can help you with:\n- Project suggestions\n- Career guidance\n- Course recommendations\n- Code review\n- General educational questions\nWhat would you like to know?"
            else:
                response_text = "I'm here to help you with your educational journey! You can ask me about projects, career guidance, or any educational topics."
            
            response = {
                "response": response_text,
                "sender": "ai",
                "suggestions": [
                    "Suggest a trending project",
                    "How do I build a portfolio?",
                    "Analyze my progress"
                ]
            }
            
            return JsonResponse(response)
            
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            return JsonResponse({"error": "Failed to process message"}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)