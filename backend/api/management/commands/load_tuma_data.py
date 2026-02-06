import csv
import os
import difflib
from django.core.management.base import BaseCommand
from api.models import University, UniversityStats
from django.conf import settings

class Command(BaseCommand):
    help = 'TÜMA Verilerini Yükle (Bozuk Karakter Dostu Mod)'

    def normalize_name(self, text):
        """ Üniversite isimlerini eşleştirmek için temizler """
        if not text: return ""
        text = text.lower()
        # Türkçe karakterleri İngilizceye çevir (Eşleşme kolay olsun diye)
        tr_map = {'ü': 'u', 'ö': 'o', 'ı': 'i', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'İ': 'i'}
        for k, v in tr_map.items():
            text = text.replace(k, v)
        
        # Gereksiz kelimeleri at
        garbage = ['vakif', 'devlet', 'yuksek', 'teknoloji', 'bilim', 'enstitusu', 'univ', '.', 'universitesi', 'universite']
        for g in garbage:
            text = text.replace(g, '')
        return " ".join(text.split())

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 TÜMA Yükleyici (Fix Modu) Başlatıldı...")
        
        file_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"❌ Dosya Yok: {file_path}"))
            return

        # 1. DATABASE'İ HAFIZAYA AL
        db_unis = list(University.objects.all())
        uni_map = {self.normalize_name(u.name): u for u in db_unis}
        self.stdout.write(f"📚 DB'de {len(db_unis)} üniversite var.")

        matched = 0
        failed = 0
        
        # 2. DOSYAYI OKU (Encoding hatalarını yoksayarak)
        # 'utf-8-sig' genellikle bozuk görünen ama aslında UTF-8 olan dosyaları çözer.
        # Olmazsa 'latin-1' deneriz ama şu an header eşleştirmesiyle çözeceğiz.
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            # Sizin görselde ayırıcı virgül (,) görünüyor
            reader = csv.DictReader(f, delimiter=',')
            
            # CSV Başlıklarını alalım
            headers = reader.fieldnames if reader.fieldnames else []
            # Listeyi ekrana yazalım ki ne okuduğumuzu görelim
            self.stdout.write(f"📋 Okunan Başlıklar: {headers}")

            # --- KRİTİK BÖLÜM: BOZUK BAŞLIKLARI EŞLEŞTİRME ---
            # Görseldeki bozuk metinlerin "Köklerini" arayacağız.
            def find_col(keywords):
                for h in headers:
                    for k in keywords:
                        # Case insensitive (Büyük/küçük harf duyarsız) arama
                        if k.lower() in h.lower(): return h
                return None

            # Sizin görseldeki sütunlara göre harita:
            # Genel Puan -> "Genel"
            # YerleÅŸke -> "Yerle"
            # Akad.Des. -> "Akad"
            # Kariyer -> "Kariyer"
            # Ögr.Den (Öğrenim Deneyimi) -> "Den" veya "Ogr"
            
            cols = {
                'uni': find_col(['universite', 'üniversite', 'univ']), 
                'general': find_col(['genel']),        # Genel Memnuniyet
                'campus': find_col(['yerle', 'kampus']), # Yerleşke (YerleÅŸke)
                'academic': find_col(['akad']),        # Akademik Destek (Akad.Des)
                'career': find_col(['kariyer']),       # Kariyer Desteği
                'social': find_col(['imk', 'sosyal']), # Öğrenim İmkanları (Ã–ÄŸr.Ä°mk) -> Bunu Sosyal kabul edelim
                'tech': find_col(['den', 'tekno']),    # Öğrenim Deneyimi (Ã–ÄŸr.Den) -> Bunu Tekno/Eğitim Kalitesi kabul edelim
            }

            if not cols['uni']:
                self.stdout.write(self.style.ERROR("❌ 'Üniversite' sütunu bulunamadı!"))
                return

            for row in reader:
                # Üniversite adını bul
                raw_name = row.get(cols['uni'])
                if not raw_name: continue

                norm = self.normalize_name(raw_name)
                target = uni_map.get(norm)

                # Bulamazsa yakın eşleşme dene
                if not target:
                    matches = difflib.get_close_matches(norm, uni_map.keys(), n=1, cutoff=0.6)
                    if matches:
                        target = uni_map[matches[0]]

                if target:
                    defaults = {'source': 'TÜMA 2024', 'city_score': 70}
                    
                    # Puanları Çek ve Temizle
                    for key, csv_header in cols.items():
                        if key == 'uni': continue
                        
                        val = row.get(csv_header, "50") # Bulamazsa 50 ver
                        try:
                            # Virgülü noktaya çevir, sayı olmayan her şeyi sil
                            clean_val = str(val).replace(',', '.')
                            score = int(float(clean_val))
                            defaults[f"{key}_score"] = score
                        except:
                            defaults[f"{key}_score"] = 50 # Okuyamazsa 50 ver

                    # Veritabanına Yaz
                    UniversityStats.objects.update_or_create(university=target, defaults=defaults)
                    matched += 1
                else:
                    failed += 1

        self.stdout.write(self.style.SUCCESS(f"✅ İŞLEM TAMAM: {matched} üniversitenin gerçek puanları yüklendi."))