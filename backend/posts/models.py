from django.db import models

from accounts.models import CustomUser  # accounts app
from django.utils import timezone


POST_TYPES = (
        ('blog', 'Blog'),
        ('news', 'News'),
        ('review', 'Review'),
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
    )
    
class Post(models.Model):
    POST_TYPES = (
        ('blog', 'Blog'),
        ('news', 'News'),
        ('review', 'Review'),
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
    )

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    post_type = models.CharField(max_length=10, choices=POST_TYPES, blank=True, null=True)
    image = models.ImageField(blank=True, null=True, upload_to="post_images/")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    visibility = models.CharField(
        choices=[
            ("Public", "Public"),
            ("Connections", "Connections"),
            ("Private", "Private"),
        ],
        default="Public",
        max_length=20,
    )

    def __str__(self):
        return f"[{self.author}] {self.title or 'Untitled Post'}"


class PostImage(models.Model):
    """Model to handle multiple images per post"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_images')
    image = models.ImageField(upload_to='post_images/')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Image {self.order} for {self.post}"


class Comment(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Comment by {self.author} on {self.post}"


class Like(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("post", "user")


class Save(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="saves")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("post", "user")


class Share(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="shares")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)


class Favorite(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="favorites")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("post", "user")


class Report(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="reports")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    reason = models.TextField(max_length=255)
    reported_at = models.DateTimeField(default=timezone.now)