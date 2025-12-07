# backend/main.py
from vision_service import verify_image_with_ai
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
# main.py (la final)

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

        # Apelarea funcției tale (vision_service.py)
        result = verify_image_with_ai(image_bytes, location_name)

        return result
    except Exception as e:
        return {"verified": False, "message": f"Eroare internă: {e}"}