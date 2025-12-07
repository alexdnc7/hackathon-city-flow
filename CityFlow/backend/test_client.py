import requests
import os

# --- Configuratie ---
# Asigură-te că imaginea test.jpg există în acest folder!
# Folosește un JPEG mic, numit: test_image.jpg
IMAGE_FILENAME = "Zidurile Cetății.jpg" 
URL = "http://127.0.0.1:8000/verify"
LOCATION_NAME = "Zidurile Cetății"

print("\n--- TEST VISION START ---")

# Verificare existență fișier
if not os.path.exists(IMAGE_FILENAME):
    print(f"❌ Eroare: Fișierul '{IMAGE_FILENAME}' nu a fost găsit. Asigură-te că există în același director cu acest script.")
else:
    # --- Trimiterea Cererii ---
    # 'rb' înseamnă citire în mod binar
    files = {
        'file': open(IMAGE_FILENAME, 'rb')
    }
    
    data = {
        'location_name': LOCATION_NAME
    }
    
    try:
        # Aici se trimit datele
        response = requests.post(URL, files=files, data=data)
        
        # --- Afișare Rezultat ---
        print("\n--- Răspuns Server ---")
        print(f"Status Code: {response.status_code}")
        print("JSON Body:")
        print(response.json())
        
    except requests.exceptions.ConnectionError:
        print("\n!!! EROARE CRITICĂ: Conexiune refuzată. Asigură-te că serverul Uvicorn rulează.")
    except Exception as e:
        print(f"A apărut o eroare neașteptată: {e}")

print("\n--- TEST VISION END ---")