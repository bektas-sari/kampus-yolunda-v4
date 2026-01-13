import os
import pandas as pd
import re
from django.core.management.base import BaseCommand
from api.models import University, Department

class Command(BaseCommand):
    help = 'YÖK Atlas Excel verilerini veritabanına yükler'

    def add_arguments(self, parser):
        # BURASI SADECE AÇIKLAMADIR, DOSYA YOLUNU BURAYA YAZMA!
        parser.add_argument('file_path', type=str, help='Excel dosyasının tam yolu')

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']
        self.stdout.write(self.style.WARNING(f"📂 '{file_path}' okunuyor..."))

        try:
            # .xls dosyaları için xlrd motorunu, .xlsx için openpyxl kullanır
            if file_path.endswith('.xls'):
                df = pd.read_excel(file_path, header=0, engine='xlrd')
            else:
                df = pd.read_excel(file_path, header=0)
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Hata: Dosya okunamadı. {str(e)}"))
            self.stdout.write("İpucu: 'pip install xlrd' komutunu çalıştırdığından emin ol.")
            return

        current_uni = None
        current_faculty = None
        uni_counter = 0
        dept_counter = 0

        for index, row in df.iterrows():
            col_1 = str(row.iloc[0]).strip()
            col_2 = str(row.iloc[1]).strip()

            # 1. DURUM: ÜNİVERSİTE
            if (col_1 == 'nan' or col_1 == '') and ('ÜNİVERSİTE' in col_2.upper()):
                uni_name = re.sub(r'\s*\(.*?\)', '', col_2).strip()
                city = "ISTANBUL" # Varsayılan
                uni_type = "DEVLET"

                # Parantez içi analiz (Şehir ve Tür)
                matches = re.findall(r'\((.*?)\)', col_2)
                for match in matches:
                    m_upper = match.upper()
                    if 'DEVLET' in m_upper: uni_type = 'DEVLET'
                    elif 'VAKIF' in m_upper: uni_type = 'VAKIF'
                    elif 'KIBRIS' in m_upper: uni_type = 'KIBRIS'
                    elif 'YABANCI' in m_upper: uni_type = 'YABANCI'
                    elif len(match) > 2 and 'ÜNİVERSİTE' not in m_upper:
                         # Basit şehir eşleştirmesi
                        import unidecode
                        city_slug = unidecode.unidecode(m_upper).replace(' ', '').upper()
                        # Burada switch-case yerine gelen veriyi direkt büyük harfle yazıyoruz
                        city = city_slug

                from django.utils.text import slugify
                current_uni, created = University.objects.get_or_create(
                    name=uni_name,
                    defaults={'city': city, 'uni_type': uni_type, 'slug': f"uni-{index}"}
                )
                if created:
                    current_uni.slug = f"{slugify(uni_name)}-{current_uni.id}"
                    current_uni.save()
                    uni_counter += 1
                    self.stdout.write(f"🏫 Eklendi: {uni_name}")
                
                current_faculty = None
                continue

            # 2. DURUM: FAKÜLTE
            if (col_1 == 'nan' or col_1 == '') and (col_2 != 'nan' and col_2 != ''):
                current_faculty = col_2
                continue

            # 3. DURUM: BÖLÜM
            if col_1.replace('.', '').isdigit() and current_uni:
                try:
                    p_code = col_1
                    p_name = col_2
                    p_duration = int(row.iloc[2]) if str(row.iloc[2]).isdigit() else 4
                    p_score_type = str(row.iloc[3]).strip()
                    try: p_quota = int(row.iloc[4])
                    except: p_quota = 0
                    
                    # Veriler bazen virgül bazen nokta ile gelebilir
                    try: p_ranking = int(str(row.iloc[11]).replace('.', ''))
                    except: p_ranking = None
                    
                    try: p_base = float(str(row.iloc[12]).replace(',', '.'))
                    except: p_base = None

                    Department.objects.update_or_create(
                        program_code=p_code,
                        defaults={
                            'university': current_uni,
                            'name': p_name,
                            'faculty': current_faculty if current_faculty else "Rektörlük",
                            'duration': p_duration,
                            'score_type': p_score_type,
                            'quota': p_quota,
                            'ranking': p_ranking,
                            'base_score': p_base
                        }
                    )
                    dept_counter += 1
                    if dept_counter % 500 == 0:
                        self.stdout.write(f"   ... {dept_counter} bölüm işlendi.")

                except Exception:
                    continue

        self.stdout.write(self.style.SUCCESS(f"✅ BİTTİ! Toplam {uni_counter} Üni, {dept_counter} Bölüm."))