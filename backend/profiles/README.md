# EduVerse Enhanced Profile System

This module provides a comprehensive and extensible profile management system for EduVerse, supporting intelligent career development and project-based learning.

## 🎯 Overview

The enhanced profile system allows users to:

- View and update their complete profile information
- Manage nested sections (Education, Experience, Licenses, Projects) independently
- Upload profile images with proper validation
- Access AI-generated skills (read-only)
- Maintain academic/professional growth tracking

## 🏗 Architecture

### Models

#### Profile Model

- **Core Fields**: `display_name`, `bio`, `location`, `website`, `profile_image`
- **AI-Managed**: `skills` (read-only, auto-generated)
- **Relationships**: One-to-many with Education, Experience, License, Project
- **Social Features**: Followers, following, blocked users, close friends

#### Nested Models

- **Education**: School, degree, field of study, dates, description
- **Experience**: Title, company, location, dates, current status, description
- **License**: Name, organization, dates, credential info
- **Project**: Title, description, dates, URL, research flag

### Serializers

#### ProfileSerializer

- Full profile representation with nested data
- Handles image URLs with fallback logic
- Includes counts and statistics

#### ProfileUpdateSerializer

- Optimized for PATCH operations
- Supports multipart form data for image uploads
- Validates file size and type

#### Nested Serializers

- `EducationSerializer`, `ExperienceSerializer`, `LicenseSerializer`, `ProjectSerializer`
- Proper validation for date ranges and business logic
- Clean field definitions with appropriate read-only fields

## 🔗 API Endpoints

### Main Profile Endpoints

#### GET /api/profiles/me/

Retrieve current user's full profile with all nested data.

**Response:**

```json
{
  "id": 1,
  "username": "johndoe",
  "display_name": "John Doe",
  "email": "john@example.com",
  "bio": "Software engineer passionate about education",
  "profile_image_url": "/media/profile_images/john.jpg",
  "website": "https://johndoe.dev",
  "location": "San Francisco, CA",
  "skills": {
    "python": "expert",
    "javascript": "intermediate",
    "react": "advanced"
  },
  "education_details": [...],
  "experiences": [...],
  "licenses": [...],
  "projects": [...],
  "followers_count": 42,
  "following_count": 15
}
```

#### PATCH /api/profiles/me/

Update current user's profile information. Supports multipart form data for image uploads.

**Request (JSON):**

```json
{
  "display_name": "John Doe",
  "bio": "Updated bio",
  "website": "https://johndoe.dev",
  "location": "San Francisco, CA"
}
```

**Request (Multipart):**

```bash
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -F "display_name=John Doe" \
  -F "profile_image=@/path/to/image.jpg" \
  https://api.eduverse.com/api/profiles/me/
```

#### GET /api/profiles/me/stats/

Get profile statistics and counts.

**Response:**

```json
{
  "followers_count": 42,
  "following_count": 15,
  "posts_count": 8,
  "education_count": 2,
  "experience_count": 3,
  "licenses_count": 1,
  "projects_count": 5
}
```

### Education Management

#### GET /api/profiles/me/education/

Retrieve all education entries for current user.

#### POST /api/profiles/me/education/

Add new education entry.

**Request:**

```json
{
  "school_name": "Stanford University",
  "degree": "Master of Science",
  "field_of_study": "Computer Science",
  "start_date": "2020-09-01",
  "end_date": "2022-06-15",
  "description": "Specialized in machine learning and AI"
}
```

#### PUT /api/profiles/me/education/{id}/

Update specific education entry.

#### DELETE /api/profiles/me/education/{id}/

Delete specific education entry.

### Experience Management

#### GET /api/profiles/me/experience/

Retrieve all experience entries for current user.

#### POST /api/profiles/me/experience/

Add new experience entry.

**Request:**

```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "start_date": "2022-06-01",
  "is_current": true,
  "description": "Leading development of educational platforms"
}
```

#### PUT /api/profiles/me/experience/{id}/

Update specific experience entry.

#### DELETE /api/profiles/me/experience/{id}/

Delete specific experience entry.

### License Management

#### GET /api/profiles/me/licenses/

Retrieve all license entries for current user.

#### POST /api/profiles/me/licenses/

Add new license entry.

**Request:**

```json
{
  "name": "AWS Certified Solutions Architect",
  "issuing_organization": "Amazon Web Services",
  "issue_date": "2023-01-15",
  "credential_id": "AWS-123456",
  "credential_url": "https://aws.amazon.com/certification"
}
```

#### PUT /api/profiles/me/licenses/{id}/

Update specific license entry.

#### DELETE /api/profiles/me/licenses/{id}/

Delete specific license entry.

### Project Management

#### GET /api/profiles/me/projects/

Retrieve all project entries for current user.

#### POST /api/profiles/me/projects/

Add new project entry.

**Request:**

```json
{
  "title": "EduVerse Platform",
  "description": "A comprehensive learning platform",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "url": "https://github.com/eduverse/platform",
  "is_research": false
}
```

#### PUT /api/profiles/me/projects/{id}/

Update specific project entry.

#### DELETE /api/profiles/me/projects/{id}/

Delete specific project entry.

## 🔐 Authentication & Permissions

### Authentication

- All endpoints require JWT authentication
- Include `Authorization: Bearer <token>` header

### Permissions

- Users can only access and modify their own profile data
- Public profile viewing is available for other users
- Skills field is read-only (AI-managed)

## 📁 File Upload

### Profile Images

- Supported formats: JPEG, PNG, GIF
- Maximum file size: 5MB
- Upload directory: `media/profile_images/`
- Fallback logic: profile_image → avatar → default

### Validation

```python
# File size validation
if value.size > 5 * 1024 * 1024:
    raise ValidationError("Profile image file size must be under 5MB")

# File type validation
allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
if value.content_type not in allowed_types:
    raise ValidationError("Only JPEG, PNG, and GIF images are allowed")
```

## 🧠 AI Integration

### Skills Management

- Skills are automatically generated by AI based on user activities
- Users cannot manually add or remove skills
- Skills are returned as read-only data in profile responses
- Format: `{"skill_name": "proficiency_level"}`

### Future Enhancements

- AI-powered skill recommendations
- Automatic skill extraction from projects and experiences
- Skill gap analysis and learning recommendations

## ✅ Validation Rules

### Education

- End date cannot be before start date
- All fields are optional except school_name

### Experience

- End date cannot be before start date
- Current positions should not have end dates
- All fields are optional except title and company

### License

- Expiry date cannot be before issue date
- All fields are optional except name and organization

### Project

- End date cannot be before start date
- All fields are optional except title

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all profile tests
python manage.py test profiles

# Run specific test classes
python manage.py test profiles.tests.ProfileAPITest

# Run with coverage
coverage run --source='.' manage.py test profiles
coverage report
```

### Test Coverage

- Model validation and relationships
- API endpoint functionality
- Authentication and permissions
- File upload handling
- Data validation and error handling
- Nested section management

## 🚀 Usage Examples

### Frontend Integration

#### React Example

```javascript
// Get user profile
const getProfile = async () => {
  const response = await fetch("/api/profiles/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Update profile with image
const updateProfile = async (data, imageFile) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  if (imageFile) {
    formData.append("profile_image", imageFile);
  }

  const response = await fetch("/api/profiles/me/", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
};

// Add education entry
const addEducation = async (educationData) => {
  const response = await fetch("/api/profiles/me/education/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(educationData),
  });
  return response.json();
};
```

#### Python Example

```python
import requests

# Get user profile
def get_profile(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get('https://api.eduverse.com/api/profiles/me/', headers=headers)
    return response.json()

# Update profile with image
def update_profile(token, data, image_path=None):
    headers = {'Authorization': f'Bearer {token}'}

    if image_path:
        with open(image_path, 'rb') as f:
            files = {'profile_image': f}
            data = {**data, 'profile_image': f}
            response = requests.patch(
                'https://api.eduverse.com/api/profiles/me/',
                headers=headers,
                data=data,
                files=files
            )
    else:
        response = requests.patch(
            'https://api.eduverse.com/api/profiles/me/',
            headers=headers,
            json=data
        )

    return response.json()
```

## 🔧 Configuration

### Settings

```python
# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Avatar upload settings
AVATAR_MAX_SIZE = 5 * 1024 * 1024  # 5MB
AVATAR_ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
```

### URL Configuration

```python
# Include in main urls.py
urlpatterns = [
    path('api/', include('profiles.urls')),
]
```

## 📈 Performance Considerations

### Database Optimization

- Use `select_related` and `prefetch_related` for nested data
- Index frequently queried fields
- Consider caching for public profile data

### File Handling

- Implement image resizing for large uploads
- Use CDN for serving media files in production
- Implement proper cleanup for deleted images

## 🔮 Future Enhancements

### Planned Features

- Advanced privacy controls
- Profile analytics and insights
- Integration with external platforms (LinkedIn, GitHub)
- Real-time collaboration features
- Advanced search and filtering

### API Extensions

- Bulk operations for nested sections
- Advanced filtering and sorting
- Webhook support for profile changes
- GraphQL endpoint for complex queries

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Follow security best practices

## 📄 License

This module is part of the EduVerse platform and follows the same licensing terms.
