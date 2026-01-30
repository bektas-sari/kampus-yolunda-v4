import csv
import os
from django.core.management.base import BaseCommand
from api.models import University, UniversityStats
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'TÜMA verilerini mevcut üniversitelere ENJEKTE eder (Silme Yapmaz)'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='CSV dosyasının yolu')

    def handle(self, *args, **options):
        file_path = options['file_path']

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Dosya bulunamadı: {file_path}'))
            return

        self.stdout.write(self.style.WARNING(f'TÜMA Verileri Enjekte Ediliyor...'))

        try:
            with open(file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                updated_count = 0
                
                for row in reader:
                    try:
                        uni_name = row['Üniversite'].strip()
                        
                        # Üniversiteyi Bul (Basit Eşleşme)
                        uni = University.objects.filter(name__iexact=uni_name).first()
                        
                        if not uni:
                            # Bulamazsa "Üniversitesi" ekleyip/çıkarıp deneyelim
                            if "Üniversitesi" in uni_name:
                                short_name = uni_name.replace("Üniversitesi", "").strip()
                                uni = University.objects.filter(name__icontains=short_name).first()
                            
                        if not uni:
                            continue

                        # Puanları Temizle
                        def clean_score(val):
                            if not val: return 50
                            return int(val.split('(')[0].strip())

                        academic = clean_score(row.get('Öğr.Den. Puan (Sıra)', 0))
                        campus = clean_score(row.get('Yerleşke Puan (Sıra)', 0))
                        
                        # İstatistikleri Güncelle (ASLA SİLME YOK)
                        UniversityStats.objects.update_or_create(
                            university=uni,
                            defaults={
                                'academic_score': academic,
                                'campus_score': campus,
                                'social_score': clean_score(row.get('Yönetim Puan (Sıra)', 0)),
                                'career_score': clean_score(row.get('Kariyer Puan (Sıra)', 0)),
                                'tech_score': clean_score(row.get('Akad.Des. Puan (Sıra)', 0)),
                                'city_score': campus, 
                                'source': 'TÜMA 2025'
                            }
                        )
                        updated_count += 1

                    except Exception as e:
                        continue

            self.stdout.write(self.style.SUCCESS(f'\n🚀 BAŞARILI! {updated_count} üniversitenin istatistikleri güncellendi.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Genel Hata: {e}'))