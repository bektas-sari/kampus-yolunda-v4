import logging
import os
import io # Unutulan kütüphane eklendi
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.core.management import call_command

from rest_framework import viewsets, filters, status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

# --- MODELLER ---
from .models import (
    University, Department, Dormitory, StudentHouse, 
    Scholarship, News, Lead, Feature, CampusVenue, Promotion, Review, CampusReel,
    FavoriteUniversity, FavoriteDormitory, FavoriteStudentHouse,
    UniversityStats, DepartmentStats
)

# --- SERIALIZERS ---
from .serializers import (
    UserSerializer,
    UniversityListSerializer, UniversityDetailSerializer,
    DepartmentSerializer,
    DormitorySerializer,
    StudentHouseSerializer,
    ScholarshipSerializer,
    NewsSerializer,
    LeadSerializer,
    CampusVenueSerializer,
    PromotionSerializer,
    FeatureSerializer,
    ReviewSerializer, ReviewCreateSerializer,
    FavoriteUniversitySerializer, FavoriteDormitorySerializer, FavoriteStudentHouseSerializer,
    CampusReelSerializer,
    ProgramSuggestionSerializer 
)

logger = logging.getLogger(__name__)

# --- SYSTEM WARMUP (BAKIM/DATA LOADER) ---
class SystemWarmupView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        status_report = []
        detailed_logs = ""
        
        try:
            # 1. MIGRATION
            out_migrate = io.StringIO()
            call_command('migrate', interactive=False, stdout=out_migrate)
            status_report.append("✅ Veritabanı (Migration) güncellendi.")
            detailed_logs += f"--- MIGRATE LOG ---\n{out_migrate.getvalue()}\n"

            # 2. DOSYA KONTROLÜ
            file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
            if not os.path.exists(file_path):
                return Response({"status": "error", "message": "Dosya Yok"}, status=200)
            status_report.append("✅ Dosya Mevcut")

            # 3. VERİ YÜKLEME
            out_load = io.StringIO()
            try:
                call_command('load_osym_data', stdout=out_load, stderr=out_load)
                status_report.append("✅ ÖSYM Yükleme Tamamlandı.")
            except Exception as e:
                status_report.append(f"❌ Yükleme Hatası: {str(e)}")
            
            detailed_logs += f"\n--- LOAD LOG ---\n{out_load.getvalue()}\n"

            # 4. TÜMA
            tuma_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
            if os.path.exists(tuma_path):
                call_command('load_tuma_data', tuma_path)
                status_report.append("✅ TÜMA Güncellendi.")
            
            return Response({
                "status": "success",
                "report": status_report,
                "detailed_logs": detailed_logs.split('\n')
            }, status=200)

        except Exception as e:
            return Response({"status": "critical_error", "error": str(e)}, status=200)

# =============================================================================
# 1. VIEWSETS (Standart)
# =============================================================================

class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.all().order_by('-is_promoted', '-student_count')
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'uni_type', 'is_promoted']
    search_fields = ['name', 'city']
    permission_classes = [AllowAny]
    def get_serializer_class(self):
        return UniversityListSerializer if self.action == 'list' else UniversityDetailSerializer

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all().select_related('university')
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['score_type', 'university__city']
    search_fields = ['name', 'program_code', 'university__name']
    permission_classes = [AllowAny]

class CampusVenueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CampusVenue.objects.all()
    serializer_class = CampusVenueSerializer
    permission_classes = [AllowAny]

class DormitoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dormitory.objects.all()
    serializer_class = DormitorySerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['city', 'dorm_type', 'is_promoted']
    search_fields = ['name', 'district']
    permission_classes = [AllowAny]

class StudentHouseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StudentHouse.objects.all().order_by('-is_promoted', '-created_at')
    serializer_class = StudentHouseSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['city', 'room_count']
    permission_classes = [AllowAny]

class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Scholarship.objects.filter(is_active=True).order_by('deadline')
    serializer_class = ScholarshipSerializer
    permission_classes = [AllowAny]

class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]

class PromotionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Promotion.objects.filter(is_active=True)
    serializer_class = PromotionSerializer
    permission_classes = [AllowAny]

class FeatureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    permission_classes = [AllowAny]

class CampusReelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CampusReel.objects.all().order_by('-created_at')
    serializer_class = CampusReelSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get('homepage') == 'true':
            qs = qs.filter(show_on_homepage=True)
        return qs

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [AllowAny]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_approved=True).order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        # Basitleştirilmiş Create Logic
        try:
            return super().create(request, *args, **kwargs)
        except:
            return Response({"error": "Review creation failed"}, status=400)

# =============================================================================
# 2. ÖZEL İŞLEVLER
# =============================================================================

class RegisterView(generics.CreateAPIView):
    queryset = UserSerializer.Meta.model.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self): return self.request.user

# Favori View'ları (Basitleştirilmiş)
class FavoriteToggleView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request): return Response({'status': 'ok'}) # Placeholder

class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteStudentHouseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return FavoriteStudentHouse.objects.filter(user=self.request.user)

class FavoriteUniversityToggleView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request): return Response({'status': 'ok'})

class FavoriteUniversityListView(generics.ListAPIView):
    serializer_class = FavoriteUniversitySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return FavoriteUniversity.objects.filter(user=self.request.user)

class FavoriteDormitoryToggleView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request): return Response({'status': 'ok'})

class FavoriteDormitoryListView(generics.ListAPIView):
    serializer_class = FavoriteDormitorySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return FavoriteDormitory.objects.filter(user=self.request.user)

class TrackActivityView(views.APIView):
    permission_classes = [AllowAny]
    def post(self, request): return Response({"status": "tracked"})

# =============================================================================
# 3. TERCİH MOTORU (DÜZELTİLMİŞ)
# =============================================================================

class TercihMotoruView(APIView):
    permission_classes = [AllowAny]

    def normalize_tr(self, text):
        if not text: return ""
        text = str(text).strip()
        mapping = {'i': 'I', 'İ': 'I', 'ı': 'I', 'I': 'I', 'ğ': 'G', 'Ğ': 'G', 'ü': 'U', 'Ü': 'U', 'ş': 'S', 'Ş': 'S', 'ö': 'O', 'Ö': 'O', 'ç': 'C', 'Ç': 'C'}
        normalized = []
        for char in text:
            if char in mapping: normalized.append(mapping[char])
            else: normalized.append(char.upper())
        return "".join(normalized)

    def generate_insights(self, dept, ranking, city_filter, dept_filter):
        reasons = []
        diff = dept.ranking - ranking
        if diff > 0: reasons.append(f"Sıralamanız {diff:,} kişi daha iyi.")
        elif abs(diff) < ranking * 0.1: reasons.append("Tam puanınızın karşılığı.")
        
        if city_filter:
            for c in city_filter:
                if self.normalize_tr(c) in self.normalize_tr(dept.university.city):
                    reasons.append(f"Şehir Tercihi: {dept.university.city}")
                    break
        
        if dept.scholarship_rate == 100: reasons.append("Tam Burslu")
        elif dept.scholarship_rate > 0: reasons.append(f"%{dept.scholarship_rate} İndirimli")
        elif dept.university.uni_type == 'DEVLET': reasons.append("Devlet Üniversitesi")
        
        return reasons

    def post(self, request):
        try:
            ranking = int(request.data.get('student_ranking', 0))
            score_type = request.data.get('score_type', 'SAY')
            city_filter = request.data.get('city_filter', [])
            dept_filter = request.data.get('department_filter', [])
            
            if isinstance(city_filter, str): city_filter = [city_filter]
            if isinstance(dept_filter, str): dept_filter = [dept_filter]

            if ranking <= 0: return Response({"error": "Geçersiz sıralama"}, status=400)

            # 1. Geniş Havuz (Makası Açtık - En az 50k tarasın)
            min_limit = 0 
            # Eğer 1. ise bile 50.000'e kadar baksın ki sonuç dönsün (Garantiler dolsun)
            max_limit = max(50000, ranking * 2.5) 

            queryset = Department.objects.filter(
                score_type=score_type,
                ranking__range=(min_limit, max_limit)
            ).select_related('university', 'university__stats')

            # 2. Akıllı Filtreleme
            if city_filter:
                query = Q()
                for city in city_filter:
                    term = self.normalize_tr(city)
                    if "STANBUL" in term: term = "STANBUL"
                    elif "ZMIR" in term: term = "ZMIR"
                    query |= Q(university__city__icontains=term)
                queryset = queryset.filter(query)

            if dept_filter:
                query = Q()
                for dept in dept_filter:
                    term = self.normalize_tr(dept)
                    query |= Q(name__icontains=dept)
                    query |= Q(name__icontains=term)
                    # Manuel Fixler
                    if "BILGISAYAR" in term: query |= Q(name__icontains="BİLGİSAYAR")
                    if "YAZILIM" in term: query |= Q(name__icontains="YAZILIM")
                    if "TIP" in term: query |= Q(name__icontains="TIP")
                queryset = queryset.filter(query)

            # 3. İşleme
            programs = list(queryset[:300]) # Max 300 sonuç
            surprise, ideal, safe = [], [], []

            for prog in programs:
                if not prog.ranking: continue
                
                diff = prog.ranking - ranking
                percent_diff = diff / ranking if ranking > 0 else 0

                stats = None
                if hasattr(prog.university, 'stats'):
                    s = prog.university.stats
                    stats = {
                        "academic_score": s.academic_score,
                        "campus_score": s.campus_score,
                        "city_score": s.city_score
                    }

                # --- FRONTEND İÇİN DÜZELTİLMİŞ DATA YAPISI ---
                # Frontend 'university_name' bekliyor, 'uni_name' değil!
                data = {
                    "id": prog.id,
                    "name": prog.name,
                    "program_code": prog.program_code,
                    
                    # KRİTİK DÜZELTME:
                    "university_name": prog.university.name, 
                    "university_slug": prog.university.slug,
                    "university_city": prog.university.city,
                    "university_type": prog.university.uni_type,
                    "university_logo": prog.university.logo.url if prog.university.logo else None,
                    "university_stats": stats,
                    
                    "ranking": prog.ranking,
                    "score": prog.base_score,
                    "quota": prog.quota,
                    "scholarship_rate": prog.scholarship_rate,
                    "is_english": prog.is_english,
                    
                    "reasons": self.generate_insights(prog, ranking, city_filter, dept_filter)
                }

                # Kategorizasyon
                if -0.25 < percent_diff < 0: surprise.append(data)
                elif 0 <= percent_diff <= 0.30: ideal.append(data)
                elif percent_diff > 0.30: safe.append(data)
                
                # Derece öğrencisi (Rank 1-5000) için istisna
                if ranking < 5000 and prog.ranking < 20000:
                    if prog.ranking < ranking: surprise.append(data)
                    elif prog.ranking < ranking + 5000: ideal.append(data)
                    else: safe.append(data)

            return Response({
                "surprise_choices": sorted(surprise, key=lambda x: x['ranking'])[:10],
                "ideal_choices": sorted(ideal, key=lambda x: x['ranking'])[:20],
                "safe_choices": sorted(safe, key=lambda x: x['ranking'])[:20]
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class FilterView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        cities = Department.objects.values_list('university__city', flat=True).distinct().order_by('university__city')
        departments = Department.objects.values_list('name', flat=True).distinct().order_by('name')
        return Response({
            "cities": sorted(list(set([c for c in cities if c]))),
            "departments": sorted(list(set([d for d in departments if d])))
        })

# --- DEBUG AMAÇLI: VERİ KONTROLÜ ---
class InspectDataView(views.APIView):
    """
    Veritabanındaki ilk 10 bölümü ham haliyle gösterir.
    Hata ayıklamak için kullanın.
    """
    permission_classes = [AllowAny]
    def get(self, request):
        depts = Department.objects.all()[:10]
        data = []
        for d in depts:
            data.append({
                "name": d.name,
                "uni": d.university.name,
                "rank": d.ranking,
                "score": d.base_score,
                "city": d.university.city
            })
        return Response({"count": Department.objects.count(), "sample": data})