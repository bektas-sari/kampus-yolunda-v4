from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import University

class Command(BaseCommand):
    help = 'Üniversiteleri veritabanına kurar (Excel gerektirmez)'

    def handle(self, *args, **options):
        # NotebookLM'den gelen ve senin onayladığın TEMİZ veriler
        universities_data = [
            {
                "name": "Ege Üniversitesi",
                "city": "İZMİR",
                "type": "DEVLET",
                "founded": 1955,
                "web": "https://ege.edu.tr",
                "rector": "Prof. Dr. Musa Alcı", # 2026 Güncel
                "desc": "Türkiye'nin dördüncü üniversitesi olan kurum, tıp, ziraat ve fen bilimlerindeki köklü geleneği ve Bornova'daki modern kampüsüyle bir akademik markadır."
            },
            {
                "name": "Dokuz Eylül Üniversitesi",
                "city": "İZMİR",
                "type": "DEVLET",
                "founded": 1982,
                "web": "https://deu.edu.tr",
                "rector": "Prof. Dr. Bayram Yılmaz", # Kontrol ettim, güncel
                "desc": "İzmir'in her köşesine yayılmış kampüsleri ve güçlü tıp fakültesi ile Ege bölgesinin eğitim devidir."
            },
            {
                "name": "İstanbul Teknik Üniversitesi",
                "city": "İSTANBUL",
                "type": "DEVLET",
                "founded": 1773,
                "web": "https://itu.edu.tr",
                "rector": "Prof. Dr. Hasan Mandal",
                "desc": "Mühendislik ve mimarlıkta Türkiye'nin altın standartlarını belirleyen kurum, Maslak kampüsündeki devasa Ar-Ge ekosistemiyle bilinmektedir."
            },
            # ... Buraya diğer 200 üniversiteyi aynı formatta ekleyebilirsin ama şimdilik sistemi kurmak için bunlar yeter.
        ]

        self.stdout.write("🚀 Üniversite kurulumu başlıyor...")

        for data in universities_data:
            slug = slugify(data['name'].replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c'))
            
            uni, created = University.objects.update_or_create(
                name=data['name'],
                defaults={
                    'slug': slug,
                    'city': data['city'],
                    'uni_type': data['type'],
                    'founded_year': data['founded'],
                    'website': data['web'],
                    'rector': data['rector'],
                    'description': data['desc']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Kuruldu: {data['name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"🔄 Güncellendi: {data['name']}"))

        self.stdout.write(self.style.SUCCESS("🎉 İşlem Tamam! Excel ile uğraşmana gerek kalmadı."))