from django.contrib import admin
from django.utils.html import format_html
from .models import (
    University, Feature, CampusVenue, UniversityImage, 
    Department, Dormitory, DormitoryDistance, DormitoryImage, 
    StudentHouse, HouseImage, FavoriteStudentHouse, 
    FavoriteUniversity, FavoriteDormitory, Scholarship, News,
    UniversityStats, DepartmentStats, Lead, 
    StudentHouseConnection, Promotion, Review, CampusReel # YENİ MODEL EKLENDİ
)

# --- 1. YARDIMCI (INLINE) MODELLER ---

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
    fields = ('program_code', 'name', 'faculty', 'score_type', 'quota', 'base_score')
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

# --- YENİ EKLENEN REELS ADMIN ---
@admin.register(CampusReel)
class CampusReelAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'show_on_homepage', 'created_at')
    list_filter = ('show_on_homepage', 'university')
    search_fields = ('title', 'university__name')
    autocomplete_fields = ['university']
    list_editable = ('show_on_homepage',)
    
    # Özel form görünümü
    fields = (
        'title', 
        'university', 
        'embed_code', 
        'show_on_homepage'
    )

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'content_object', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'created_at')
    list_editable = ('is_approved',)
    search_fields = ('author_name', 'comment')
    readonly_fields = ('content_type', 'object_id')

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_preview')
    search_fields = ('name',)
    
    def icon_preview(self, obj):
        return format_html('<span>{} ({})</span>', obj.name, obj.icon)
    icon_preview.short_description = "İkon"

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'uni_type', 'is_promoted', 'student_count')
    list_editable = ('is_promoted',) 
    list_filter = ('is_promoted', 'city', 'uni_type')
    search_fields = ('name', 'slug', 'city') 
    prepopulated_fields = {'slug': ('name',)}
    
    inlines = [
        UniversityImageInline, 
        CampusVenueInline, 
        DepartmentInline, 
        DormitoryDistanceInline, 
        StudentHouseConnectionInline
    ]
    
    fields = (
        'name', 'slug', 'city', 'uni_type', 'is_promoted', 'logo', 'cover_image',
        'founded_year', 'student_count', 'academician_count', 'prof_count', 'doc_count', 'dr_count', 'education_language',
        'website', 'phone', 'email', 'address', 'map_location', 'video_url',
        'description', 'features', 'admin_user'
    )

@admin.register(CampusVenue)
class CampusVenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'venue_type', 'rating', 'is_sponsored')
    list_filter = ('venue_type', 'is_sponsored', 'university__city')
    search_fields = ('name', 'university__name')
    autocomplete_fields = ['university']

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('program_code', 'university', 'name', 'faculty', 'score_type', 'quota', 'base_score')
    list_filter = ('score_type', 'university__city', 'education_type', 'language')
    search_fields = ('name', 'program_code', 'university__name', 'faculty')
    autocomplete_fields = ['university']
    list_per_page = 50

@admin.register(Dormitory)
class DormitoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'dorm_type', 'price', 'is_promoted')
    list_editable = ('is_promoted',)
    list_filter = ('is_promoted', 'city', 'dorm_type')
    search_fields = ('name', 'district')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [DormitoryImageInline]
    filter_horizontal = ('features',)

@admin.register(StudentHouse)
class StudentHouseAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'district', 'price', 'is_promoted', 'created_at')
    list_editable = ('is_promoted',)
    list_filter = ('is_promoted', 'city', 'room_count', 'is_furnished')
    search_fields = ('title', 'description', 'district') 
    prepopulated_fields = {'slug': ('title',)}
    inlines = [HouseImageInline] 
    filter_horizontal = ('features',)
    
    fields = (
        'title', 'slug', 'price', 'is_promoted', 'cover_image',
        'city', 'district',
        'room_count', 'square_meters', 'is_furnished', 'features',
        'description', 'contact_phone'
    )

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'amount', 'deadline', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('title', 'provider')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    # ESKİ ALANLARI TEMİZLEDİK (embed_code, show_on_homepage GİTTİ)
    list_display = ('title', 'category', 'is_published', 'published_at')
    list_editable = ('is_published',) 
    list_filter = ('is_published', 'category', 'is_breaking')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}
    
    fields = (
        ('title', 'slug'),          
        ('category', 'author'),     
        'cover_image',
        'summary',                  
        'content',                  
        ('is_published', 'is_breaking', 'is_featured') 
    )

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('university', 'title', 'is_active')
    search_fields = ('university__name', 'title')
    list_filter = ('is_active',)

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'lead_type', 'university', 'created_at', 'is_read')
    list_filter = ('lead_type', 'is_read', 'created_at')
    readonly_fields = ('created_at', 'ip_address')

# --- SADECE OKUNABİLİR MODELLER ---

@admin.register(UniversityStats)
class UniversityStatsAdmin(admin.ModelAdmin):
    list_display = ('university', 'date', 'page_views')
    readonly_fields = ('university', 'date', 'page_views', 'search_appearances', 'website_clicks', 'phone_clicks')

@admin.register(DepartmentStats)
class DepartmentStatsAdmin(admin.ModelAdmin):
    list_display = ('department', 'date', 'page_views')
    readonly_fields = ('department', 'date', 'page_views')

# Vercel güncelleme tetikleyicisi 