import csv
import os
import re
import difflib  # <--- SİHİRLİ KÜTÜPHANE BU
from django.core.management.base import BaseCommand
from api.models import University
from django.conf import settings

class Command(BaseCommand):
    help = 'CSV dosyasından Üniversite Detaylarını Yükler (Fuzzy Matching ile)'

    def normalize_name(self, text):
        """ İsimleri basitleştirir (Koc Univ -> koc) """
        if not text: return ""
        text = text.lower()
        # Türkçe karakterleri İngilizce karşılıklarına çevir
        tr_map = {'ü': 'u', 'ö': 'o', 'ı': 'i', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'İ': 'i', 'I': 'i'}
        for k, v in tr_map.items():
            text = text.replace(k, v)
        
        # Parantez içindeki kısaltmaları sil (İYTE vb.)
        text = re.sub(r'\s*\(.*?\)', '', text)
        
        # "universitesi", "universite" gibi kelimeleri de atalım ki "koc" == "koc" kalsın
        text = text.replace('universitesi', '').replace('universite', '').replace('yuksek', '').replace('teknoloji', '').replace('enstitusu', '')
        
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

        self.stdout.write("🚀 Üniversite Detayları Güncelleniyor (Fuzzy Mod)...")
        
        # 1. Veritabanındaki Üniversiteleri Hazırla
        db_unis = list(University.objects.all())
        # Harita: {'ege': <UniObj>, 'dokuz eylul': <UniObj>}
        uni_map = {self.normalize_name(u.name): u for u in db_unis}
        
        # Anahtarların listesi (Matching için)
        db_keys = list(uni_map.keys())

        updated_count = 0
        not_found_count = 0
        
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                raw_name = row['universite'].strip()
                search_key = self.normalize_name(raw_name)
                
                target_uni = None
                
                # A) Tam Eşleşme Dene
                if search_key in uni_map:
                    target_uni = uni_map[search_key]
                else:
                    # B) Yaklaşık Eşleşme (Fuzzy) Dene
                    # cutoff=0.4 demek %40 benzerlik yeterli demek (Çok esnek)
                    matches = difflib.get_close_matches(search_key, db_keys, n=1, cutoff=0.4)
                    if matches:
                        match_key = matches[0]
                        target_uni = uni_map[match_key]
                        # self.stdout.write(f"🔗 Eşleşti: '{raw_name}' -> '{target_uni.name}'")

                if target_uni:
                    # --- GÜNCELLEME ---
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
                    self.stdout.write(self.style.WARNING(f"⚠️ HİÇ BULUNAMADI: {raw_name} (Aranan: {search_key})"))
                    not_found_count += 1

        self.stdout.write(self.style.SUCCESS(f"🏁 İŞLEM TAMAM: {updated_count} üniversite güncellendi."))