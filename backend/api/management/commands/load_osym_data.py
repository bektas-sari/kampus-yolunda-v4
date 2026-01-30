import csv
import os
from django.core.management.base import BaseCommand
from api.models import University, Department
from django.conf import settings
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Load 2025 ÖSYM Data from osym_data.csv (Turbo/Bulk Mode)'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
        
        self.stdout.write(self.style.WARNING("⚠️ Eski veriler temizleniyor (Sıfır Kurulum)..."))
        Department.objects.all().delete()
        University.objects.all().delete()

        CITY_MAPPING = {
            "ADANA": "ADANA", "ADIYAMAN": "ADIYAMAN", "AFYON": "AFYONKARAHISAR", "AĞRI": "AGRI",
            "AKSARAY": "AKSARAY", "AMASYA": "AMASYA", "ANKARA": "ANKARA", "ANTALYA": "ANTALYA",
            "ARDAHAN": "ARDAHAN", "ARTVİN": "ARTVIN", "AYDIN": "AYDIN", "BALIKESİR": "BALIKESIR", 
            "BANDIRMA": "BALIKESIR", "BARTIN": "BARTIN", "BATMAN": "BATMAN", "BAYBURT": "BAYBURT", 
            "BİLECİK": "BILECIK", "BİNGÖL": "BINGOL", "BİTLİS": "BITLIS", "BOLU": "BOLU", 
            "BURDUR": "BURDUR", "BURSA": "BURSA", "ÇANAKKALE": "CANAKKALE", "ÇANKIRI": "CANKIRI", 
            "ÇORUM": "CORUM", "DENİZLİ": "DENIZLI", "DİYARBAKIR": "DIYARBAKIR", "DÜZCE": "DUZCE", 
            "EDİRNE": "EDIRNE", "ELAZIĞ": "ELAZIG", "ERZİNCAN": "ERZINCAN", "ERZURUM": "ERZURUM", 
            "ESKİŞEHİR": "ESKISEHIR", "GAZİANTEP": "GAZIANTEP", "GİRESUN": "GIRESUN", 
            "GÜMÜŞHANE": "GUMUSHANE", "HAKKARİ": "HAKKARI", "HATAY": "HATAY", "İSKENDERUN": "HATAY", 
            "IĞDIR": "IGDIR", "ISPARTA": "ISPARTA", "İSTANBUL": "ISTANBUL", "İZMİR": "IZMIR", 
            "KAHRAMANMARAŞ": "KAHRAMANMARAS", "KARABÜK": "KARABUK", "KARAMAN": "KARAMAN", "KARS": "KARS", 
            "KASTAMONU": "KASTAMONU", "KAYSERİ": "KAYSERI", "KIRIKKALE": "KIRIKKALE", 
            "KIRKLARELİ": "KIRKLARELI", "KIRŞEHİR": "KIRSEHIR", "KİLİS": "KILIS", "KOCAELİ": "KOCAELI", 
            "GEBZE": "KOCAELI", "KONYA": "KONYA", "KÜTAHYA": "KUTAHYA", "MALATYA": "MALATYA", 
            "MANİSA": "MANISA", "MARDİN": "MARDIN", "MERSİN": "MERSIN", "MUĞLA": "MUGLA", 
            "MUŞ": "MUS", "NEVŞEHİR": "NEVSEHIR", "NİĞDE": "NIGDE", "ORDU": "ORDU", 
            "OSMANİYE": "OSMANIYE", "RİZE": "RIZE", "SAKARYA": "SAKARYA", "SAMSUN": "SAMSUN", 
            "SİİRT": "SIIRT", "SİNOP": "SINOP", "SİVAS": "SIVAS", "ŞANLIURFA": "SANLIURFA", 
            "ŞIRNAK": "SIRNAK", "TEKİRDAĞ": "TEKIRDAG", "TOKAT": "TOKAT", "TRABZON": "TRABZON", 
            "TUNCELİ": "TUNCELI", "UŞAK": "USAK", "VAN": "VAN", "YALOVA": "YALOVA", 
            "YOZGAT": "YOZGAT", "ZONGULDAK": "ZONGULDAK", "KIBRIS": "KIBRIS"
        }

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"Dosya bulunamadı: {file_path}"))
            return

        # 'errors=replace' ile bozuk karakterleri yoksayıyoruz (Encoding hatasını önler)
        with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            reader = csv.reader(f, delimiter=';')
            next(reader, None) 
            next(reader, None)

            # --- OPTİMİZASYON: ÜNİVERSİTE ÖNBELLEĞİ ---
            # Her satırda DB'ye sormamak için hafızada tutuyoruz
            university_cache = {} 
            departments_to_create = [] # Toplu kayıt listesi

            count = 0
            for row in reader:
                try:
                    if len(row) < 9: continue

                    prog_code = row[0].strip()
                    uni_type_raw = row[1].strip()
                    uni_name = row[2].strip()
                    faculty = row[3].strip()
                    dept_name = row[4].strip()
                    score_type = row[5].strip()
                    quota_str = row[6].strip()
                    min_score_str = row[8].strip()

                    if not prog_code or not uni_name: continue

                    # 1. Üniversite İşlemi (Cache Kontrolü)
                    if uni_name not in university_cache:
                        # Şehir Bulma
                        city = "ISTANBUL"
                        uni_upper = uni_name.upper()
                        
                        found_city = False
                        if "(" in uni_upper:
                            potential = uni_upper.split("(")[-1].replace(")", "").strip()
                            for k, v in CITY_MAPPING.items():
                                if k in potential:
                                    city = v
                                    found_city = True
                                    break
                        if not found_city:
                            for k, v in CITY_MAPPING.items():
                                if k in uni_upper:
                                    city = v
                                    break

                        # Tür
                        uni_type = 'DEVLET'
                        if 'VAKIF' in uni_type_raw.upper(): uni_type = 'VAKIF'
                        elif 'KIBRIS' in uni_type_raw.upper(): uni_type = 'KIBRIS'
                        elif 'YABANCI' in uni_type_raw.upper(): uni_type = 'YABANCI'

                        # DB'ye Yaz (Sadece Üni için tek tek yazılır, sayısı azdır)
                        uni_slug = slugify(uni_name)
                        university, _ = University.objects.get_or_create(
                            name=uni_name,
                            defaults={
                                'slug': uni_slug,
                                'city': city, 
                                'uni_type': uni_type
                            }
                        )
                        university_cache[uni_name] = university
                    
                    # Cache'den al
                    university = university_cache[uni_name]

                    # 2. Veri Dönüşümleri
                    try: quota = int(quota_str)
                    except: quota = 0
                    
                    try: 
                        min_score = float(min_score_str.replace(',', '.'))
                        if min_score < 100: min_score = 0
                    except: min_score = 0.0

                    # Rank Tahmini
                    ranking = 0
                    if min_score > 100:
                        ranking = int((560 - min_score) * 2000) 
                        if ranking < 1: ranking = 1

                    # 3. LİSTEYE EKLE (DB'ye Yazma!)
                    departments_to_create.append(
                        Department(
                            university=university,
                            program_code=prog_code,
                            name=dept_name,
                            faculty=faculty,
                            score_type=score_type,
                            quota=quota,
                            base_score=min_score,
                            ranking=ranking
                        )
                    )
                    count += 1
                except Exception as e:
                    continue

            # 4. TOPLU KAYIT (BULK CREATE) - İŞTE HIZ BURADA
            if departments_to_create:
                self.stdout.write("Veritabanına toplu yazılıyor (Bu işlem hızlı sürecek)...")
                # 1000'erli paketler halinde kaydet
                Department.objects.bulk_create(departments_to_create, batch_size=1000)

        self.stdout.write(self.style.SUCCESS(f"✅ İŞLEM TAMAM: {count} bölüm şimşek hızında yüklendi!"))