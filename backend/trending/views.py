from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse

def trending_projects(request):
    data = {
        "trending_projects": []
    }
    return JsonResponse(data)
