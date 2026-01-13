import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University, Department

def populate_departments():
    try:
        uni = University.objects.get(slug='bogazici-universitesi')
        
        departments = [
            {
                'name': 'Bilgisayar Mühendisliği',
                'faculty': 'Mühendislik Fakültesi',
                'language': 'İngilizce',
                'education_type': 'Örgün',
                'quota': 80,
                'base_score': 545.2,
                'ranking': 300
            },
             {
                'name': 'Endüstri Mühendisliği',
                'faculty': 'Mühendislik Fakültesi',
                'language': 'İngilizce',
                'education_type': 'Örgün',
                'quota': 60,
                'base_score': 530.5,
                'ranking': 800
            },
             {
                'name': 'Psikoloji',
                'faculty': 'Fen-Edebiyat Fakültesi',
                'language': 'İngilizce',
                'education_type': 'Örgün',
                'quota': 90,
                'base_score': 510.0,
                'ranking': 1500
            }
        ]

        for dept_data in departments:
            dept, created = Department.objects.get_or_create(
                university=uni,
                name=dept_data['name'],
                defaults=dept_data
            )
            if created:
                print(f"Created Department: {dept.name}")
            else:
                print(f"Department already exists: {dept.name}")

    except University.DoesNotExist:
        print("University 'bogazici-universitesi' not found.")

if __name__ == '__main__':
    populate_departments()
