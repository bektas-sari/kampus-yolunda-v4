import csv
import os
import re
from django.core.management.base import BaseCommand
from api.models import University
from django.conf import settings

class Command(BaseCommand):
    help = 'CSV dosyasından Üniversite Detaylarını (Video, Harita vb.) Yükler'

    def parse_count(self, text):
        """ '55.000 - 60.000' veya '3.436+' gibi metinlerden sayı üretir """
        if not text: return 0
        try:
            # Noktaları sil, sayıları bul
            nums = [int(s.replace('.', '')) for s in re.findall(r'\d+', text)]
            if not nums: return 0
            # Ortalama al (Aralık verilmişse ortasını alır)
            return int(sum(nums) / len(nums))
        except:
            return 0

    def normalize_url(self, url):
        """ Web sitesi linkine https:// ekler """
        if url and not url.startswith('http'):
            return f"https://{url}"
        return url

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'universite_info.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"Dosya bulunamadı: {file_path}"))
            return

        self.stdout.write("🚀 Üniversite Detayları Güncelleniyor...")
        
        updated_count = 0
        not_found_count = 0

        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                uni_name = row['universite'].strip()
                
                # Veritabanında üniversiteyi bul (Case insensitive)
                uni = University.objects.filter(name__icontains=uni_name).first()
                
                if uni:
                    # --- GÜNCELLENEN ALANLAR (MODEL İLE EŞLEŞTİRİLDİ) ---
                    
                    # 1. Kuruluş Yılı
                    if row['kurulus_yili']:
                        uni.founded_year = int(row['kurulus_yili']) 
                    
                    # 2. Öğrenci Sayıları
                    uni.student_count_label = row['toplam_ogrenci']
                    uni.student_count = self.parse_count(row['toplam_ogrenci'])
                    
                    # 3. Akademisyen Sayıları
                    uni.academic_staff_label = row['toplam_akademisyen']
                    uni.academician_count = self.parse_count(row['toplam_akademisyen']) # Sıralama için sayıya çeviriyoruz
                    
                    # 4. Eğitim ve Diğer
                    uni.education_language = row['egitim_dili']
                    uni.website = self.normalize_url(row['web'])
                    uni.phone = row['telefon']
                    uni.email = row['eposta']
                    uni.address = row['adres']
                    
                    # 5. Medya (Map & Video)
                    uni.map_location = row['harita']      # Düzeltildi
                    uni.video_url = row['tanitim_video']  # Düzeltildi
                    
                    uni.description = row['hakkinda']
                    uni.technopark = row['teknopark']
                    
                    uni.save()
                    updated_count += 1
                else:
                    self.stdout.write(self.style.WARNING(f"⚠️ Bulunamadı: {uni_name}"))
                    not_found_count += 1

        self.stdout.write(self.style.SUCCESS(f"🏁 İŞLEM TAMAM: {updated_count} üniversite güncellendi."))