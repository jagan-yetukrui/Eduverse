from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def bot_endpoint(request):
    if request.method == "POST":
        try:
            # Parse the incoming JSON message
            data = json.loads(request.body)
            message = data.get('message', '')
            
            # For now, return a simple response
            response = {
                "message": f"You said: {message}",
                "sender": "ai"
            }
            
            return JsonResponse(response)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
