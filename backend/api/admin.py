from django.contrib import admin
from django.utils.html import format_html
from .models import (
    University, Feature, CampusVenue, UniversityImage, 
    Department, Dormitory, DormitoryDistance, DormitoryImage, 
    StudentHouse, HouseImage, FavoriteStudentHouse, 
    FavoriteUniversity, FavoriteDormitory, Scholarship, News,
    UniversityStats, DepartmentStats, Lead, 
    StudentHouseConnection, Promotion, Review # YENİ EKLENDİ
)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'rating', 'created_at', 'is_approved', 'content_object')
    list_filter = ('is_approved', 'rating', 'created_at')
    search_fields = ('author_name', 'comment')


# --- INLINE (İÇ İÇE) MODELLER ---

class UniversityImageInline(admin.TabularInline):
    model = UniversityImage
    extra = 0
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
    readonly_fields = ('program_code', 'name', 'faculty', 'score_type', 'quota', 'base_score')
    show_change_link = True
    can_delete = False
    classes = ['collapse']

class DormitoryDistanceInline(admin.TabularInline):
    model = DormitoryDistance
    extra = 0
    autocomplete_fields = ['dormitory']
    verbose_name = "Mesafe Kaydı"
    verbose_name_plural = "Üniversiteye Yakın Yurtlar"

# --- YENİ EKLENEN KISIM: ÜNİVERSİTE İÇİNDE EV SEÇİMİ ---
class StudentHouseConnectionInline(admin.TabularInline):
    model = StudentHouseConnection
    extra = 1
    autocomplete_fields = ['house'] # Ev ismini arayarak bulmanı sağlar
    verbose_name = "Yakındaki Kiralık Ev"
    verbose_name_plural = "Yakındaki Konaklama Yerleri (Öğrenci Evleri)"
    fields = ('house', 'distance_text', 'is_promoted')

class DormitoryImageInline(admin.TabularInline):
    model = DormitoryImage
    extra = 0
    fields = ['image']
    verbose_name = "Galeri Resmi"
    verbose_name_plural = "Yurt Galerisi"

class HouseImageInline(admin.TabularInline):
    model = HouseImage
    extra = 0
    fields = ['image']
    verbose_name = "Galeri Resmi"
    verbose_name_plural = "Ev Galerisi (Çoklu Fotoğraf)"

# --- ANA ADMIN MODELLERİ ---

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_preview')
    search_fields = ('name',)
    
    def icon_preview(self, obj):
        return format_html('<span>{} ({})</span>', obj.name, obj.icon)
    icon_preview.short_description = "İkon"

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'uni_type', 'is_promoted', 'student_count', 'updated_at')
    list_editable = ('is_promoted',) 
    list_filter = ('is_promoted', 'city', 'uni_type')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    
    # StudentHouseConnectionInline BURAYA EKLENDİ
    inlines = [UniversityImageInline, CampusVenueInline, DepartmentInline, DormitoryDistanceInline, StudentHouseConnectionInline]
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('name', 'slug', 'city', 'uni_type', 'is_promoted', 'logo', 'cover_image')
        }),
        ('İstatistikler', {
            'fields': ('founded_year', 'student_count', 'academician_count', 'prof_count', 'doc_count', 'dr_count', 'education_language')
        }),
        ('İletişim & Medya', {
            'fields': ('website', 'phone', 'email', 'address', 'map_location', 'video_url')
        }),
        ('Açıklama & Özellikler', {
            'fields': ('description', 'features')
        }),
        ('Yönetici Atama', {
            'fields': ('admin_user',)
        }),
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
    list_display = ('name', 'city', 'dorm_type', 'price', 'is_promoted', 'cover_preview')
    list_editable = ('is_promoted',)
    list_filter = ('is_promoted', 'city', 'dorm_type')
    search_fields = ('name', 'district')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [DormitoryImageInline]

    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="height: 40px; border-radius:4px;" />', obj.cover_image.url)
        return "-"

@admin.register(StudentHouse)
class StudentHouseAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'district', 'price', 'is_promoted', 'created_at')
    list_editable = ('is_promoted',)
    list_filter = ('is_promoted', 'city', 'room_count', 'is_furnished')
    # search_fields olması ÇOK ÖNEMLİ, yoksa Üniversite sayfasında ev arayamazsın.
    search_fields = ('title', 'description', 'district') 
    prepopulated_fields = {'slug': ('title',)}
    
    inlines = [HouseImageInline] 
    
    fieldsets = (
        ('İlan Detayları', {
            'fields': ('title', 'slug', 'price', 'is_promoted', 'cover_image')
        }),
        ('Konum', {
            # University ve distance_to_uni buradan kaldırıldı (Artık Üniversite sayfasından ekleniyor)
            'fields': ('city', 'district') 
        }),
        ('Özellikler', {
            'fields': ('room_count', 'square_meters', 'is_furnished', 'features')
        }),
        ('Açıklama & İletişim', {
            'fields': ('description', 'contact_phone')
        }),
    )

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'amount', 'deadline', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('title', 'provider')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_published', 'published_at')
    list_filter = ('is_published', 'category')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('university', 'title', 'is_active')
    search_fields = ('university__name', 'title')

# --- DİĞERLERİ ---
admin.site.register(Lead)
admin.site.register(UniversityStats)