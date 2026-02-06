import logging
import os
import io 
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
            # 1. MIGRATION (Veritabanı Güncelleme)
            out_migrate = io.StringIO()
            call_command('migrate', interactive=False, stdout=out_migrate)
            status_report.append("✅ Veritabanı (Migration) güncellendi.")
            detailed_logs += f"--- MIGRATE LOG ---\n{out_migrate.getvalue()}\n"

            # 2. DOSYA KONTROLÜ (OSYM)
            file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
            if not os.path.exists(file_path):
                return Response({"status": "error", "message": "Dosya Yok"}, status=200)
            status_report.append("✅ ÖSYM Dosyası Mevcut")

            # 3. VERİ YÜKLEME (OSYM)
            out_load = io.StringIO()
            try:
                call_command('load_osym_data', stdout=out_load, stderr=out_load)
                status_report.append("✅ ÖSYM Yükleme Tamamlandı.")
            except Exception as e:
                status_report.append(f"❌ Yükleme Hatası: {str(e)}")
            
            detailed_logs += f"\n--- LOAD LOG ---\n{out_load.getvalue()}\n"

            # 4. TÜMA VERİLERİ
            tuma_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
            if os.path.exists(tuma_path):
                out_tuma = io.StringIO()
                try:
                    call_command('load_tuma_data', stdout=out_tuma, stderr=out_tuma)
                    status_report.append("✅ TÜMA Verileri Güncellendi.")
                except Exception as e:
                    status_report.append(f"❌ TÜMA Hatası: {str(e)}")
                
                detailed_logs += f"\n--- TUMA LOG ---\n{out_tuma.getvalue()}\n"

            # 5. ÜNİVERSİTE DETAYLARI (VİDEO/HARİTA/INFO) - YENİ EKLENDİ
            detail_path = os.path.join(settings.BASE_DIR, 'universite_info.csv')
            if os.path.exists(detail_path):
                out_detail = io.StringIO()
                try:
                    call_command('load_uni_details', stdout=out_detail, stderr=out_detail)
                    status_report.append("✅ Üniversite Detayları (Video/Harita) Güncellendi.")
                except Exception as e:
                    status_report.append(f"❌ Detay Yükleme Hatası: {str(e)}")
                
                detailed_logs += f"\n--- DETAY LOG ---\n{out_detail.getvalue()}\n"
            
            return Response({
                "status": "success",
                "report": status_report,
                "detailed_logs": detailed_logs.split('\n')
            }, status=200)

        except Exception as e:
            return Response({"status": "critical_error", "error": str(e)}, status=200)

# =============================================================================
# 1. VIEWSETS
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
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

class FavoriteToggleView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request): return Response({'status': 'ok'})

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
# 3. TERCİH MOTORU (DÜZELTİLMİŞ - UNIVERSAL FORMAT & STATS FIX)
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

            # Geniş Arama Havuzu
            min_limit = 0 
            max_limit = max(50000, ranking * 2.5) 

            # Sadece üniversiteyi çekiyoruz, stats'ı manuel eşleştireceğiz
            queryset = Department.objects.filter(
                score_type=score_type,
                ranking__range=(min_limit, max_limit)
            ).select_related('university')

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
                    if "BILGISAYAR" in term: query |= Q(name__icontains="BİLGİSAYAR")
                queryset = queryset.filter(query)

            programs = list(queryset[:300])

            # --- STATS FIX: TÜM İSTATİSTİKLERİ HAFIZAYA AL ---
            all_stats = UniversityStats.objects.all()
            stats_map = {s.university_id: s for s in all_stats}

            surprise, ideal, safe = [], [], []

            for prog in programs:
                if not prog.ranking: continue
                
                diff = prog.ranking - ranking
                percent_diff = diff / ranking if ranking > 0 else 0

                # --- GARANTİLİ STATS EŞLEŞTİRME ---
                s = stats_map.get(prog.university.id)
                stats_data = None
                
                if s:
                    stats_data = {
                        "academic_score": s.academic_score, "academic": s.academic_score,
                        "campus_score": s.campus_score, "campus": s.campus_score,
                        "social_score": s.social_score, "social": s.social_score,
                        "career_score": s.career_score, "career": s.career_score,
                        "tech_score": s.tech_score, "tech": s.tech_score,
                        "city_score": s.city_score, "city": s.city_score,
                    }

                # --- ÜNİVERSİTE FORMATLAMA ---
                data = {
                    "id": prog.id,
                    "name": prog.name,
                    "program_code": prog.program_code,
                    
                    "university_name": prog.university.name, 
                    "university_slug": prog.university.slug,
                    "university_city": prog.university.city,
                    "university_type": prog.university.uni_type,
                    "university_logo": prog.university.logo.url if prog.university.logo else None,
                    "university_stats": stats_data,
                    
                    "ranking": prog.ranking,
                    "score": prog.base_score,
                    "quota": prog.quota,
                    "scholarship_rate": prog.scholarship_rate,
                    "is_english": prog.is_english,
                    "reasons": self.generate_insights(prog, ranking, city_filter, dept_filter)
                }

                if -0.25 < percent_diff < 0: surprise.append(data)
                elif 0 <= percent_diff <= 0.30: ideal.append(data)
                elif percent_diff > 0.30: safe.append(data)
                
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

# --- DEBUG AMAÇLI: VERİ KONTROLÜ (GÜÇLENDİRİLMİŞ) ---
class InspectDataView(views.APIView):
    """
    Veritabanındaki verilerin SAĞLAMASINI yapar.
    """
    permission_classes = [AllowAny]
    def get(self, request):
        # Stats Fix Kontrolü
        all_stats_count = UniversityStats.objects.count()
        sample_stats = UniversityStats.objects.first()
        
        sample_stats_data = "YOK"
        if sample_stats:
            sample_stats_data = {
                "uni": sample_stats.university.name,
                "academic": sample_stats.academic_score,
                "campus": sample_stats.campus_score
            }

        return Response({
            "total_departments": Department.objects.count(),
            "total_universities": University.objects.count(),
            "total_stats_loaded": all_stats_count,
            "sample_stat_record": sample_stats_data
        })