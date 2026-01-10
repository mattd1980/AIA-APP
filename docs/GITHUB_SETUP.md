# Configuration du Repository GitHub - AIA-APP

## Option 1: Créer le repo manuellement (Recommandé)

1. **Aller sur GitHub** : https://github.com/new

2. **Remplir les informations** :
   - **Repository name** : `AIA-APP`
   - **Description** : `Application d'Inventaire IA pour Assurance`
   - **Visibility** : Public (ou Private selon vos préférences)
   - **NE PAS** initialiser avec README, .gitignore, ou license (on a déjà tout)

3. **Cliquer sur "Create repository"**

4. **Connecter le repo local** :
   ```bash
   git remote add origin https://github.com/VOTRE_USERNAME/AIA-APP.git
   git branch -M main
   git push -u origin main
   ```

---

## Option 2: Créer via API avec token

1. **Créer un Personal Access Token** :
   - Aller sur : https://github.com/settings/tokens
   - Cliquer sur "Generate new token (classic)"
   - Donner un nom : `AIA-APP Setup`
   - Sélectionner la scope : `repo` (toutes les permissions repo)
   - Générer et copier le token

2. **Configurer le token** :
   ```powershell
   $env:GITHUB_TOKEN = "votre_token_ici"
   ```

3. **Exécuter le script** :
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/setup-github.ps1
   ```

4. **Pousser le code** :
   ```bash
   git push -u origin main
   ```

---

## Option 3: Utiliser GitHub CLI (si installé)

```bash
# Installer GitHub CLI si pas déjà installé
# Windows: winget install GitHub.cli

# Se connecter
gh auth login

# Créer le repo
gh repo create AIA-APP --public --description "Application d'Inventaire IA pour Assurance" --source=. --remote=origin --push
```

---

## Vérification

Une fois le repo créé et connecté, vérifier :

```bash
# Vérifier le remote
git remote -v

# Devrait afficher :
# origin  https://github.com/VOTRE_USERNAME/AIA-APP.git (fetch)
# origin  https://github.com/VOTRE_USERNAME/AIA-APP.git (push)
```

---

## Commandes Utiles

```bash
# Voir l'état
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Votre message"

# Pousser vers GitHub
git push origin main

# Récupérer les changements
git pull origin main
```

---

## Structure du Repository

Le repo contient déjà :
- ✅ Documentation complète (docs/)
- ✅ Schéma de base de données (dbschema.md)
- ✅ Guide de tests (test.md)
- ✅ Scripts utilitaires (scripts/)
- ✅ .gitignore configuré
- ✅ README.md
