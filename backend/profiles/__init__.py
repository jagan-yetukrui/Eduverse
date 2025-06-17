# In app's __init__.py
from django.apps import AppConfig


default_app_config = 'profiles.apps.ProfilesConfig'

# In apps.py
class ProfilesConfig(AppConfig):
    def ready(self):
        import profiles.signals