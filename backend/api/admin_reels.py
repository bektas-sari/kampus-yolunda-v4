from django.contrib import admin
from .models import CampusReel

# Bu dosya admin.py lanetini asmak icin olusturuldu.
print("--- REELS ADMIN DOSYASI YUKLENIYOR ---") # Loglarda gormek icin

class CampusReelAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'show_on_homepage', 'created_at')
    list_filter = ('show_on_homepage', 'university')
    search_fields = ('title', 'university__name')
    autocomplete_fields = ['university']
    list_editable = ('show_on_homepage',)
    fields = ('title', 'university', 'embed_code', 'show_on_homepage')

admin.site.register(CampusReel, CampusReelAdmin)