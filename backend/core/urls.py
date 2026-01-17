from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# JWT Views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Admin Paneli
    path('admin/', admin.site.urls),

    # Ana API Rotaları
    path('api/', include('api.urls')),

    # Kimlik Doğrulama (JWT) Endpoint'leri
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Geliştirme ortamında (Localhost) medya ve statik dosyaları Django sunar.
# Canlıda (Production) bu işi Cloudinary ve WhiteNoise yapar.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)