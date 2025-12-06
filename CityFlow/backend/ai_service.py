import json
import os
import requests
import base64
from openai import OpenAI
from dotenv import load_dotenv

# 1. Configurare Mediu
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
besttime_key = os.getenv("BESTTIME_API_KEY")

client = OpenAI(api_key=api_key)

# 2. Baza de Date Statică (Numele exacte din BestTime Dashboard)
# ATENȚIE: Nu modifica numele sau adresele de aici, sunt sincronizate cu contul tău BestTime.
LOCATIONS_DB = [
    {
        "id": "loc_1",
        "name": "Unirii Square",  #
        "address": "Piața Unirii Cluj-Napoca Romania", 
        "description": "Piața principală a orașului. Punctul zero, plin de evenimente și terase.",
        "type": "mainstream"
    },
    {
        "id": "loc_2",
        "name": "Zidurile Cetății", #
        "address": "Strada Potaissa Cluj-Napoca Romania", 
        "description": "O stradă pietonală boemă, liniștită, lângă zidul vechi al cetății.",
        "type": "hidden_gem"
    },
    {
        "id": "loc_3",
        "name": "Central Park Simion Bărnuțiu", #
        "address": "Parcul Central Cluj-Napoca Romania", 
        "description": "Parcul mare al orașului. Are lac, hamace și clădirea Casino.",
        "type": "mainstream"
    }
]

# 3. Funcția care cere date LIVE de la BestTime.app
def get_live_busyness(venue_name, venue_address):
    url = "https://besttime.app/api/v1/forecasts/now"
    params = {
        'api_key_private': besttime_key,
        'venue_name': venue_name,
        'venue_address': venue_address
    }
    
    try:
        response = requests.post(url, params=params)
        data = response.json()
        
        if data.get('status') == 'OK':
            # Returnează procentul de aglomerație (0-100)
            return data['analysis']['venue_live_busyness']
        else:
            print(f"⚠️ BestTime Warning: {data.get('message')} ({venue_name})")
            return None
    except Exception as e:
        print(f"❌ BestTime Error: {e}")
        return None

# 4. Construirea Contextului pentru AI
def build_traffic_context():
    context_text = "SITUAȚIA LIVE A TRAFICULUI (Senzori):\n"
    
    for loc in LOCATIONS_DB:
        # A. Încercăm să luăm date reale
        busyness = get_live_busyness(loc['name'], loc['address'])
        
        # B. LOGICA DE FALLBACK (PLASA DE SIGURANȚĂ PENTRU DEMO)
        # Dacă BestTime nu are date încă (sau dă eroare), simulăm logic:
        # Mainstream = Aglomerat, Hidden = Liber.
        if busyness is not None:
            source = "LIVE DATA"
        else:
            source = "ESTIMATED (Missing Data)"
            busyness = 85 if loc['type'] == 'mainstream' else 15
            
        # C. Traducem procentul în cuvinte
        if busyness >= 70:
            status = "FOARTE AGLOMERAT (BUSY)"
        elif busyness >= 40:
            status = "MODERAT"
        else:
            status = "LIBER (FREE)"
            
        context_text += f"- ID: {loc['id']} | {loc['name']}: {busyness}% ({status}) | Sursa: {source} | Descriere: {loc['description']}\n"
        
    return context_text

# 5. Funcția Principală CHAT (AI + Date)
def get_ai_response(user_msg, lat, long):
    print("\n--- 1. Se colectează datele de trafic... ---")
    traffic_context = build_traffic_context()
    print(f"--- 2. Date trimise la AI:\n{traffic_context}\n----------------")

    system_prompt = f"""
    Ești "CityFlow", un ghid local inteligent din Cluj.
    
    MISIUNEA TA:
    Să combați overtourism-ul. Îndrumă oamenii DEPARTE de locurile marcate "FOARTE AGLOMERAT" și CĂTRE locurile "LIBER" sau "MODERAT".
    
    DATE LIVE DIN TEREN:
    {traffic_context}
    
    INSTRUCȚIUNI:
    1. Dacă userul vrea să meargă într-un loc BUSY (>70%), recomandă-i politicos o alternativă FREE din listă.
    2. Folosește procentele ca argument (ex: "Piața Unirii e 90% plină acum!").
    3. Spune-i că primește 50 COINS dacă trimite o poză de la locația recomandată (FREE).
    4. Răspunde strict în format JSON.

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
        return {"text": "Am o eroare tehnică. Te rog încearcă din nou.", "suggested_location_id": None, "coins_reward": 0}

# 6. Funcția VISION (Verificare Poză)
def verify_image_with_ai(image_bytes, target_location_name):
    # Conversie imagine în Base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    prompt = f"Analizează această imagine. Userul susține că este la '{target_location_name}'. Se vede acest loc în poză (sau elemente specifice lui)? Răspunde JSON: {{ \"is_match\": true/false, \"reason\": \"motivul scurt\" }}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
            max_tokens=300
        )
        result = json.loads(response.choices[0].message.content)
        
        if result["is_match"]:
            return {"verified": True, "coins": 50, "message": "Super! Validat. Ai primit 50 coins."}
        else:
            return {"verified": False, "coins": 0, "message": f"Nu pare să fie locația corectă. ({result['reason']})"}

    except Exception as e:
        print(f"Eroare Vision: {e}")
        return {"verified": False, "message": "Nu am putut analiza imaginea."}