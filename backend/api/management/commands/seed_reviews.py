from django.core.management.base import BaseCommand
from api.models import Review, University, CampusVenue, Dormitory
from django.contrib.contenttypes.models import ContentType
import random

class Command(BaseCommand):
    help = 'Veritabanına rastgele ve gerçekçi öğrenci yorumları ekler (Social Proof)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Seeding işlemi başlıyor...'))

        # --- VERİ SETLERİ ---
        comments_pool = [
            "Kampüs harika ama yemekhane sıraları çok uzun.",
            "Kütüphane vize haftası çok dolu oluyor, sabah erken gelmek lazım.",
            "Manzarası efsane, özellikle gün batımında kahve içmek çok keyifli.",
            "Yurt imkanları fena değil ama internet biraz yavaş.",
            "Hocalar çok ilgili, kesinlikle tavsiye ederim.",
            "Fiyatlar öğrenci için biraz pahalı ama lezzeti yerinde.",
            "Ulaşım biraz sıkıntılı, ring saatlerine dikkat edin.",
            "Ortam çok samimi, herkes birbirine yardımcı oluyor.",
            "Laboratuvar imkanları gerçekten dünya standartlarında.",
            "Sosyal aktiviteler çok fazla, her gün bir etkinlik var.",
            "Yemekleri ev yemeği tadında, bayıldım.",
            "Sınavlar zorluyor ama öğreniyorsunuz.",
            "Kampüsün yeşilliği insana huzur veriyor.",
            "İnternet hızı kütüphanede çok iyi.",
            "Kantindeki çaylar efsane.",
        ]

        names_pool = [
            "Ahmet Y.", "Ayşe K.", "Mehmet T.", "Zeynep B.", "Ali C.", 
            "Fatma D.", "Mustafa E.", "Elif S.", "Burak Ö.", "Selin G.",
            "Caner K.", "Deniz A.", "Emre V.", "Gizem T.", "Hakan Ü."
        ]

        # --- HEDEF KİTLE ---
        target_unis = University.objects.filter(name__icontains="Teknik") | University.objects.filter(name__icontains="Ege")
        # Daha spesifik filtreleme:
        odtu = University.objects.filter(name__icontains="Orta Doğu Teknik").first()
        itu = University.objects.filter(name__icontains="İstanbul Teknik").first()
        ege = University.objects.filter(name__icontains="Ege Üniversitesi").first()
        
        selected_unis = [u for u in [odtu, itu, ege] if u]

        random_venues = list(CampusVenue.objects.all().order_by('?')[:5])
        random_dorms = list(Dormitory.objects.all().order_by('?')[:3])

        all_targets = selected_unis + random_venues + random_dorms

        if not all_targets:
            self.stdout.write(self.style.ERROR('Hiçbir hedef (Üniversite, Mekan, Yurt) bulunamadı!'))
            return

        total_reviews = 0

        for target in all_targets:
            # Modelin ContentType'ını al
            content_type = ContentType.objects.get_for_model(target)
            
            # Rastgele 3-5 yorum ekle
            count = random.randint(3, 5)
            
            for _ in range(count):
                # Puanlama mantığı: %70 ihtimalle 4-5, %30 ihtimalle 3
                rating = random.choice([5, 5, 4, 4, 4, 3, 3])
                
                comment_text = random.choice(comments_pool)
                author = random.choice(names_pool)

                Review.objects.create(
                    content_type=content_type,
                    object_id=target.id,
                    author_name=author,
                    rating=rating,
                    comment=comment_text,
                    is_approved=True
                )
                
                # TODO: İleride buraya gamification mantığı eklenecek. 
                # Kullanıcı 5. yorumunu yaptığında User modelindeki 'coffee_reward_eligible' alanı True yapılacak.

            target_name = getattr(target, 'name', str(target))
            self.stdout.write(self.style.SUCCESS(f"[OK] {target_name} için {count} yorum eklendi."))
            total_reviews += count

        self.stdout.write(self.style.SUCCESS(f"\nTOPLAM {total_reviews} ADET YORUM BAŞARIYLA EKLENDİ."))
