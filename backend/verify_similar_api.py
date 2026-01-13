import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University, Dormitory, StudentHouse
from api.serializers import UniversitySerializer, DormitorySerializer, StudentHouseSerializer

def verify_similar():
    print("--- Verifying Universities ---")
    bogazici = University.objects.get(slug='bogazici-universitesi')
    serializer = UniversitySerializer(bogazici)
    print(f"Current: {bogazici.name}")
    print(f"Similar Count: {len(serializer.data['similar'])}")
    for item in serializer.data['similar']:
        print(f" - {item['name']} ({item['city']})")

    print("\n--- Verifying Dormitories ---")
    dorm_a = Dormitory.objects.filter(city='ISTANBUL').first()
    serializer = DormitorySerializer(dorm_a)
    print(f"Current: {dorm_a.name}")
    print(f"Similar Count: {len(serializer.data['similar'])}")
    for item in serializer.data['similar']:
        print(f" - {item['name']} ({item['city']})")

    print("\n--- Verifying Student Houses ---")
    house_a = StudentHouse.objects.filter(city='IZMIR').first()
    serializer = StudentHouseSerializer(house_a)
    print(f"Current: {house_a.title}")
    # Fix: Ensure we are accessing the correct key 'title' or 'name' based on the serializer
    similar_data = serializer.data['similar']
    print(f"Similar Count: {len(similar_data)}")
    for item in similar_data:
        print(f" - {item.get('title', item.get('name'))} ({item['city']})")

if __name__ == '__main__':
    verify_similar()
