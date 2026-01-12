# Quick Start Guide - AIA-APP

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL installé et en cours d'exécution
- npm ou yarn

---

## ⚡ Installation en 5 Minutes

### 1. Cloner et Installer

```bash
# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

### 2. Créer la Base de Données

**Option A : Script PowerShell (Recommandé)**
```powershell
.\scripts\create-db.ps1
```

**Option B : Manuellement**
```sql
psql -U postgres
CREATE DATABASE aia_app;
\q
```

### 3. Configurer les Variables d'Environnement

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/aia_app?schema=public"
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=votre_clé_openai_ici
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 4. Initialiser la Base de Données

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Démarrer les Serveurs

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Accéder à l'Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## ✅ Vérification

### Backend
```bash
curl http://localhost:3000/health
# Devrait retourner: {"status":"ok","timestamp":"..."}
```

### Base de Données
```bash
curl http://localhost:3000/health/db
# Devrait retourner: {"status":"ok","database":"connected"}
```

### Frontend
- Ouvrir http://localhost:5173
- Vous devriez voir la page "Mes Inventaires"
- Cliquer sur "Nouvel Inventaire" pour tester l'upload

---

## 🐛 Dépannage Rapide

### Erreur: "Database does not exist"
→ Créer la base de données (étape 2)

### Erreur: "User was denied access"
→ Vérifier le mot de passe dans DATABASE_URL

### Erreur: "Connection refused"
→ Vérifier que PostgreSQL est en cours d'exécution

### Frontend ne se connecte pas au backend
→ Vérifier VITE_API_URL dans `frontend/.env`

### Erreur Prisma: "schema.prisma not found"
→ Exécuter depuis le dossier `backend/`

---

## 📚 Documentation Complète

- [Setup Base de Données](./SETUP_DATABASE.md) - Guide détaillé DB
- [MVP Complet](./MVP_COMPLETE.md) - Statut et fonctionnalités
- [Guidelines de Développement](./DEVELOPMENT_GUIDELINES.md) - Conventions
- [Spécification Technique](./TECHNICAL_SPECIFICATION.md) - Architecture

---

## 🎯 Prochaines Étapes

1. ✅ Application fonctionnelle
2. ⚠️ Créer la base de données (si pas encore fait)
3. ⚠️ Ajouter votre clé OpenAI API
4. ✅ Tester l'upload d'images
5. ✅ Vérifier le traitement IA
6. ✅ Générer un rapport PDF

**Le MVP est prêt ! 🎉**
