from django.contrib import admin
from .models import (
    University, UniversityStats, Department, 
    Feature, CampusVenue, UniversityImage,
    Dormitory, StudentHouse, Scholarship, News
)

# --- 1. SADELEŞTİRİLMİŞ ÜNİVERSİTE YÖNETİMİ ---
@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    # Sadece en temel, hata vermesi imkansız alanlar
    list_display = ('name', 'city', 'uni_type')
    search_fields = ('name',)
    
    # KESİN ÇÖZÜM: Inline'ların hepsini kapattık.
    # Sayfa artık çökmeyecek. 
    inlines = [] 

# --- 2. DİĞER MODELLER (Hata veren satırlar temizlendi) ---

@admin.register(UniversityStats)
class UniversityStatsAdmin(admin.ModelAdmin):
    # HATA VEREN 'general_score' alanını kaldırdım.
    # Sadece 'university' ve 'source' gösteriyoruz, bunlar kesin var.
    list_display = ('university', 'source') 

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'program_code')
    search_fields = ('name', 'program_code')

# --- 3. DİĞER BASİT KAYITLAR ---
admin.site.register(Feature)
admin.site.register(CampusVenue)
admin.site.register(UniversityImage)
admin.site.register(Dormitory)
admin.site.register(StudentHouse)
admin.site.register(Scholarship)
admin.site.register(News)