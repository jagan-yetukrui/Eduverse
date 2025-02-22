from django.contrib import admin
from django.utils.html import format_html
from .models import Profile, Education, License, Experience, Project

# Create custom admin site to avoid URL namespace collision
class ProfilesAdminSite(admin.AdminSite):
    site_header = 'Profiles Administration'
    site_title = 'Profiles Admin'
    index_title = 'Profiles Admin'

profiles_admin = ProfilesAdminSite(name='profiles_admin')

@admin.register(Profile, site=profiles_admin)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['username', 'display_name', 'email', 'account_status', 'is_verified', 'profile_image_preview']
    list_filter = ['account_status', 'is_verified']
    search_fields = ['username', 'display_name', 'email']
    readonly_fields = ['skills']
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'username', 'display_name', 'email', 'bio', 'avatar')
        }),
        ('Profile Status', {
            'fields': ('account_status', 'is_verified')
        }),
        ('Skills & Expertise', {
            'fields': ('skills',)
        })
    )

    def profile_image_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%;" />', obj.avatar.url)
        return "No Image"
    profile_image_preview.short_description = 'Avatar'

@admin.register(Education, site=profiles_admin)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['profile', 'school_name', 'degree', 'start_date', 'end_date']
    search_fields = ['school_name', 'degree']

@admin.register(License, site=profiles_admin)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ['profile', 'name', 'issuing_organization', 'issue_date', 'expiry_date']
    search_fields = ['name', 'issuing_organization']

@admin.register(Experience, site=profiles_admin)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['profile', 'title', 'company', 'start_date', 'end_date', 'is_current']
    search_fields = ['title', 'company']

@admin.register(Project, site=profiles_admin)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['profile', 'title', 'start_date', 'end_date', 'is_research']
    search_fields = ['title']
