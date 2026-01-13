import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University

def check_url():
    uni = University.objects.last()
    if not uni:
        print("No university")
        return
        
    print(f"Uni: {uni.name}")
    try:
        print(f"Cover Image Field: {uni.cover_image}")
        print(f"Cover Image URL: {uni.cover_image.url}")
    except Exception as e:
        print(f"Error accessing .url: {e}")

if __name__ == '__main__':
    check_url()
