import random
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import University, Department
import uuid

class Command(BaseCommand):
    help = 'Populate database with extensive realistic mock data for Preference Engine testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Delete existing University and Department data before populating',
        )

    def handle(self, *args, **options):
        # 1. TEMİZLİK (İsteğe Bağlı)
        if options['clean']:
            self.stdout.write(self.style.WARNING('Cleaning existing University and Department data...'))
            Department.objects.all().delete()
            University.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Data cleaned.'))

        # 2. ŞEHİR LİSTESİ (Tüm İller)
        # Modelden tüm Türkiye illerini çekiyoruz (81 İl)
        VALID_CITIES = [choice[0] for choice in University.CITY_CHOICES]
        self.stdout.write(f"Loaded {len(VALID_CITIES)} cities from University model.")

        # 3. ÜNİVERSİTE OLUŞTURMA
        uni_suffixes = ['Üniversitesi', 'Teknik Üniversitesi', 'Bölge Üniversitesi', 'Bilim Üniversitesi']
        uni_prefixes = [
            'Boğaziçi', 'ODTÜ', 'İTÜ', 'Yıldız Teknik', 'Hacettepe', 'Ankara', 'Gazi', 'Ege', 'Dokuz Eylül', 'Marmara',
            'İstanbul', 'Koç', 'Sabancı', 'Bilkent', 'Özyeğin', 'Yeditepe', 'Bahçeşehir', 'Başkent', 'Çankaya', 'TOBB',
            'Akdeniz', 'Uludağ', 'Çukurova', 'Selçuk', 'Erciyes', 'Anadolu', 'Osmangazi', 'KATÜ', 'On Dokuz Mayıs', 'Pamukkale',
            'Sakarya', 'Kocaeli', 'Celal Bayar', 'Mustafa Kemal', 'Balıkesir', 'Adnan Menderes', 'Namık Kemal', 'Sıtkı Koçman',
            'Sütçü İmam', 'Artuklu', 'Atatürk', 'Kocatepe', 'Cumhuriyet', 'Gaziosmanpaşa', 'Abant İzzet Baysal', 'Onsekiz Mart',
            'Trakya', 'Süleyman Demirel', 'Dumlupınar', 'Recep Tayyip Erdoğan', 'Harran', 'Fırat', 'Dicle', 'Van Yüzüncü Yıl'
        ]

        universities = []
        
        self.stdout.write('Creating Universities...')
        
        # Daha fazla üniversite oluşturalım ki her ile en az 1 tane düşme ihtimali artsın
        TOTAL_UNIS = 150 
        for i in range(TOTAL_UNIS):
            # İsim Seçimi
            if i < len(uni_prefixes):
                base_name = uni_prefixes[i]
                if 'Üniversitesi' not in base_name and 'Yüksek' not in base_name and 'Teknik' not in base_name and 'Enstitü' not in base_name:
                    name = f"{base_name} Üniversitesi"
                else: 
                    name = base_name # ODTÜ, İTÜ gibi
            else:
                # Rastgele İsim Türet
                city_name = random.choice(VALID_CITIES).capitalize()
                suffix = random.choice(uni_suffixes)
                name = f"{city_name} {suffix} - {i}" # Unique olması için

            # Şehir Seçimi
            # 1. Öncelik: Her şehre en az 1 üniversite düşsün.
            if i < len(VALID_CITIES):
                city = VALID_CITIES[i]
            else:
                # 2. Öncelik: Kalanları büyük şehirlere ağırlıklı dağıt
                if random.random() < 0.4: # %40 ihtimalle büyükşehir
                    city = random.choice(['ISTANBUL', 'ANKARA', 'IZMIR', 'ANTALYA', 'BURSA'])
                else:
                    city = random.choice(VALID_CITIES)
            
            # Tip Seçimi
            # %70 Devlet, %30 Vakıf gibi
            uni_type = 'DEVLET' if random.random() > 0.3 else 'VAKIF'
            
            slug = slugify(name) + f"-{i}"
            
            uni, created = University.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'city': city,
                    'uni_type': uni_type,
                    'is_promoted': random.choice([True, False, False, False]), # %25 ihtimal
                    'student_count': random.randint(5000, 80000),
                    'description': f"{name}, {city} şehrinde bulunan köklü bir eğitim kurumudur."
                }
            )
            universities.append(uni)

        self.stdout.write(self.style.SUCCESS(f'Processed {len(universities)} universities.'))

        # 4. BÖLÜM (PROGRAM) OLUŞTURMA
        departments_data = [
            # (Name, ScoreType, BaseRankingRange, Faculty)
            ("Bilgisayar Mühendisliği", "SAY", (1000, 150000), "Mühendislik Fakültesi"),
            ("Tıp", "SAY", (100, 40000), "Tıp Fakültesi"),
            ("Diş Hekimliği", "SAY", (10000, 60000), "Diş Hekimliği Fakültesi"),
            ("Hukuk", "EA", (1000, 80000), "Hukuk Fakültesi"),
            ("Psikoloji", "EA", (5000, 150000), "Edebiyat Fakültesi"),
            ("Hemşirelik", "SAY", (80000, 300000), "Sağlık Bilimleri Fakültesi"),
            ("Sınıf Öğretmenliği", "EA", (50000, 250000), "Eğitim Fakültesi"),
            ("Türkçe Öğretmenliği", "SOZ", (10000, 400000), "Eğitim Fakültesi"), # USER REQUEST
            ("İşletme", "EA", (50000, 500000), "İktisadi ve İdari Bilimler Fakültesi"),
            ("Mimarlık", "SAY", (40000, 250000), "Mimarlık Fakültesi"),
            ("Makine Mühendisliği", "SAY", (30000, 250000), "Mühendislik Fakültesi"),
            ("İngiliz Dili ve Edebiyatı", "DIL", (5000, 80000), "Edebiyat Fakültesi"),
        ]

        self.stdout.write('Creating Departments...')
        dept_count = 0
        
        for uni in universities:
            # Her üniversite için rastgele bölümler ekle
            # Büyük üniversitelerde hepsi olsun, küçüklerde bazıları
            
            num_depts = random.randint(4, len(departments_data)) # En az 4 bölüm
            selected_depts = random.sample(departments_data, num_depts)
            
            # CRITICAL: Türkçe Öğretmenliği'ni çoğu üniversiteye ekle test için
            turkce_ogretmenligi = ("Türkçe Öğretmenliği", "SOZ", (10000, 400000), "Eğitim Fakültesi")
            if turkce_ogretmenligi not in selected_depts and random.random() > 0.2: # %80 ihtimalle ekle
                selected_depts.append(turkce_ogretmenligi)

            for dept_name, score_type, (min_rank, max_rank), faculty in selected_depts:
                # Ranking Calculation Logic
                # İstanbul/Ankara/İzmir daha yüksek puanlı (daha düşük ranking)
                city_factor = 0.5 if uni.city in ['ISTANBUL', 'ANKARA', 'IZMIR'] else 1.2
                uni_prestige_factor = 0.3 if uni.uni_type == 'VAKIF' and uni.is_promoted else 1.0
                
                # Base ranking
                base_rank = random.randint(min_rank, max_rank)
                final_rank = int(base_rank * city_factor * uni_prestige_factor)
                
                # Ensure within somewhat realistic bounds (1 to 2M)
                final_rank = max(100, min(final_rank, 1500000))
                
                # Quota
                quota = random.choice([30, 40, 50, 60, 70, 80, 90, 100, 120])
                
                # Program Code (YÖK ID) - Unique
                prog_code = str(random.randint(100000000, 999999999))
                
                Department.objects.get_or_create(
                    university=uni,
                    name=dept_name,
                    defaults={
                        'program_code': prog_code,
                        'faculty': faculty,
                        'score_type': score_type,
                        'quota': quota,
                        'ranking': final_rank,
                        'language': random.choice(['Türkçe', 'Türkçe', 'Türkçe', 'İngilizce']),
                        'education_type': 'Örgün Öğretim',
                        'base_score': random.uniform(200, 550) # Puan çok kritik değil sıralama motoru için ama olsun
                    }
                )
                dept_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {dept_count} departments across {len(universities)} universities.'))
