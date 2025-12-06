# backend/main.py
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import uvicorn
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
async def verify_endpoint(file: UploadFile = File(...), location_name: str = Form(...)):
    # 1. Citim fișierul primit de la telefon în memorie (ca bytes)
    image_bytes = await file.read()
    
    # 2. Îl trimitem la funcția noastră de AI
    # Notă: Frontend-ul trebuie să trimită și numele locației (location_name)
    result = verify_image_with_ai(image_bytes, location_name)
    
    return result

# --- PORNIRE SERVER (Aceasta trebuie să fie ULTIMA parte din fișier) ---
if __name__ == "__main__":
    # HOST 0.0.0.0 este CRITIC ca sa te poti conecta de pe telefon prin Wi-Fi
    uvicorn.run(app, host="0.0.0.0", port=8000)