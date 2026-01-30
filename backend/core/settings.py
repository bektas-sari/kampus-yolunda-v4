"""
Django settings for core project.
Kampusyolunda - Kognitect Mimari Yapısı (Production Ready)
"""

import dj_database_url
from decouple import config, UndefinedValueError
from pathlib import Path
import os
from django.urls import reverse_lazy
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- GÜVENLİK AYARLARI ---
# Öncelik env değişkeninde, yoksa decouple config, o da yoksa default.
SECRET_KEY = os.environ.get('SECRET_KEY', config('SECRET_KEY', default='django-insecure-default-key'))

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['*']

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
    "jazzmin",
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    
    # Cloudinary Uygulamaları (Sıralama Önemli: staticfiles'dan sonra gelmeli)
    'cloudinary_storage',
    'cloudinary',

    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',

    'django_jsonform',
    'django_filters',
    'api',
    'django_extensions',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
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
        default=config('DATABASE_URL', default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600
    )
}

# --- STATİK VE MEDYA DOSYALARI ---
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Medya Dosyaları Ayarı
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Django 5.0+ Storage Yapılandırması
# 'default' kısmında backend ismini tırnak içinde tam yol olarak veriyoruz.
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# --- CLOUDINARY AYARLARI ---
# Render Environment Variables kısmındaki isimlerle birebir eşleşmeli.
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', config('CLOUDINARY_CLOUD_NAME', default='')),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', config('CLOUDINARY_API_KEY', default='')),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', config('CLOUDINARY_API_SECRET', default='')),
}

# --- CORS, JWT ve Diğer Ayarların Aynen Devam Ediyor ---
# (Buradan aşağısı senin gönderdiğin kodla aynı kalabilir)