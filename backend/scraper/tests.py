from django.test import TestCase
from .models import EducationalContent, JobPosting, SkillResource

class EducationalContentModelTest(TestCase):
    def test_create_educational_content(self):
        content = EducationalContent.objects.create(
            title="Learn Python",
            description="A guide to Python programming.",
            url="https://example.com/python",
            source="Example"
        )
        self.assertEqual(content.title, "Learn Python")

class JobPostingModelTest(TestCase):
    def test_create_job_posting(self):
        job = JobPosting.objects.create(
            job_title="Software Developer",
            company="TechCorp",
            location="Remote",
            requirements="Proficient in Python",
            application_url="https://example.com/apply"
        )
        self.assertEqual(job.job_title, "Software Developer")

class SkillResourceModelTest(TestCase):
    def test_create_skill_resource(self):
        resource = SkillResource.objects.create(
            skill_name="Data Science",
            description="Learn data science basics.",
            resource_url="https://example.com/data-science"
        )
        self.assertEqual(resource.skill_name, "Data Science")
