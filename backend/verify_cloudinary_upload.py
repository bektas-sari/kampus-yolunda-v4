import os
import django
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Dormitory, DormitoryImage

def verify_upload():
    print("--- Testing Cloudinary Upload ---")
    
    # Mock Cloudinary configs if not present just to check if code runs up to upload attempt
    # Warning: This will fail if no credentials are provided in env, which is expected.
    # We want to catch that error to confirm logic is trying to reach Cloudinary.
    
    try:
        # Create a valid 1x1 GIF image (smallest possible valid image)
        # 1x1 pixel transparent GIF
        file_content = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        file_name = 'test_cloud_pixel.gif'
        
        # Try to save a new DormitoryImage
        dorm = Dormitory.objects.first()
        if not dorm:
            print("No dormitory found to attach image to.")
            return

        print(f"Attaching image to Dorm: {dorm.name}")
        
        img = DormitoryImage(dormitory=dorm)
        img.image.save(file_name, ContentFile(file_content))
        img.save()
        
        print(f"Upload Successful! URL: {img.image.url}")
        
        # Cleanup if successful (optional)
        # img.delete() 
        
    except Exception as e:
        print(f"Upload Failed: {repr(e)}")

    # Debug Configs
    from django.conf import settings
    print("\n--- Settings Debug ---")
    conf = getattr(settings, 'CLOUDINARY_STORAGE', {})
    print(f"CLOUD_NAME set: {bool(conf.get('CLOUD_NAME'))}")
    print(f"API_KEY set: {bool(conf.get('API_KEY'))}")
    print(f"API_SECRET set: {bool(conf.get('API_SECRET'))}")
    try:
        print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
    except AttributeError:
        print("DEFAULT_FILE_STORAGE not set in settings.")
        
    try:
        print(f"STORAGES: {settings.STORAGES}")
    except AttributeError:
        print("STORAGES not set in settings.")

if __name__ == '__main__':
    verify_upload()
