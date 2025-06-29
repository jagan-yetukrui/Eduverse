from django.db import models

class EducationalContent(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    url = models.URLField()
    source = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class JobPosting(models.Model):
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    requirements = models.TextField()
    application_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.job_title

class SkillResource(models.Model):
    skill_name = models.CharField(max_length=255)
    description = models.TextField()
    resource_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.skill_name
