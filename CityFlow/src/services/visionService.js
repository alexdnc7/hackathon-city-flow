// src/services/visionService.js
import { Platform } from 'react-native';

// ⚠️ CONFIGURARE DINAMICĂ A URL-UL API
// Pe mobil, schimbă 'localhost' cu IP-ul local al computerului (ex: 192.168.1.5)
// Asigură-te că portul corespunde cu cel din backend (de obicei 8000 pentru FastAPI)
const API_BASE_URL = 'http://192.168.34.106:8000'; // IP corect din Wi-Fi
const CHAT_URL = `${API_BASE_URL}/chat`;
const VERIFY_URL = `${API_BASE_URL}/verify`;

// --- Apelează endpoint-ul de CHAT pentru răspunsuri AI ---
export const sendChatMessage = async (text, lat, long) => {
  try {
    console.log("📤 Trimit mesaj la Chat endpoint:", CHAT_URL);
    
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        lat: lat,
        long: long
      })
    });

    if (!response.ok) {
      throw new Error(`Eroare HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Răspuns primit de la Chat:", data);
    return data;

  } catch (error) {
    console.error("❌ Eroare la conexiunea cu Chat endpoint:", error);
    throw error;
  }
};

// --- Apelează endpoint-ul de VERIFY pentru imagini ---
export const sendToVisionAPI = async (imageUri, locationName) => {
  try {
    const formData = new FormData();

    // Adăugăm imaginea
    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });
    }

    // Adăugăm locația
    formData.append('location_name', locationName);

    console.log("📸 Trimit imagine la Verify endpoint:", VERIFY_URL);
    
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Eroare HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Răspuns primit de la Verify:", data);
    return data;

  } catch (error) {
    console.error("❌ Eroare la conexiunea cu Verify endpoint:", error);
    throw error;
  }
};