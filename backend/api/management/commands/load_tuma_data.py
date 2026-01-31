import csv
import os
import difflib
from django.core.management.base import BaseCommand
from api.models import University, UniversityStats
from django.conf import settings

class Command(BaseCommand):
    help = 'TÜMA (Memnuniyet) Verilerini Akıllı Eşleştirme ile Yükle'

    def normalize_name(self, text):
        """Türkçe karakterleri ve fazlalıkları temizler"""
        text = text.lower().replace('ü', 'u').replace('ö', 'o').replace('ı', 'i').replace('ş', 's').replace('ç', 'c').replace('ğ', 'g')
        text = text.replace('universitesi', '').replace('univ', '').replace('yuksekteknoloji', 'iyte')
        return text.strip()

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'memnuniyet.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"Dosya bulunamadı: {file_path}"))
            return

        self.stdout.write("🔍 TÜMA Verileri Yükleniyor ve Eşleştiriliyor...")

        # Veritabanındaki Üniversiteleri Hafızaya Al
        db_universities = list(University.objects.all())
        uni_map = {self.normalize_name(u.name): u for u in db_universities}
        
        matched_count = 0
        failed_count = 0

        with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
            reader = csv.DictReader(f, delimiter=';') # Noktalı virgül varsayımı
            
            # Sütun İsimlerini Kontrol Et (Esneklik için)
            headers = reader.fieldnames
            col_uni = next((h for h in headers if "Üniversite" in h or "Universite" in h), None)
            
            # Puan Sütunlarını Tahmin Et
            col_academic = next((h for h in headers if "Akademik" in h), None)
            col_campus = next((h for h in headers if "Kampüs" in h or "Yerleşke" in h), None)
            col_social = next((h for h in headers if "Sosyal" in h), None)
            col_career = next((h for h in headers if "Kariyer" in h), None)
            col_tech = next((h for h in headers if "Tekno" in h or "İmkan" in h), None)
            
            if not col_uni:
                self.stdout.write(self.style.ERROR("❌ CSV'de 'Üniversite' sütunu bulunamadı! Başlıkları kontrol edin."))
                return

            for row in reader:
                raw_name = row.get(col_uni, "").strip()
                if not raw_name: continue

                norm_name = self.normalize_name(raw_name)
                
                # 1. Tam Eşleşme Dene
                target_uni = uni_map.get(norm_name)

                # 2. Benzerlik Araması (Fuzzy Match)
                if not target_uni:
                    # Veritabanındaki normalize isimler arasında en benzerini bul
                    closest_matches = difflib.get_close_matches(norm_name, uni_map.keys(), n=1, cutoff=0.6)
                    if closest_matches:
                        target_uni = uni_map[closest_matches[0]]
                        # self.stdout.write(f"🔗 Eşleşti: {raw_name} -> {target_uni.name}")

                if target_uni:
                    try:
                        # Puanları Al (Yoksa 50 varsay)
                        # CSV'deki puanlar bazen "A+", "A" gibi harf olabilir, onları sayıya çevirmek gerekebilir.
                        # Biz şimdilik sayısal (0-100 veya 0-500) olduğunu varsayıyoruz.
                        def get_score(col):
                            val = row.get(col, "50")
                            try:
                                return int(float(val.replace(',', '.')))
                            except:
                                return 50

                        stats, created = UniversityStats.objects.update_or_create(
                            university=target_uni,
                            defaults={
                                'academic_score': get_score(col_academic),
                                'campus_score': get_score(col_campus),
                                'social_score': get_score(col_social),
                                'career_score': get_score(col_career),
                                'tech_score': get_score(col_tech),
                                'city_score': 70, # Şehir puanı TÜMA'da yoksa varsayılan
                                'source': 'TÜMA 2024'
                            }
                        )
                        matched_count += 1
                    except Exception as e:
                        print(f"Hata ({raw_name}): {e}")
                else:
                    failed_count += 1
                    # self.stdout.write(f"⚠️ Eşleşmedi: {raw_name}")

        self.stdout.write(self.style.SUCCESS(f"✅ İŞLEM TAMAM: {matched_count} üniversite güncellendi. ({failed_count} kayıp)"))