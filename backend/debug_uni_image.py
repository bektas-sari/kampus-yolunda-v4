import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University
from api.serializers import UniversitySerializer

def debug_uni_api():
    # Get the latest university (assuming user added Dokuz Eylül last)
    uni = University.objects.last()
    if not uni:
        print("No university found.")
        return

    print(f"Checking University: {uni.name} (slug: {uni.slug})")
    
    serializer = UniversitySerializer(uni)
    data = serializer.data
    
    # Check Cover Image
    print(f"Cover Image (Raw): {data.get('cover_image')}")
    
    # Check Gallery Images
    gallery = data.get('gallery_images', [])
    print(f"Gallery Images Count: {len(gallery)}")
    for img in gallery:
        print(f" - Image: {img.get('image')}")

if __name__ == '__main__':
    debug_uni_api()
