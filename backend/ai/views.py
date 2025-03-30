from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import asyncio
import os
from .eduverse_bot import EduVerseBot
import traceback

# Create a single instance of the bot
bot = EduVerseBot()

@csrf_exempt
def bot_endpoint(request):
    if request.method == "POST":
        try:
            # Parse the incoming JSON message
            data = json.loads(request.body)
            message = data.get('message', '')
            user_id = data.get('user_id', 'default_user')
            
            print(f"Received message: {message} from user: {user_id}")
            
            # Create a simple context object that mimics TurnContext
            class SimpleTurnContext:
                def __init__(self, message, user_id):
                    self.activity = type('obj', (object,), {
                        'text': message,
                        'from_property': type('obj', (object,), {'id': user_id})
                    })
                    self.responses = []
                
                async def send_activity(self, text):
                    self.responses.append(text)
            
            # Create context and process message
            context = SimpleTurnContext(message, user_id)
            
            # Run the bot's message handler
            asyncio.run(bot.on_message_activity(context))
            
            # Get the response from the bot
            bot_response = context.responses[0] if context.responses else "No response generated"
            print(f"Bot response: {bot_response[:50]}...")  # Log first 50 chars

            print(f"Bot response: {bot_response}")
            
            response = {
                "response": bot_response,
                "sender": "ai",
                "suggestions": []
            }
            
            return JsonResponse(response)
            
        except Exception as e:
            print(f"Error in bot_endpoint: {str(e)}")
            traceback.print_exc()
            return JsonResponse({
                "response": "🌋 The mystical connection was lost! Let's try again, brave adventurer.",
                "error": str(e),
                "sender": "ai",
                "suggestions": []
            }, status=500)
            
    return JsonResponse({"error": "Only POST requests are allowed."}, status=405)