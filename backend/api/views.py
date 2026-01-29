import logging
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType

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
    ProgramSuggestionSerializer # <-- IMPORT DÜZELTİLDİ
)

logger = logging.getLogger(__name__)

# =============================================================================
# 1. VIEWSETS (Standart CRUD İşlemleri)
# =============================================================================

class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Üniversiteleri listeleme ve detay görüntüleme.
    Slug üzerinden erişim sağlar.
    """
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
    """
    Bölümleri listeleme.
    """
    queryset = Department.objects.all().select_related('university')
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['score_type', 'education_type', 'university__city']
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
    """
    Kullanıcı başvurularını (Lead) toplar.
    Oluşturmak (POST) herkese açık, listelemek sadece admin/yetkiliye.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

class ReviewViewSet(viewsets.ModelViewSet):
    """
    Yorum işlemleri. Generic relation yapısını manuel handle eder.
    """
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
                    is_approved=True, # Otomatik onay (Production'da False yapılabilir)
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
    """
    Görüntülenme ve tıklanma sayılarını atomik olarak artırır.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        action_type = request.data.get('type')
        slug = request.data.get('slug')
        obj_id = request.data.get('id')
        today = timezone.now().date()
        
        try:
            # Üniversite ile ilgili aksiyonlar
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
            
            # Bölüm görüntüleme aksiyonu
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
# 3. TERCİH MOTORU (AKILLI FİLTRELEME & AI)
# =============================================================================

class TercihMotoruView(views.APIView):
    """
    Segmentli Algoritma Kullanan Profesyonel Tercih Motoru
    Derece öğrencileri (Rank 1-5000) için özel mantık içerir.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            ranking = int(request.data.get('student_ranking', 0))
            score_type = request.data.get('score_type', 'SAY')
            
            # Input Temizliği & Güvenlik
            raw_city = request.data.get('city_filter', [])
            raw_dept = request.data.get('department_filter', [])
            
            city_filter = [raw_city] if isinstance(raw_city, str) else raw_city
            dept_filter = [raw_dept] if isinstance(raw_dept, str) else raw_dept

        except (ValueError, TypeError):
            return Response({"error": "Geçersiz veri formatı."}, status=400)

        if ranking <= 0:
            return Response({"error": "Sıralama 0'dan büyük olmalıdır."}, status=400)

        # --- 1. SEGMENTLİ ARALIK BELİRLEME ---
        
        # Segment A: Derece (1 - 5.000)
        # 300k tavanı ile güvenli limanları kapsa
        if ranking < 5000:
            min_limit = 0
            max_limit = 300000 
        
        # Segment B: Başarılı (5.000 - 50.000)
        elif ranking < 50000:
            min_limit = int(ranking * 0.50)
            max_limit = int(ranking * 4.00)
            
        # Segment C: Orta (50.000 - 200.000)
        elif ranking < 200000:
            min_limit = int(ranking * 0.80)
            max_limit = int(ranking * 2.50) # Biraz daha genişletildi
            
        # Segment D: Alt (200.000+)
        else:
            min_limit = int(ranking * 0.90)
            max_limit = int(ranking * 2.00)

        # Sorguyu Başlat
        # OPTİMİZASYON: 'university__stats' eklendi
        programs = Department.objects.filter(
            score_type=score_type,
            ranking__range=(min_limit, max_limit)
        ).select_related('university', 'university__stats') 

        # --- 2. FİLTRELEME (Türkçe Karakter Destekli) ---
        if city_filter and len(city_filter) > 0:
            city_query = Q()
            for city in city_filter:
                term = str(city).strip()
                if not term: continue
                
                # 1. Ham arama
                city_query |= Q(university__city__icontains=term)
                
                # 2. ASCII/TR Varyasyonları
                replacements = {'İ': 'I', 'ı': 'I', 'Ş': 'S', 'ş': 's', 'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u', 'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c'}
                term_normalized = term
                for tr, en in replacements.items():
                    term_normalized = term_normalized.replace(tr, en)
                
                # Basit replace
                term_ascii = term.replace("i", "i").upper() 
                term_tr = term.replace("i", "İ").replace("ı", "I").upper()

                city_query |= Q(university__city__icontains=term_ascii)
                city_query |= Q(university__city__icontains=term_tr)
                city_query |= Q(university__city__icontains=term_normalized)

            programs = programs.filter(city_query)

        if dept_filter and len(dept_filter) > 0:
            dept_query = Q()
            for dept in dept_filter:
                d_term = str(dept).strip()
                if not d_term: continue
                dept_query |= Q(name__icontains=d_term)
                if 'i' in d_term:
                    dept_query |= Q(name__icontains=d_term.replace('i', 'İ'))
                    dept_query |= Q(name__icontains=d_term.replace('i', 'İ').upper())
            programs = programs.filter(dept_query)

        # --- 3. KATEGORİZASYON ---
        # FIX: Doğru serializer kullanıldı
        serialized_data = ProgramSuggestionSerializer(programs, many=True).data
        
        surprise = []
        ideal = []
        safe = []

        for item in serialized_data:
            prog_rank = item['ranking']
            if not prog_rank: continue
            
            # Segment A (Derece) için özel dağılım:
            if ranking < 5000:
                ideal_threshold = max(ranking * 1.5, 3000)
                if prog_rank <= ideal_threshold: 
                    ideal.append(item)
                else:
                    safe.append(item)
            else:
                # Standart Kullanıcılar İçin
                if prog_rank < ranking * 0.95: # Sürpriz
                    surprise.append(item)
                elif prog_rank > ranking * 1.15: # Güvenli
                    safe.append(item)
                else: # İdeal
                    ideal.append(item)

        return Response({
            "surprise_choices": sorted(surprise, key=lambda x: x['ranking'])[:50],
            "ideal_choices": sorted(ideal, key=lambda x: x['ranking'])[:50],
            "safe_choices": sorted(safe, key=lambda x: x['ranking'])[:50]
        })

class FilterView(views.APIView):
    """
    Tercih motoru autocomplete için filtre verilerini döner.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        cities = Department.objects.values_list('university__city', flat=True).distinct().order_by('university__city')
        departments = Department.objects.values_list('name', flat=True).distinct().order_by('name')

        return Response({
            "cities": sorted(list(set([c for c in cities if c]))),
            "departments": sorted(list(set([d for d in departments if d])))
        })
