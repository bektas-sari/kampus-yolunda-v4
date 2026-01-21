from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# --- ÖZELLİK HAVUZU ---
class Feature(models.Model):
    name = models.CharField(max_length=100, verbose_name="Özellik Adı")
    icon = models.CharField(max_length=50, blank=True, verbose_name="İkon Kodu (Lucide)", help_text="Örn: Wifi, Coffee")
    
    def __str__(self): return self.name
    class Meta:
        verbose_name = "Özellik / İkon"
        verbose_name_plural = "Özellik Havuzu"

# --- ÜNİVERSİTE MODELİ ---
class University(models.Model):
    TYPE_CHOICES = [('DEVLET', 'Devlet'), ('VAKIF', 'Vakıf'), ('OZEL', 'Özel'), ('KIBRIS', 'Kıbrıs'), ('YABANCI', 'Yabancı')]
    
    # Şehir listesi
    CITY_CHOICES = [
        ('ISTANBUL', 'İstanbul'), ('ANKARA', 'Ankara'), ('IZMIR', 'İzmir'), ('ANTALYA', 'Antalya'),
        ('ADANA', 'Adana'), ('ADIYAMAN', 'Adıyaman'), ('AFYONKARAHISAR', 'Afyonkarahisar'), ('AGRI', 'Ağrı'),
        ('AKSARAY', 'Aksaray'), ('AMASYA', 'Amasya'), ('ARDAHAN', 'Ardahan'), ('ARTVIN', 'Artvin'),
        ('AYDIN', 'Aydın'), ('BALIKESIR', 'Balıkesir'), ('BARTIN', 'Bartın'), ('BATMAN', 'Batman'),
        ('BAYBURT', 'Bayburt'), ('BILECIK', 'Bilecik'), ('BINGOL', 'Bingöl'), ('BITLIS', 'Bitlis'),
        ('BOLU', 'Bolu'), ('BURDUR', 'Burdur'), ('BURSA', 'Bursa'), ('CANAKKALE', 'Çanakkale'),
        ('CANKIRI', 'Çankırı'), ('CORUM', 'Çorum'), ('DENIZLI', 'Denizli'), ('DIYARBAKIR', 'Diyarbakır'),
        ('DUZCE', 'Düzce'), ('EDIRNE', 'Edirne'), ('ELAZIG', 'Elazığ'), ('ERZINCAN', 'Erzincan'),
        ('ERZURUM', 'Erzurum'), ('ESKISEHIR', 'Eskişehir'), ('GAZIANTEP', 'Gaziantep'), ('GIRESUN', 'Giresun'),
        ('GUMUSHANE', 'Gümüşhane'), ('HAKKARI', 'Hakkari'), ('HATAY', 'Hatay'), ('IGDIR', 'Iğdır'),
        ('ISPARTA', 'Isparta'), ('KAHRAMANMARAS', 'Kahramanmaraş'), ('KARABUK', 'Karabük'), ('KARAMAN', 'Karaman'),
        ('KARS', 'Kars'), ('KASTAMONU', 'Kastamonu'), ('KAYSERI', 'Kayseri'), ('KIRIKKALE', 'Kırıkkale'),
        ('KIRKLARELI', 'Kırklareli'), ('KIRSEHIR', 'Kırşehir'), ('KILIS', 'Kilis'), ('KOCAELI', 'Kocaeli'),
        ('KONYA', 'Konya'), ('KUTAHYA', 'Kütahya'), ('MALATYA', 'Malatya'), ('MANISA', 'Manisa'),
        ('MARDIN', 'Mardin'), ('MERSIN', 'Mersin'), ('MUGLA', 'Muğla'), ('MUS', 'Muş'),
        ('NEVSEHIR', 'Nevşehir'), ('NIGDE', 'Niğde'), ('ORDU', 'Ordu'), ('OSMANIYE', 'Osmaniye'),
        ('RIZE', 'Rize'), ('SAKARYA', 'Sakarya'), ('SAMSUN', 'Samsun'), ('SIIRT', 'Siirt'),
        ('SINOP', 'Sinop'), ('SIVAS', 'Sivas'), ('SANLIURFA', 'Şanlıurfa'), ('SIRNAK', 'Şırnak'),
        ('TEKIRDAG', 'Tekirdağ'), ('TOKAT', 'Tokat'), ('TRABZON', 'Trabzon'), ('TUNCELI', 'Tunceli'),
        ('USAK', 'Uşak'), ('VAN', 'Van'), ('YALOVA', 'Yalova'), ('YOZGAT', 'Yozgat'), ('ZONGULDAK', 'Zonguldak')
    ]

    name = models.CharField(max_length=200, verbose_name="Üniversite Adı")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="URL Yolu (Slug)")
    city = models.CharField(max_length=50, choices=CITY_CHOICES, verbose_name="Şehir")
    uni_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='DEVLET', verbose_name="Üniversite Türü")
    
    is_promoted = models.BooleanField(default=False, verbose_name="Öne Çıkan / Tavsiye (Reklam)")

    founded_year = models.IntegerField(null=True, blank=True, verbose_name="Kuruluş Yılı")
    rector = models.CharField(max_length=100, blank=True, verbose_name="Rektör")
    
    # İstatistikler
    student_count = models.IntegerField(default=0, verbose_name="Toplam Öğrenci Sayısı")
    academician_count = models.IntegerField(default=0, verbose_name="Toplam Akademisyen Sayısı")
    prof_count = models.IntegerField(default=0, verbose_name="Profesör Sayısı")
    doc_count = models.IntegerField(default=0, verbose_name="Doçent Sayısı")
    dr_count = models.IntegerField(default=0, verbose_name="Dr. Öğr. Üyesi Sayısı")
    
    education_language = models.CharField(max_length=50, blank=True, null=True, verbose_name="Eğitim Dili")
    video_url = models.URLField(blank=True, null=True, verbose_name="Tanıtım Videosu (Youtube Embed)")

    description = models.TextField(blank=True, verbose_name="Açıklama / Hakkında")
    
    website = models.URLField(blank=True, verbose_name="Web Sitesi")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Telefon")
    email = models.EmailField(blank=True, verbose_name="E-posta")
    address = models.TextField(blank=True, verbose_name="Adres")
    map_location = models.CharField(max_length=500, blank=True, verbose_name="Harita Embed Linki")
    
    logo = models.ImageField(upload_to='uni_logos/', blank=True, null=True, verbose_name="Üniversite Logosu")
    cover_image = models.ImageField(upload_to='uni_covers/', blank=True, null=True, verbose_name="Kapak Görseli")
    
    features = models.ManyToManyField(Feature, blank=True, verbose_name="Kampüs İmkanları")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    admin_user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_university', verbose_name="Yetkili Yönetici")

    class Meta:
        verbose_name = "Üniversite"
        verbose_name_plural = "Üniversiteler"

    def __str__(self): return self.name

# --- KAMPÜS MEKANI ---
class CampusVenue(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='venues', verbose_name="Bağlı Üniversite")
    name = models.CharField(max_length=100, verbose_name="Mekan Adı")
    venue_type = models.CharField(max_length=50, verbose_name="Mekan Türü (Cafe, Kırtasiye vb.)")
    image = models.ImageField(upload_to='venues/', verbose_name="Mekan Görseli")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0, verbose_name="Puan (5 üzerinden)")
    distance = models.CharField(max_length=50, verbose_name="Uzaklık Bilgisi")
    is_sponsored = models.BooleanField(default=False, verbose_name="Sponsorlu Mekan")
    discount_text = models.CharField(max_length=100, blank=True, verbose_name="İndirim Metni")
    
    description = models.TextField(blank=True, verbose_name="Mekan Açıklaması")
    amenities = models.TextField(blank=True, verbose_name="İmkanlar", help_text="Virgülle ayırarak yazınız (Örn: Wifi, Teras, Priz)")
    working_hours = models.TextField(blank=True, verbose_name="Çalışma Saatleri", help_text="Örn: Hafta İçi: 09:00 - 20:00")
    
    class Meta:
        verbose_name = "Kampüs Mekanı"
        verbose_name_plural = "Kampüs Mekanları"

    def __str__(self): return f"{self.name} ({self.university.name})"

# --- GALERİ & BÖLÜMLER ---
class UniversityImage(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='gallery_images', verbose_name="Üniversite")
    image = models.ImageField(upload_to='uni_gallery/', verbose_name="Galeri Resmi")
    
    class Meta:
        verbose_name = "Üniversite Galeri Resmi"
        verbose_name_plural = "Üniversite Galerisi"

class Department(models.Model):
    SCORE_TYPES = [
        ('SAY', 'Sayısal'), ('EA', 'Eşit Ağırlık'), ('SOZ', 'Sözel'), 
        ('DIL', 'Dil'), ('TYT', 'TYT')
    ]
    
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='departments', verbose_name="Üniversite")
    program_code = models.CharField(max_length=20, unique=True, verbose_name="Program Kodu (YÖK ID)")
    name = models.CharField(max_length=200, verbose_name="Bölüm Adı")
    faculty = models.CharField(max_length=200, blank=True, verbose_name="Fakülte")
    language = models.CharField(max_length=50, default="Türkçe", verbose_name="Eğitim Dili")
    duration = models.IntegerField(default=4, verbose_name="Süre (Yıl)")
    score_type = models.CharField(max_length=10, choices=SCORE_TYPES, default='SAY', verbose_name="Puan Türü")
    education_type = models.CharField(max_length=50, default="Örgün Öğretim", verbose_name="Öğretim Türü")
    quota = models.IntegerField(null=True, blank=True, verbose_name="Genel Kontenjan")
    school_rank_quota = models.IntegerField(null=True, blank=True, verbose_name="Okul 1. Kontenjanı")
    base_score = models.FloatField(null=True, blank=True, verbose_name="Taban Puan (2024)")
    ranking = models.IntegerField(null=True, blank=True, verbose_name="Başarı Sıralaması (2024)")
    special_conditions = models.TextField(blank=True, verbose_name="Özel Koşullar")
    accreditation = models.CharField(max_length=100, blank=True, verbose_name="Akreditasyon")

    class Meta:
        verbose_name = "Bölüm / Program"
        verbose_name_plural = "Bölümler"

    def __str__(self): return f"{self.name} - {self.university.name}"

# --- YURT MODELİ ---
class Dormitory(models.Model):
    TYPE_CHOICES = [('KIZ', 'Kız Yurdu'), ('ERKEK', 'Erkek Yurdu'), ('KARMA', 'Karma Yurt'), ('APART', 'Öğrenci Apartı')]
    CITY_CHOICES = University.CITY_CHOICES 

    name = models.CharField(max_length=200, verbose_name="Yurt Adı")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="URL Yolu")
    
    universities = models.ManyToManyField(University, through='DormitoryDistance', related_name='dormitories', verbose_name="Hizmet Verilen Üniversiteler")

    dorm_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='KARMA', verbose_name="Yurt Tipi")
    city = models.CharField(max_length=50, choices=CITY_CHOICES, verbose_name="Şehir")
    district = models.CharField(max_length=100, verbose_name="İlçe/Semt")
    address = models.TextField(blank=True, verbose_name="Tam Adres")
    price = models.IntegerField(verbose_name="Fiyat", help_text="Yıllık/Aylık")
    capacity = models.IntegerField(default=0, blank=True, verbose_name="Kapasite")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    
    phone = models.CharField(max_length=20, blank=True, verbose_name="Telefon")
    email = models.EmailField(blank=True, verbose_name="E-posta")
    website = models.URLField(blank=True, verbose_name="Web Sitesi")
    
    logo = models.ImageField(upload_to='dorm_logos/', blank=True, null=True, verbose_name="Yurt Logosu")
    cover_image = models.ImageField(upload_to='dorm_covers/', blank=True, null=True, verbose_name="Kapak Resmi")
    features = models.ManyToManyField(Feature, blank=True, verbose_name="Yurt Özellikleri")
    
    is_promoted = models.BooleanField(default=False, verbose_name="Ana Vitrin (Promoted)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme")

    class Meta:
        verbose_name = "Yurt"
        verbose_name_plural = "Yurtlar"

    def __str__(self): return self.name

class DormitoryDistance(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, verbose_name="Üniversite")
    dormitory = models.ForeignKey(Dormitory, on_delete=models.CASCADE, verbose_name="Yurt")
    distance_text = models.CharField(max_length=100, verbose_name="Mesafe Bilgisi", help_text="Örn: 5 dk Yürüme")
    is_partner = models.BooleanField(default=False, verbose_name="Vitrin/Partner Gösterimi")
    
    class Meta:
        unique_together = ('university', 'dormitory')
        verbose_name = "Yurt-Üniversite Mesafe Kaydı"
        verbose_name_plural = "Hizmet İlişkileri (Mesafe)"

class DormitoryImage(models.Model):
    dormitory = models.ForeignKey(Dormitory, on_delete=models.CASCADE, related_name='gallery_images', verbose_name="Yurt")
    image = models.ImageField(upload_to='dorm_gallery/', verbose_name="Galeri Resmi")
    class Meta:
        verbose_name = "Yurt Galeri Resmi"
        verbose_name_plural = "Yurt Galerisi"

# --- ÖĞRENCİ EVİ & DİĞERLERİ ---
class StudentHouse(models.Model):
    CITY_CHOICES = University.CITY_CHOICES
    title = models.CharField(max_length=200, verbose_name="İlan Başlığı")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="URL Yolu")
    city = models.CharField(max_length=50, choices=CITY_CHOICES, verbose_name="Şehir")
    district = models.CharField(max_length=100, verbose_name="İlçe")
    room_count = models.CharField(max_length=20, verbose_name="Oda Sayısı")
    price = models.IntegerField(verbose_name="Fiyat")
    is_furnished = models.BooleanField(default=True, verbose_name="Eşyalı mı?")
    square_meters = models.IntegerField(null=True, blank=True, verbose_name="Metrekare")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    features = models.ManyToManyField(Feature, blank=True, verbose_name="Ev Özellikleri")
    contact_phone = models.CharField(max_length=20, blank=True, verbose_name="İletişim Tel")
    cover_image = models.ImageField(upload_to='house_covers/', blank=True, null=True, verbose_name="Kapak Resmi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme")

    is_promoted = models.BooleanField(default=False, verbose_name="Öne Çıkan / Tavsiye (Reklam)")
    
    class Meta:
        verbose_name = "Öğrenci Evi"
        verbose_name_plural = "Öğrenci Evleri"
    def __str__(self): return self.title

class HouseImage(models.Model):
    house = models.ForeignKey(StudentHouse, on_delete=models.CASCADE, related_name='gallery_images', verbose_name="Öğrenci Evi")
    image = models.ImageField(upload_to='house_gallery/', verbose_name="Resim")
    class Meta:
        verbose_name = "Ev Resmi"
        verbose_name_plural = "Ev Galerisi"

# --- FAVORİLER ---
class FavoriteStudentHouse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_houses', verbose_name="Kullanıcı")
    student_house = models.ForeignKey(StudentHouse, on_delete=models.CASCADE, related_name='favorited_by', verbose_name="Öğrenci Evi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarih")
    class Meta: 
        unique_together = ('user', 'student_house')
        verbose_name = "Favori Ev"
        verbose_name_plural = "Favori Evler"

class FavoriteUniversity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_universities', verbose_name="Kullanıcı")
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='favorited_by', verbose_name="Üniversite")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarih")
    class Meta: 
        unique_together = ('user', 'university')
        verbose_name = "Favori Üniversite"
        verbose_name_plural = "Favori Üniversiteler"

class FavoriteDormitory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_dormitories', verbose_name="Kullanıcı")
    dormitory = models.ForeignKey(Dormitory, on_delete=models.CASCADE, related_name='favorited_by', verbose_name="Yurt")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarih")
    class Meta: 
        unique_together = ('user', 'dormitory')
        verbose_name = "Favori Yurt"
        verbose_name_plural = "Favori Yurtlar"

# --- BURS & HABERLER ---
class Scholarship(models.Model):
    LEVEL_CHOICES = [('Lise', 'Lise'), ('Lisans', 'Lisans'), ('YuksekLisans', 'Yüksek Lisans'), ('Doktora', 'Doktora')]
    CATEGORY_CHOICES = [('Basari', 'Başarı'), ('Ihtiyac', 'İhtiyaç'), ('Spor', 'Spor'), ('Sanat', 'Sanat'), ('Kurumsal', 'Kurumsal'), ('KYK', 'KYK')]
    
    title = models.CharField(max_length=200, verbose_name="Burs Adı")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="URL Yolu")
    provider = models.CharField(max_length=200, verbose_name="Burs Veren Kurum")
    logo = models.ImageField(upload_to='scholarships/logos/', blank=True, null=True, verbose_name="Kurum Logosu")
    description = models.TextField(verbose_name="Açıklama")
    requirements = models.TextField(verbose_name="Başvuru Şartları")
    amount = models.CharField(max_length=100, verbose_name="Burs Miktarı")
    deadline = models.DateField(verbose_name="Son Başvuru Tarihi")
    city = models.CharField(max_length=50, choices=University.CITY_CHOICES, blank=True, null=True, verbose_name="Şehir (Varsa)")
    education_level = models.CharField(max_length=50, choices=LEVEL_CHOICES, default='Lisans', verbose_name="Eğitim Seviyesi")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Basari', verbose_name="Kategori")
    application_url = models.URLField(blank=True, verbose_name="Başvuru Linki")
    is_active = models.BooleanField(default=True, verbose_name="Aktif mi?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme")
    
    class Meta: 
        verbose_name = "Burs Fırsatı"
        verbose_name_plural = "Burs Fırsatları"
    def __str__(self): return self.title

# --- HABERLER (Temizlendi: Embed/Show alanları kaldırıldı) ---
class News(models.Model):
    CATEGORY_CHOICES = [('Gundem', 'Gündem'), ('Sinav', 'Sınav'), ('Kariyer', 'Kariyer'), ('Yasam', 'Yaşam'), ('Teknoloji', 'Teknoloji'), ('Burslar', 'Burslar')]
    
    title = models.CharField(max_length=255, verbose_name="Haber Başlığı")
    slug = models.SlugField(max_length=255, unique=True, blank=True, verbose_name="URL Yolu")
    cover_image = models.ImageField(upload_to='news/covers/', verbose_name="Kapak Resmi")
    summary = models.TextField(max_length=300, blank=True, null=True, verbose_name="Özet (Kısa Açıklama)")
    content = models.TextField(verbose_name="İçerik")
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Yasam', verbose_name="Kategori")
    author = models.CharField(max_length=100, default="Kampüs Editör", verbose_name="Yazar")
    is_published = models.BooleanField(default=True, verbose_name="Yayında mı?")
    is_breaking = models.BooleanField(default=False, verbose_name="Son Dakika?")
    is_featured = models.BooleanField(default=False, verbose_name="Öne Çıkan?")
    published_at = models.DateTimeField(auto_now_add=True, verbose_name="Yayın Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme")
    
    class Meta: 
        verbose_name = "Haber"
        verbose_name_plural = "Haberler"
        ordering = ['-published_at']
    
    def __str__(self): return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            import uuid
            self.slug = f"{slugify(self.title)}-{str(uuid.uuid4())[:8]}"
        super().save(*args, **kwargs)

# --- İSTATİSTİKLER ---
class UniversityStats(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='daily_stats', verbose_name="Üniversite")
    date = models.DateField(auto_now_add=True, verbose_name="Tarih")
    
    page_views = models.PositiveIntegerField(default=0, verbose_name="Sayfa Görüntülenme")
    search_appearances = models.PositiveIntegerField(default=0, verbose_name="Aramada Görünme")
    website_clicks = models.PositiveIntegerField(default=0, verbose_name="Website Tıklama")
    phone_clicks = models.PositiveIntegerField(default=0, verbose_name="Telefon Tıklama")
    
    class Meta:
        unique_together = ('university', 'date')
        verbose_name = "Üniversite İstatistiği"
        verbose_name_plural = "Üniversite İstatistikleri"
        indexes = [
            models.Index(fields=['date', 'university']),
        ]

    def __str__(self):
        return f"{self.university.name} - {self.date}"

class DepartmentStats(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='stats', verbose_name="Bölüm")
    date = models.DateField(auto_now_add=True, verbose_name="Tarih")
    page_views = models.PositiveIntegerField(default=0, verbose_name="Görüntülenme")

    class Meta:
        unique_together = ('department', 'date')
        verbose_name = "Bölüm İstatistiği"
        verbose_name_plural = "Bölüm İstatistikleri"

# --- LEAD (FORM BAŞVURULARI) ---
class Lead(models.Model):
    LEAD_TYPES = (
        ('SCHOLARSHIP', 'Burs Başvurusu'),
        ('INFO_REQUEST', 'Bilgi Talebi'),
        ('CAMPUS_TOUR', 'Kampüs Turu İsteği'),
        ('DORM_APPLY', 'Yurt Başvurusu'),
    )
    
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='leads', null=True, blank=True, verbose_name="İlgili Üniversite")
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı (Varsa)")
    
    lead_type = models.CharField(max_length=20, choices=LEAD_TYPES, verbose_name="Talep Türü")
    name = models.CharField(max_length=100, verbose_name="Ad Soyad")
    email = models.EmailField(verbose_name="E-posta")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefon")
    message = models.TextField(blank=True, null=True, verbose_name="Mesaj")
    
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name="IP Adresi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarih")
    is_read = models.BooleanField(default=False, verbose_name="Okundu mu?")

    class Meta:
        verbose_name = "Gelen Talep (Lead)"
        verbose_name_plural = "Gelen Talepler (Leads)"

    def __str__(self):
        return f"{self.get_lead_type_display()} - {self.name}"

# --- DİĞER BAĞLANTILAR ---

class StudentHouseConnection(models.Model):
    """
    Bir Üniversite ile Bir Öğrenci Evi arasındaki bağlantıyı ve mesafeyi tutar.
    """
    university = models.ForeignKey(
        'University', 
        on_delete=models.CASCADE, 
        related_name='connected_houses',
        verbose_name="Üniversite"
    )
    house = models.ForeignKey(
        'StudentHouse', 
        on_delete=models.CASCADE, 
        related_name='connected_universities',
        verbose_name="Öğrenci Evi"
    )
    distance_text = models.CharField(
        max_length=100, 
        verbose_name="Mesafe Bilgisi (Örn: 10 dk yürüme)",
        default="Bilinmiyor"
    )
    is_promoted = models.BooleanField(
        default=False, 
        verbose_name="Vitrin/Partner Gösterimi"
    )

    class Meta:
        verbose_name = "Üniversiteye Yakın Ev Bağlantısı"
        verbose_name_plural = "Üniversiteye Yakın Ev Bağlantıları"
        unique_together = ('university', 'house') 

    def __str__(self):
        return f"{self.university.name} - {self.house.title}"

class Promotion(models.Model):
    university = models.OneToOneField(University, on_delete=models.CASCADE, related_name='promotion')
    title = models.CharField(max_length=200, verbose_name="Başlık (Örn: %50 Burs İmkanı)")
    subtitle = models.CharField(max_length=200, verbose_name="Alt Başlık", blank=True)
    description = models.TextField(verbose_name="Kısa Açıklama")
    image = CloudinaryField(verbose_name="Reklam Görseli", blank=True, null=True)
    button_text = models.CharField(max_length=50, default="Detaylı Bilgi", verbose_name="Buton Yazısı")
    button_link = models.URLField(verbose_name="Yönlenecek Link")
    is_active = models.BooleanField(default=True, verbose_name="Yayında mı?")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reklam: {self.university.name}"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    author_name = models.CharField(max_length=100, default="Misafir Kullanıcı", verbose_name="Yaz görünen Ad")
    rating = models.IntegerField(default=5, verbose_name="Puan (1-5)")
    comment = models.TextField(verbose_name="Yorum")
    is_approved = models.BooleanField(default=True, verbose_name="Onaylandı mı?")
    
    # Generic Relations
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarih")

    class Meta:
        verbose_name = "Yorum / Değerlendirme"
        verbose_name_plural = "Yorumlar"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author_name} - {self.content_type.model} ({self.rating} Puan)"

# --- YENİ MODEL: KAMPÜS REELS / VİDEO GALERİ ---
class CampusReel(models.Model):
    title = models.CharField(max_length=255, verbose_name="Video Başlığı")
    
    # İlişki: Bu video hangi üniversiteye ait? (Boş bırakılırsa genel videodur)
    university = models.ForeignKey(
        'University', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reels', 
        verbose_name="İlgili Üniversite"
    )
    
    embed_code = models.TextField(
        verbose_name="Embed Kodu",
        help_text="Instagram/Youtube embed kodunu buraya yapıştırın."
    )
    
    show_on_homepage = models.BooleanField(default=False, verbose_name="Anasayfa Vitrininde Göster")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Eklenme Tarihi")

    class Meta:
        verbose_name = "Kampüs Reels"
        verbose_name_plural = "Kampüs Reels Videoları"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.university.name if self.university else 'Genel'}"