import json
import os
import math
import base64
import requests # Necesită instalarea librăriei requests
from openai import OpenAI
from dotenv import load_dotenv

# --- Configurare ---
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
besttime_key = os.getenv("BESTTIME_API_KEY")

client = OpenAI(api_key=api_key)

# --- FUNCTII AUXILIARE ---

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculează distanța Haversine între două puncte GPS în kilometri."""
    R = 6371  # Raza Pământului în km

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance_km = R * c
    return round(distance_km, 2)


# --- BAZA DE DATE STATICA & COORDONATE ---
LOCATIONS_DB = [
    {
        "id": "loc_1", "name": "Unirii Square", "address": "Piața Unirii Cluj-Napoca Romania", 
        "description": "Piața principală a orașului. Punctul zero, plin de terase.",
        "type": "mainstream", "lat": 46.7693, "long": 23.5898
    },
    {
        "id": "loc_2", "name": "Zidurile Cetății", "address": "Strada Potaissa Cluj-Napoca Romania", 
        "description": "O stradă pietonală boemă, liniștită, lângă zidul vechi al cetății.",
        "type": "hidden_gem", "lat": 46.7674, "long": 23.5866
    },
    {
        "id": "loc_3", "name": "Central Park Simion Bărnuțiu", "address": "Parcul Central Cluj-Napoca Romania", 
        "description": "Parc mare cu hamace și lac. Moderat de aglomerat.",
        "type": "mainstream", "lat": 46.7656, "long": 23.5822
    }
]

# --- FUNCTIA BUILD CONTEXT (Folosește Distanța + Forecast Calitativ) ---
def build_traffic_context(user_lat, user_long):
    context_text = "SITUAȚIA TRAFICULUI:\n"
    
    for loc in LOCATIONS_DB:
        
        # 1. Calculează distanța față de user
        distance = calculate_distance(user_lat, user_long, loc['lat'], loc['long'])
        
        # 2. APEL API: Încercăm să obținem Statusul Calitativ (Forecast)
        forecast_status = "N/A"
        try:
            url = "https://besttime.app/api/v1/forecasts/now"
            params = {
                'api_key_private': besttime_key,
                'venue_name': loc['name'],
                'venue_address': loc['address']
            }
            response = requests.post(url, params=params)
            data = response.json()
            
            # Verificăm statusul Forecast (Ex: High, Average, Low)
            if data.get('status') == 'OK' and 'analysis' in data:
                forecast_status = data['analysis'].get('forecasted_busyness_status', 'N/A')
            
        except Exception as e:
            print(f"Eroare Forecast BestTime: {e}")


        # 3. Logica de Aglomerație (Estimare Predictivă + Status Calitativ)
        if loc['type'] == 'mainstream':
            busyness = 85 # Estimare: Locațiile populare sunt aglomerate
        else:
            busyness = 15 # Estimare: Hidden Gems sunt libere

        # 4. Traducem procentul în cuvinte
        if busyness >= 70:
            crowd_level = "FOARTE AGLOMERAT (BUSY)"
        elif busyness >= 40:
            crowd_level = "MODERAT"
        else:
            crowd_level = "LIBER (FREE)"
            
        source = f"PREDICTIV ({forecast_status})"
            
        # 5. Construim string-ul final (Include FORECAST STATUS și DISTANȚĂ)
        context_text += (
            f"- ID: {loc['id']} | {loc['name']}: {busyness}% ({crowd_level}) | FORECAST: {forecast_status} | DISTANȚĂ: {distance} km | Sursa: {source}\n"
        )
        
    return context_text

# --- FUNCTII PRINCIPALE ---

def get_ai_response(user_msg, lat, long):
    
    traffic_data_context = build_traffic_context(lat, long)

    system_prompt = f"""
    Ești "CityFlow", un ghid local inteligent din Cluj. Misiunea ta este să gestionezi overtourism-ul.
    
    DATE TRAFIC:
    {traffic_data_context}
    
    INSTRUCȚIUNI:
    1. Analizează aglomerația predictivă (Busyness %) și statusul (FORECAST). Dacă userul vrea să meargă într-un loc BUSY, refuză politicos.
    2. Recomandă cea mai bună alternativă: o locație marcată "LIBER" care este **cea mai APROAPE (distanță minimă)** de utilizator.
    3. Folosește distanța și procentele în răspuns (Ex: 'Este la doar 1.2 km de tine și e 15% plin!').
    4. Fii scurt și la obiect.
    
    FORMAT JSON OBLIGATORIU:
    {{
        "text": "Mesajul tău conversațional aici...",
        "suggested_location_id": "loc_2" (sau null),
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
        return {"text": "Am o problemă tehnică de rețea. Te rog încearcă din nou.", "suggested_location_id": None, "coins_reward": 0}


def verify_image_with_ai(image_bytes, target_location_name):
    """Verifică poza userului folosind GPT-4 Vision."""
    
    print(f"📸 Analizez imaginea pentru locația: {target_location_name}")
    
    # Conversie bytes -> Base64
    try:
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        print(f"✅ Imagine convertită în base64 ({len(base64_image)} caractere)")
    except Exception as e:
        print(f"❌ Eroare la conversia în base64: {e}")
        return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}

    prompt = f"Utilizatorul susține că este la '{target_location_name}'. Analizează imaginea și confirmă vizual că este acel loc sau o parte clară a acestuia. Răspunde strict JSON: {{\"is_match\": true/false, \"reason\": \"motivul scurt\"}}."

    try:
        print("📡 Trimit cererea la OpenAI GPT-4 Vision...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": [ 
                    {"type": "text", "text": prompt}, 
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}} 
                ]}
            ],
            response_format={"type": "json_object"},
            max_tokens=300
        )
        
        print(f"✅ Răspuns primit de la OpenAI")
        
        # --- VERIFICARE DEFENSIVĂ (REPARĂ EROAREA NoneType) ---
        if not response or not response.choices:
            print("❌ Eroare: Răspuns OpenAI gol (nicio alegere disponibilă)")
            return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}
        
        if not response.choices[0].message:
            print("❌ Eroare: Mesaj gol în răspuns")
            return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}
        
        content = response.choices[0].message.content
        
        if not content or content.strip() == "":
            print("❌ Eroare: Conținut gol în mesaj")
            return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}
        
        print(f"📝 Conținut primit: {content[:100]}...")
        
        # Dacă totul e OK, citim JSON-ul
        try:
            result = json.loads(content)
        except json.JSONDecodeError as parse_error:
            print(f"❌ Eroare la parsarea JSON: {parse_error}")
            print(f"📍 Conținut care nu s-a putut parsa: {content}")
            return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}
        
        if result.get("is_match") is True:
            print("🚀 Verificare reușită!")
            return {"verified": True, "coins": 50, "message": f"Super! AI-ul a confirmat că ești la {target_location_name}. Ai primit 50 coins!"}
        else:
            print(f"❌ Verificare eșuată: {result.get('reason', 'Detalii insuficiente')}")
            return {"verified": False, "message": f"Hmm, AI-ul nu recunoaște locul. ({result.get('reason', 'Detalii insuficiente')}) Mai încearcă o poză mai clară."}

    except Exception as e:
        # Aceasta prinde erorile de rețea sau cele care depășesc rate limit-ul
        print(f"❌ Eroare neașteptată: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}