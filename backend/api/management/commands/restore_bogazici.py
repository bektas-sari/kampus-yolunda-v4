import os
import pandas as pd
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import University, Department

class Command(BaseCommand):
    help = 'Sadece Boğaziçi Üniversitesi verilerini kurtarır'

    def handle(self, *args, **kwargs):
        file_path = 'lisans_original.xls'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Dosya bulunamadı: {file_path}'))
            return

        self.stdout.write("Excel taranıyor, Boğaziçi Üniversitesi aranıyor...")
        
        try:
            # Sadece gerekli sütunları okuyarak hız kazanalım ama garanti olsun diye hepsini okuyoruz
            df = pd.read_excel(file_path)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Excel okuma hatası: {e}'))
            return

        current_uni = None
        current_faculty = ""
        target_found = False

        for index, row in df.iterrows():
            col_0 = str(row.iloc[0]).strip() # Program Kodu
            col_1 = str(row.iloc[1]).strip() # Program Adı (veya Üni Adı)

            # 1. Üniversite Satırı Tespiti
            if "ÜNİVERSİTESİ" in col_1 and pd.isna(row.iloc[2]): 
                uni_name = col_1.strip()
                
                # FİLTRE: Sadece Boğaziçi'ni al, gerisini atla
                if "BOĞAZİÇİ" in uni_name.upper():
                    target_found = True
                    self.stdout.write(self.style.WARNING(f"Hedef Tespit Edildi: {uni_name}"))
                    
                    # Üniversiteyi Oluştur
                    current_uni, created = University.objects.get_or_create(
                        name=uni_name,
                        defaults={
                            'slug': 'bogazici-universitesi', # Sabit slug verelim temiz olsun
                            'city': 'ISTANBUL',
                            'uni_type': 'DEVLET',
                            'description': "Boğaziçi Üniversitesi, 1863 yılında kurulan Robert Kolej'in devamı niteliğinde olan, Türkiye'nin önde gelen araştırma üniversitelerinden biridir."
                        }
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Üniversite Geri Getirildi: {uni_name}"))
                    else:
                        self.stdout.write(f"Üniversite zaten var, güncelleniyor: {uni_name}")
                    
                    current_faculty = "" # Fakülte sıfırla
                else:
                    # Boğaziçi değilse, bu döngüdeki diğer işlemleri yapma, current_uni'yi boşalt
                    current_uni = None
                    target_found = False
                
                continue

            # Eğer şu an Boğaziçi satırlarının altındaysak işlemlere devam et
            if not target_found or not current_uni:
                continue

            # 2. Fakülte Satırı Tespiti
            if pd.isna(row.iloc[0]) and ("Fakültesi" in col_1 or "Yüksekokulu" in col_1):
                current_faculty = col_1
                continue

            # 3. Bölüm Satırı Tespiti
            if col_0.isdigit() and current_uni:
                try:
                    prog_code = col_0
                    dept_name = col_1
                    duration = int(row.iloc[2]) if str(row.iloc[2]).isdigit() else 4
                    score_type = str(row.iloc[3]).strip()
                    quota = int(row.iloc[4]) if pd.notna(row.iloc[4]) else 0
                    
                    base_score = row.iloc[12]
                    base_score = float(base_score) if (pd.notna(base_score) and str(base_score) != '-') else None

                    ranking = row.iloc[11]
                    ranking = int(ranking) if (pd.notna(ranking) and str(ranking) != '-') else None

                    # Bölümü Oluştur/Güncelle
                    Department.objects.update_or_create(
                        program_code=prog_code,
                        defaults={
                            'university': current_uni,
                            'name': dept_name,
                            'faculty': current_faculty,
                            'duration': duration,
                            'score_type': score_type,
                            'quota': quota,
                            'base_score': base_score,
                            'ranking': ranking,
                            'language': 'İngilizce' if 'İngilizce' in dept_name else 'Türkçe'
                        }
                    )
                    # self.stdout.write(f"  -> Bölüm Eklendi: {dept_name}") # Çok kalabalık etmesin diye kapattım
                except Exception as e:
                    continue

        self.stdout.write(self.style.SUCCESS('OPERASYON TAMAMLANDI: Boğaziçi Üniversitesi ve bölümleri kurtarıldı.'))