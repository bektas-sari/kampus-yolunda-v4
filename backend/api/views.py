from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from django.utils import timezone
from rest_framework import viewsets, filters, status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import action
from rest_framework.views import APIView

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
    PreferenceRequestSerializer, ProgramSuggestionSerializer
)

# =============================================================================
# 1. VIEWSETS (Router ile çalışan modern yapılar)
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
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [AllowAny] 
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
# 2. ÖZEL VIEW'LAR (Router dışı, manuel işlemler)
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
                        if action_type == 'university_view': stats.page_views = F('page_views') + 1
                        elif action_type == 'website_click': stats.website_clicks = F('website_clicks') + 1
                        elif action_type == 'phone_click': stats.phone_clicks = F('phone_clicks') + 1
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
        return Response({"status": "invalid_action"}, status=200)

class TercihMotoruView(views.APIView):
    """
    Sınav sonucuna göre stratejik tercih yelpazesi sunan analiz motoru.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        siralama = request.query_params.get('siralama')
        puan_turu = request.query_params.get('puan_turu')

        if not siralama or not puan_turu:
            return Response({"error": "Sıralama ve puan türü gereklidir."}, status=400)

        try:
            siralama_int = int(siralama)
        except ValueError:
            return Response({"error": "Sıralama geçerli bir sayı olmalıdır."}, status=400)
        
        # Yelpaze: %30 yukarı (Hayal) ve %50 aşağı (Güvenli)
        min_rank = siralama_int * 0.7
        max_rank = siralama_int * 1.5

        queryset = Department.objects.filter(
            score_type=puan_turu,
            ranking__range=(min_rank, max_rank)
        ).select_related('university').order_by('ranking')

        serializer = DepartmentSerializer(queryset, many=True)
        
        categorized_data = []
        for item in serializer.data:
            rank = item.get('ranking')
            if rank:
                if rank < siralama_int * 0.9:
                    category = "HAYAL"
                elif rank <= siralama_int * 1.15:
                    category = "HEDEF"
                else:
                    category = "GÜVENLİ"
                item['category'] = category
                categorized_data.append(item)


class PreferenceEngineView(APIView):
    """
    Gelişmiş Tercih Motoru (Preference Engine)
    Öğrenci sıralamasına göre Garanti, İdeal ve Sürpriz programları kategorize eder.
    Post Request Bekler:
    {
        "student_ranking": 50000,
        "score_type": "SAY",
        "city_filter": ["ISTANBUL", "ANKARA"], (Opsiyonel)
        "department_filter": ["Bilgisayar", "Yazılım"] (Opsiyonel)
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PreferenceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        ranking = data['student_ranking']
        score_type = data['score_type']
        cities = data.get('city_filter', [])
        dept_keywords = data.get('department_filter', [])

        # 1. Geniş Kapsamlı Filtreleme (Veritabanı Seviyesi)
        # Algoritma Limitleri:
        # Surprise (Sürpriz): %50 - %80 (Örn: 50k ise -> 25k - 40k arası)
        # Ideal (İdeal): %80 - %125 (Örn: 50k ise -> 40k - 62.5k arası)
        # Safe (Garanti): %125 - %200 (Örn: 50k ise -> 62.5k - 100k arası)
        
        # DB'den çekerken en geniş aralığı (0.5x ile 2.0x arası) alıyoruz.
        min_limit = int(ranking * 0.50)
        max_limit = int(ranking * 2.00)

        queryset = Department.objects.filter(
            score_type=score_type,
            ranking__range=(min_limit, max_limit)
        ).select_related('university').order_by('ranking')

        # Şehir Filtresi
        if cities:
            queryset = queryset.filter(university__city__in=cities)

        # Bölüm Adı Filtresi (OR Mantığı: "Bilgisayar" VEYA "Yazılım")
        if dept_keywords:
            query = Q()
            for keyword in dept_keywords:
                query |= Q(name__icontains=keyword)
            queryset = queryset.filter(query)

        # 2. Python Seviyesinde Kategorizasyon
        # Veriyi çekip bellekte ayırıyoruz (Serialization maliyetini düşürmek için önce ayırabiliriz, 
        # ama serializer many=True daha pratik olabilir. Performans kriterine göre optimize edilebilir.)
        
        # Not: Queryset henüz execute edilmedi.
        
        safe_choices = []
        ideal_choices = []
        surprise_choices = []

        # Sınır Değerleri
        surprise_limit_top = int(ranking * 0.50)
        surprise_limit_bottom = int(ranking * 0.80)
        
        ideal_limit_top = int(ranking * 0.80) # (Burası çakışabilir, >= logic ile çözeriz)
        ideal_limit_bottom = int(ranking * 1.25)
        
        safe_limit_top = int(ranking * 1.25)
        safe_limit_bottom = int(ranking * 2.00)

        # Iterate edip ayıralım
        # Serializer'ı manuel list üzerinde kullanacağız
        
        all_departments = list(queryset) # DB Hit

        for dept in all_departments:
            r = dept.ranking
            if not r: continue
            
            # Mantık: 
            # Sürpriz: 0.5 * Rank <= r < 0.8 * Rank
            # İdeal:   0.8 * Rank <= r < 1.25 * Rank
            # Garanti: 1.25 * Rank <= r <= 2.0 * Rank
            
            if surprise_limit_top <= r < surprise_limit_bottom:
                surprise_choices.append(dept)
            elif ideal_limit_top <= r < ideal_limit_bottom:
                ideal_choices.append(dept)
            elif safe_limit_top <= r <= safe_limit_bottom:
                safe_choices.append(dept)

        # 3. Serialize ve Response Oluşturma
        return Response({
            "surprise_choices": ProgramSuggestionSerializer(surprise_choices, many=True).data,
            "ideal_choices": ProgramSuggestionSerializer(ideal_choices, many=True).data,
            "safe_choices": ProgramSuggestionSerializer(safe_choices, many=True).data,
            "meta": {
                "student_ranking": ranking,
                "counts": {
                    "surprise": len(surprise_choices),
                    "ideal": len(ideal_choices),
                    "safe": len(safe_choices)
                }
            }
        })
