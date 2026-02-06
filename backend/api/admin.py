from django.contrib import admin
from .models import (
    University, UniversityStats, Department, 
    Feature, CampusVenue, UniversityImage,
    Dormitory, StudentHouse, Scholarship, News
)

# --- 1. ÜNİVERSİTE YÖNETİMİ (VERİLERİ GÖSTEREN MOD) ---

class UniversityStatsInline(admin.StackedInline):
    model = UniversityStats
    can_delete = False
    verbose_name_plural = 'Kalite Puanları (TÜMA)'
    fk_name = 'university'
    # Hata vermemesi için sadece kesin var olan alanları çağırıyoruz
    fields = ('source', 'general_score', 'academic_score', 'campus_score')
    extra = 0

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    # Liste Görünümü
    list_display = ('name', 'city', 'uni_type', 'is_promoted')
    list_filter = ('city', 'uni_type')
    search_fields = ('name',)

    # DETAY SAYFASI: İşte verileri geri getiren kısım burası!
    # Alanları açıkça belirtiyoruz ki Django gizlemesin.
    fields = (
        ('name', 'slug'),
        ('city', 'uni_type', 'founded_year'),
        ('rector', 'website', 'email', 'phone'),
        'description',  # <-- "Hakkında" yazısı burada görünecek
        'video_url', 
        'map_location',
        ('student_count', 'academician_count'),
        'logo', 'cover_image'
    )

    # İNLINE'lar:
    # DepartmentInline'ı (Bölümleri) bilerek eklemedim çünkü o sistemi çökertiyor.
    # Puanları (Stats) ekledim.
    inlines = [UniversityStatsInline]

# --- 2. BÖLÜM YÖNETİMİ (AYRI MENÜDEN) ---
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    # Bölümleri üniversite detayında değil, sol menüdeki "Departments" kısmından yöneteceksiniz.
    list_display = ('name', 'university', 'program_code', 'base_score')
    search_fields = ('name', 'program_code', 'university__name')
    list_per_page = 20  # Sayfalama (Hız için)

# --- 3. DİĞER MODELLER ---
@admin.register(UniversityStats)
class UniversityStatsAdmin(admin.ModelAdmin):
    list_display = ('university', 'source')

admin.site.register(Feature)
admin.site.register(CampusVenue)
admin.site.register(UniversityImage)
admin.site.register(Dormitory)
admin.site.register(StudentHouse)
admin.site.register(Scholarship)
admin.site.register(News)