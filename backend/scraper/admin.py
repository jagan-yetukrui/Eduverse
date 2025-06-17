from django.contrib import admin
from .models import EducationalContent, JobPosting, SkillResource

@admin.register(EducationalContent)
class EducationalContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'created_at')

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('job_title', 'company', 'location', 'created_at')

@admin.register(SkillResource)
class SkillResourceAdmin(admin.ModelAdmin):
    list_display = ('skill_name', 'created_at')
