import csv
import os
from django.core.management.base import BaseCommand
from api.models import University, Department
from django.conf import settings
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Load 2025 ÖSYM Data with Rich Features (Safe Update)'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'osym_data.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"Dosya bulunamadı: {file_path}"))
            return

        self.stdout.write(self.style.WARNING("⚠️ Bölümler güncelleniyor (Üniversite demirbaşları korunacak)..."))
        
        # Sadece Bölümleri temizle, Üniversiteler kalsın
        Department.objects.all().delete()

        CITY_MAPPING = {
            "ADANA": "ADANA", "ADIYAMAN": "ADIYAMAN", "AFYON": "AFYONKARAHISAR", "AĞRI": "AGRI",
            "AKSARAY": "AKSARAY", "AMASYA": "AMASYA", "ANKARA": "ANKARA", "ANTALYA": "ANTALYA",
            "İSTANBUL": "ISTANBUL", "İZMİR": "IZMIR", "BURSA": "BURSA", "ESKİŞEHİR": "ESKISEHIR",
            # Diğer iller eklenebilir
        }

        # Rank Tahmin Fonksiyonu (2024 Verilerine Göre)
        def estimate_rank(score, score_type):
            if not score or score < 150: return 999999
            if score_type == 'SAY':
                if score > 530: return (560 - score) * 50
                if score > 450: return 2000 + (530 - score) * 400
                if score > 350: return 40000 + (450 - score) * 1200
                return 160000 + (350 - score) * 3000
            elif score_type == 'EA':
                if score > 500: return (560 - score) * 80
                if score > 400: return 5000 + (500 - score) * 800
                if score > 300: return 90000 + (400 - score) * 2500
                return 350000 + (300 - score) * 4000
            elif score_type == 'SOZ':
                if score > 450: return (560 - score) * 100
                if score > 350: return 10000 + (450 - score) * 1000
                return 110000 + (350 - score) * 5000
            elif score_type == 'DIL':
                if score > 450: return (560 - score) * 100
                if score > 350: return 10000 + (450 - score) * 500
                return 60000 + (350 - score) * 1000
            return 999999

        with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            lines = f.readlines()
            start_index = 0
            for i, line in enumerate(lines):
                if "Program Kodu" in line:
                    start_index = i
                    break
            
            header_line = lines[start_index].strip().replace('\n', '').split(';')
            data_lines = lines[start_index+1:]
            reader = csv.DictReader(data_lines, fieldnames=header_line, delimiter=';')

            # Cache
            university_cache = {uni.name: uni for uni in University.objects.all()}
            departments_to_create = []
            count = 0

            for row in reader:
                try:
                    prog_code = row.get('Program Kodu', '').strip()
                    uni_name = row.get('Üniversite Adı', '').strip()
                    dept_name = row.get('Program Adı', '').strip()
                    if not prog_code or not uni_name: continue

                    # 1. Üniversite
                    if uni_name in university_cache:
                        university = university_cache[uni_name]
                    else:
                        city = "ISTANBUL"
                        uni_upper = uni_name.upper()
                        for k, v in CITY_MAPPING.items():
                            if k in uni_upper:
                                city = v
                                break
                        
                        uni_type = 'DEVLET'
                        if 'VAKIF' in row.get('Üniversite Türü', '').upper(): uni_type = 'VAKIF'
                        elif 'KIBRIS' in row.get('Üniversite Türü', '').upper(): uni_type = 'KIBRIS'

                        university = University.objects.create(
                            name=uni_name,
                            slug=slugify(uni_name),
                            city=city,
                            uni_type=uni_type
                        )
                        university_cache[uni_name] = university

                    # 2. Veri Temizliği
                    raw_score = row.get('En Küçük Puan', '').replace(',', '.')
                    try: base_score = float(raw_score) if raw_score and raw_score != '--' else 0.0
                    except: base_score = 0.0

                    try: quota = int(row.get('Kontenjan', '0'))
                    except: quota = 0

                    score_type = row.get('Puan Türü', 'SAY').strip()
                    if score_type == "SÖZ": score_type = "SOZ"
                    if score_type == "DİL": score_type = "DIL"

                    # 3. Zengin Özellik Çıkarımı (Feature Extraction)
                    is_english = "İngilizce" in dept_name or "English" in dept_name
                    language = "İngilizce" if is_english else "Türkçe"
                    
                    scholarship_rate = 0
                    if "Burslu" in dept_name: scholarship_rate = 100
                    elif "%50" in dept_name: scholarship_rate = 50
                    elif "%25" in dept_name: scholarship_rate = 25
                    
                    # 4. Özel Kontenjanları JSON'a Paketle (CSV'deki kolon indekslerine dikkat etmeliyiz)
                    # DictReader kullandığımız için kolon başlıklarına göre alacağız.
                    # Ancak CSV başlıkları bazen boş veya isimsiz olabilir (Unnamed).
                    # Bu durumda row içindeki değerlere manuel erişim gerekebilir ama 
                    # DictReader ile isimler üzerinden gitmek daha güvenli.
                    
                    special_quotas = {}
                    
                    # CSV'de 4 adet özel kontenjan grubu var. İsimleri genellikle Unnamed olabilir.
                    # Bu nedenle, manuel bir mapping yapma şansımız yoksa, en azından var olanları alalım.
                    # Eğer sütun adları CSV'de tam ise: "Kontenjan.1", "En Küçük Puan.1" gibi.
                    
                    # Okul Birincisi (Genelde ilk grup)
                    if row.get('Kontenjan.1') and row.get('Kontenjan.1') != '--':
                        special_quotas['okul_birincisi'] = {
                            'kota': row['Kontenjan.1'],
                            'puan': row.get('En Küçük Puan.1', '--')
                        }
                    
                    # Depremzede (Genelde ikinci grup)
                    if row.get('Kontenjan.2') and row.get('Kontenjan.2') != '--':
                        special_quotas['depremzede'] = {
                            'kota': row['Kontenjan.2'],
                            'puan': row.get('En Küçük Puan.2', '--')
                        }

                    # 5. Sıralama Hesapla
                    ranking = estimate_rank(base_score, score_type)

                    departments_to_create.append(
                        Department(
                            university=university,
                            program_code=prog_code,
                            name=dept_name,
                            faculty=row.get('Fakülte/Yüksekokul Adı', '').strip(),
                            score_type=score_type,
                            quota=quota,
                            base_score=base_score,
                            ranking=int(ranking),
                            language=language,
                            is_english=is_english,
                            scholarship_rate=scholarship_rate,
                            special_quotas=special_quotas
                        )
                    )
                    count += 1

                except Exception as e:
                    continue

            # Batch Insert
            if departments_to_create:
                self.stdout.write("Veritabanına yazılıyor...")
                Department.objects.bulk_create(departments_to_create, batch_size=1000)

        self.stdout.write(self.style.SUCCESS(f"✅ İŞLEM TAMAM: {count} bölüm başarıyla yüklendi."))