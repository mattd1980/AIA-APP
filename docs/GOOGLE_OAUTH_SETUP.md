# Configuration de la connexion Google (OAuth)

Ce guide explique comment activer la **connexion et la création de compte avec Google** dans l’application (bouton « Se connecter avec Google »).

## 1. Où configurer dans Google

1. **Ouvrir la Google Cloud Console**  
   → [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Créer ou sélectionner un projet**  
   - En haut à gauche : menu « Sélectionner un projet » → « Nouveau projet » (ex. « Inventory AI ») ou choisir un projet existant.

3. **Activer l’API « Google+ » / identité**  
   - Menu ☰ → **APIs & Services** → **Library**.  
   - Rechercher **« Google+ API »** ou **« Google Identity »** (selon l’interface).  
   - Pour OAuth 2.0 « Connexion avec Google », l’écran des identifiants suffit souvent ; si demandé, activer l’API liée à la connexion (ex. « Google+ API »).

4. **Créer des identifiants OAuth 2.0**  
   - Menu ☰ → **APIs & Services** → **Credentials**.  
   - **+ Create Credentials** → **OAuth client ID**.

5. **Écran « Configure consent screen » (si première fois)**  
   - **User Type** : **External** (pour des utilisateurs hors de votre organisation).  
   - Remplir au minimum : **App name** (ex. « Inventory AI »), **User support email**, **Developer contact**.  
   - **Save and Continue** jusqu’à la fin (scopes : ajouter si besoin `email`, `profile` ; souvent proposés par défaut).

6. **Créer l’OAuth Client ID**  
   - **Application type** : **Web application**.  
   - **Name** : ex. « Inventory AI Web ».  
   - **Authorized JavaScript origins** (optionnel mais recommandé) :  
     - En local : `http://localhost:5173` (frontend), `http://localhost:3000` (backend si utilisé dans le navigateur).  
     - En production : l’URL de votre application (ex. `https://ia.heliacode.com`).  
   - **Authorized redirect URIs** (obligatoire) :  
     - **En local** : `http://localhost:3000/api/auth/google/callback`  
       (remplacez `3000` si votre backend tourne sur un autre port).  
     - **En production** : `https://VOTRE-DOMAINE/api/auth/google/callback`  
       Exemple : `https://ia.heliacode.com/api/auth/google/callback`.  
   - **Create** → vous obtenez un **Client ID** et un **Client secret**.

7. **Récupérer Client ID et Client secret**  
   - Dans **APIs & Services** → **Credentials**, cliquer sur le client OAuth que vous venez de créer.  
   - Copier **Client ID** et **Client secret** pour les mettre dans les variables d’environnement du backend (voir ci‑dessous).

## 2. Variables d’environnement (backend)

Dans le fichier `.env` du backend (ou dans les variables d’environnement de votre hébergeur), ajoutez :

```env
# Google OAuth
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret

# URL de votre application en production (obligatoire pour le callback Google)
# Google redirigera l’utilisateur vers : BACKEND_URL/api/auth/google/callback
BACKEND_URL=https://ia.heliacode.com

# URL du frontend (pour la redirection après connexion et CORS ; même valeur si même origine)
FRONTEND_URL=https://ia.heliacode.com
```

En **développement local** :

```env
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 3. Comportement dans l’app

- **Connexion** : l’utilisateur clique sur « Se connecter avec Google » → redirection vers Google → après accord, redirection vers le backend (`/api/auth/google/callback`) puis vers le frontend (accueil ou admin selon le rôle).
- **Création de compte** : si l’email Google n’existe pas encore en base, un **nouveau compte utilisateur** est créé automatiquement (email, nom, photo issus de Google). Sinon, l’utilisateur est simplement connecté.

Le bouton « Se connecter avec Google » n’apparaît que si `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont définis côté backend.
