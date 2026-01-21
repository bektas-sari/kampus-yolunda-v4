from django.contrib import admin
from .models import CampusReel

@admin.register(CampusReel)
class CampusReelAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'show_on_homepage', 'created_at')
    search_fields = ('title', 'university__name')
    autocomplete_fields = ['university']