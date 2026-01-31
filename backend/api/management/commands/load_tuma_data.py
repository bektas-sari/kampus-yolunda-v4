import csv
import os
import difflib
from django.core.management.base import BaseCommand
from api.models import University, UniversityStats
from django.conf import settings

class Command(BaseCommand):
    help = 'TÜMA Verilerini Yükle (Verbose Mode)'

    def normalize_name(self, text):
        if not text: return ""
        text = text.lower()
        tr_map = {'ü': 'u', 'ö': 'o', 'ı': 'i', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'İ': 'i'}
        for k, v in tr_map.items():
            text = text.replace(k, v)
        
        garbage = ['vakif', 'devlet', 'yuksek', 'teknoloji', 'bilim', 'enstitusu', 'univ', '.', 'universitesi', 'universite']
        for g in garbage:
            text = text.replace(g, '')
        return " ".join(text.split())

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 TÜMA Yükleyici Başlatıldı...")
        
        file_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"❌ Dosya Yok: {file_path}"))
            return

        # 1. AYIRAÇ TESPİTİ
        delimiter = ';'
        try:
            with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
                line = f.readline()
                if ';' in line: delimiter = ';'
                elif ',' in line: delimiter = ','
                self.stdout.write(f"🔍 Algılanan Ayıraç: '{delimiter}'")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Dosya okuma hatası: {e}"))
            return

        # 2. ÜNİVERSİTELERİ HAFIZAYA AL
        db_unis = list(University.objects.all())
        uni_map = {self.normalize_name(u.name): u for u in db_unis}
        self.stdout.write(f"📚 DB'de {len(db_unis)} üniversite var.")

        matched = 0
        failed = 0
        
        # 3. İŞLEME BAŞLA
        with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            
            # Başlıkları temizle (Görünmez karakterleri sil)
            headers = [h.strip().replace('\ufeff', '') for h in reader.fieldnames] if reader.fieldnames else []
            self.stdout.write(f"📋 Başlıklar: {headers}")

            # Sütun Eşleştirme
            def find_col(keywords):
                for h in headers:
                    for k in keywords:
                        if k.lower() in h.lower(): return h
                return None

            col_uni = find_col(['üniversite', 'universite', 'uni'])
            if not col_uni:
                self.stdout.write(self.style.ERROR("❌ 'Üniversite' sütunu bulunamadı!"))
                return

            cols = {
                'academic': find_col(['akademik']),
                'campus': find_col(['kampüs', 'yerleşke']),
                'social': find_col(['sosyal']),
                'career': find_col(['kariyer']),
                'tech': find_col(['tekno', 'imkan']),
            }

            for row in reader:
                # DictReader orijinal başlıkları kullanır, bizim temiz headers listemizi değil
                # O yüzden row içindeki key'i bulmak için orijinalini kullanmalıyız
                # Basitlik adına row değerlerini sırayla da alabiliriz ama key ile gidelim
                
                # Gerçek anahtarı bul (DictReader'daki)
                real_uni_key = next((k for k in row.keys() if col_uni in k), None)
                if not real_uni_key: continue
                
                raw_name = row[real_uni_key]
                if not raw_name: continue

                norm = self.normalize_name(raw_name)
                target = uni_map.get(norm)

                if not target:
                    matches = difflib.get_close_matches(norm, uni_map.keys(), n=1, cutoff=0.6)
                    if matches:
                        target = uni_map[matches[0]]

                if target:
                    defaults = {'source': 'TÜMA 2025', 'city_score': 70}
                    for key, col_name in cols.items():
                        if not col_name: 
                            defaults[f"{key}_score"] = 50
                            continue
                        
                        # DictReader key'ini bul
                        real_key = next((k for k in row.keys() if col_name in k), None)
                        val = row.get(real_key, "50")
                        try:
                            defaults[f"{key}_score"] = int(float(str(val).replace(',', '.')))
                        except:
                            defaults[f"{key}_score"] = 50

                    UniversityStats.objects.update_or_create(university=target, defaults=defaults)
                    matched += 1
                else:
                    failed += 1

        self.stdout.write(self.style.SUCCESS(f"✅ BİTTİ: {matched} Eşleşti, {failed} Kayıp."))