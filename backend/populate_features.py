import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Feature

data = {
    "Wifi": "7/24 İnternet (Fiber)",
    "Library": "Çalışma Odaları",
    "Monitor": "Bilgisayar Laboratuvarı",
    "Printer": "Yazıcı / Fotokopi",
    "Coffee": "Sabah Kahvaltısı",
    "Utensils": "Akşam Yemeği",
    "Droplets": "7/24 Sıcak Su",
    "Fan": "Klima / İklimlendirme",
    "Bath": "Özel Banyo/WC",
    "SprayCan": "Oda Temizliği",
    "Shirt": "Ütü ve Çamaşır Odası",
    "ShieldCheck": "7/24 Güvenlik",
    "ScanFace": "Parmak İzi / Kartlı Giriş",
    "Bus": "Kampüse Servis",
    "Car": "Otopark",
    "MapPin": "Merkezi Konum",
    "Dumbbell": "Spor Salonu (Fitness)",
    "Waves": "Yüzme Havuzu",
    "Tv": "Sinema / TV Odası",
    "Gamepad2": "Oyun Salonu (PS/Bilardo)",
    "Trees": "Bahçe / Yeşil Alan",
    "Stethoscope": "Revir / Sağlık Hizmeti"
}

created_count = 0
updated_count = 0

print(f"Starting population of {len(data)} features...")

for icon, name in data.items():
    # We match by name to avoid duplicate amenities with different icons (or no icons)
    obj, created = Feature.objects.get_or_create(
        name=name,
        defaults={'icon': icon}
    )
    
    if created:
        print(f"Created: {name} ({icon})")
        created_count += 1
    else:
        # If it exists, we ensure the icon is set correctly if it was missing or different
        if obj.icon != icon:
            old_icon = obj.icon
            obj.icon = icon
            obj.save()
            print(f"Updated: {name} (Icon: {old_icon} -> {icon})")
            updated_count += 1
        else:
            print(f"Skipped: {name} (Already exists with correct icon)")

print("\n--------------------------------------------------")
print(f"Result: {created_count} created, {updated_count} updated.")
print("--------------------------------------------------")
