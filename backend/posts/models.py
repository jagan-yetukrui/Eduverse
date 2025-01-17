from django.db import models

from accounts.models import CustomUser  # accounts app
from django.utils import timezone


class Post(models.Model):
    POST_TYPES = (
        ('blog', 'Blog'),
        ('news', 'News'),
        ('review', 'Review'),
    )

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    post_type = models.CharField(max_length=10, choices=POST_TYPES)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.author}] {self.title}"


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
