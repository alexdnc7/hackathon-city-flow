# 🌍 CityFlow - Explorează fără Aglomerație

CityFlow este o aplicație mobile care folosește AI și geolocation pentru a recomanda locații mai puțin aglomerate din Cluj-Napoca.

## ✨ Caracteristici

- 🤖 **Chat AI Inteligent** - Conversație naturală cu CityFlow
- 📸 **Verificare Foto cu Vision** - Confirmă locația cu poze
- 🗺️ **Itinerarii Optimizate** - Trasee de vizitare eficiente
- 📍 **Geolocation Real-time** - Localizare precisă
- 🔐 **Autentificare Firebase** - Login/Signup securizat

## 🛠️ Tech Stack

### Frontend
- **React Native** + **Expo** - Cross-platform mobile
- **Firebase Auth** - Autentificare
- **expo-location** - GPS
- **expo-image-picker** - Poze

### Backend
- **FastAPI** (Python) - REST API
- **OpenAI GPT-4o** - AI Conversațional
- **GPT-4 Vision** - Verificare foto
- **BestTime API** - Date trafic

## 📋 Cerințe

- **Node.js** >= 16
- **Python** >= 3.11
- **Expo CLI** - `npm install -g expo-cli`

## 🚀 Setup Local

### 1. Clonează Repo
```bash
git clone https://github.com/alexdnc7/hackathon-city-flow.git
cd hackathon-city-flow
```

### 2. Setup Backend

```bash
cd CityFlow/backend

# Creează .env din template
cp .env.example .env

# Completează cheile în .env
# OPENAI_API_KEY=...
# BESTTIME_API_KEY=...
# GCP_CREDENTIALS_PATH=./cityflow-key.json

# Instalează dependențe
pip install -r requirements.txt

# Descarcă Firebase key din Firebase Console și plasează-l aici

# Rulează backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Setup Frontend

```bash
cd CityFlow

# Instalează dependențe
npm install

# Rulează Expo
npx expo start

# Scaneaza QR code cu Expo Go pe telefon
```

### 4. Configurare Firebase

Editat `src/config/firebase.js` cu credențialele tale Firebase:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 📱 Flow Aplicație

1. **Login/Register** - Autentificare Firebase
2. **Chat Screen** - Conversație cu AI
3. **Itinerarii** - Recomandări de trasee
4. **Foto Verificare** - Confirmare locație cu poze
5. **Feedback** - Timp record, celebrări

## 🔐 Securitate

Cheile API și credențiale sunt protejate:
- `.env` - Nu e comitat pe GitHub (`.gitignore`)
- `cityflow-key.json` - Nu e comitat pe GitHub
- `.env.example` - Template cu placeholder-uri

Vezi [SECURITY.md](./SECURITY.md) pentru detalii complete.

## 📦 Structură Proiect

```
hackathon-city-flow/
├── CityFlow/
│   ├── backend/              # FastAPI server
│   │   ├── main.py
│   │   ├── ai_service.py
│   │   ├── vision_service.py
│   │   ├── requirements.txt
│   │   ├── .env.example      # Template variabile
│   │   └── traffic.json
│   └── src/                  # React Native App
│       ├── screens/
│       ├── components/
│       ├── services/
│       ├── config/
│       └── navigation/
├── .gitignore                # Ascunde cheile
├── SECURITY.md              # Ghid securitate
└── README.md                # Acest fișier
```

## 🔄 Variabile de Mediu

Necesare în `CityFlow/backend/.env`:

```
OPENAI_API_KEY=sk-proj-xxxxx
BESTTIME_API_KEY=pri_xxxxx
GCP_CREDENTIALS_PATH=./cityflow-key.json
```

Obține cheile din:
- **OpenAI** - https://platform.openai.com/api-keys
- **BestTime** - https://besttime.app/api
- **Firebase** - Firebase Console → Service Accounts

## 🐛 Troubleshooting

### Backend nu se conectează
- Verifica IP backend în `src/services/visionService.js`
- Asigura-te că backend rulează pe `0.0.0.0:8000`

### Fotografii nu se verifică
- Verifica OPENAI_API_KEY în `.env`
- Asigura-te că imagini au marker-e distinctive

### Firebase auth eșuează
- Verifica config în `src/config/firebase.js`
- Asigura-te că email-ul e valid

## 📝 Notă de Dezvoltare

Proiectul este în dezvoltare activă. Pentru bug-uri sau feature requests, deschide un issue pe GitHub.

## 👥 Echipa

- Alex - Backend AI
- [Contribuitori]

## 📄 Licență

MIT

---

**Recomandări:** Citește [SECURITY.md](./SECURITY.md) înainte să lucrez cu repo-ul!
