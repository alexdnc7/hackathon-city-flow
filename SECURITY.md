# 🔐 Setup Securitate pentru CityFlow

## ⚠️ Variabile de Mediu Sensibile

Proiectul folosește chei API și credențiale Firebase care **TREBUIE** să rămână private.

### 1. Setup Local (.env)

După ce clonezi repo-ul, creează un fișier `.env` în folderul `backend/`:

```bash
cd CityFlow/backend
cp .env.example .env
```

Apoi editează `.env` și completează cu cheile tale:

```
OPENAI_API_KEY=sk-proj-xxxxx...
BESTTIME_API_KEY=pri_xxxxx...
GCP_CREDENTIALS_PATH=./cityflow-key.json
```

### 2. Firebase Service Account Key

1. Descarcă `cityflow-key.json` din Firebase Console
2. Plasează-l în folderul `backend/`
3. **NU-l commita pe GitHub** (`.gitignore` îl protejează)

### 3. Verificare de Securitate

Înainte de a face push pe GitHub:

```bash
# Verifică dacă .env este ignorat
git status

# Nu ar trebui să vezi .env în output
```

## 📋 Chei Necesare

| Cheie | Unde se obține | Unde se folosește |
|-------|-----------------|------------------|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) | `backend/ai_service.py` |
| `BESTTIME_API_KEY` | [besttime.app](https://besttime.app) | `backend/ai_service.py` |
| `cityflow-key.json` | Firebase Console → Service Accounts | `backend/main.py` |

## ✅ Checklist înainte de Push

- [ ] `.env` nu este tracked de git
- [ ] `cityflow-key.json` nu este în repo
- [ ] `.gitignore` conține `.env` și `*-key.json`
- [ ] `backend/.env.example` conține template (fără valori reale)

## 🚀 Pentru Alți Desarrollatori

1. Clonează repo-ul
2. Cere admin-ul pentru `.env` și `cityflow-key.json`
3. Plasează fișierele în `backend/`
4. Rulează `pip install -r requirements.txt`
5. Starter app!

---

**Dacă accidental ai comitat o cheie, contactează admin pentru rotire!**
