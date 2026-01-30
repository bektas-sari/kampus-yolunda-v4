import logging
import os
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
    CSV veri yükleme komutunu tetikler.
    AYRICA: Otomatik Migration ve Hata Ayıklama yapar.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        status_report = []
        try:
            # ADIM 1: Veritabanını Güncelle (Auto-Migrate)
            call_command('migrate', interactive=False)
            status_report.append("✅ Veritabanı (Migration) güncellendi.")

            # ADIM 2: Dosya Kontrolü
            file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
            if not os.path.exists(file_path):
                return Response({
                    "status": "error", 
                    "message": f"Dosya Bulunamadı! Aranan yer: {file_path}",
                    "current_dir": os.getcwd(),
                    "dir_content": os.listdir(settings.BASE_DIR)
                }, status=200)
            
            status_report.append(f"✅ Dosya bulundu: {file_path}")

            # ADIM 3: Verileri Yükle
            call_command('load_osym_data')
            status_report.append("✅ ÖSYM Verileri Yüklendi.")

            # ADIM 4: TÜMA (Opsiyonel)
            tuma_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
            if os.path.exists(tuma_path):
                call_command('load_tuma_data', tuma_path)
                status_report.append("✅ TÜMA Verileri Güncellendi.")
            
            return Response({
                "status": "success",
                "report": status_report,
                "message": "Sistem Başarıyla Kuruldu."
            }, status=200)

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Warmup Error: {error_details}")
            
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
# 3. TERCİH MOTORU (AKILLI FİLTRELEME & AI) - GÜNCELLENMİŞ VERSİYON
# =============================================================================

# api/views.py dosyasındaki TercihMotoruView sınıfını bununla değiştirin:

# api/views.py dosyasındaki TercihMotoruView sınıfını bununla değiştirin:

class TercihMotoruView(APIView):
    """
    Segmentli Algoritma + Gelişmiş Türkçe Karakter Desteği + Debug Logları
    """
    permission_classes = [AllowAny]

    def normalize_input(self, text):
        """
        Türkçe karakterleri İngilizce karşılıklarına çevirir (Arama genişletmek için)
        """
        if not text: return ""
        replacements = {
            "İ": "i", "I": "i", "ı": "i", "Ş": "s", "ş": "s", "Ğ": "g", "ğ": "g",
            "Ü": "u", "ü": "u", "Ö": "o", "ö": "o", "Ç": "c", "ç": "c"
        }
        text = text.lower()
        for src, dest in replacements.items():
            text = text.replace(src, dest)
        return text

    def serialize_program(self, prog):
        stats = None
        if hasattr(prog.university, 'stats'):
            s = prog.university.stats
            stats = {
                "academic_score": s.academic_score,
                "campus_score": s.campus_score,
                "social_score": s.social_score,
                "career_score": s.career_score,
                "tech_score": s.tech_score,
                "city_score": s.city_score,
            }

        return {
            "id": prog.id,
            "name": prog.name,
            "program_code": prog.program_code,
            "faculty": prog.faculty,
            "score_type": prog.score_type,
            "quota": prog.quota,
            "ranking": prog.ranking,
            "points": prog.base_score,
            "education_type": prog.education_type,
            "university_name": prog.university.name,
            "university_slug": prog.university.slug,
            "university_city": prog.university.city,
            "university_logo": prog.university.logo.url if prog.university.logo else None,
            "university_stats": stats
        }

    def post(self, request):
        try:
            # Gelen Verileri Al
            ranking = int(request.data.get('student_ranking', 0))
            score_type = request.data.get('score_type', 'SAY')
            
            # Filtreleri Liste Haline Getir
            raw_city = request.data.get('city_filter', [])
            raw_dept = request.data.get('department_filter', [])
            
            city_filter = [raw_city] if isinstance(raw_city, str) else raw_city
            dept_filter = [raw_dept] if isinstance(raw_dept, str) else raw_dept

            print(f"🔍 ARAMA BAŞLADI: Rank={ranking}, Tip={score_type}, Şehir={city_filter}, Bölüm={dept_filter}")

            if ranking <= 0:
                return Response({"error": "Sıralama 0'dan büyük olmalıdır."}, status=400)

            # 1. Geniş Havuz (Ranking Aralığı)
            if ranking < 5000:
                min_limit, max_limit = 0, 300000 
            elif ranking < 50000:
                min_limit, max_limit = int(ranking * 0.50), int(ranking * 4.00)
            elif ranking < 200000:
                min_limit, max_limit = int(ranking * 0.80), int(ranking * 2.50)
            else:
                min_limit, max_limit = int(ranking * 0.90), int(ranking * 2.00)

            # Temel Sorgu
            programs = Department.objects.filter(
                score_type=score_type,
                ranking__range=(min_limit, max_limit)
            ).select_related('university', 'university__stats')

            print(f"📊 Temel Havuz Sayısı: {programs.count()}")

            # 2. ŞEHİR FİLTRESİ (Gelişmiş)
            if city_filter and len(city_filter) > 0:
                city_query = Q()
                for city in city_filter:
                    term = str(city).strip()
                    if not term: continue
                    
                    # 1. Tam Eşleşme (DB'deki haliyle)
                    city_query |= Q(university__city__icontains=term)
                    
                    # 2. Türkçe Büyük Harf Desteği (istanbul -> İSTANBUL)
                    tr_upper = term.replace("i", "İ").replace("ı", "I").upper()
                    city_query |= Q(university__city__icontains=tr_upper)

                    # 3. ASCII Desteği (İstanbul -> ISTANBUL)
                    ascii_upper = term.replace("İ", "I").replace("i", "I").replace("ı", "I").upper()
                    city_query |= Q(university__city__icontains=ascii_upper)
                    
                    # 4. Özel Durumlar
                    if "istanbul" in term.lower():
                        city_query |= Q(university__city__icontains="STANBUL")
                    elif "izmir" in term.lower():
                        city_query |= Q(university__city__icontains="ZMIR")

                programs = programs.filter(city_query)
                print(f"🏙️ Şehir Filtresi Sonrası: {programs.count()}")

            # 3. BÖLÜM FİLTRESİ (Gelişmiş Varyasyonlu)
            if dept_filter and len(dept_filter) > 0:
                dept_query = Q()
                for dept in dept_filter:
                    term = str(dept).strip()
                    if not term: continue
                    
                    # Kullanıcı girdisini normalize et
                    norm_term = self.normalize_input(term) # örn: turkce ogretmenligi

                    # A. Standart Arama
                    dept_query |= Q(name__icontains=term)
                    
                    # B. Türkçe Büyük Harf (türkçe -> TÜRKÇE)
                    # Basit bir replace zinciri ile yaygın Türkçe karakterleri büyütelim
                    term_upper = term.upper().replace("i", "İ").replace("ı", "I") 
                    # Python'un upper'ı "i"yi "I" yapar, o yüzden manuel düzeltme gerekebilir ama
                    # Veritabanındaki veri "TÜRKÇE" ise icontains genelde yetmeyebilir.
                    
                    # C. Joker Karakterli Arama (En Garantisi)
                    # "Türkçe" kelimesindeki ü, ç gibi harflerin yerine ne gelirse gelsin bulmaya çalışalım.
                    # Bu biraz maliyetlidir ama kesin sonuç verir.
                    # Şimdilik "normalize" edilmiş versiyon üzerinden gidelim:
                    
                    # Varyasyon 1: Girilen kelime (Olduğu gibi)
                    # Varyasyon 2: Büyük harf (Python default) -> TURKCE
                    # Varyasyon 3: Türkçe Büyük Harf (Manual) -> TÜRKÇE
                    
                    tr_map = str.maketrans("iıüöçşğ", "İIÜÖÇŞĞ")
                    term_tr_upper = term.translate(tr_map).upper()
                    
                    dept_query |= Q(name__icontains=term_tr_upper)
                    
                    # 'i' ve 'İ' karmaşası için özel bypass
                    if "rkce" in norm_term or "rkçe" in norm_term: # Türkçe/Turkce
                         dept_query |= Q(name__icontains="RKÇE")
                         dept_query |= Q(name__icontains="RKCE")
                    
                    if "gretmen" in norm_term: # Öğretmenlik/Ogretmenlik
                         dept_query |= Q(name__icontains="RETMEN") # Başındaki Ğ/G harfini atlayıp gövdeyi ara

                programs = programs.filter(dept_query)
                print(f"📚 Bölüm Filtresi Sonrası: {programs.count()}")

            # 4. Kategorizasyon
            all_programs_list = list(programs[:200]) # Limit koy
            surprise, ideal, safe = [], [], []

            for prog in all_programs_list:
                if not prog.ranking: continue
                diff = prog.ranking - ranking
                
                # Basitleştirilmiş Mantık
                if diff < 0 and abs(diff) < ranking * 0.3: # Biraz daha iyi sıralama
                    surprise.append(self.serialize_program(prog))
                elif diff >= 0 and diff < ranking * 0.4: # Yakın sıralama
                    ideal.append(self.serialize_program(prog))
                elif diff >= ranking * 0.4: # Garanti
                    safe.append(self.serialize_program(prog))
                
                # Derece öğrencileri için istisna
                if ranking < 5000:
                    if prog.ranking < ranking: surprise.append(self.serialize_program(prog))
                    else: ideal.append(self.serialize_program(prog))

            print(f"✅ SONUÇ: {len(surprise)} Sürpriz, {len(ideal)} İdeal, {len(safe)} Güvenli")

            return Response({
                "surprise_choices": surprise[:20],
                "ideal_choices": ideal[:20],
                "safe_choices": safe[:20]
            })

        except Exception as e:
            print(f"❌ HATA OLUŞTU: {str(e)}")
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