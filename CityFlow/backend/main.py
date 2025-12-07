from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import uvicorn
# Folosim ai_service pentru că acolo am consolidat toată logica la pasul anterior
from ai_service import get_ai_response, verify_image_with_ai

app = FastAPI()

# Modelul de date pentru Chat
class ChatMessage(BaseModel):
    message: str
    lat: float
    long: float

# --- Endpoint 1: CHAT ---
@app.post("/chat")
async def chat_endpoint(data: ChatMessage):
    # Aici folosesti logica ta de AI
    response = get_ai_response(data.message, data.lat, data.long)
    return response

# --- Endpoint 2: VISION (Verificare Poză) ---
@app.post("/verify")
async def verify_image(
    file: UploadFile = File(...),
    location_name: str = Form(...)
):
    """
    Endpoint pentru verificarea unei imagini cu AI Vision.
    """
    try:
        # Citirea conținutului imaginii
        image_bytes = await file.read()

        # Apelarea funcției tale (din ai_service.py)
        result = verify_image_with_ai(image_bytes, location_name)

        return result
    except Exception as e:
        return {"verified": False, "message": f"Eroare internă: {e}"}

# --- PORNIRE SERVER (Aceasta trebuie să fie ULTIMA parte din fișier) ---
if __name__ == "__main__":
    # HOST 0.0.0.0 este CRITIC ca sa te poti conecta de pe telefon prin Wi-Fi
    uvicorn.run(app, host="0.0.0.0", port=8000)