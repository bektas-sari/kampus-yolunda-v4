from django.contrib import admin
# Sadece CampusReel'i çekiyoruz, diğerleri beklesin.
from .models import CampusReel 

# --- SADECE TEST İÇİN TEK MODEL ---
class CampusReelAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'show_on_homepage', 'created_at')
    list_filter = ('show_on_homepage', 'university')
    search_fields = ('title', 'university__name')
    list_editable = ('show_on_homepage',)
    fields = ('title', 'university', 'embed_code', 'show_on_homepage')

admin.site.register(CampusReel, CampusReelAdmin)