import os
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from PIL import Image, ImageOps
from .models import University, UniversityImage, Dormitory, DormitoryImage, StudentHouse, HouseImage

# --- AYARLAR ---
MAX_WIDTH = 1200  # Maksimum genişlik (px)
QUALITY = 80      # Sıkıştırma kalitesi (%80 idealdir)

def optimize_image(image_field):
    """
    Görseli bulur, boyutlandırır ve sıkıştırarak üzerine yazar.
    NOT: Cloudinary/S3 kullanılıyorsa bu işlem atlanır.
    """
    if not image_field:
        return

    # Cloudinary veya S3 kullanılıyorsa optimizasyon yapma (Onlar halleder)
    # Ayrıca .path erişimi hata verebilir.
    try:
        # Check if using remote storage
        if hasattr(image_field.storage, 'bucket_name'): # S3
             return
        if 'cloudinary' in str(type(image_field.storage)).lower(): # Cloudinary
             return
             
        file_path = image_field.path
        
        # Dosya gerçekten var mı kontrol et
        if not os.path.exists(file_path):
            return

        with Image.open(file_path) as img:
            # 1. Ön Kontrol: Zaten optimize edilmiş mi?
            # (Genişliği uygunsa ve işlemden geçtiyse tekrar yorma)
            if img.width <= MAX_WIDTH:
                # Yine de EXIF bilgisini temizlemek için kaydedebiliriz
                pass

            # 2. Oryantasyon (Telefon yan tutulduysa düzelt)
            img = ImageOps.exif_transpose(img)

            # 3. Format Dönüşümü (RGBA ise JPEG desteklemez, RGB yap)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # 4. Yeniden Boyutlandırma
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / float(img.width)
                height = int((float(img.height) * float(ratio)))
                img = img.resize((MAX_WIDTH, height), Image.LANCZOS)
            
            # 5. Kaydet (Orijinalin üzerine yaz)
            img.save(file_path, 'JPEG', quality=QUALITY, optimize=True)

    except Exception as e:
        # Cloudinary kullanıyorsak path hatası verebilir, yoksay.
        # print(f"⚠️ Görsel optimizasyon hatası: {e}") 
        pass

# --- TETİKLEYİCİLER ---

@receiver(post_save, sender=University)
def university_image_optimizer(sender, instance, created, **kwargs):
    """Üniversite eklendiğinde veya güncellendiğinde çalışır"""
    # REMOTE STORAGE İÇİN DEVRE DIŞI BIRAKILDI
    pass
    # if instance.logo:
    #     optimize_image(instance.logo)
    # if instance.cover_image:
    #     optimize_image(instance.cover_image)

@receiver(post_save, sender=UniversityImage)
def gallery_image_optimizer(sender, instance, created, **kwargs):
    """Galeriye fotoğraf eklendiğinde çalışır"""
    pass
    # if instance.image:
    #     optimize_image(instance.image)

@receiver(post_delete, sender=University)
@receiver(post_delete, sender=UniversityImage)
def delete_image_file(sender, instance, **kwargs):
    """
    Veritabanından kayıt silindiğinde,
    fiziksel dosya da silinsin (Çöp birikmesin).
    Remote storage (Cloudinary) için gerekmez, ama local için kalsın.
    """
    try:
        if sender == University:
            if instance.logo and os.path.isfile(instance.logo.path):
                os.remove(instance.logo.path)
            if instance.cover_image and os.path.isfile(instance.cover_image.path):
                os.remove(instance.cover_image.path)
                
        elif sender == UniversityImage:
            if instance.image and os.path.isfile(instance.image.path):
                os.remove(instance.image.path)
    except Exception:
        pass # Cloudinary/S3 ise path yoktur, hata yoksayılır

# --- YENİ EKLENECEK SİNYALLER (Dosyanın en altına) ---

# YURT FOTOĞRAFLARI İÇİN
@receiver(post_save, sender=Dormitory)
def dormitory_cover_optimizer(sender, instance, **kwargs):
    pass

@receiver(post_save, sender=DormitoryImage)
def dormitory_gallery_optimizer(sender, instance, **kwargs):
    pass

# EV FOTOĞRAFLARI İÇİN
@receiver(post_save, sender=StudentHouse)
def house_cover_optimizer(sender, instance, **kwargs):
    pass

@receiver(post_save, sender=HouseImage)
def house_gallery_optimizer(sender, instance, **kwargs):
    pass

# SİLİNME İŞLEMİ (Temizlik)
@receiver(post_delete, sender=Dormitory)
@receiver(post_delete, sender=DormitoryImage)
@receiver(post_delete, sender=StudentHouse)
@receiver(post_delete, sender=HouseImage)
def delete_accommodation_images(sender, instance, **kwargs):
    try:
        # Kapak fotoğrafı kontrolü
        if hasattr(instance, 'cover_image') and instance.cover_image:
            if os.path.isfile(instance.cover_image.path):
                os.remove(instance.cover_image.path)
                
        # Galeri fotoğrafı kontrolü
        if hasattr(instance, 'image') and instance.image:
            if os.path.isfile(instance.image.path):
                os.remove(instance.image.path)
    except Exception:
        pass