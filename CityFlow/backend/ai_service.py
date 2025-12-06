import json
import os
import base64
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
besttime_key = os.getenv("BESTTIME_API_KEY")
client = OpenAI(api_key=api_key)

# --- FUNCTIE NOUA: FETCH LIVE TRAFFIC ---
def get_live_traffic_data():
    """
    1. Citește locațiile din traffic.json.
    2. Pentru fiecare, întreabă BestTime.app cât e de aglomerat.
    3. Construiește contextul pentru AI.
    """
    context_string = "SITUAȚIA LIVE A TRAFICULUI (BestTime Data):\n"
    
    try:
        with open('traffic.json', 'r', encoding='utf-8') as f:
            locations = json.load(f)

        for loc in locations:
            # -- SIMULARE FALLBACK -- 
            # Daca nu vrei sa consumi credite BestTime la fiecare refresh in dev,
            # decomenteaza liniile de mai jos si comenteaza apelul API real.
            
            # traffic_percent = 85 if loc['type'] == 'mainstream' else 10
            # status = "BUSY" if traffic_percent > 70 else "FREE"
            
            # -- APEL REAL BESTTIME (New Foot Traffic API) --
            # Folosim endpoint-ul de search/forecast
            url = "https://besttime.app/api/v1/forecasts/now"
            params = {
                'api_key_private': besttime_key,
                'venue_name': loc['name'],
                'venue_address': loc['address']
            }
            
            try:
                response = requests.post(url, params=params)
                data = response.json()
                
                if data.get('status') == 'OK':
                    # BestTime returneaza 0-100 busyness
                    traffic_percent = data['analysis']['venue_live_busyness']
                    # Traducem procentul in cuvinte pentru AI
                    if traffic_percent >= 70:
                        status = "BUSY"
                    elif traffic_percent >= 40:
                        status = "MODERATE"
                    else:
                        status = "FREE"
                else:
                    # Fallback daca nu gaseste locatia
                    traffic_percent = 50
                    status = "UNKNOWN"
            except Exception as e:
                print(f"Eroare BestTime pt {loc['name']}: {e}")
                traffic_percent = 0
                status = "FREE (Eroare date)"

            # Construim textul pentru AI
            context_string += (
                f"- ID: {loc['id']} | Nume: {loc['name']} | "
                f"Grad Ocupare: {traffic_percent}% ({status}) | "
                f"Tip: {loc['type']} | Descriere: {loc['description']}\n"
            )

        return context_string

    except Exception as e:
        print(f"Eroare generala traffic: {e}")
        return "Nu am putut prelua datele live."

# --- FUNCTII PRINCIPALE ---

def get_ai_response(user_msg, lat, long):
    
    # AICI SE FACE APELUL LIVE ACUM
    traffic_data_context = get_live_traffic_data()

    system_prompt = f"""
    Ești un asistent turistic local numit "CityFlow".
    Obiectivul tău: Să ajuți utilizatorii să evite aglomerația (BUSY/High %) și să descopere locuri libere (FREE/Low %).
    
    DATE LIVE DESPRE LOCAȚII (De la Senzori):
    {traffic_data_context}
    
    COORDONATELE UTILIZATORULUI: {lat}, {long}
    
    INSTRUCȚIUNI:
    1. Analizează datele de 'Grad Ocupare'. Dacă userul vrea undeva cu >70%, recomandă alternativa cu cel mai mic %.
    2. Dacă recomandarea e acceptată, spune-i că primește monede (coins) pentru validare foto.
    3. Fii scurt.
    
    FORMAT JSON OBLIGATORIU:
    {{
        "text": "Mesaj...",
        "suggested_location_id": "id_locatie sau null",
        "coins_reward": 50
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg}
            ],
            response_format={"type": "json_object"}, 
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content)

    except Exception as e:
        print(f"Eroare OpenAI: {e}")
        return {"text": "Eroare AI.", "suggested_location_id": None, "coins_reward": 0}

# (Păstrează funcția verify_image_with_ai exact cum era, e buna!)
def verify_image_with_ai(image_bytes, target_location_name):
    # ... codul tau vechi ramane la fel aici ...
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    prompt = f"Verifică dacă poza este de la '{target_location_name}'. JSON: {{ \"is_match\": true/false, \"reason\": \"...\" }}"
    
    # ... restul functiei tale ...
    # (Doar adaug-o aici ca sa fie fisierul complet, 
    # am scurtat-o in exemplu ca sa vezi modificarile de mai sus)
    pass