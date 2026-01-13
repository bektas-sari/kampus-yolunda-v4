import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University
from api.serializers import UniversitySerializer
from api.views import UniversityDetailView

def verify_api():
    try:
        uni = University.objects.get(slug='bogazici-universitesi')
        serializer = UniversitySerializer(uni)
        data = serializer.data
        
        print(f"University: {data['name']}")
        print(f"Departments Count: {len(data['departments'])}")
        
        for dept in data['departments']:
            print(f"- {dept['name']} ({dept['faculty']})")
            
    except University.DoesNotExist:
        print("University 'bogazici-universitesi' not found.")

if __name__ == '__main__':
    verify_api()
