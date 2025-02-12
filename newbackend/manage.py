#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newbackend.settings')

import sys

from django.db import models
#from django.contrib.auth.models import User  # Assuming you're using Django's User model

class Post(models.Model):
    post_id = models.AutoField(primary_key=True)  # Unique ID
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to the User
    content = models.TextField()  # Post content
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp

    def __str__(self):
        return f"Post by {self.user.username}: {self.content[:20]}"


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newbackend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
