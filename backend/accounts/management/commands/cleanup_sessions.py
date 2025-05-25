from django.core.management.base import BaseCommand
from accounts.models import UserSession
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Cleans up expired user sessions'

    def handle(self, *args, **options):
        # Deactivate sessions older than 14 days
        expiry_date = timezone.now() - timedelta(days=14)
        expired_sessions = UserSession.objects.filter(
            last_activity__lt=expiry_date,
            is_active=True
        )
        
        count = expired_sessions.count()
        expired_sessions.update(is_active=False)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deactivated {count} expired sessions')
        ) 