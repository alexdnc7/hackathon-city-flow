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
    },
    {
        "id": "loc_4", "name": "Piața Muzeului", "address": "Piața Muzelor Cluj-Napoca Romania",
        "description": "Piața frumoasă și liniștită cu o atmosferă culturală. Perfectă pentru poze Instagram.",
        "type": "hidden_gem", "lat": 46.7677, "long": 23.5945
    },
    {
        "id": "loc_5", "name": "Casa Boema", "address": "Strada Memorandumului Cluj-Napoca Romania",
        "description": "Restaurant tradiționalist cu mâncare autentică românească. Trebuie să încerci mancarurile tradiționale.",
        "type": "hidden_gem", "lat": 46.7700, "long": 23.5810
    },
    {
        "id": "loc_6", "name": "Bastionul Croitorilor", "address": "Strada Memorandumului Cluj-Napoca Romania",
        "description": "Zidul vechi al cetății. Intrare gratuită. Partea cea mai veche și autentică a orașului.",
        "type": "hidden_gem", "lat": 46.7680, "long": 23.5870
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
        if loc['name'] == 'Unirii Square':
            busyness = 85  # Main square is very busy
        elif loc['name'] == 'Central Park Simion Bărnuțiu':
            busyness = 30  # Park is moderately busy (more realistic)
        elif loc['type'] == 'mainstream':
            busyness = 85  # Other mainstream locations are busy
        else:
            busyness = 15  # Hidden gems are mostly free

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
    Ești "CityFlow", un ghid local inteligent din Cluj. Misiunea ta este să gestionezi overtourism-ul și să oferi recomandări creative.
    
    DATE TRAFIC:
    {traffic_data_context}
    
    INSTRUCȚIUNI PRINCIPALE:
    1. DETECTIE ITINERARIU CLASIC: Dacă utilizatorul spune "itinerariu", "traseu", "tur", "ture recomandate" SAU menționează "aglomerat", "plin", "multă lume" → MODUL ITINERARIU CLASIC (Zidul, Piața Unirii, Parc)
    2. DETECTIE ALTE OPȚIUNI: Dacă utilizatorul spune "alte opțiuni", "altele", "alte locuri", "altceva", "mai mult" SAU doar cere RECOMANDĂRI CREATIVE → MODUL ITINERARIU CREATIV - TU GENEREZI 3 LOCAȚII NOI DIN CLUJ pe baza temei/intereselor utilizatorului
    3. DETECTIE DESTINAȚIE: Dacă utilizatorul spune "aș vrea să merg la...", "aș vrea să vizitez...", "vreau să mă duc la..." → propune direct să ia o poză și să ți-o trimită de acolo pentru verificare
    4. ITINERARIU: Ordoneaza locurile după distanță (cel mai apropiat START) pentru eficiență maximă
    5. CREATIVITATE: Când ceri alte opțiuni, gândește-te la locuri REALE din Cluj care nu sunt prea cunoscute: muzee, restaurante, galerii, biserici vechi, piețe secundare, parcuri ascunse etc.
    6. MESAJ: Fii enthusiast, descrie frumusețea locurilor, spune de ce sunt interesante și unice
    
    FORMAT JSON OBLIGATORIU - ITINERARIU CLASIC:
    {{
        "text": "Mesajul tău conversațional...",
        "suggested_locations": [
            {{"id": "loc_2", "name": "Zidurile Cetății", "distance": 0.5, "busyness": 15}},
            {{"id": "loc_3", "name": "Parc Central", "distance": 1.2, "busyness": 20}},
            {{"id": "loc_1", "name": "Piața Unirii", "distance": 2.1, "busyness": 25}}
        ],
        "itinerary": "Ordine vizitare: Zidurile Cetății (0.5 km) → Parc Central (1.2 km) → Piața Unirii (2.1 km)"
    }}
    
    FORMAT JSON OBLIGATORIU - ITINERARIU CREATIV (alte opțiuni / recomandări):
    {{
        "text": "Mesajul tău conversațional cu recomandări creative...",
        "suggested_locations": [
            {{"id": "custom_1", "name": "[Locul 1 din Cluj]", "distance": 0.X, "busyness": YY}},
            {{"id": "custom_2", "name": "[Locul 2 din Cluj]", "distance": 0.X, "busyness": YY}},
            {{"id": "custom_3", "name": "[Locul 3 din Cluj]", "distance": 0.X, "busyness": YY}}
        ],
        "itinerary": "Ordine vizitare: [Loc 1] (0.X km) → [Loc 2] (0.X km) → [Loc 3] (0.X km)"
    }}
    
    EXEMPLE DE LOCURI DIN CLUJ pe care poți sugera:
    - Piața Muzelor / Museum Square
    - Casa Boema - restaurant tradițional
    - Bastionul Croitorilor
    - Biserica Sfântul Mihail
    - Podul Minciunilor
    - Parcul Botanic
    - Strada Memorandumului
    - Teatrul Național
    - Galeria de Artă
    - Piața Petru Maior
    - Grădina Iulius
    - Pasajul Universitații
    - Obor (piața veche)
    - Complexul Compania etc.
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
        return {"text": "Am o problemă tehnică de rețea. Te rog încearcă din nou.", "suggested_locations": [], "itinerary": None}


def verify_image_with_ai(image_bytes, target_location_name):
    """Verifică poza userului folosind GPT-4 Vision."""
    
    print(f"📸 Analizez imaginea pentru locația: {target_location_name}")
    
    # Conversie bytes -> Base64
    try:
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        print(f"✅ Imagine convertită în base64 ({len(base64_image)} caractere)")
    except Exception as e:
        print(f"❌ Eroare la conversia în base64: {e}")
        return {"verified": False, "message": "Locația nu este regăsită în poză. Te rog încearcă o poză mai clară."}

    # Instrucțiuni specifice pentru fiecare locație
    location_hints = {
        "Zidurile Cetății": "zid medieval, arhitectură veche, stradă pietonală boemă, piatră veche, stradă liniștită cu atmosferă istorică",
        "Piața Unirii": "piață centrală, clădiri mari, terase, monument, oameni mulți, centrul orașului",
        "Central Park": "parc, copaci, lac, verde, hamace, natură, spații deschise, verdeață",
    }
    hints = location_hints.get(target_location_name, "caracteristici distinctive")
    
    prompt = f"""Analizează imaginea și determină dacă aceasta arată locul specificat.

LOCUL ȚINTĂ: {target_location_name}
CARACTERISTICI SPECIFICE: {hints}

INSTRUCȚIUNI:
1. Căuta marcaje distinctive: arhitectură, monumente, nume pe panouri, elemente de design caracteristice.
2. Pentru "Zidurile Cetății": ziduri medievale, piatră veche, arhitectură istorică, stradă liniștită, atmosferă boemă.
3. Pentru piețe: structuri mari, oameni, terase, monumente centrale.
4. Pentru parcuri: copaci, apă, verde, spații deschise.
5. Acceptă doar dacă sunt prove clare (80%+ încredere). Imagini vagi/generice → NU.

Răspunde STRICT JSON: {{"is_match": true/false, "reason": "motivul scurt", "confidence": "high/medium/low"}}"""

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
            return {"verified": False, "message": "Locația nu este regăsită în poză. Te rog încearcă o poză mai clară."}
        
        if not response.choices[0].message:
            print("❌ Eroare: Mesaj gol în răspuns")
            return {"verified": False, "message": "Locația nu este regăsită în poză. Te rog încearcă o poză mai clară."}
        
        content = response.choices[0].message.content
        
        if not content or content.strip() == "":
            print("❌ Eroare: Conținut gol în mesaj")
            return {"verified": False, "message": "Locația nu este regăsită în poză. Te rog încearcă o poză mai clară."}
        
        print(f"📝 Conținut primit: {content[:100]}...")
        
        # Dacă totul e OK, citim JSON-ul
        try:
            result = json.loads(content)
        except json.JSONDecodeError as parse_error:
            print(f"❌ Eroare la parsarea JSON: {parse_error}")
            print(f"📍 Conținut care nu s-a putut parsa: {content}")
            return {"verified": False, "message": "Locația nu este regăsită în poză. Te rog încearcă o poză mai clară."}
        
        if result.get("is_match") is True:
            print("🚀 Verificare reușită!")
            return {"verified": True, "message": f"✓ Confirmat! Ești la {target_location_name}."}
        else:
            confidence = result.get('confidence', 'unknown')
            reason = result.get('reason', 'Imaginea nu conține marcaje distinctive ale acestei locații.')
            print(f"❌ Verificare eșuată (confidence: {confidence}): {reason}")
            return {"verified": False, "message": f"❌ Nu pot confirma. {reason} Încearcă o poză cu marcajele distinctive ale locului."}

    except Exception as e:
        # Aceasta prinde erorile de rețea sau cele care depășesc rate limit-ul
        print(f"❌ Eroare neașteptată: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {"verified": False, "message": "Locația nu este regăsită în poză. Te rog încearcă o poză mai clară."}