import csv
import os
import re
from django.core.management.base import BaseCommand
from api.models import University
from django.conf import settings

class Command(BaseCommand):
    help = 'CSV dosyasından Üniversite Detaylarını (Video, Harita vb.) Yükler (Akıllı Eşleştirme)'

    def normalize_name(self, text):
        """
        Üniversite isimlerini eşleştirme için standartlaştırır.
        Örn: "İzmir Yüksek Teknoloji Enstitüsü (İYTE)" -> "izmir yuksek teknoloji enstitusu"
        """
        if not text: return ""
        text = text.lower()
        # Türkçe karakterleri İngilizce karşılıklarına çevir
        tr_map = {'ü': 'u', 'ö': 'o', 'ı': 'i', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'İ': 'i'}
        for k, v in tr_map.items():
            text = text.replace(k, v)
        
        # Parantez içindeki kısaltmaları (İYTE vb.) temizle
        text = re.sub(r'\s*\(.*?\)', '', text)
        
        # Fazla boşlukları temizle
        return " ".join(text.split())

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

        self.stdout.write("🚀 Üniversite Detayları Güncelleniyor (Akıllı Mod)...")
        
        # 1. Veritabanındaki Üniversiteleri Hafızaya Al (Normalize Ederek)
        db_unis = University.objects.all()
        uni_map = {}
        for u in db_unis:
            # Hem orijinal ismini hem de normalize edilmiş halini anahtar yapalım
            norm = self.normalize_name(u.name)
            uni_map[norm] = u
            
            # Özel Durumlar (Manuel Eşleştirme İhtimaline Karşı)
            if "iyte" in norm: uni_map["izmir yuksek teknoloji enstitusu"] = u
            if "katip" in norm: uni_map["izmir katip celebi universitesi"] = u

        updated_count = 0
        not_found_count = 0

        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                raw_name = row['universite'].strip()
                search_key = self.normalize_name(raw_name)
                
                # Eşleşeni bul
                uni = uni_map.get(search_key)
                
                # Eğer tam eşleşme yoksa "contains" mantığıyla dene
                if not uni:
                    for key, val in uni_map.items():
                        if search_key in key or key in search_key:
                            uni = val
                            break
                
                if uni:
                    # --- GÜNCELLENEN ALANLAR ---
                    if row['kurulus_yili']:
                        uni.founded_year = int(row['kurulus_yili']) 
                    
                    uni.student_count_label = row['toplam_ogrenci']
                    uni.student_count = self.parse_count(row['toplam_ogrenci'])
                    
                    uni.academic_staff_label = row['toplam_akademisyen']
                    uni.academician_count = self.parse_count(row['toplam_akademisyen'])
                    
                    uni.education_language = row['egitim_dili']
                    uni.website = self.normalize_url(row['web'])
                    uni.phone = row['telefon']
                    uni.email = row['eposta']
                    uni.address = row['adres']
                    
                    uni.map_location = row['harita']
                    uni.video_url = row['tanitim_video']
                    
                    uni.description = row['hakkinda']
                    uni.technopark = row['teknopark']
                    
                    uni.save()
                    updated_count += 1
                else:
                    # Hata ayıklama için normalize edilmiş ismini yazdıralım
                    self.stdout.write(self.style.WARNING(f"⚠️ Bulunamadı: {raw_name} (Aranan Kök: {search_key})"))
                    not_found_count += 1

        self.stdout.write(self.style.SUCCESS(f"🏁 İŞLEM TAMAM: {updated_count} üniversite güncellendi. ({not_found_count} kayıp)"))