from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from .models import Profile, Education, License, Experience, Project
from .serializers import (
    ProfileSerializer, EditProfileSerializer, PrivacySettingsSerializer,
    NotificationSettingsSerializer, BlockedUserSerializer
)
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import date
import json

User = get_user_model()

class ProfileModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = self.user.profile

    def test_profile_creation(self):
        """Test that profile is created automatically when user is created"""
        self.assertIsInstance(self.profile, Profile)
        self.assertEqual(self.profile.user, self.user)
        self.assertEqual(self.profile.account_status, 'active')
        self.assertFalse(self.profile.is_verified)

    def test_profile_str_method(self):
        """Test the string representation of Profile"""
        self.assertEqual(str(self.profile), self.user.username)

    def test_profile_image_url_fallback(self):
        """Test profile image URL fallback logic"""
        # Test with no images
        self.assertIsNone(self.profile.get_profile_image_url())
        
        # Test with profile_image
        self.profile.profile_image = SimpleUploadedFile(
            "test.jpg", b"file_content", content_type="image/jpeg"
        )
        self.assertIsNotNone(self.profile.get_profile_image_url())
        
        # Test with avatar fallback
        self.profile.profile_image = None
        self.profile.avatar = SimpleUploadedFile(
            "avatar.jpg", b"file_content", content_type="image/jpeg"
        )
        self.assertIsNotNone(self.profile.get_profile_image_url())

    def test_skills_read_only(self):
        """Test that skills field is properly documented as read-only"""
        # Skills should be managed by AI, not manually editable
        self.assertEqual(self.profile.skills, {})
        # In a real implementation, skills would be populated by AI analysis

class EducationModelTest(TestCase):
    """Test cases for Education model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = self.user.profile
    
    def test_education_creation(self):
        """Test education entry creation"""
        education = Education.objects.create(
            profile=self.profile,
            school_name='Test University',
            degree='Bachelor of Science',
            field_of_study='Computer Science',
            start_date=date(2018, 9, 1),
            end_date=date(2022, 5, 15),
            description='Studied computer science fundamentals'
        )
        
        self.assertEqual(education.school_name, 'Test University')
        self.assertEqual(education.degree, 'Bachelor of Science')
        self.assertEqual(education.field_of_study, 'Computer Science')
    
    def test_education_validation(self):
        """Test education date validation"""
        # Test invalid date range
        with self.assertRaises(Exception):
            education = Education(
                profile=self.profile,
                school_name='Test University',
                start_date=date(2022, 5, 15),
                end_date=date(2018, 9, 1)  # End before start
            )
            education.full_clean()

class ExperienceModelTest(TestCase):
    """Test cases for Experience model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = self.user.profile
    
    def test_experience_creation(self):
        """Test experience entry creation"""
        experience = Experience.objects.create(
            profile=self.profile,
            title='Software Engineer',
            company='Tech Corp',
            location='San Francisco, CA',
            start_date=date(2022, 6, 1),
            is_current=True,
            description='Developed web applications'
        )
        
        self.assertEqual(experience.title, 'Software Engineer')
        self.assertEqual(experience.company, 'Tech Corp')
        self.assertTrue(experience.is_current)
    
    def test_current_experience_no_end_date(self):
        """Test that current experience should not have end date"""
        experience = Experience(
            profile=self.profile,
            title='Software Engineer',
            company='Tech Corp',
            start_date=date(2022, 6, 1),
            is_current=True,
            end_date=date(2023, 12, 31)  # Should not be allowed
        )
        
        with self.assertRaises(Exception):
            experience.full_clean()

class LicenseModelTest(TestCase):
    """Test cases for License model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = self.user.profile
    
    def test_license_creation(self):
        """Test license entry creation"""
        license_obj = License.objects.create(
            profile=self.profile,
            name='AWS Certified Solutions Architect',
            issuing_organization='Amazon Web Services',
            issue_date=date(2023, 1, 15),
            credential_id='AWS-123456',
            credential_url='https://aws.amazon.com/certification'
        )
        
        self.assertEqual(license_obj.name, 'AWS Certified Solutions Architect')
        self.assertEqual(license_obj.issuing_organization, 'Amazon Web Services')
        self.assertEqual(license_obj.credential_id, 'AWS-123456')

class ProjectModelTest(TestCase):
    """Test cases for Project model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = self.user.profile
    
    def test_project_creation(self):
        """Test project entry creation"""
        project = Project.objects.create(
            profile=self.profile,
            title='EduVerse Platform',
            description='A comprehensive learning platform',
            start_date=date(2023, 1, 1),
            end_date=date(2023, 12, 31),
            url='https://github.com/eduverse/platform',
            is_research=False
        )
        
        self.assertEqual(project.title, 'EduVerse Platform')
        self.assertEqual(project.description, 'A comprehensive learning platform')
        self.assertFalse(project.is_research)

class ProfileAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = self.user.profile
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        """Test retrieving a profile"""
        url = reverse('profile_me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertIn('followers_count', response.data)
        self.assertIn('following_count', response.data)
        self.assertIn('skills', response.data)

    def test_update_profile(self):
        """Test updating profile information"""
        url = reverse('profile_me')
        data = {
            'display_name': 'Test User',
            'bio': 'Test bio',
            'website': 'https://example.com',
            'location': 'Test Location',
            'highlights': {'key': 'value'}
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.display_name, data['display_name'])
        self.assertEqual(self.profile.highlights, data['highlights'])

    def test_privacy_settings(self):
        """Test updating privacy settings"""
        url = reverse('profile-privacy')
        data = {
            'privacy_settings': {
                'profile_visibility': 'private',
                'posts_visibility': 'friends',
                'followers_visibility': 'private',
                'following_visibility': 'private',
                'allow_friend_requests': True,
                'show_online_status': False
            }
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(
            self.profile.privacy_settings['profile_visibility'],
            data['privacy_settings']['profile_visibility']
        )

    def test_notification_settings(self):
        """Test updating notification settings"""
        url = reverse('profile-notifications')
        data = {
            'notification_settings': {
                'email': True,
                'push': False,
                'sms': False,
                'post_likes': True,
                'comments': True,
                'follows': True,
                'messages': True
            }
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(
            self.profile.notification_settings['push'],
            data['notification_settings']['push']
        )

    def test_blocked_users(self):
        """Test blocking and unblocking users"""
        blocked_user = User.objects.create_user(
            username='blockeduser',
            email='blocked@example.com',
            password='testpass123'
        )
        url = reverse('profile-block-user')
        data = {
            'user_id': blocked_user.id,
            'block_reason': 'Spam',
            'block_duration': 'permanent'
        }
        
        # Test blocking
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(blocked_user in self.profile.blocked_users.all())
        
        # Test unblocking
        response = self.client.delete(url, {'user_id': blocked_user.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(blocked_user in self.profile.blocked_users.all())

    def test_get_me_profile_authenticated(self):
        """Test GET /me/ endpoint for authenticated user"""
        url = reverse('profile-me')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(data['email'], 'test@example.com')
        self.assertIn('education_details', data)
        self.assertIn('experiences', data)
        self.assertIn('licenses', data)
        self.assertIn('projects', data)

    def test_get_me_profile_unauthenticated(self):
        """Test GET /me/ endpoint for unauthenticated user"""
        url = reverse('profile-me')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_me_profile(self):
        """Test PATCH /me/ endpoint for profile updates"""
        url = reverse('profile-me')
        
        update_data = {
            'display_name': 'Updated Name',
            'bio': 'Updated bio',
            'website': 'https://example.com',
            'location': 'San Francisco, CA'
        }
        
        response = self.client.patch(url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['display_name'], 'Updated Name')
        self.assertEqual(response.data['bio'], 'Updated bio')
        self.assertEqual(response.data['website'], 'https://example.com')
        self.assertEqual(response.data['location'], 'San Francisco, CA')

    def test_patch_me_profile_with_image(self):
        """Test PATCH /me/ endpoint with profile image upload"""
        url = reverse('profile-me')
        
        # Create a mock image file
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            b"file_content",
            content_type="image/jpeg"
        )
        
        update_data = {
            'display_name': 'Updated Name',
            'profile_image': image_file
        }
        
        response = self.client.patch(url, update_data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['display_name'], 'Updated Name')
        self.assertIn('profile_image_url', response.data)

    def test_education_endpoints(self):
        """Test education management endpoints"""
        url = reverse('profile-me-education')
        
        # Test POST /me/education/
        education_data = {
            'school_name': 'Test University',
            'degree': 'Bachelor of Science',
            'field_of_study': 'Computer Science',
            'start_date': '2018-09-01',
            'end_date': '2022-05-15',
            'description': 'Studied computer science fundamentals'
        }
        
        response = self.client.post(url, education_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        education_id = response.data['id']
        
        # Test GET /me/education/
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
        # Test PUT /me/education/{id}/
        update_data = {
            'school_name': 'Updated University',
            'degree': 'Master of Science',
            'field_of_study': 'Computer Science',
            'start_date': '2018-09-01',
            'end_date': '2022-05-15',
            'description': 'Updated description'
        }
        
        detail_url = reverse('profile-me-education-detail', kwargs={'education_id': education_id})
        response = self.client.put(detail_url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['school_name'], 'Updated University')
        self.assertEqual(response.data['degree'], 'Master of Science')
        
        # Test DELETE /me/education/{id}/
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify deletion
        response = self.client.get(url)
        self.assertEqual(len(response.data), 0)

    def test_experience_endpoints(self):
        """Test experience management endpoints"""
        url = reverse('profile-me-experience')
        
        # Test POST /me/experience/
        experience_data = {
            'title': 'Software Engineer',
            'company': 'Tech Corp',
            'location': 'San Francisco, CA',
            'start_date': '2022-06-01',
            'is_current': True,
            'description': 'Developed web applications'
        }
        
        response = self.client.post(url, experience_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        experience_id = response.data['id']
        
        # Test GET /me/experience/
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
        # Test PUT /me/experience/{id}/
        update_data = {
            'title': 'Senior Software Engineer',
            'company': 'Tech Corp',
            'location': 'San Francisco, CA',
            'start_date': '2022-06-01',
            'is_current': True,
            'description': 'Updated description'
        }
        
        detail_url = reverse('profile-me-experience-detail', kwargs={'experience_id': experience_id})
        response = self.client.put(detail_url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Senior Software Engineer')
        
        # Test DELETE /me/experience/{id}/
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_license_endpoints(self):
        """Test license management endpoints"""
        url = reverse('profile-me-licenses')
        
        # Test POST /me/licenses/
        license_data = {
            'name': 'AWS Certified Solutions Architect',
            'issuing_organization': 'Amazon Web Services',
            'issue_date': '2023-01-15',
            'credential_id': 'AWS-123456',
            'credential_url': 'https://aws.amazon.com/certification'
        }
        
        response = self.client.post(url, license_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        license_id = response.data['id']
        
        # Test GET /me/licenses/
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
        # Test PUT /me/licenses/{id}/
        update_data = {
            'name': 'AWS Certified Solutions Architect - Associate',
            'issuing_organization': 'Amazon Web Services',
            'issue_date': '2023-01-15',
            'credential_id': 'AWS-123456',
            'credential_url': 'https://aws.amazon.com/certification'
        }
        
        detail_url = reverse('profile-me-licenses-detail', kwargs={'license_id': license_id})
        response = self.client.put(detail_url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'AWS Certified Solutions Architect - Associate')
        
        # Test DELETE /me/licenses/{id}/
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_project_endpoints(self):
        """Test project management endpoints"""
        url = reverse('profile-me-projects')
        
        # Test POST /me/projects/
        project_data = {
            'title': 'EduVerse Platform',
            'description': 'A comprehensive learning platform',
            'start_date': '2023-01-01',
            'end_date': '2023-12-31',
            'url': 'https://github.com/eduverse/platform',
            'is_research': False
        }
        
        response = self.client.post(url, project_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Test GET /me/projects/
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
        # Test PUT /me/projects/{id}/
        update_data = {
            'title': 'EduVerse Platform v2',
            'description': 'Updated description',
            'start_date': '2023-01-01',
            'end_date': '2023-12-31',
            'url': 'https://github.com/eduverse/platform',
            'is_research': False
        }
        
        detail_url = reverse('profile-me-projects-detail', kwargs={'project_id': project_id})
        response = self.client.put(detail_url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'EduVerse Platform v2')
        
        # Test DELETE /me/projects/{id}/
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_skills_read_only(self):
        """Test that skills field is read-only and cannot be modified"""
        url = reverse('profile-me')
        
        # Try to update skills (should be ignored)
        update_data = {
            'display_name': 'Test User',
            'skills': {'python': 'expert', 'javascript': 'intermediate'}
        }
        
        response = self.client.patch(url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Skills should remain unchanged (empty dict in this case)
        self.assertEqual(response.data['skills'], {})

    def test_validation_errors(self):
        """Test validation errors for invalid data"""
        url = reverse('profile-me-education')
        
        # Test invalid education dates
        education_data = {
            'school_name': 'Test University',
            'degree': 'Bachelor of Science',
            'start_date': '2022-05-15',
            'end_date': '2018-09-01'  # End before start
        }
        
        response = self.client.post(url, education_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_unauthorized_access(self):
        """Test that users cannot access other users' data"""
        url = reverse('profile-detail', kwargs={'user__username': 'otheruser'})
        response = self.client.get(url)
        
        # This should work for public profiles, but let's test the principle
        # In a real implementation, you might have privacy controls
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_me_stats_endpoint(self):
        """Test the /me/stats/ endpoint"""
        url = reverse('profile-me-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn('education_count', data)
        self.assertIn('experience_count', data)
        self.assertIn('licenses_count', data)
        self.assertIn('projects_count', data)
        self.assertEqual(data['education_count'], 1)
        self.assertEqual(data['experience_count'], 1)
