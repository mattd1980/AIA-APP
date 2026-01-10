# Application d'Inventaire IA pour Assurance

Application web React utilisant la vision par ordinateur (OpenAI) pour automatiser l'inventaire des biens meubles, déterminer leur valeur de remplacement et générer un rapport d'assurance.

## 🎯 Objectif

Automatiser l'inventaire des biens meubles d'un locataire en utilisant:
- Vision par ordinateur pour identifier les objets
- IA pour reconnaître marques et modèles
- Recherche de prix en temps réel
- Calcul automatique de la valeur de remplacement
- Génération de rapports PDF

## 🚀 Technologies

### Frontend
- **React** (TypeScript)
- **Vite** ou Create React App

### Backend
- **Node.js** avec **TypeScript**
- **Express.js**
- **PostgreSQL** (Railway)
- **Prisma** ou TypeORM

### Services
- **OpenAI GPT-4 Vision API** - Reconnaissance d'objets
- **DataForSEO** / **SERP API** - Recherche de prix
- **Railway** - Hébergement backend et base de données

## 📋 Fonctionnalités MVP

- [x] Upload multiple d'images
- [ ] Identification automatique d'objets via OpenAI Vision
- [ ] Reconnaissance de marques et modèles
- [ ] Évaluation de l'état et de l'âge
- [ ] Recherche de prix via DataForSEO/SERP
- [ ] Calcul de valeur de remplacement avec dépréciation
- [ ] Génération de rapport PDF
- [ ] Interface admin pour gestion des inventaires

## 📁 Structure du Projet

```
project-root/
├── frontend/          # Application React
├── backend/           # API Express/TypeScript
├── docs/              # TOUTE la documentation (voir DEVELOPMENT_GUIDELINES.md)
│   ├── DEVELOPMENT_GUIDELINES.md  # ⚠️ LIRE EN PREMIER
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   ├── DATABASE_SCHEMA.md
│   ├── UI.md
│   ├── test.md
│   ├── dbschema.md
│   └── GITHUB_SETUP.md
├── scripts/           # Scripts utilitaires
└── README.md
```

## 📚 Documentation

**⚠️ IMPORTANT : Lire [DEVELOPMENT_GUIDELINES.md](./docs/DEVELOPMENT_GUIDELINES.md) en premier !**

- [Guidelines de Développement](./docs/DEVELOPMENT_GUIDELINES.md) - **COMMENCER ICI**
- [Spécification Technique](./docs/TECHNICAL_SPECIFICATION.md)
- [Documentation API](./docs/API_DOCUMENTATION.md)
- [Guide de Déploiement](./docs/DEPLOYMENT.md)
- [Schéma de Base de Données](./docs/DATABASE_SCHEMA.md)
- [Guide UI/UX](./docs/UI.md)
- [Stratégie de Tests](./docs/test.md)
- [Setup GitHub](./docs/GITHUB_SETUP.md)

## 🔧 Installation Locale

### Prérequis
- Node.js 18+
- PostgreSQL (ou utiliser Railway)
- Compte OpenAI avec crédits API

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npx prisma migrate dev
npx prisma generate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurer VITE_API_URL
npm run dev
```

## 🌐 Déploiement

Voir [Guide de Déploiement](./docs/DEPLOYMENT.md) pour les instructions complètes.

### Quick Start (Railway)

1. Créer un projet Railway
2. Ajouter PostgreSQL
3. Connecter le repository GitHub
4. Configurer les variables d'environnement
5. Déployer

## 🔐 Variables d'Environnement

### Backend (.env)
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
DATAFORSEO_API_KEY=...
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 📊 Flux de Données

1. **Upload** → Utilisateur upload des images
2. **Traitement** → Backend envoie à OpenAI Vision API
3. **Identification** → Parsing des objets identifiés
4. **Recherche Prix** → DataForSEO/SERP pour chaque item
5. **Calcul** → Valeur de remplacement avec dépréciation
6. **Rapport** → Génération PDF avec inventaire complet

## 🛣️ Roadmap

### Phase 1 (MVP) - Semaines 1-8
- Setup projet et infrastructure
- Upload et traitement d'images
- Intégration OpenAI Vision
- Recherche de prix basique
- Génération PDF

### Phase 2 - Semaines 9-16
- Amélioration reconnaissance marques/modèles
- Base de données produits
- Interface corrections manuelles
- Export formats multiples

### Phase 3 - Semaines 17-24
- Authentification (Google OAuth)
- Multi-utilisateurs
- Migration images vers S3
- Intégration Applied Epic

## ⚖️ Conformité

- **Loi 25 (Québec)**: Consentement explicite, hébergement canadien, droit à l'oubli
- **Sécurité**: Chiffrement, validation fichiers, rate limiting

## 📝 License

[À déterminer]

## 🤝 Contribution

[À déterminer]

## 📧 Contact

[À déterminer]
