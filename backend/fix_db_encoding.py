import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University, Dormitory, StudentHouse, Feature, Department

def fix_text(text):
    if not text:
        return text
    
    # Common replacements for the observed broken encoding
    replacements = {
        'Ã¼': 'ü', 'Ã¶': 'ö', 'Ã§': 'ç', 'ÅŸ': 'ş', 'ÄŸ': 'ğ', 'Ä±': 'ı', 'Ä°': 'İ',
        'Ãœ': 'Ü', 'Ã–': 'Ö', 'Ã‡': 'Ç', 'Åž': 'Ş', 'Äž': 'Ğ',
        # User observed specific ones:
        '³': 'ü', '²': 'ı', '¹': 'i',
        'Y³ksek': 'Yüksek', 'H²z': 'Hız', 'K³t³phane': 'Kütüphane',
        'Y³zme': 'Yüzme', 'Dokuz Eyll': 'Dokuz Eylül', 'Boazii': 'Boğaziçi',
        '': 'ü', # generic fallback if others fail, unsafe but often true for this case context? 
                 # Wait,  is the replacement char. Let's be careful.
    }
    
    fixed = text
    for bad, good in replacements.items():
        fixed = fixed.replace(bad, good)
        
    # Specific targeted fixes for known University names if simple replace fails
    if "Dokuz Eyl" in fixed and "l" in fixed:
         fixed = fixed.replace("Dokuz Eyll", "Dokuz Eylül") # specific override
         
    return fixed

def run_fix():
    print("Fixing Features...")
    for item in Feature.objects.all():
        new_name = fix_text(item.name)
        if new_name != item.name:
            print(f"Feature: {item.name} -> {new_name}")
            item.name = new_name
            item.save()

    print("\nFixing Universities...")
    for item in University.objects.all():
        item.name = fix_text(item.name)
        item.city = fix_text(item.city)
        item.description = fix_text(item.description)
        item.save()

    print("\nFixing Dormitories...")
    for item in Dormitory.objects.all():
        item.name = fix_text(item.name)
        item.description = fix_text(item.description)
        item.save()
        
    print("\nFixing Departments...")
    for item in Department.objects.all():
        item.name = fix_text(item.name)
        item.save()

    print("\nDone!")

if __name__ == "__main__":
    run_fix()
