from django.shortcuts import render, get_object_or_404
from django.db.models import F, Q
from django.utils import timezone
from rest_framework import generics, permissions, status, views, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

# MODELLER
from .models import (
    University, Department, Dormitory, StudentHouse, 
    Scholarship, News, Lead,
    FavoriteUniversity, FavoriteDormitory, FavoriteStudentHouse,
    UniversityStats, DepartmentStats
)

# SERIALIZERS
from .serializers import (
    UserSerializer,
    UniversityListSerializer, UniversityDetailSerializer,
    DepartmentSerializer,
    DormitorySerializer,
    StudentHouseSerializer,
    ScholarshipSerializer,
    NewsSerializer,
    LeadSerializer,
    FavoriteUniversitySerializer, FavoriteDormitorySerializer, FavoriteStudentHouseSerializer
)

# --- KULLANICI İŞLEMLERİ (AUTH) ---

class RegisterView(generics.CreateAPIView):
    queryset = UserSerializer.Meta.model.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user

# --- ÜNİVERSİTELER ---

class UniversityList(generics.ListAPIView):
    serializer_class = UniversityListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'uni_type', 'is_promoted']
    search_fields = ['name', 'city']
    permission_classes = [AllowAny]

    # DÜZELTME BURADA: Queryset'i statik tanımlamak yerine fonksiyon içine aldık.
    # Böylece migration yaparken veritabanında bu sütun var mı diye kontrol etmez.
    def get_queryset(self):
        return University.objects.all().order_by('-is_promoted', '-student_count')

class UniversityDetail(generics.RetrieveAPIView):
    queryset = University.objects.all()
    serializer_class = UniversityDetailSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

# --- BÖLÜMLER ---

class DepartmentList(generics.ListAPIView):
    queryset = Department.objects.all().select_related('university')
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['score_type', 'education_type', 'university__city']
    search_fields = ['name', 'program_code', 'university__name']
    permission_classes = [AllowAny]

# --- YURTLAR ---

class DormitoryList(generics.ListAPIView):
    queryset = Dormitory.objects.all()
    serializer_class = DormitorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['city', 'dorm_type', 'is_promoted']
    search_fields = ['name', 'district']
    permission_classes = [AllowAny]

class DormitoryDetail(generics.RetrieveAPIView):
    queryset = Dormitory.objects.all()
    serializer_class = DormitorySerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

# --- ÖĞRENCİ EVLERİ ---

class StudentHouseList(generics.ListAPIView):
    serializer_class = StudentHouseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'room_count', 'is_furnished']
    search_fields = ['title', 'district', 'description']
    permission_classes = [AllowAny]

    # DÜZELTME BURADA: Sıralama ve filtrelemeyi tek bir yerde güvenli şekilde yapıyoruz.
    def get_queryset(self):
        # Önce temel sorgu ve sıralama
        queryset = StudentHouse.objects.all().order_by('-is_promoted', '-created_at')
        
        # Ekstra Fiyat Filtreleri
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        return queryset

class StudentHouseDetail(generics.RetrieveAPIView):
    queryset = StudentHouse.objects.all()
    serializer_class = StudentHouseSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

# --- BURSLAR & HABERLER ---

class ScholarshipList(generics.ListAPIView):
    queryset = Scholarship.objects.filter(is_active=True).order_by('deadline')
    serializer_class = ScholarshipSerializer
    permission_classes = [AllowAny]

class ScholarshipDetail(generics.RetrieveAPIView):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

class NewsList(generics.ListAPIView):
    queryset = News.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]

class BreakingNewsList(generics.ListAPIView):
    queryset = News.objects.filter(is_published=True, is_breaking=True).order_by('-published_at')
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]

class NewsDetail(generics.RetrieveAPIView):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

# --- ANALİTİK (GÖRÜNTÜLENME TAKİBİ) ---

class TrackActivityView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        action_type = request.data.get('type')
        slug = request.data.get('slug')
        obj_id = request.data.get('id')
        today = timezone.now().date()

        try:
            # 1. ÜNİVERSİTE İŞLEMLERİ
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

            # 2. BÖLÜM İŞLEMLERİ
            elif action_type == 'dept_view':
                if obj_id:
                    dept = Department.objects.filter(id=obj_id).first()
                    if dept:
                        stats, _ = DepartmentStats.objects.get_or_create(department=dept, date=today)
                        stats.page_views = F('page_views') + 1
                        stats.save()
                        return Response({"status": "tracked"}, status=200)

            # 3. EV/İLAN İŞLEMLERİ
            elif action_type in ['house_view', 'house_contact_click']:
                return Response({"status": "tracked house action"}, status=200)

        except Exception as e:
            return Response({"status": "error", "detail": str(e)}, status=400)

        return Response({"status": "invalid_action"}, status=200)

# --- LEAD (FORM BAŞVURUSU) ---

class CreateLeadView(generics.CreateAPIView):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [AllowAny]

# --- FAVORİLER ---

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

# --- YORUM OLUŞTURMA (REVIEW) ---
from django.contrib.contenttypes.models import ContentType
from .models import Review
from .serializers import ReviewCreateSerializer

class CreateReviewView(views.APIView):
    permission_classes = [AllowAny] # İsteğe göre IsAuthenticated yapılabilir

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            model_type = serializer.validated_data.pop('model_type')
            object_id = serializer.validated_data.pop('object_id')
            
            # ContentType bulma (university, dormitory, campusvenue)
            try:
                # Basit eşleştirme: 'university' -> University model
                # 'dormitory' -> Dormitory model
                # 'venue' -> CampusVenue model
                
                # Model adını düzeltme (frontendden gelen ile backenddeki app_label eşleşmeli)
                # Ancak burada app_label="api" ve model="university" şeklinde arayacağız.
                
                ct = None
                if model_type == 'university':
                    ct = ContentType.objects.get(app_label='api', model='university')
                elif model_type == 'dormitory':
                    ct = ContentType.objects.get(app_label='api', model='dormitory')
                elif model_type == 'venue':
                    ct = ContentType.objects.get(app_label='api', model='campusvenue')
                
                if not ct:
                    return Response({"error": "Geçersiz model tipi"}, status=status.HTTP_400_BAD_REQUEST)

                # Yorumu Kaydet
                Review.objects.create(
                    content_type=ct,
                    object_id=object_id,
                    author_name=serializer.validated_data['author_name'],
                    rating=serializer.validated_data['rating'],
                    comment=serializer.validated_data['comment'],
                    is_approved=True, # DÜZELTME: Anında yayınlanması için True yapıldı
                    user=request.user if request.user.is_authenticated else None
                )
                return Response({"message": "Yorumunuz başarıyla yayınlandı."}, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)