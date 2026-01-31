import csv
import os
import difflib
from django.core.management.base import BaseCommand
from api.models import University, UniversityStats
from django.conf import settings

class Command(BaseCommand):
    help = 'TÜMA Verilerini Yükle (Akıllı Eşleştirme & Delimiter Dedektifi)'

    def normalize_name(self, text):
        """
        Üniversite isimlerini 'kök' haline getirir.
        Örn: 'İstanbul Teknik Üniversitesi' -> 'istanbul teknik'
        Örn: 'Koç Univ.' -> 'koc'
        """
        if not text: return ""
        text = text.lower()
        
        # Türkçe Karakter Temizliği
        tr_map = {'ü': 'u', 'ö': 'o', 'ı': 'i', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'İ': 'i'}
        for k, v in tr_map.items():
            text = text.replace(k, v)
            
        # Gürültü Kelimeleri At
        # 'universitesi', 'universite' kelimelerini en son silmek önemli
        garbage = ['vakif', 'devlet', 'yuksek', 'teknoloji', 'bilim', 'enstitusu', 'univ', '.', 'universitesi', 'universite']
        
        for g in garbage:
            text = text.replace(g, '')
            
        # Boşlukları temizle 'istanbul  teknik' -> 'istanbul teknik'
        return " ".join(text.split())

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
        
        if not os.path.exists(file_path):
            print(f"❌ HATA: Dosya bulunamadı -> {file_path}")
            return

        # 1. AYIRAÇ (DELIMITER) TESPİTİ
        # Dosyanın ilk satırını okuyup neyle ayrıldığına karar verelim
        delimiter = ';'
        try:
            with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
                first_line = f.readline()
                if ';' in first_line: delimiter = ';'
                elif ',' in first_line: delimiter = ','
                else: delimiter = '\t'
        except:
            pass
            
        print(f"🔍 Algılanan Ayıraç: '{delimiter}'")

        # 2. VERİTABANI HAZIRLIĞI
        db_unis = list(University.objects.all())
        # Harita: { 'bogazici': UniversityObj, 'koc': UniversityObj }
        uni_map = {self.normalize_name(u.name): u for u in db_unis}
        
        print(f"📚 Veritabanında {len(db_unis)} üniversite var.")
        # print(f"DEBUG DB Örnek: {list(uni_map.keys())[:3]}")

        matched_count = 0
        failed_count = 0
        failed_samples = []

        # 3. CSV OKUMA VE EŞLEŞTİRME
        with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            headers = reader.fieldnames
            print(f"📋 CSV Başlıkları: {headers}")

            # Sütunları Bul (Esnek İsimlendirme)
            col_uni = next((h for h in headers if "Üniversite" in h or "Universite" in h or "Uni" in h), None)
            
            if not col_uni:
                print("❌ KRİTİK HATA: 'Üniversite' isimli bir sütun bulunamadı!")
                return

            # Puan Sütunlarını Bul (Akademik, Kampüs, vs.)
            # Eğer sütun yoksa None döner, aşağıda varsayılan 50 puan atanır.
            cols = {
                'academic': next((h for h in headers if "Akademik" in h), None),
                'campus': next((h for h in headers if "Kampüs" in h or "Yerleşke" in h), None),
                'social': next((h for h in headers if "Sosyal" in h), None),
                'career': next((h for h in headers if "Kariyer" in h), None),
                'tech': next((h for h in headers if "Tekno" in h or "İmkan" in h), None),
            }

            for row in reader:
                raw_name = row.get(col_uni, "")
                if not raw_name or len(raw_name) < 3: continue

                norm_name = self.normalize_name(raw_name)
                
                # A) Tam Eşleşme
                target = uni_map.get(norm_name)

                # B) Yaklaşık Eşleşme (Fuzzy Match)
                # Örn: CSV'de "ist aydin" var, DB'de "istanbul aydin" varsa bulur.
                if not target:
                    matches = difflib.get_close_matches(norm_name, uni_map.keys(), n=1, cutoff=0.55) # %55 benzerlik yeterli
                    if matches:
                        target = uni_map[matches[0]]
                        # print(f"🔗 Fuzzy Match: CSV({norm_name}) -> DB({matches[0]})")

                if target:
                    # Eşleşme Başarılı -> Puanları Kaydet
                    try:
                        defaults = {}
                        for key, csv_col in cols.items():
                            val = row.get(csv_col, "50")
                            # "A+", "FF" gibi sayısal olmayan değer gelirse 50 yap
                            try:
                                # Virgülü noktaya çevir (75,5 -> 75.5)
                                clean_val = str(val).replace(',', '.')
                                defaults[f"{key}_score"] = int(float(clean_val))
                            except:
                                defaults[f"{key}_score"] = 50
                        
                        defaults['source'] = 'TÜMA 2025'
                        
                        UniversityStats.objects.update_or_create(
                            university=target,
                            defaults=defaults
                        )
                        matched_count += 1
                    except Exception as e:
                        print(f"⚠️ Kayıt Hatası ({raw_name}): {e}")
                else:
                    failed_count += 1
                    if len(failed_samples) < 5:
                        failed_samples.append(f"CSV: '{norm_name}' (Aslı: {raw_name})")

        print(f"✅ SONUÇ: {matched_count} üniversite güncellendi. ({failed_count} eşleşmedi)")
        
        if failed_samples:
            print("⚠️ Eşleşmeyen ilk 5 örnek (Bunlar DB'de farklı yazılmış olabilir):")
            for s in failed_samples: print(s)