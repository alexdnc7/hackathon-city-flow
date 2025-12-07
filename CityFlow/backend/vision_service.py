# vision_service.py - Folosește Google Vision pentru Vedere și OpenAI pentru Raționament

import json
import os
import io

# Importuri pentru Google Cloud Vision
from google.cloud import vision
from google.cloud.vision import ImageAnnotatorClient
from google.oauth2 import service_account # NOU: Pentru autentificare explicită

# Importuri pentru OpenAI (pentru raționamentul final)
from openai import OpenAI
from openai import APIError 
from dotenv import load_dotenv

# --- 1. CONFIGURARE CLIENȚI ---

load_dotenv()

# Client OpenAI (pentru raționament text)
openai_key = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=openai_key)

# Citirea căii către fișierul JSON din .env
gcp_credentials_path = os.getenv("GCP_CREDENTIALS_PATH") 

# If a relative path is provided in .env, resolve it relative to this file's directory
if gcp_credentials_path:
    # Strip surrounding quotes if present
    gcp_credentials_path = gcp_credentials_path.strip('"')
    if not os.path.isabs(gcp_credentials_path):
        base_dir = os.path.dirname(__file__)
        gcp_credentials_path = os.path.normpath(os.path.join(base_dir, gcp_credentials_path))

# Client Google Vision (Autentificarea se face prin calea directă din .env)
try:
    # Încărcarea explicită a credențialelor din calea dată (GCP_CREDENTIALS_PATH)
    credentials = service_account.Credentials.from_service_account_file(gcp_credentials_path)
    
    # Inițializarea clientului cu credențialele încărcate
    vision_client = vision.ImageAnnotatorClient(credentials=credentials)
    
    print("✅ Google Vision Client inițializat prin calea explicită din .env.")
except Exception as e:
    print(f"❌ EROARE CRITICĂ AUTH: Nu s-a putut inițializa clientul Google Vision.")
    print(f"Verificați calea în .env: {gcp_credentials_path}")
    print(f"Eroare detaliată: {e}")


def verify_image_with_ai(image_bytes, target_location_name):
    print(f"📸 1/3: Analizez imaginea pentru locația: {target_location_name} (folosind Google Vision)")
    
    # --- 2. APEL GOOGLE VISION (EXTRAGERE ETICHETE) ---
    try:
        # Creează obiectul Imagine din bytes
        image = vision.Image(content=image_bytes)

        # Trimitere către Google Vision pentru Detectarea Etichetelor (Labels)
        response = vision_client.annotate_image({
            'image': image,
            'features': [{'type': vision.Feature.Type.LABEL_DETECTION}],
        })

        # Extrage etichetele și scorurile de încredere
        detected_labels = [
            f"{label.description} (confidență: {label.score:.2f})"
            for label in response.label_annotations if label.score > 0.7 
        ]
        
        # Contexte textuale pentru OpenAI
        if not detected_labels:
            labels_text = "Nicio etichetă relevantă detectată."
        else:
            labels_text = ", ".join(detected_labels)
        
        print(f"✅ 2/3: Etichete Google detectate: {labels_text[:100]}...")

    except Exception as e:
        print(f"❌ Eroare la apelul Google Vision: {e}")
        return {"verified": False, "message": f"Eroare Vision: Problema la procesarea imaginii de către Google Vision. {e}"}


    # --- 3. APEL OPENAI (RAȚIONAMENT) ---
    
    prompt = (
        f"Scop: Verifică dacă etichetele detectate corespund locației '{target_location_name}'. "
        f"Etichete Google Vision: [{labels_text}]. "
        f"Decide: Pe baza etichetelor, este probabil ca această poză să fie '{target_location_name}'? "
        f"Răspunde STRICT JSON: {{ \"is_match\": true/false, \"reason\": \"motivul scurt\" }}"
    )

    try:
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini", # Folosim o versiune mai rapidă și mai ieftină pentru raționament text
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=300
        )
        
        # Tentativă de parsare JSON
        content = completion.choices[0].message.content
        
        # Verificare pentru răspuns gol sau None
        if not content or content.strip() == "":
            print("❌ 3/3: Răspuns gol de la AI")
            return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}
        
        result = json.loads(content)
        
        # --- 4. LOGICA DE REWARD FINALĂ ---
        if result.get("is_match"):
            print("🚀 3/3: Verificare reușită!")
            return {
                "verified": True, 
                "coins_earned": 50, 
                "message": f"Super! AI-ul a confirmat că ești la {target_location_name}. Ai primit 50 coins!"
            }
        else:
            print(f"❌ 3/3: Verificare eșuată. Motiv: {result.get('reason', 'Necunoscut')}")
            return {
                "verified": False, 
                "coins_earned": 0, 
                "message": f"Hopa! AI-ul nu recunoaște locul. Motiv: {result.get('reason', 'Necunoscut')}"
            }

    except APIError as e:
        # Erori de OpenAI (cheie, rețea)
        print(f"❌ Eroare OpenAI API: {e}")
        print(f"📍 Debug APIError details: {str(e)}")
        return {"verified": False, "message": f"Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}
    
    except json.JSONDecodeError as parse_error:
        # Răspuns OpenAI invalid
        print(f"❌ Eroare Parsare: Răspunsul nu a fost JSON valid")
        print(f"📍 Debug content: {content}")
        print(f"📍 Debug parse_error: {str(parse_error)}")
        return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}
        
    except Exception as e:
        print(f"❌ Eroare Necunoscută: {type(e).__name__}: {e}")
        print(f"📍 Debug exception: {str(e)}")
        return {"verified": False, "message": "Eroare: Imaginea nu a putut fi procesată de AI (Răspuns gol)."}