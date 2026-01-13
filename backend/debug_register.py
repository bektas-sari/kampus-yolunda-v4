import requests
import json

url = "http://127.0.0.1:8000/api/register/"
headers = {"Content-Type": "application/json"}

# Senaryo 1: Çok kısa şifre (MinimumLengthValidator çalışıyor mu?)
data_weak = {
    "username": "debug_user_1",
    "email": "debug1@example.com",
    "password": "123" 
}

# Senaryo 2: Var olan kullanıcı (UniqueValidator çalışıyor mu?)
# Önceki testlerden 'testuser1' veya benzeri kalmış olabilir.
data_duplicate = {
    "username": "testuser_weak", # Bunu önceki testte kullanmıştık
    "email": "weak@example.com",
    "password": "password123"
}

def test_register(data, scenario_name):
    print(f"\n--- {scenario_name} ---")
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status: {response.status_code}")
        print("Response:", response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register(data_weak, "Scenario 1: Weak Password (123)")
    test_register(data_duplicate, "Scenario 2: Duplicate User")
