"""
Django settings for core project.
Kampusyolunda - Kognitect Mimari Yapısı
"""

from decouple import config
from pathlib import Path
import os
import dj_database_url
from django.urls import reverse_lazy
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-test-key-change-in-prod')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = ["*"]  # Geliştirme aşamasında her yerden erişime izin ver

# Application definition

INSTALLED_APPS = [
    # --- ADMIN TEMASI (JAZZMIN) ---
    "jazzmin",

    # --- STANDART DJANGO ---
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage', # Cloudinary Storage (Staticfiles'dan önce olmalı)
    'django.contrib.staticfiles',
    'cloudinary', # Cloudinary

    # --- 3. PARTI ARAÇLAR ---
    'rest_framework', 
    'corsheaders',  # Frontend ile iletişim için şart
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
    
    'corsheaders.middleware.CorsMiddleware', 
    
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
        'DIRS': [], # Burası boş kalsın şimdilik
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

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600
    )
}

# --- ŞİFRE GÜVENLİĞİ (AKTİF EDİLDİ) ---
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8, # En az 8 karakter
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# --- EMAIL AYARLARI (TERMİNALE BASAR) ---
# Geliştirme aşamasında gerçek mail atmak yerine terminale yazdırır.
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# --- YERELLEŞTİRME AYARLARI ---
LANGUAGE_CODE = 'tr'  # Türkçe
TIME_ZONE = 'Europe/Istanbul' # Türkiye Saati
USE_I18N = True
USE_L10N = True
USE_TZ = True

# --- STATİK VE MEDYA DOSYALARI ---
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# --- CLOUDINARY AYARLARI ---
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY': config('CLOUDINARY_API_KEY', default=''),
    'API_SECRET': config('CLOUDINARY_API_SECRET', default=''),
}

# Django 4.2+ ve 5.0+ için STORAGES yapısı
STORAGES = {
    'default': {
        'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage',
    },
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
    },
}

# --- CORS AYARLARI (Next.js için) ---
CORS_ALLOW_ALL_ORIGINS = True 

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://kampus-backend-4wes.onrender.com",
]

# --- REST FRAMEWORK AYARLARI ---
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

# --- JAZZMIN AYARLARI (KAMPÜS YOLUNDA ÖZEL) ---
JAZZMIN_SETTINGS = {
    "site_title": "Kampüs Yolunda Admin",
    "site_header": "Kampüs Yolunda",
    "site_brand": "Yönetim Paneli",
    "welcome_sign": "Kampüs Yolunda Yönetim Paneline Hoşgeldiniz",
    "copyright": "Kognitect Teknoloji A.Ş.",
    "search_model": ["api.University", "api.Department"], 
    "user_avatar": None,
    "topmenu_links": [
        {"name": "Siteyi Görüntüle", "url": "http://localhost:3000", "new_window": True},
        {"model": "auth.User"},
        {"app": "api"},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "api.University": "fas fa-university",      
        "api.Department": "fas fa-graduation-cap",  
        "api.Dormitory": "fas fa-bed",              
        "api.StudentHouse": "fas fa-home",          
        "api.Scholarship": "fas fa-hand-holding-usd", 
        "api.News": "fas fa-newspaper",             
        "api.Lead": "fas fa-bullhorn",              
        "api.Feature": "fas fa-list-ul",            
        "api.CampusVenue": "fas fa-coffee",         
        "api.UniversityStats": "fas fa-chart-line", 
    },
    "order_with_respect_to": [
        "api.University", 
        "api.Department", 
        "api.Dormitory", 
        "api.StudentHouse", 
        "api.Scholarship",
        "api.News",
        "api.Lead"
    ],
    "show_ui_builder": False, 
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "theme": "flatly", 
    "dark_mode_theme": "darkly", 
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}

# Geliştirme aşamasında mailleri terminale basar (Gmail ayarı yapana kadar bunu kullan)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Eğer proje canlıya (production) geçtiyse bu ayarı kapatıp SMTP (Gmail/AWS) açacağız.
# EMAIL_HOST = 'smtp.gmail.com' ... (İlerde burayı dolduracağız)