"""
Django settings for core project.
Kampusyolunda - Kognitect Mimari Yapısı (Production Ready)
"""

import dj_database_url
from decouple import config
from pathlib import Path
import os
from django.urls import reverse_lazy
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- GÜVENLİK AYARLARI ---
# Production'da SECRET_KEY env'den gelmeli.
SECRET_KEY = config('SECRET_KEY', default='django-insecure-test-key-change-in-prod')

# Production'da bu KESİNLİKLE False olmalı.
DEBUG = config('DEBUG', default=False, cast=bool)

# Render ve Vercel için Host Ayarları
ALLOWED_HOSTS = ['*']

# CSRF Güvenliği
CSRF_TRUSTED_ORIGINS = [
    'https://kampus-backend-4wes.onrender.com',
    'https://kampus-yolunda.vercel.app',
    'https://kampusyolunda.com',
    'https://www.kampusyolunda.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# --- UYGULAMA TANIMLARI ---
INSTALLED_APPS = [
    # --- ADMIN TEMASI (JAZZMIN) ---
    "jazzmin",

    # --- STANDART DJANGO ---
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',  # Staticfiles'dan önce!
    'django.contrib.staticfiles',
    'cloudinary',

    # --- 3. PARTI ARAÇLAR ---
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',

    # --- BİZİM UYGULAMAMIZ ---
    'django_jsonform',
    'django_filters',
    'api',
    'django_extensions',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# --- VERİTABANI AYARLARI ---
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600
    )
}
# SQLite SSL Hack
if 'sqlite' in DATABASES['default']['ENGINE']:
    DATABASES['default'].pop('OPTIONS', None)
    
# --- ŞİFRE GÜVENLİĞİ ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- YERELLEŞTİRME ---
LANGUAGE_CODE = 'tr'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_TZ = True

# --- STATİK VE MEDYA DOSYALARI ---
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "cloudinary_storage.storage.StaticCloudinaryStorage",
    },
}
STATICFILES_STORAGE = 'cloudinary_storage.storage.StaticCloudinaryStorage'

# --- CLOUDINARY AYARLARI ---
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# --- CORS AYARLARI ---
CORS_ALLOW_ALL_ORIGINS = False 
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://kampus-yolunda.vercel.app",
    "https://kampusyolunda.com",
    "https://www.kampusyolunda.com",
]

# --- REST FRAMEWORK ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# --- JWT AYARLARI ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- EMAIL AYARLARI ---
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# --- JAZZMIN (ADMIN) AYARLARI ---
JAZZMIN_SETTINGS = {
    "site_title": "Kampüs Yolunda Admin",
    "site_header": "Kampüs Yolunda",
    "site_brand": "Yönetim Paneli",
    "welcome_sign": "Kampüs Yolunda Yönetim Paneline Hoşgeldiniz",
    "copyright": "Kognitect Teknoloji A.Ş.",
    "search_model": ["api.University", "api.Department", "api.CampusReel"],
    "topmenu_links": [
        {"name": "Siteyi Görüntüle", "url": "https://kampusyolunda.com", "new_window": True},
        {"model": "auth.User"},
        {"app": "api"},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    
    # --- İKON AYARLARI ---
    # CampusReel buradan kaldırıldı (Otomatik görünmesi için)
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "api.University": "fas fa-university",
        "api.Department": "fas fa-graduation-cap",
        "api.Dormitory": "fas fa-bed",
        "api.News": "fas fa-newspaper",
    },
    
    # --- SIRALAMA AYARLARI ---
    # CampusReel buradan kaldırıldı (Otomatik görünmesi için)
    "order_with_respect_to": [
        "api.University", 
        "api.Department", 
        "api.Dormitory", 
        "api.News"
    ],
}

JAZZMIN_UI_TWEAKS = {
    "theme": "flatly",
    "dark_mode_theme": "darkly",
}