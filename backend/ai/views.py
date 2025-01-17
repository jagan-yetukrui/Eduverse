from django.shortcuts import render
from django.http import HttpResponse

def accounts_home(request):
    return HttpResponse("Welcome to the Accounts API!")  # Response for `/api/accounts/`

def profile_view(request):
    return HttpResponse("This is the Profile API!")  # Response for `/api/accounts/profile/`

# Create your views here.
