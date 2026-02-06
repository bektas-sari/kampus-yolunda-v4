import re
from django.core.management.base import BaseCommand
from api.models import University

class Command(BaseCommand):
    help = 'Veritabanındaki sayısal hataları (28, 219 vb.) etiketlere bakarak denetler ve düzeltir.'

    def parse_correctly(self, text):
        """
        DOĞRU HESAPLAMA MANTIĞI:
        1. Önce tüm noktaları sil (3.436 -> 3436, 55.000 -> 55000)
        2. Sonra sayıları bul.
        """
        if not text: return 0
        try:
            # Temizlik: Noktaları kaldır (Binlik ayraç hatasını önler)
            # "55.000" -> "55000" olur.
            clean_text = str(text).replace('.', '').replace(',', '')
            
            # Sayıları bul
            nums = [int(s) for s in re.findall(r'\d+', clean_text)]
            
            if not nums: return 0
            
            # Ortalama al (Aralık verilmişse ortasını bulur)
            return int(sum(nums) / len(nums))
        except:
            return 0

    def handle(self, *args, **kwargs):
        self.stdout.write("🕵️‍♂️ VERİ DENETİMİ VE ONARIMI BAŞLIYOR...")
        
        unis = University.objects.all()
        fixed_count = 0
        
        for uni in unis:
            # --- 1. ÖĞRENCİ SAYISI KONTROLÜ ---
            if uni.student_count_label:
                correct_val = self.parse_correctly(uni.student_count_label)
                
                # Hata Toleransı: Eğer mevcut sayı ile doğru sayı arasında fark varsa
                # Örn: Mevcut=28, Doğru=57500 -> FARK VAR, DÜZELT!
                # Örn: Mevcut=12000, Doğru=12000 -> FARK YOK, GEÇ.
                if abs(uni.student_count - correct_val) > 10: 
                    self.stdout.write(self.style.WARNING(f"🔧 DÜZELTİLDİ: {uni.name} [Öğrenci]"))
                    self.stdout.write(f"   Eski: {uni.student_count} -> Yeni: {correct_val} (Kaynak: {uni.student_count_label})")
                    
                    uni.student_count = correct_val
                    uni.save()
                    fixed_count += 1

            # --- 2. AKADEMİSYEN SAYISI KONTROLÜ ---
            if uni.academic_staff_label:
                correct_val = self.parse_correctly(uni.academic_staff_label)
                
                if abs(uni.academician_count - correct_val) > 5:
                    self.stdout.write(self.style.WARNING(f"🔧 DÜZELTİLDİ: {uni.name} [Akademisyen]"))
                    self.stdout.write(f"   Eski: {uni.academician_count} -> Yeni: {correct_val} (Kaynak: {uni.academic_staff_label})")
                    
                    uni.academician_count = correct_val
                    uni.save()
                    fixed_count += 1

        if fixed_count == 0:
            self.stdout.write(self.style.SUCCESS("✅ MÜKEMMEL: Hiçbir hata bulunamadı. Veriler temiz."))
        else:
            self.stdout.write(self.style.SUCCESS(f"🏁 TAMAMLANDI: Toplam {fixed_count} hatalı veri onarıldı."))