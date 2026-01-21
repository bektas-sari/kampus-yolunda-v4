from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Django baslarken bizim ozel admin dosyamizi zorla yukle
        try:
            import api.admin_fix
        except ImportError:
            pass