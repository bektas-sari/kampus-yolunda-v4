from django.urls import path
from .views import (
    UniversityList, UniversityDetail,
    DepartmentList,
    DormitoryList, DormitoryDetail,
    StudentHouseList, StudentHouseDetail,
    ScholarshipList, ScholarshipDetail,
    NewsList, NewsDetail, BreakingNewsList,
    RegisterView, ManageUserView,
    FavoriteToggleView, FavoriteListView,
    FavoriteUniversityToggleView, FavoriteUniversityListView,
    FavoriteDormitoryToggleView, FavoriteDormitoryListView,
    TrackActivityView, CreateLeadView, CreateReviewView
)

urlpatterns = [
    # --- ÜNİVERSİTELER ---
    path('universities/', UniversityList.as_view(), name='university-list'),
    path('universities/<slug:slug>/', UniversityDetail.as_view(), name='university-detail'),

    # --- BÖLÜMLER ---
    path('departments/', DepartmentList.as_view(), name='department-list'),

    # --- YURTLAR ---
    path('dormitories/', DormitoryList.as_view(), name='dormitory-list'),
    path('dormitories/<slug:slug>/', DormitoryDetail.as_view(), name='dormitory-detail'),

    # --- ÖĞRENCİ EVLERİ (Hata buradaydı, şimdi eklendi) ---
    path('houses/', StudentHouseList.as_view(), name='student-house-list'),
    path('houses/<slug:slug>/', StudentHouseDetail.as_view(), name='student-house-detail'),

    # --- HABERLER ---
    path('news/', NewsList.as_view(), name='news-list'),
    path('news/breaking/', BreakingNewsList.as_view(), name='news-breaking'),
    path('news/<slug:slug>/', NewsDetail.as_view(), name='news-detail'),

    # --- BURSLAR ---
    path('scholarships/', ScholarshipList.as_view(), name='scholarship-list'),
    path('scholarships/<slug:slug>/', ScholarshipDetail.as_view(), name='scholarship-detail'),

    # --- KULLANICI & AUTH ---
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', ManageUserView.as_view(), name='me'),

    # --- FAVORİLER ---
    path('favorites/houses/', FavoriteListView.as_view(), name='fav-houses'),
    path('favorites/houses/toggle/', FavoriteToggleView.as_view(), name='fav-houses-toggle'),
    path('favorites/universities/', FavoriteUniversityListView.as_view(), name='fav-uni'),
    path('favorites/universities/toggle/', FavoriteUniversityToggleView.as_view(), name='fav-uni-toggle'),
    path('favorites/dormitories/', FavoriteDormitoryListView.as_view(), name='fav-dorm'),
    path('favorites/dormitories/toggle/', FavoriteDormitoryToggleView.as_view(), name='fav-dorm-toggle'),

    # --- ANALİTİK VE FORM (LEAD) ---
    path('track-activity/', TrackActivityView.as_view(), name='track-activity'),
    path('leads/create/', CreateLeadView.as_view(), name='create-lead'),
    
    # --- YORUM OLUŞTURMA ---
    path('reviews/create/', CreateReviewView.as_view(), name='create-review'),
]