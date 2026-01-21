from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    University, UniversityImage, Department, CampusVenue,
    Dormitory, DormitoryImage, DormitoryDistance,
    StudentHouse, HouseImage, Feature,
    FavoriteUniversity, FavoriteDormitory, FavoriteStudentHouse,
    Scholarship, News, Lead,
    StudentHouseConnection, Promotion, Review, CampusReel
)

# --- 1. TEMEL VE YARDIMCI SERIALIZERS ---

class ReviewSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%d %B %Y", read_only=True)
    target_name = serializers.SerializerMethodField()
    target_type = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'author_name', 'rating', 'comment', 'created_at', 'target_name', 'target_type']
    
    def get_target_name(self, obj):
        return str(obj.content_object)
    
    def get_target_type(self, obj):
        return obj.content_type.model


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Yorum oluşturmak için kullanılan serializer.
    'model_type' (örn: 'university') ve 'object_id' alır.
    """
    model_type = serializers.CharField(write_only=True)
    object_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Review
        fields = ['author_name', 'rating', 'comment', 'model_type', 'object_id']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'date_joined')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['name', 'icon']

class UniversityImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityImage
        fields = ['id', 'image']

class HouseImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseImage
        fields = ['id', 'image']

class DormitoryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DormitoryImage
        fields = ['id', 'image']

class CampusVenueSerializer(serializers.ModelSerializer):
    reviews = serializers.SerializerMethodField()
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = CampusVenue
        fields = [
            'id', 'name', 'venue_type', 'image', 'rating', 'distance', 
            'is_sponsored', 'discount_text', 'description', 'amenities', 
            'amenities_list', 'working_hours', 'reviews'
        ]
    
    def get_reviews(self, obj):
        reviews = Review.objects.filter(
            content_type__model='campusvenue',
            object_id=obj.id,
            is_approved=True
        ).order_by('-created_at')
        return ReviewSerializer(reviews, many=True).data

    def get_amenities_list(self, obj):
        if not obj.amenities: return []
        return [x.strip() for x in obj.amenities.split(',') if x.strip()]

# --- BÖLÜM SERIALIZER ---
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            'id', 'program_code', 'name', 'faculty', 
            'language', 'education_type', 'score_type', 'duration',
            'quota', 'school_rank_quota', 'base_score', 'ranking',
            'special_conditions', 'accreditation'
        ]

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = ['title', 'subtitle', 'description', 'image', 'button_text', 'button_link']

# --- 2. İLİŞKİSEL SERIALIZERS (Tablolar Arası Bağlar) ---

class DormitoryDistanceSerializer(serializers.ModelSerializer):
    """Yurt detayında görünen 'Yakın Üniversiteler' listesi için"""
    university_name = serializers.ReadOnlyField(source='university.name')
    university_slug = serializers.ReadOnlyField(source='university.slug')
    
    class Meta:
        model = DormitoryDistance
        fields = ['university_name', 'university_slug', 'distance_text']

# --- 3. ANA SERIALIZERS (API Endpointleri İçin) ---

# A) ÜNİVERSİTE LİSTESİ (Hafif Veri)
class UniversityListSerializer(serializers.ModelSerializer):
    city_display = serializers.CharField(source='get_city_display', read_only=True)
    logo_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    department_count = serializers.IntegerField(source='departments.count', read_only=True)

    class Meta:
        model = University
        fields = [
            'id', 'name', 'slug', 'city', 'city_display', 'uni_type', 
            'logo', 'logo_url', 'cover_image', 'cover_image_url',
            'department_count', 'is_promoted'
        ]

    def get_logo_url(self, obj):
        if obj.logo: return obj.logo.url
        return None

    def get_cover_image_url(self, obj):
        if obj.cover_image: return obj.cover_image.url
        return None


# B) ÜNİVERSİTE DETAYI (Tüm Veriler + Yurt/Ev Birleşimi)
class UniversityDetailSerializer(serializers.ModelSerializer):
    features = FeatureSerializer(many=True, read_only=True)
    gallery_images = UniversityImageSerializer(many=True, read_only=True)
    departments = DepartmentSerializer(many=True, read_only=True)
    venues = CampusVenueSerializer(many=True, read_only=True)
    promotion = PromotionSerializer(read_only=True)
    
    # ESKİ YURT LİSTESİ YERİNE ARTIK BU FONKSİYONU KULLANIYORUZ:
    dorm_connections = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    
    logo_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = [
            'id', 'name', 'slug', 'city', 'uni_type', 
            'founded_year', 'rector', 
            'student_count', 'academician_count', 
            'prof_count', 'doc_count', 'dr_count', 
            'education_language', 'video_url',
            'description', 'website', 'phone', 'email', 'address', 'map_location',
            'logo', 'logo_url', 'cover_image', 'cover_image_url',
            'features', 'gallery_images', 'departments', 'venues', 
            'features', 'gallery_images', 'departments', 'venues', 
            'dorm_connections', 'promotion', 'reviews' # reviews EKLENDİ
        ]
    
    def get_reviews(self, obj):
        # Sadece Üniversitesiye ait onaylı yorumları getir
        reviews = Review.objects.filter(
            content_type__model='university', 
            object_id=obj.id,
            is_approved=True
        ).order_by('-created_at')
        return ReviewSerializer(reviews, many=True).data

    def get_logo_url(self, obj):
        if obj.logo: return obj.logo.url
        return None

    def get_cover_image_url(self, obj):
        if obj.cover_image: return obj.cover_image.url
        return None

    def get_dorm_connections(self, obj):
        """
        Bu fonksiyon hem yakın YURTLARI hem de yakın EVLERİ birleştirip döndürür.
        Frontend tek bir liste alır, 'type' alanına göre filtreler.
        """
        combined_list = []

        # 1. YURTLARI ÇEK
        dorm_distances = DormitoryDistance.objects.filter(university=obj).select_related('dormitory')
        for dist in dorm_distances:
            dorm = dist.dormitory
            combined_list.append({
                'type': 'YURT', 
                'name': dorm.name,
                'slug': dorm.slug,
                'city': dorm.get_city_display(),
                'district': dorm.district,
                'price': dorm.price,
                'cover_image': dorm.cover_image.url if dorm.cover_image else None,
                'distance_text': dist.distance_text, 
                'is_partner': dorm.is_promoted,
                'sub_tag': f"{dorm.dorm_type} YURDU" 
            })

        # 2. ÖĞRENCİ EVLERİNİ ÇEK
        house_connections = StudentHouseConnection.objects.filter(university=obj).select_related('house')
        for conn in house_connections:
            house = conn.house
            combined_list.append({
                'type': 'EV', 
                'name': house.title,
                'slug': house.slug,
                'city': house.get_city_display(),
                'district': house.district,
                'price': house.price,
                'cover_image': house.cover_image.url if house.cover_image else None,
                'distance_text': conn.distance_text, 
                'is_partner': conn.is_promoted,
                'sub_tag': f"{house.room_count} | {house.square_meters} m²"
            })
        
        return combined_list

# Uyumluluk İçin
UniversitySerializer = UniversityDetailSerializer


# C) YURT SERIALIZER
class DormitorySerializer(serializers.ModelSerializer):
    features = FeatureSerializer(many=True, read_only=True)
    gallery_images = DormitoryImageSerializer(many=True, read_only=True)
    nearby_universities = DormitoryDistanceSerializer(source='dormitorydistance_set', many=True, read_only=True)
    
    class Meta:
        model = Dormitory
        fields = [
            'id', 'name', 'slug', 'dorm_type', 'city', 'district', 'address',
            'price', 'capacity', 'description', 
            'phone', 'email', 'website',
            'logo', 'cover_image',
            'is_promoted', 'features', 'gallery_images', 'nearby_universities'
        ]

# D) ÖĞRENCİ EVI SERIALIZER
class StudentHouseSerializer(serializers.ModelSerializer):
    features = FeatureSerializer(many=True, read_only=True)
    gallery_images = HouseImageSerializer(many=True, read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentHouse
        fields = '__all__'

    def get_cover_image_url(self, obj):
        if obj.cover_image: return obj.cover_image.url
        return None

# E) DİĞERLERİ
class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = '__all__'

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'

# --- FAVORİLER SERIALIZERS ---
class FavoriteStudentHouseSerializer(serializers.ModelSerializer):
    student_house = StudentHouseSerializer(read_only=True)
    class Meta:
        model = FavoriteStudentHouse
        fields = ('id', 'student_house', 'created_at')

class FavoriteUniversitySerializer(serializers.ModelSerializer):
    university = UniversityListSerializer(read_only=True) 
    class Meta:
        model = FavoriteUniversity
        fields = ('id', 'university', 'created_at')

class FavoriteDormitorySerializer(serializers.ModelSerializer):
    dormitory = DormitorySerializer(read_only=True)
    class Meta:
        model = FavoriteDormitory
        fields = ('id', 'dormitory', 'created_at')

# --- LEAD (BAŞVURU/FORM) SERIALIZER ---
class LeadSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%d.%m.%Y %H:%M", read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'

class CampusReelSerializer(serializers.ModelSerializer):
    university_name = serializers.ReadOnlyField(source='university.name')
    university_slug = serializers.ReadOnlyField(source='university.slug')

    class Meta:
        model = CampusReel
        fields = ['id', 'title', 'embed_code', 'university_name', 'university_slug', 'show_on_homepage']