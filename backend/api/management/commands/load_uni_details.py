import csv
import os
import re
import difflib
from django.core.management.base import BaseCommand
from api.models import University
from django.conf import settings

class Command(BaseCommand):
    help = 'CSV dosyasından Üniversite Detaylarını Yükler (Hata Düzeltici Mod)'

    def normalize_name(self, text):
        """ İsimleri en saf haline ("ege", "yasar") getirir. """
        if not text: return ""
        text = text.replace('\ufeff', '').strip()
        rep = {'İ': 'i', 'I': 'i', 'ı': 'i', 'Ş': 's', 'ş': 's', 'Ğ': 'g', 'ğ': 'g', 'Ü': 'u', 'ü': 'u', 'Ö': 'o', 'ö': 'o', 'Ç': 'c', 'ç': 'c'}
        for k, v in rep.items():
            text = text.replace(k, v)
        text = text.lower()
        garbage = ['universitesi', 'universite', 'yuksek', 'teknoloji', 'enstitusu', 'vakif', 'devlet', 'univ', 'uni', '.', 't.c.']
        for g in garbage:
            text = text.replace(g, '')
        text = re.sub(r'[^\w\s]', '', text)
        return " ".join(text.split())

    def parse_count(self, text):
        """ 
        DÜZELTİLMİŞ FONKSİYON: 
        3.436 gibi sayıları 3 ve 436 diye ayırmaz. 
        Önce noktayı siler -> 3436 yapar.
        """
        if not text: return 0
        try:
            # KRİTİK DÜZELTME: Önce noktaları temizle!
            # "55.000" -> "55000" olur.
            clean_text = str(text).replace('.', '').replace(',', '')
            
            nums = [int(s) for s in re.findall(r'\d+', clean_text)]
            if not nums: return 0
            
            # Ortalama al (Aralık verilmişse)
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

        self.stdout.write("🚀 Üniversite Detayları ve Sayısal Veriler Onarılıyor...")
        
        db_unis = list(University.objects.all())
        uni_map = {self.normalize_name(u.name): u for u in db_unis}
        db_keys = list(uni_map.keys())

        updated_count = 0
        
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                raw_name = row['universite'].strip()
                search_key = self.normalize_name(raw_name)
                target_uni = uni_map.get(search_key)
                
                if not target_uni:
                    matches = difflib.get_close_matches(search_key, db_keys, n=1, cutoff=0.2)
                    if matches:
                        target_uni = uni_map[matches[0]]

                if target_uni:
                    # SAYISAL DÜZELTMELER BURADA YAPILIYOR
                    target_uni.founded_year = int(row['kurulus_yili']) if row['kurulus_yili'] else target_uni.founded_year
                    
                    target_uni.student_count_label = row['toplam_ogrenci']
                    # Yeni parse_count ile doğru sayıyı hesapla
                    target_uni.student_count = self.parse_count(row['toplam_ogrenci']) 
                    
                    target_uni.academic_staff_label = row['toplam_akademisyen']
                    # Yeni parse_count ile doğru sayıyı hesapla
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

        self.stdout.write(self.style.SUCCESS(f"🏁 ONARIM TAMAMLANDI: {updated_count} üniversite yeniden hesaplandı."))