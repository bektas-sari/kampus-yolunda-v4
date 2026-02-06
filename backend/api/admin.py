from django.contrib import admin
from .models import (
    University, UniversityStats, Department, 
    Feature, CampusVenue, UniversityImage,
    Dormitory, StudentHouse, Scholarship, News
    # Hata veren diğer modelleri şimdilik çağırmıyoruz
)

# --- SADECE TEMEL AYARLAR ---

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    # Sadece veritabanında kesin var olan alanları listeliyoruz
    list_display = ('name', 'city', 'uni_type')
    search_fields = ('name',)
    
    # Detay sayfasına girince HİÇBİR EKSTRA KUTU (Inline) açmıyoruz.
    # Böylece "Hatalı alan", "Hatalı ilişki" riski sıfırlanıyor.
    inlines = []

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'program_code')
    search_fields = ('name', 'program_code')

@admin.register(UniversityStats)
class UniversityStatsAdmin(admin.ModelAdmin):
    list_display = ('university', 'academic_score', 'general_score')

# Diğer modellerin basit kayıtları
admin.site.register(Feature)
admin.site.register(CampusVenue)
admin.site.register(UniversityImage)
admin.site.register(Dormitory)
admin.site.register(StudentHouse)
admin.site.register(Scholarship)
admin.site.register(News)