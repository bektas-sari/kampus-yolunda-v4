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

# --- UTILS ---
from .utils import calculate_probability

logger = logging.getLogger(__name__)

# --- SYSTEM WARMUP (BAKIM/DATA LOADER) ---
class SystemWarmupView(views.APIView):
    """
    Render Shell erişimi olmadığı için, HTTP üzerinden
    CSV veri yükleme komutunu tetikler ve ÇIKTIYI GÖSTERİR.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        status_report = []
        detailed_logs = "" # Terminal çıktıları buraya gelecek
        
        try:
            # 1. MIGRATION (Veritabanı Güncelleme)
            out_migrate = io.StringIO()
            call_command('migrate', interactive=False, stdout=out_migrate)
            status_report.append("✅ Veritabanı (Migration) güncellendi.")
            detailed_logs += f"--- MIGRATE LOG ---\n{out_migrate.getvalue()}\n"

            # 2. DOSYA KONTROLÜ
            file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
            if not os.path.exists(file_path):
                return Response({
                    "status": "error", 
                    "message": f"Dosya Bulunamadı! Aranan yer: {file_path}",
                    "current_dir": os.getcwd(),
                    "dir_content": os.listdir(settings.BASE_DIR)
                }, status=200)
            
            status_report.append(f"✅ Dosya bulundu: {file_path}")

            # 3. VERİ YÜKLEME (Captured Output)
            out_load = io.StringIO()
            try:
                # stdout ve stderr'i yakalıyoruz
                call_command('load_osym_data', stdout=out_load, stderr=out_load)
                status_report.append("✅ ÖSYM Yükleme Komutu Çalıştırıldı.")
            except Exception as e:
                status_report.append(f"❌ Yükleme sırasında hata: {str(e)}")
            
            # Yakalanan çıktıları rapora ekle
            command_output = out_load.getvalue()
            detailed_logs += f"\n--- LOAD DATA LOG ---\n{command_output}\n"

            # 4. TÜMA (DÜZELTİLEN KISIM BURASI)
            tuma_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
            if os.path.exists(tuma_path):
                out_tuma = io.StringIO()
                try:
                    # HATA BURADAYDI: tuma_path argümanını sildik çünkü komut yolu zaten biliyor.
                    call_command('load_tuma_data', stdout=out_tuma, stderr=out_tuma)
                    status_report.append("✅ TÜMA Verileri Güncellendi.")
                except Exception as e:
                    status_report.append(f"❌ TÜMA Hatası: {str(e)}")
                
                detailed_logs += f"\n--- TUMA LOG ---\n{out_tuma.getvalue()}\n"
            
            return Response({
                "status": "success",
                "message": "İşlem tamamlandı. Detaylar aşağıda:",
                "report": status_report,
                "detailed_logs": detailed_logs.split('\n') 
            }, status=200)

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            return Response({
                "status": "critical_error",
                "error_summary": str(e),
                "traceback": error_details,
                "report_so_far": status_report
            }, status=200)

# =============================================================================
# 1. VIEWSETS (Standart CRUD İşlemleri)
# =============================================================================

class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.all().order_by('-is_promoted', '-student_count')
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'uni_type', 'is_promoted']
    search_fields = ['name', 'city']
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return UniversityListSerializer
        return UniversityDetailSerializer

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
    queryset = StudentHouse.objects.all() 
    serializer_class = StudentHouseSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'room_count', 'is_furnished']
    search_fields = ['title', 'district', 'description']
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = StudentHouse.objects.all().order_by('-is_promoted', '-created_at')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        return queryset

class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Scholarship.objects.filter(is_active=True).order_by('deadline')
    serializer_class = ScholarshipSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = NewsSerializer
    lookup_field = 'slug'
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
        queryset = super().get_queryset()
        homepage = self.request.query_params.get('homepage')
        if homepage == 'true':
            queryset = queryset.filter(show_on_homepage=True)
        return queryset

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_approved=True).order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            model_type = serializer.validated_data.pop('model_type')
            object_id = serializer.validated_data.pop('object_id')
            
            try:
                ct = None
                if model_type == 'university':
                    ct = ContentType.objects.get(app_label='api', model='university')
                elif model_type == 'dormitory':
                    ct = ContentType.objects.get(app_label='api', model='dormitory')
                elif model_type == 'venue':
                    ct = ContentType.objects.get(app_label='api', model='campusvenue')
                
                if not ct:
                    return Response({"error": "Geçersiz model tipi"}, status=status.HTTP_400_BAD_REQUEST)

                Review.objects.create(
                    content_type=ct,
                    object_id=object_id,
                    author_name=serializer.validated_data['author_name'],
                    rating=serializer.validated_data['rating'],
                    comment=serializer.validated_data['comment'],
                    is_approved=True, 
                    user=request.user if request.user.is_authenticated else None
                )
                return Response({"message": "Yorumunuz başarıyla yayınlandı."}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =============================================================================
# 2. ÖZEL İŞLEVLER (Auth, Favori, İstatistik)
# =============================================================================

class RegisterView(generics.CreateAPIView):
    queryset = UserSerializer.Meta.model.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user

# --- FAVORİ İŞLEMLERİ ---

class FavoriteToggleView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        house_id = request.data.get('house_id')
        house = get_object_or_404(StudentHouse, id=house_id)
        fav, created = FavoriteStudentHouse.objects.get_or_create(user=request.user, student_house=house)
        if not created:
            fav.delete()
            return Response({'liked': False})
        return Response({'liked': True})

class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteStudentHouseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return FavoriteStudentHouse.objects.filter(user=self.request.user)

class FavoriteUniversityToggleView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        uni_id = request.data.get('university_id')
        uni = get_object_or_404(University, id=uni_id)
        fav, created = FavoriteUniversity.objects.get_or_create(user=request.user, university=uni)
        if not created:
            fav.delete()
            return Response({'liked': False})
        return Response({'liked': True})

class FavoriteUniversityListView(generics.ListAPIView):
    serializer_class = FavoriteUniversitySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return FavoriteUniversity.objects.filter(user=self.request.user)

class FavoriteDormitoryToggleView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        dorm_id = request.data.get('dormitory_id')
        dorm = get_object_or_404(Dormitory, id=dorm_id)
        fav, created = FavoriteDormitory.objects.get_or_create(user=request.user, dormitory=dorm)
        if not created:
            fav.delete()
            return Response({'liked': False})
        return Response({'liked': True})

class FavoriteDormitoryListView(generics.ListAPIView):
    serializer_class = FavoriteDormitorySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return FavoriteDormitory.objects.filter(user=self.request.user)

# --- İSTATİSTİK TAKİBİ ---

class TrackActivityView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        action_type = request.data.get('type')
        slug = request.data.get('slug')
        obj_id = request.data.get('id')
        today = timezone.now().date()
        
        try:
            if action_type in ['university_view', 'website_click', 'phone_click']:
                if slug:
                    uni = University.objects.filter(slug=slug).first()
                    if uni:
                        stats, _ = UniversityStats.objects.get_or_create(university=uni, date=today)
                        if action_type == 'university_view':
                            stats.page_views = F('page_views') + 1
                        elif action_type == 'website_click':
                            stats.website_clicks = F('website_clicks') + 1
                        elif action_type == 'phone_click':
                            stats.phone_clicks = F('phone_clicks') + 1
                        stats.save()
                        return Response({"status": "tracked"}, status=200)
            
            elif action_type == 'dept_view':
                if obj_id:
                    dept = Department.objects.filter(id=obj_id).first()
                    if dept:
                        stats, _ = DepartmentStats.objects.get_or_create(department=dept, date=today)
                        stats.page_views = F('page_views') + 1
                        stats.save()
                        return Response({"status": "tracked"}, status=200)
                        
        except Exception as e:
            return Response({"status": "error", "detail": str(e)}, status=400)
            
        return Response({"status": "invalid_action_or_missing_data"}, status=400)

# =============================================================================
# 3. TERCİH MOTORU (SONSUZ GÜVEN ALGORİTMASI V2.0)
# =============================================================================

class TercihMotoruView(APIView):
    """
    Sonsuz Güven Algoritması v2.0
    Ranking Volatilitesi + Akıllı Eşleşme Puanı (Match Score)
    """
    permission_classes = [AllowAny]

    def normalize_tr(self, text):
        if not text: return ""
        text = str(text).strip()
        mapping = {
            'i': 'I', 'İ': 'I', 'ı': 'I', 'I': 'I',
            'ğ': 'G', 'Ğ': 'G', 'ü': 'U', 'Ü': 'U',
            'ş': 'S', 'Ş': 'S', 'ö': 'O', 'Ö': 'O',
            'ç': 'C', 'Ç': 'C'
        }
        normalized = []
        for char in text:
            if char in mapping: normalized.append(mapping[char])
            else: normalized.append(char.upper())
        return "".join(normalized)

    def generate_insights(self, dept, ranking, city_filter, dept_filter):
        """Bu bölüm neden önerildi? (İnsan dokunuşu)"""
        reasons = []
        
        # 1. Sıralama Durumu
        diff = dept.ranking - ranking
        if diff > 0:
            reasons.append(f"Sıralamanız bu bölümden {diff:,} kişi daha iyi (Avantajlı)")
        elif abs(diff) < ranking * 0.1:
            reasons.append("Tam puanınızın/sıralamanızın karşılığı (İdeal)")
        
        # 2. Şehir Uyumu
        if city_filter:
            # Basit kontrol
            for c in city_filter:
                if self.normalize_tr(c) in self.normalize_tr(dept.university.city):
                    reasons.append(f"Tercih ettiğiniz şehirde: {dept.university.city}")
                    break
        
        # 3. Burs Durumu
        if dept.scholarship_rate == 100:
            reasons.append("💎 Tam Burslu Program")
        elif dept.scholarship_rate > 0:
            reasons.append(f"💸 %{dept.scholarship_rate} İndirimli")
        elif dept.university.uni_type == 'DEVLET':
            reasons.append("🏛️ Devlet Üniversitesi (Ücretsiz)")

        # 4. Dil
        if dept.is_english:
            reasons.append("🌍 İngilizce Eğitim")

        return reasons

    def post(self, request):
        try:
            # 1. Girdiler
            ranking = int(request.data.get('student_ranking', 0))
            score_type = request.data.get('score_type', 'SAY')
            city_filter = request.data.get('city_filter', [])
            dept_filter = request.data.get('department_filter', [])
            
            # String gelirse listeye çevir
            if isinstance(city_filter, str): city_filter = [city_filter]
            if isinstance(dept_filter, str): dept_filter = [dept_filter]

            if ranking <= 0:
                return Response({"error": "Sıralama 0'dan büyük olmalıdır."}, status=400)

            # 2. Geniş Havuz (Volatiliteye göre)
            # Sıralama ne kadar kötüyse makas o kadar açılır.
            min_limit = 0 
            if ranking < 5000: max_limit = 20000
            elif ranking < 50000: max_limit = ranking * 2.5
            else: max_limit = ranking * 2.0

            queryset = Department.objects.filter(
                score_type=score_type,
                ranking__range=(min_limit, max_limit)
            ).select_related('university', 'university__stats')

            # 3. Akıllı Filtreleme
            if city_filter:
                query = Q()
                for city in city_filter:
                    term = self.normalize_tr(city)
                    if "STANBUL" in term: term = "STANBUL" # İ/I Fix
                    elif "ZMIR" in term: term = "ZMIR"
                    query |= Q(university__city__icontains=term)
                queryset = queryset.filter(query)

            if dept_filter:
                query = Q()
                for dept in dept_filter:
                    term = self.normalize_tr(dept)
                    query |= Q(name__icontains=dept) # Orjinal
                    query |= Q(name__icontains=term) # Normalize
                    # Manuel Fix
                    if "BILGISAYAR" in term: query |= Q(name__icontains="BİLGİSAYAR")
                queryset = queryset.filter(query)

            # 4. Kategorizasyon ve Skorlama
            # Performans için ilk 300'ü al
            programs = list(queryset[:300])
            
            surprise, ideal, safe = [], [], []

            for prog in programs:
                if not prog.ranking: continue
                
                # Matematiksel Fark
                diff = prog.ranking - ranking
                percent_diff = diff / ranking

                # Data Hazırla (Serializer kullanıyoruz veya manuel dict)
                # Manuel dict daha hızlı ve esnek burada
                stats = None
                if hasattr(prog.university, 'stats'):
                    s = prog.university.stats
                    stats = {
                        "academic_score": s.academic_score,
                        "campus_score": s.campus_score,
                        "city_score": s.city_score
                    }

                data = {
                    "id": prog.id,
                    "name": prog.name,
                    "program_code": prog.program_code,
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

                # Kategori Mantığı (Volatilite Bazlı)
                # Sürpriz: Bölüm daha iyi sıralamada (Negatif fark)
                if -0.20 < percent_diff < 0: 
                    surprise.append(data)
                
                # İdeal: %25'e kadar gerileme normaldir
                elif 0 <= percent_diff <= 0.25:
                    ideal.append(data)
                
                # Güvenli: %25'ten sonrası
                elif percent_diff > 0.25:
                    safe.append(data)
                
                # Derece öğrencisi istisnası
                if ranking < 5000 and prog.ranking < 10000:
                    if prog.ranking < ranking: surprise.append(data)
                    else: ideal.append(data)

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