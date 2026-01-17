
#!/usr/bin/env bash
# exit on error
set -o errexit

# Paketleri kur
pip install -r requirements.txt

# Statik dosyaları topla (CSS/JS - WhiteNoise için şart)
python manage.py collectstatic --noinput

# Veritabanı tablolarını güncelle
python manage.py migrate