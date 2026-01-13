import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Dormitory, StudentHouse, Feature
from django.utils.text import slugify

def populate():
    # Create Features
    wifi, _ = Feature.objects.get_or_create(name='WiFi', icon_code='wifi')
    security, _ = Feature.objects.get_or_create(name='7/24 Güvenlik', icon_code='security')
    
    # Create Dormitory
    dorm, created = Dormitory.objects.get_or_create(
        name='Test Yurt A',
        defaults={
            'slug': 'test-yurt-a',
            'dorm_type': 'KARMA',
            'city': 'ISTANBUL',
            'district': 'Besiktas',
            'address': 'Test Adresi No:1',
            'price': 15000,
            'capacity': 100,
            'description': 'Harika bir test yurdu.',
            'phone': '05551234567'
        }
    )
    if created:
        print(f"Created Dormitory: {dorm.name}")
        dorm.features.add(wifi, security)
        dorm.save()
    else:
        print(f"Dormitory already exists: {dorm.name}")

    # Create Student House
    house, created = StudentHouse.objects.get_or_create(
        title='Test Öğrenci Evi 2+1',
        defaults={
            'slug': 'test-ogrenci-evi-2-1',
            'city': 'IZMIR',
            'district': 'Buca',
            'room_count': '2+1',
            'price': 12000,
            'is_furnished': True,
            'description': 'Mükemmel öğrenci evi.',
            'contact_phone': '05559876543'
        }
    )
    if created:
        print(f"Created House: {house.title}")
        house.features.add(wifi)
        house.save()
    else:
        print(f"House already exists: {house.title}")

if __name__ == '__main__':
    populate()
