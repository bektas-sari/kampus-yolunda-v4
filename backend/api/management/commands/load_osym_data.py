import csv
import os
from django.core.management.base import BaseCommand
from api.models import University, Department
from django.conf import settings
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Load 2025 ÖSYM Data (DEBUG MODE)'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"Dosya bulunamadı: {file_path}"))
            return

        self.stdout.write(self.style.WARNING("⚠️ VERİ YÜKLEME BAŞLIYOR... (Önceki Bölümler Siliniyor)"))
        Department.objects.all().delete()

        # ŞEHİR EŞLEŞTİRME (Manuel Mapping)
        CITY_MAPPING = {
            "ADANA": "ADANA", "ADIYAMAN": "ADIYAMAN", "AFYON": "AFYONKARAHISAR", "AĞRI": "AGRI",
            "AKSARAY": "AKSARAY", "AMASYA": "AMASYA", "ANKARA": "ANKARA", "ANTALYA": "ANTALYA",
            "ARDAHAN": "ARDAHAN", "ARTVİN": "ARTVIN", "AYDIN": "AYDIN", "BALIKESİR": "BALIKESIR", 
            "BİLECİK": "BILECIK", "BİNGÖL": "BINGOL", "BİTLİS": "BITLIS", "BOLU": "BOLU", 
            "BURDUR": "BURDUR", "BURSA": "BURSA", "ÇANAKKALE": "CANAKKALE", "ÇANKIRI": "CANKIRI", 
            "ÇORUM": "CORUM", "DENİZLİ": "DENIZLI", "DİYARBAKIR": "DIYARBAKIR", "DÜZCE": "DUZCE", 
            "EDİRNE": "EDIRNE", "ELAZIĞ": "ELAZIG", "ERZİNCAN": "ERZINCAN", "ERZURUM": "ERZURUM", 
            "ESKİŞEHİR": "ESKISEHIR", "GAZİANTEP": "GAZIANTEP", "GİRESUN": "GIRESUN", 
            "GÜMÜŞHANE": "GUMUSHANE", "HAKKARİ": "HAKKARI", "HATAY": "HATAY", "IĞDIR": "IGDIR", 
            "ISPARTA": "ISPARTA", "İSTANBUL": "ISTANBUL", "İZMİR": "IZMIR", 
            "KAHRAMANMARAŞ": "KAHRAMANMARAS", "KARABÜK": "KARABUK", "KARAMAN": "KARAMAN", "KARS": "KARS", 
            "KASTAMONU": "KASTAMONU", "KAYSERİ": "KAYSERI", "KIRIKKALE": "KIRIKKALE", 
            "KIRKLARELİ": "KIRKLARELI", "KIRŞEHİR": "KIRSEHIR", "KİLİS": "KILIS", "KOCAELİ": "KOCAELI", 
            "KONYA": "KONYA", "KÜTAHYA": "KUTAHYA", "MALATYA": "MALATYA", "MANİSA": "MANISA", 
            "MARDİN": "MARDIN", "MERSİN": "MERSIN", "MUĞLA": "MUGLA", "MUŞ": "MUS", 
            "NEVŞEHİR": "NEVSEHIR", "NİĞDE": "NIGDE", "ORDU": "ORDU", "OSMANİYE": "OSMANIYE", 
            "RİZE": "RIZE", "SAKARYA": "SAKARYA", "SAMSUN": "SAMSUN", "SİİRT": "SIIRT", 
            "SİNOP": "SINOP", "SİVAS": "SIVAS", "ŞANLIURFA": "SANLIURFA", "ŞIRNAK": "SIRNAK", 
            "TEKİRDAĞ": "TEKIRDAG", "TOKAT": "TOKAT", "TRABZON": "TRABZON", "TUNCELİ": "TUNCELI", 
            "UŞAK": "USAK", "VAN": "VAN", "YALOVA": "YALOVA", "YOZGAT": "YOZGAT", "ZONGULDAK": "Zonguldak"
        }

        def estimate_rank(score, score_type):
            if not score or score < 150: return 999999
            # 2024 Yaklaşık Verileri
            if score_type == 'SAY':
                if score > 530: return int((560 - score) * 50)
                if score > 450: return int(2000 + (530 - score) * 400)
                if score > 350: return int(40000 + (450 - score) * 1200)
                return int(160000 + (350 - score) * 3000)
            elif score_type == 'EA':
                if score > 480: return int((500 - score) * 100)
                if score > 400: return int(5000 + (480 - score) * 1000)
                return int(85000 + (400 - score) * 3000)
            elif score_type == 'SOZ':
                if score > 450: return int((500 - score) * 150)
                return int(10000 + (450 - score) * 2000)
            elif score_type == 'DIL':
                if score > 450: return int((500 - score) * 100)
                return int(5000 + (450 - score) * 1000)
            return 999999

        # CSV OKUMA
        with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            lines = f.readlines()
            
            # Başlık satırını bul
            start_index = 0
            for i, line in enumerate(lines):
                if "Program Kodu" in line and "Üniversite Adı" in line:
                    start_index = i
                    break
            
            # Başlıkları temizle (BOM ve boşluklardan arındır)
            raw_header = lines[start_index].strip().split(';')
            header = [h.strip().replace('\ufeff', '') for h in raw_header]
            
            self.stdout.write(f"📋 BULUNAN BAŞLIKLAR: {header}")

            # İndeksleri bul (İsimle eşleşmezse manuel indeks kullanacağız)
            try:
                idx_code = header.index("Program Kodu")
                idx_uni = header.index("Üniversite Adı")
                idx_dept = header.index("Program Adı")
                idx_fac = header.index("Fakülte/Yüksekokul Adı")
                idx_score_type = header.index("Puan Türü")
                idx_quota = header.index("Kontenjan")
                idx_score = header.index("En Küçük Puan")
                idx_type = header.index("Üniversite Türü")
            except ValueError as e:
                self.stdout.write(self.style.ERROR(f"❌ Kritik Sütun Bulunamadı: {e}. CSV Formatını kontrol et."))
                return

            university_cache = {uni.name: uni for uni in University.objects.all()}
            departments_to_create = []
            count = 0
            
            # Veri satırlarını işle
            for line_idx, line in enumerate(lines[start_index+1:], start=1):
                row = line.strip().split(';')
                if len(row) < len(header): continue

                try:
                    # 1. TEMEL VERİLERİ AL
                    prog_code = row[idx_code].strip()
                    uni_name = row[idx_uni].strip()
                    dept_name = row[idx_dept].strip()
                    
                    if not prog_code or not uni_name: continue

                    # 2. ÜNİVERSİTEYİ BUL VEYA YARAT
                    if uni_name in university_cache:
                        university = university_cache[uni_name]
                    else:
                        city = "ISTANBUL"
                        uni_upper = uni_name.upper()
                        # Şehir Tahmini
                        for k, v in CITY_MAPPING.items():
                            if k in uni_upper:
                                city = v
                                break
                        
                        uni_type = 'DEVLET'
                        if 'VAKIF' in row[idx_type].upper(): uni_type = 'VAKIF'
                        elif 'KIBRIS' in row[idx_type].upper(): uni_type = 'KIBRIS'

                        university = University.objects.create(
                            name=uni_name,
                            slug=slugify(uni_name),
                            city=city,
                            uni_type=uni_type
                        )
                        university_cache[uni_name] = university

                    # 3. PUAN VE KOTA AYRIŞTIRMA (KRİTİK BÖLÜM)
                    # Puan: "350,12345" -> 350.12345
                    raw_score = row[idx_score].strip()
                    if raw_score == '--' or raw_score == '':
                        base_score = 0.0
                    else:
                        base_score = float(raw_score.replace(',', '.'))

                    try: quota = int(row[idx_quota])
                    except: quota = 0

                    score_type = row[idx_score_type].strip()
                    if score_type == "SÖZ": score_type = "SOZ"
                    if score_type == "DİL": score_type = "DIL"

                    # 4. SIRALAMA HESAPLA
                    ranking = estimate_rank(base_score, score_type)

                    # --- DEBUG LOG (İLK 5 SATIR İÇİN) ---
                    if count < 5:
                        print(f"✅ TEST OKUMA: {uni_name} | {dept_name} | Puan: {base_score} | Rank: {ranking}")

                    # 5. ZENGİN ÖZELLİKLER
                    is_english = "İngilizce" in dept_name or "English" in dept_name
                    language = "İngilizce" if is_english else "Türkçe"
                    
                    scholarship_rate = 0
                    if "Burslu" in dept_name: scholarship_rate = 100
                    elif "%50" in dept_name: scholarship_rate = 50
                    elif "%25" in dept_name: scholarship_rate = 25

                    # Özel Kontenjan (Basit Kontrol)
                    special_quotas = {}
                    # CSV kolon indeksleri kayabileceği için şimdilik boş geçiyoruz, 
                    # önce temel veriyi kurtaralım.

                    departments_to_create.append(
                        Department(
                            university=university,
                            program_code=prog_code,
                            name=dept_name,
                            faculty=row[idx_fac].strip(),
                            score_type=score_type,
                            quota=quota,
                            base_score=base_score,
                            ranking=ranking,
                            language=language,
                            is_english=is_english,
                            scholarship_rate=scholarship_rate,
                            special_quotas=special_quotas
                        )
                    )
                    count += 1

                except Exception as e:
                    # Hatalı satırları atla ama logla
                    # print(f"Hata satır {line_idx}: {e}")
                    continue

            if departments_to_create:
                self.stdout.write(f"💾 {len(departments_to_create)} Bölüm veritabanına yazılıyor...")
                Department.objects.bulk_create(departments_to_create, batch_size=2000)

        self.stdout.write(self.style.SUCCESS(f"✅ OPERASYON BAŞARILI: Toplam {count} bölüm yüklendi."))