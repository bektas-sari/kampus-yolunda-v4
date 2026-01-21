from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        # Uygulama baslarken ozel admin dosyamizi zorla import et
        import api.admin_reels
        