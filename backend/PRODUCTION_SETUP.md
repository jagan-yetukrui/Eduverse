# EduVerse Production Setup Guide

## 🔧 Production Configuration Checklist

### 1. Environment Variables

Create a `.env` file in the backend directory:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# CORS Settings (Production)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Media Storage (for production, consider using AWS S3)
MEDIA_URL=https://your-domain.com/media/
MEDIA_ROOT=/path/to/media/files

# Static Files
STATIC_URL=https://your-domain.com/static/
STATIC_ROOT=/path/to/static/files
```

### 2. CORS Configuration

Update `settings.py` for production:

```python
# Comment out for production
# CORS_ALLOW_ALL_ORIGINS = True

# Uncomment and configure for production
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://www.your-frontend-domain.com",
]

# Ensure these are set
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT',
]
```

### 3. Media Files Configuration

For production, consider using AWS S3 or similar:

```python
# Install: pip install django-storages boto3

# settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = 'your-access-key'
AWS_SECRET_ACCESS_KEY = 'your-secret-key'
AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
AWS_S3_REGION_NAME = 'your-region'
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
```

### 4. Security Settings

Add these to `settings.py`:

```python
# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# If using HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### 5. Database Configuration

For production PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

### 6. Static Files Collection

```bash
python manage.py collectstatic --noinput
```

### 7. Database Migrations

```bash
python manage.py migrate
```

### 8. Create Superuser

```bash
python manage.py createsuperuser
```

### 9. Gunicorn Configuration

Create `gunicorn.conf.py`:

```python
bind = "0.0.0.0:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

### 10. Nginx Configuration

Example nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /static/ {
        alias /path/to/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /path/to/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Deployment Commands

### Using Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t eduverse-backend .
docker run -p 8000:8000 eduverse-backend
```

### Manual Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start with Gunicorn
gunicorn eduverse_backend.wsgi:application -c gunicorn.conf.py
```

## 🔍 Health Checks

### API Health Check

```bash
curl -X GET https://your-domain.com/api/profiles/me/stats/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Connection

```bash
python manage.py dbshell
```

### Media Files Access

```bash
curl -I https://your-domain.com/media/profile_images/test.jpg
```

## 📊 Monitoring

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/eduverse/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Performance Monitoring

Consider adding:

- Django Debug Toolbar (development only)
- Sentry for error tracking
- New Relic or DataDog for performance monitoring

## 🔐 Security Checklist

- [ ] SECRET_KEY is properly set and secure
- [ ] DEBUG is set to False
- [ ] ALLOWED_HOSTS is configured
- [ ] CORS is properly configured for production
- [ ] HTTPS is enabled
- [ ] Database uses SSL
- [ ] Static files are served efficiently
- [ ] Media files are properly secured
- [ ] Regular security updates are applied
- [ ] Backups are configured

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS_ALLOWED_ORIGINS configuration
2. **Media Files Not Loading**: Verify MEDIA_URL and MEDIA_ROOT settings
3. **Database Connection**: Check database credentials and SSL settings
4. **Static Files**: Ensure collectstatic was run and nginx is configured

### Debug Mode

For debugging production issues, temporarily enable debug:

```python
DEBUG = True
ALLOWED_HOSTS = ['*']
```

Remember to disable debug mode after troubleshooting!

## 📞 Support

For additional support:

- Check the main README.md
- Review Django deployment documentation
- Contact the development team
