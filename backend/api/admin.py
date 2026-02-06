from django.contrib import admin
from django.utils.html import format_html
from .models import (
    University, UniversityStats, Department, 
    Feature, CampusVenue, UniversityImage,
    Dormitory, StudentHouse, Scholarship, News,
    Lead, Promotion, Review, CampusReel, # Eksik importlar eklendi
    DormitoryDistance, StudentHouseConnection, # Eksik importlar eklendi
    DormitoryImage, HouseImage # Eksik importlar eklendi
)

# --- 1. YARDIMCI (INLINE) MODELLER ---

class UniversityStatsInline(admin.StackedInline):
    model = UniversityStats
    can_delete = False
    verbose_name_plural = 'Kalite Puanları (TÜMA)'
    fk_name = 'university'
    # DÜZELTME: 'general_score' modelinizde YOKTU, kaldırdım.
    # Modelinizdeki gerçek alanları ekledim.
    fields = (
        ('source', 'academic_score', 'campus_score'),
        ('social_score', 'career_score', 'tech_score', 'city_score')
    )
    extra = 0

class UniversityImageInline(admin.TabularInline):
    model = UniversityImage
    extra = 1
    fields = ['image']
    verbose_name = "Galeri Resmi"
    verbose_name_plural = "Üniversite Galerisi"

class CampusVenueInline(admin.TabularInline):
    model = CampusVenue
    extra = 0
    fields = ('name', 'venue_type', 'rating', 'distance', 'is_sponsored', 'image')

class DepartmentInline(admin.TabularInline):
    model = Department
    extra = 0
    fields = ('program_code', 'name', 'faculty', 'score_type', 'base_score')
    show_change_link = True
    classes = ['collapse'] 

class DormitoryDistanceInline(admin.TabularInline):
    model = DormitoryDistance
    extra = 0
    autocomplete_fields = ['dormitory']
    verbose_name = "Mesafe Kaydı"
    verbose_name_plural = "Üniversiteye Yakın Yurtlar"

class StudentHouseConnectionInline(admin.TabularInline):
    model = StudentHouseConnection
    extra = 1
    autocomplete_fields = ['house'] 
    verbose_name = "Yakındaki Kiralık Ev"
    verbose_name_plural = "Yakındaki Konaklama Yerleri (Öğrenci Evleri)"
    fields = ('house', 'distance_text', 'is_promoted')

class DormitoryImageInline(admin.TabularInline):
    model = DormitoryImage
    extra = 1
    fields = ['image']
    verbose_name = "Galeri Resmi"
    verbose_name_plural = "Yurt Galerisi"

class HouseImageInline(admin.TabularInline):
    model = HouseImage
    extra = 1
    fields = ['image']
    verbose_name = "Galeri Resmi"
    verbose_name_plural = "Ev Galerisi"

# --- 2. ANA ADMIN MODELLERİ ---

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'uni_type', 'is_promoted', 'student_count')
    list_filter = ('city', 'uni_type', 'is_promoted')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

    # DETAY SAYFASI DÜZENİ (Modelinizdeki alanlarla birebir eşleşti)
    fields = (
        ('name', 'slug'),
        ('city', 'uni_type', 'founded_year'),
        ('is_promoted', 'admin_user'), # admin_user modelde vardı, buraya ekledim
        ('rector', 'technopark'),      # technopark modelde vardı, buraya ekledim
        ('website', 'email', 'phone'),
        'description',
        'address',
        'video_url', 
        'map_location',
        ('student_count', 'student_count_label'),       # Etiket ve Sayı yan yana
        ('academician_count', 'academic_staff_label'),  # Etiket ve Sayı yan yana
        ('prof_count', 'doc_count', 'dr_count'),
        'education_language',
        ('logo', 'cover_image'),
        'features'
    )

    # INLINE (İÇ İÇE) TABLOLAR
    inlines = [
        UniversityStatsInline,  # Artık hata vermeyecek (general_score kalktı)
        UniversityImageInline,
        CampusVenueInline,
        # DepartmentInline,     # Performans için kapalı (Çok fazla bölüm var)
        DormitoryDistanceInline,
        StudentHouseConnectionInline
    ]

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'program_code', 'base_score', 'quota')
    list_filter = ('score_type', 'university__city', 'education_type')
    search_fields = ('name', 'program_code', 'university__name')
    autocomplete_fields = ['university']
    list_per_page = 20 # Sayfa çökmesin diye sayfalama

@admin.register(UniversityStats)
class UniversityStatsAdmin(admin.ModelAdmin):
    # DÜZELTME: general_score burada da kaldırıldı.
    list_display = ('university', 'academic_score', 'campus_score', 'source')

# --- 3. DİĞER TÜM MODELLERİN KAYDI ---

@admin.register(CampusVenue)
class CampusVenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'venue_type', 'rating')
    list_filter = ('venue_type',)
    search_fields = ('name', 'university__name')

@admin.register(Dormitory)
class DormitoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'dorm_type', 'price', 'is_promoted')
    list_filter = ('city', 'dorm_type')
    search_fields = ('name',)
    inlines = [DormitoryImageInline]

@admin.register(StudentHouse)
class StudentHouseAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'price', 'room_count', 'is_promoted')
    list_filter = ('city', 'room_count')
    search_fields = ('title',)
    inlines = [HouseImageInline]

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'amount', 'deadline', 'is_active')

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_published', 'published_at')
    list_filter = ('category', 'is_published')

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'lead_type', 'university', 'created_at')
    list_filter = ('lead_type',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'content_object', 'rating', 'is_approved')
    list_filter = ('is_approved', 'rating')

@admin.register(CampusReel)
class CampusReelAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'show_on_homepage')

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'is_active')

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon')

# Basit Kayıtlar
# admin.site.register() gerek kalmadı, hepsi yukarıda @admin.register ile kapsandı.