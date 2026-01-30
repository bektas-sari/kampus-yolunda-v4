import csv
import os
from django.core.management.base import BaseCommand
from api.models import University, Department
from django.conf import settings
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Load 2025 ÖSYM Data (Safe Update Mode - Preserves Logos)'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
        
        # --- KRİTİK DEĞİŞİKLİK: ARTIK ÜNİVERSİTELERİ SİLMİYORUZ! ---
        # University.objects.all().delete()  <-- BU SATIR TARİHE GÖMÜLDÜ.
        # Sadece Bölümleri temizliyoruz ki puanlar güncellensin.
        # (Üniversite sabit kalır, içindeki bölümler her yıl değişir)
        
        self.stdout.write(self.style.WARNING("⚠️ Bölümler güncelleniyor (Üniversite demirbaşları korunacak)..."))
        Department.objects.all().delete() # Akademik veriyi tazele, ama çatıyı (Üni) yıkma.

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

        with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            reader = csv.reader(f, delimiter=';')
            next(reader, None) 
            next(reader, None)

            # Önbellek: Veritabanını yormamak için mevcut üniversiteleri hafızaya alalım
            # Artık name -> object eşleşmesi yapıyoruz
            university_cache = {}
            
            # Veritabanındaki tüm üniversiteleri çekip cache'e atalım
            for uni in University.objects.all():
                university_cache[uni.name] = uni

            departments_to_create = [] 

            count = 0
            for row in reader:
                try:
                    if len(row) < 9: continue

                    prog_code = row[0].strip()
                    uni_type_raw = row[1].strip()
                    uni_name = row[2].strip()
                    faculty = row[3].strip()
                    dept_name = row[4].strip()
                    
                    if not prog_code or not uni_name: continue

                    # 1. Üniversite İşlemi (GÜVENLİ MOD)
                    if uni_name in university_cache:
                        university = university_cache[uni_name]
                    else:
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

                        uni_slug = slugify(uni_name)
                        university = University.objects.create(
                            name=uni_name,
                            slug=uni_slug,
                            city=city, 
                            uni_type=uni_type
                        )
                        university_cache[uni_name] = university

                    # 2. Bölüm Verisi
                    # Puan Türü Normalizasyonu
                    raw_score_type = row[5].strip()
                    score_mapping = {
                        "SÖZ": "SOZ",
                        "DİL": "DIL",
                        "SAY": "SAY",
                        "EA": "EA",
                        "TYT": "TYT"
                    }
                    score_type = score_mapping.get(raw_score_type, raw_score_type)

                    try: 
                        quota = int(row[6]) if row[6].isdigit() else 0
                    except: quota = 0
                    
                    try: 
                        # Index 8: En Küçük Puan
                        score_str = row[8].replace(',', '.')
                        if score_str == '--' or not score_str:
                             min_score = 0.0
                        else:
                             min_score = float(score_str)
                    except: min_score = 0.0

                    # Rank Tahmini
                    ranking = 0
                    if min_score > 150:
                        try:
                            # 560 puan -> 1. sıra, 300 puan -> 300k sıra
                            diff = 560 - min_score
                            ranking = int(diff * 2000)
                            if ranking < 1: ranking = 1
                        except: ranking = 999999
                    
                    # Language/Education Type placeholder defaults (not in CSV explicitly in standard columns used here yet)
                    language = ""
                    education_type = "Örgün"

                    departments_to_create.append(
                        Department(
                            university=university,
                            program_code=prog_code,
                            name=dept_name,
                            faculty=faculty,
                            score_type=score_type,
                            quota=quota,
                            base_score=min_score,
                            ranking=ranking,
                            language=language,
                            education_type=education_type,
                            # city field is on University model usually, but if needed on Department:
                            # city=university.city 
                        )
                    )
                    count += 1

                except Exception as e:
                    # self.stdout.write(self.style.ERROR(f"Hata oluştu: {e} - Satır: {row}"))
                    continue

            # 3. TOPLU KAYIT
            if departments_to_create:
                self.stdout.write("Bölümler güncelleniyor...")
                Department.objects.bulk_create(departments_to_create, batch_size=1000)

        self.stdout.write(self.style.SUCCESS(f"✅ GÜNCELLEME TAMAM: {count} bölüm yüklendi. Üniversite logolarına DOKUNULMADI."))