from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse

def upcoming_events(request):
    data = {
        "upcoming_events": []
    }
    return JsonResponse(data)
