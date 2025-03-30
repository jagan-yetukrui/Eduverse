from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Profile, Education, License, Experience
from .serializers import (
    ProfileSerializer, EditProfileSerializer, PrivacySettingsSerializer,
    NotificationSettingsSerializer, BlockedUserSerializer
)

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

class ProfileAPITests(APITestCase):
    def setUp(self):
        self.client = Client()
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
