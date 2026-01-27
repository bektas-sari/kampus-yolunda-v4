import requests
import json

url = "http://127.0.0.1:8000/api/tercih-motoru/"
payload = {
    "student_ranking": 50000,
    "score_type": "SAY"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success! Response:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False)[:500] + "...")
    else:
        print("Error Response:")
        print(response.text)
except Exception as e:
    print(f"FAILED to connect: {e}")
