import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University, Dormitory, StudentHouse

def populate_similar_data():
    # 1. Başka bir İstanbul Üniversitesi (ITU)
    itu, created = University.objects.get_or_create(
        slug='itu',
        defaults={
            'name': 'İstanbul Teknik Üniversitesi',
            'city': 'ISTANBUL',
            'uni_type': 'DEVLET',
            'founded_year': 1773
        }
    )
    if created: print("Created ITU")

    # 2. Başka bir İstanbul Yurdu
    dorm_b, created = Dormitory.objects.get_or_create(
        slug='test-yurt-b',
        defaults={
            'name': 'Test Yurt B (Kadıköy)',
            'city': 'ISTANBUL',
            'district': 'Kadıköy',
            'dorm_type': 'KARMA',
            'price': 12000
        }
    )
    if created: print("Created Test Yurt B")

    # 3. Başka bir İzmir Evi
    house_b, created = StudentHouse.objects.get_or_create(
        slug='izmir-house-2',
        defaults={
            'title': 'Buca 3+1 Daire',
            'city': 'IZMIR',
            'district': 'Buca',
            'room_count': '3+1',
            'price': 18000,
            'is_furnished': True
        }
    )
    if created: print("Created Izmir House 2")

if __name__ == '__main__':
    populate_similar_data()
