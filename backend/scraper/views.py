from django.http import JsonResponse
from .scrapers import scrape_educational_content, scrape_job_postings, scrape_skill_resources

def educational_scraper_view(request):
    data = scrape_educational_content()
    return JsonResponse(data, safe=False)

def job_scraper_view(request):
    data = scrape_job_postings()
    return JsonResponse(data, safe=False)

def skill_scraper_view(request):
    data = scrape_skill_resources()
    return JsonResponse(data, safe=False)
