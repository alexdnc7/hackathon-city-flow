import requests
import json
import os

# --- CONFIGURARE ---
BASE_URL = "http://127.0.0.1:8000"
CHAT_URL = f"{BASE_URL}/chat"
VERIFY_URL = f"{BASE_URL}/verify"

print("=" * 60)
print("🧪 CityFlow Backend Test Suite")
print("=" * 60)

# ===== TEST 1: CHAT ENDPOINT =====
print("\n📝 TEST 1: Chat Endpoint")
print("-" * 60)

test_message = "Recomandă-mi un loc liber în Cluj"
chat_data = {
    "message": test_message,
    "lat": 46.7693,
    "long": 23.5898
}

try:
    response = requests.post(CHAT_URL, json=chat_data, timeout=10)
    print(f"✅ Status Code: {response.status_code}")
    
    if response.status_code == 200:
    result = response.json()
    print(f"✅ AI Response: {result.get('text', 'N/A')}")
    print(f"   Locații sugerate: {len(result.get('suggested_locations', []))}")
    print(f"   Itinerariu: {result.get('itinerary', 'N/A')}")
    else:
        print(f"❌ Error: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ EROARE: Nu pot conecta la server. Rulează: python main.py")
except requests.exceptions.Timeout:
    print("❌ EROARE: Timeout. OpenAI API este lent sau nu răspunde.")
except Exception as e:
    print(f"❌ Eroare neașteptată: {e}")

# ===== TEST 2: VERIFY ENDPOINT (dacă există imagine) =====
print("\n📸 TEST 2: Verify Endpoint (Imagine)")
print("-" * 60)

IMAGE_FILENAME = "Zidurile Cetății.jpg" 

if os.path.exists(IMAGE_FILENAME):
    try:
        files = {
            'file': open(IMAGE_FILENAME, 'rb')
        }
        data = {
            'location_name': "Zidurile Cetății"
        }
        
        response = requests.post(VERIFY_URL, files=files, data=data, timeout=30)
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Verified: {result.get('verified', False)}")
            print(f"   Message: {result.get('message', 'N/A')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Eroare: {e}")
else:
    print(f"⚠️  Fișierul '{IMAGE_FILENAME}' nu găsit. Sar peste test.")

print("\n" + "=" * 60)
print("✅ Teste complete!")
print("=" * 60)
