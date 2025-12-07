// src/services/visionService.js
import { Platform } from 'react-native';

// ⚠️ ÎNLOCUIEȘTE CU IP-UL TĂU LOCAL (ex: 192.168.1.5)
// Păstrează portul pe care rulează serverul tău backend (ex: 3000 sau 5000)
// src/services/visionService.js
const API_URL = 'http://192.168.34.105:3000/api/analyze';

export const sendToVisionAPI = async (text, imageUri) => {
  try {
    const formData = new FormData();

    // 1. Adăugăm Textul (dacă există)
    if (text) {
      formData.append('message', text); // 'message' trebuie să fie numele așteptat de backend
    }

    // 2. Adăugăm Poza (dacă există)
    if (imageUri) {
      // Trebuie să construim un obiect de tip fișier
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type: type,
      });
    }

    // 3. Trimitem cererea către Backend
    console.log("Trimit către:", API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data', // Esențial pentru poze
      },
    });

    const data = await response.json();
    return data; // Backend-ul ar trebui să returneze { reply: "..." } sau similar

  } catch (error) {
    console.error("Eroare la conexiunea cu backend-ul:", error);
    throw error;
  }
};