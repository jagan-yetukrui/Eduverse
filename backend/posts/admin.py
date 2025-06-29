from django.contrib import admin
from .models import Post, PostImage

@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__title', 'post__author__username']
    ordering = ['-created_at']

admin.site.register(Post)