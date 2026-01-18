import os
import django
import pandas as pd
import re
from django.utils.text import slugify

# Ortam Ayarları
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import University, Department

def tr_slugify(text):
    text = str(text).replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
    text = text.replace('İ', 'i').replace('Ğ', 'g').replace('Ü', 'u').replace('Ş', 's').replace('Ö', 'o').replace('Ç', 'c')
    return slugify(text)

def import_yok_atlas_data():
    file_path = 'lisans_original.xls'
    print(f"🚀 {file_path} işleniyor... Veriler Supabase'e akacak.")
    
    if not os.path.exists(file_path):
        print("HATA: Excel dosyası bulunamadı!")
        return

    # Header yokmuş gibi oku, biz yöneteceğiz
    df = pd.read_excel(file_path, header=None)

    current_university = None
    current_faculty = ""
    
    uni_count = 0
    dept_count = 0

    # SÜTUN İNDEKS HARİTASI (Excel analizine göre)
    COL_CODE = 0       # Program Kodu (106510...)
    COL_NAME = 1       # Bölüm/Uni Adı
    COL_DURATION = 2   # Öğrenim Süresi
    COL_SCORE_TYPE = 3 # Puan Türü (SAY, EA, SÖZ) <-- YENİ EKLENDİ
    COL_QUOTA = 4      # Kontenjan
    COL_RANK = 11      # Başarı Sırası
    COL_SCORE = 12     # Taban Puan
    
    for index, row in df.iterrows():
        col0 = row[COL_CODE]
        col1 = row[COL_NAME]
        
        if pd.isna(col1): continue
        text_val = str(col1).strip()

        # --- DURUM 1: BÖLÜM EKLEME (Kod varsa bölümdür) ---
        if pd.notna(col0) and str(col0).replace('.', '').isdigit() and len(str(col0)) > 5:
            if current_university:
                program_code = str(col0).replace('.', '').strip()
                
                # Veri Temizliği ve Dönüştürme
                score = row[COL_SCORE] if pd.notna(row[COL_SCORE]) else 0
                rank = row[COL_RANK] if pd.notna(row[COL_RANK]) else 0
                quota = row[COL_QUOTA] if pd.notna(row[COL_QUOTA]) else 0
                raw_score_type = row[COL_SCORE_TYPE] if pd.notna(row[COL_SCORE_TYPE]) else "TYT"
                
                try: score = float(str(score).replace(',', '.'))
                except: score = 0
                try: rank = float(str(rank).replace('.', ''))
                except: rank = 0
                try: quota = int(quota)
                except: quota = 0

                # Eğitim Türü Analizi (İsimde 'İÖ' veya 'İkinci Öğretim' var mı?)
                edu_type = 'Örgün'
                if 'İkinci Öğretim' in text_val or '(İÖ)' in text_val:
                    edu_type = 'İkinci Öğretim'
                elif 'Açıköğretim' in text_val:
                    edu_type = 'Açıköğretim'
                elif 'Uzaktan' in text_val:
                    edu_type = 'Uzaktan Öğretim'

                # Department oluştur veya güncelle
                # NOT: Eğer modelinde 'score_type' alanı yoksa burayı silmen veya modeline eklemen gerekir.
                Department.objects.update_or_create(
                    program_code=program_code,
                    defaults={
                        'university': current_university,
                        'name': text_val,
                        'faculty': current_faculty,
                        'score_type': str(raw_score_type).strip(), # SAY, EA buraya gelir
                        'language': 'İngilizce' if 'İngilizce' in text_val else 'Türkçe',
                        'education_type': edu_type,
                        'quota': quota,
                        'base_score': score,
                        'ranking': rank
                    }
                )
                dept_count += 1
                if dept_count % 100 == 0: print(f"⚡ {dept_count} bölüm işlendi...")

        # --- DURUM 2: ÜNİVERSİTE BULMA ---
        elif pd.isna(col0) and ("ÜNİVERSİTESİ" in text_val or "YÜKSEK TEKNOLOJİ ENSTİTÜSÜ" in text_val):
            # Şehir Bulma
            city = ""
            match = re.search(r'\((.*?)\)', text_val)
            if match: city = match.group(1)
            
            clean_name = text_val.split('(')[0].strip()
            uni_slug = tr_slugify(clean_name)
            
            # Üniversite Türü Tahmini
            uni_type = 'Devlet'
            if 'Vakıf' in text_val: uni_type = 'Vakıf'
            elif 'Kıbrıs' in text_val: uni_type = 'Kıbrıs'

            current_university, created = University.objects.get_or_create(
                slug=uni_slug,
                defaults={
                    'name': clean_name,
                    'city': city,
                    # 'type': uni_type # Modelinde type alanı varsa bu satırın başındaki # işaretini kaldır
                }
            )
            current_faculty = "" # Üniversite değişince fakülte sıfırlanır
            if created: uni_count += 1

        # --- DURUM 3: FAKÜLTE YAKALAMA ---
        elif pd.isna(col0) and len(text_val) > 5 and "YKS" not in text_val and "KODU" not in text_val:
            current_faculty = text_val

    print(f"\n✅ MİSYON TAMAMLANDI!")
    print(f"Toplam {uni_count} Üniversite ve {dept_count} Bölüm veritabanına basıldı.")

if __name__ == '__main__':
    import_yok_atlas_data()