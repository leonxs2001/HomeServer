import os
import json
from pathlib import Path
from decouple import config, Csv

# Basisverzeichnis (Root-Verzeichnis deines Projekts)
BASE_DIR = Path(__file__).resolve().parent.parent

# Debug-Modus (deaktivieren in Produktion!)
DEBUG = config("DEBUG", default=False, cast=bool)

# Geheimer Schlüssel für die Django-App
SECRET_KEY = config("SECRET_KEY")

# Erlaubte Hosts
ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv(), default="")

# CSRF Trusted Origins (für z.B. Formulare aus anderen Domains)
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", cast=Csv(), default="")

# Applikationen
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # deine eigenen Apps
    'WeightWatch',
    'MoneyWatch',
    'DriveWatch',
    'PiHoleController',
    'study',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'HomeServer.urls'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # eigene Templates
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI
WSGI_APPLICATION = 'HomeServer.wsgi.application'

# Datenbank (MySQL via Docker Compose)
DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config("DATABASE_NAME"),
        'USER': config("DATABASE_USER"),
        'PASSWORD': config("DATABASE_PASSWORD"),
        'HOST': config("DATABASE_HOST", default="db"),
        'PORT': config("DATABASE_PORT", default=3306, cast=int),
    }
}

# Authentifizierung
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalisierung
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Statische Dateien
STATIC_URL = '/static/'
STATIC_ROOT = config("STATIC_ROOT", default=BASE_DIR / "static")

# Medien (optional – wenn du Datei-Uploads nutzt)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / "media"

# Manuelles Laden von initialen Benutzern (optional)
initial_users = config("INITIAL_USERS", default="[]")
INITIAL_USERS = json.loads(initial_users)

# Wohin wird man nach Login weitergeleitet?
LOGIN_URL = "/login/"

# Default Primary Key Type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
