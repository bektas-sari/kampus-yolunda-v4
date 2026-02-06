import csv
import os
import re
import difflib
from django.core.management.base import BaseCommand
from api.models import University
from django.conf import settings

class Command(BaseCommand):
    help = 'CSV dosyasından Üniversite Detaylarını Yükler (Süper Normalize Modu)'

    def normalize_name(self, text):
        """ İsimleri en saf haline ("ege", "yasar") getirir. """
        if not text: return ""
        
        # 1. Ön Temizlik (BOM ve Boşluk)
        text = text.replace('\ufeff', '').strip()
        
        # 2. Türkçe Karakterleri Manuel Düzelt (Lower yapmadan ÖNCE)
        # Bu sayede "İ" -> "i" olur, "I" -> "i" olur. Karışıklık kalmaz.
        rep = {
            'İ': 'i', 'I': 'i', 'ı': 'i', 
            'Ş': 's', 'ş': 's', 
            'Ğ': 'g', 'ğ': 'g', 
            'Ü': 'u', 'ü': 'u', 
            'Ö': 'o', 'ö': 'o', 
            'Ç': 'c', 'ç': 'c'
        }
        for k, v in rep.items():
            text = text.replace(k, v)
        
        text = text.lower()
        
        # 3. Fazlalıkları At
        garbage = [
            'universitesi', 'universite', 'yuksek', 'teknoloji', 'enstitusu', 
            'vakif', 'devlet', 'univ', 'uni', '.', 't.c.'
        ]
        for g in garbage:
            text = text.replace(g, '')
            
        # 4. Noktalama İşaretlerini ve Çift Boşlukları Temizle
        text = re.sub(r'[^\w\s]', '', text)
        return " ".join(text.split())

    def parse_count(self, text):
        if not text: return 0
        try:
            nums = [int(s.replace('.', '')) for s in re.findall(r'\d+', text)]
            if not nums: return 0
            return int(sum(nums) / len(nums))
        except:
            return 0

    def normalize_url(self, url):
        if url and not url.startswith('http'):
            return f"https://{url}"
        return url

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'universite_info.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"Dosya bulunamadı: {file_path}"))
            return

        self.stdout.write("🚀 Üniversite Detayları Güncelleniyor (Süper Normalize)...")
        
        # Veritabanı isimlerini hazırla
        db_unis = list(University.objects.all())
        uni_map = {self.normalize_name(u.name): u for u in db_unis}
        db_keys = list(uni_map.keys())

        updated_count = 0
        not_found_count = 0
        
        # utf-8-sig: Excel CSV'lerindeki gizli karakterleri (BOM) çözer
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                raw_name = row['universite'].strip()
                search_key = self.normalize_name(raw_name)
                
                target_uni = uni_map.get(search_key)
                
                # Fuzzy Match (Esnek Arama)
                if not target_uni:
                    matches = difflib.get_close_matches(search_key, db_keys, n=1, cutoff=0.4)
                    if matches:
                        target_uni = uni_map[matches[0]]
                        # self.stdout.write(f"🔗 Esnek Eşleşme: CSV({search_key}) -> DB({matches[0]})")

                if target_uni:
                    # GÜNCELLEME İŞLEMLERİ
                    if row['kurulus_yili']:
                        target_uni.founded_year = int(row['kurulus_yili'])
                    
                    target_uni.student_count_label = row['toplam_ogrenci']
                    target_uni.student_count = self.parse_count(row['toplam_ogrenci'])
                    target_uni.academic_staff_label = row['toplam_akademisyen']
                    target_uni.academician_count = self.parse_count(row['toplam_akademisyen'])
                    target_uni.education_language = row['egitim_dili']
                    target_uni.website = self.normalize_url(row['web'])
                    target_uni.phone = row['telefon']
                    target_uni.email = row['eposta']
                    target_uni.address = row['adres']
                    target_uni.map_location = row['harita']
                    target_uni.video_url = row['tanitim_video']
                    target_uni.description = row['hakkinda']
                    target_uni.technopark = row['teknopark']
                    
                    target_uni.save()
                    updated_count += 1
                else:
                    # HATA RAPORU: Neden bulunamadı?
                    # DB'deki en yakın 3 ismi gösterelim
                    guesses = difflib.get_close_matches(search_key, db_keys, n=3, cutoff=0.1)
                    self.stdout.write(self.style.WARNING(f"⚠️ BULUNAMADI: {raw_name}"))
                    self.stdout.write(f"   Aranan Kök: '{search_key}'")
                    self.stdout.write(f"   DB'deki En Yakın Adaylar: {guesses}")
                    not_found_count += 1

        self.stdout.write(self.style.SUCCESS(f"🏁 SONUÇ: {updated_count} Güncellendi, {not_found_count} Kayıp."))