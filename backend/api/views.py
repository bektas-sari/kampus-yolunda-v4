from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from django.utils import timezone
from rest_framework import viewsets, filters, status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.contenttypes.models import ContentType

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
    CampusReelSerializer
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
    # --- DÜZELTME BURADA: Router için queryset zorunludur ---
    queryset = StudentHouse.objects.all() 
    # --------------------------------------------------------
    serializer_class = StudentHouseSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'room_count', 'is_furnished']
    search_fields = ['title', 'district', 'description']
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Override edilmiş queryset
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

            elif action_type in ['house_view', 'house_contact_click']:
                return Response({"status": "tracked house action"}, status=200)

        except Exception as e:
            return Response({"status": "error", "detail": str(e)}, status=400)

        return Response({"status": "invalid_action"}, status=200)