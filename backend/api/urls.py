from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# --- ROUTER KURULUMU ---
router = DefaultRouter()

# 1. ANA MODELLER
router.register(r'universities', views.UniversityViewSet)
router.register(r'departments', views.DepartmentViewSet)
router.register(r'venues', views.CampusVenueViewSet)

# 2. KONAKLAMA (Yurt & Ev)
router.register(r'dormitories', views.DormitoryViewSet)
router.register(r'student-houses', views.StudentHouseViewSet)

# 3. İÇERİK VE MEDYA
router.register(r'news', views.NewsViewSet)
router.register(r'scholarships', views.ScholarshipViewSet)
router.register(r'promotions', views.PromotionViewSet)
router.register(r'reels', views.CampusReelViewSet)

# 4. GENEL VE ETKİLEŞİM
router.register(r'features', views.FeatureViewSet)
router.register(r'leads', views.LeadViewSet)
router.register(r'reviews', views.ReviewViewSet)

# --- URL PATTERNS ---
urlpatterns = [
    # Router URL'leri
    path('', include(router.urls)),

    # Kullanıcı & Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/me/', views.ManageUserView.as_view(), name='me'),

    # Favoriler
    path('favorites/houses/', views.FavoriteListView.as_view(), name='fav-houses'),
    path('favorites/houses/toggle/', views.FavoriteToggleView.as_view(), name='fav-houses-toggle'),
    
    path('favorites/universities/', views.FavoriteUniversityListView.as_view(), name='fav-uni'),
    path('favorites/universities/toggle/', views.FavoriteUniversityToggleView.as_view(), name='fav-uni-toggle'),
    
    path('favorites/dormitories/', views.FavoriteDormitoryListView.as_view(), name='fav-dorm'),
    path('favorites/dormitories/toggle/', views.FavoriteDormitoryToggleView.as_view(), name='fav-dorm-toggle'),

    # Analitik
    path('track-activity/', views.TrackActivityView.as_view(), name='track-activity'),

    # Tercih Motoru Özel Endpoint
    path('tercih-motoru/', views.TercihMotoruView.as_view(), name='tercih_motoru'),
]