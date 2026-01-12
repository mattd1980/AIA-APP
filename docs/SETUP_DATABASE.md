# Configuration de la Base de Données

## ⚠️ Important

La base de données PostgreSQL doit être créée manuellement avant d'exécuter les migrations Prisma.

## 📋 Étapes

### 1. Vérifier PostgreSQL

Assurez-vous que PostgreSQL est installé et en cours d'exécution.

### 2. Créer la Base de Données

**Option A : Via psql (ligne de commande)**
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE aia_app;

# Quitter
\q
```

**Option B : Via pgAdmin**
1. Ouvrir pgAdmin
2. Se connecter au serveur PostgreSQL
3. Clic droit sur "Databases" → "Create" → "Database"
4. Nom : `aia_app`
5. Cliquer "Save"

**Option C : Via PowerShell (si psql est dans le PATH)**
```powershell
$env:PGPASSWORD='123'
psql -U postgres -c "CREATE DATABASE aia_app;"
```

### 3. Configurer DATABASE_URL

Éditer `backend/.env` et s'assurer que la DATABASE_URL est correcte :

```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/aia_app?schema=public"
```

**Note** : Ajuster le port (5432 par défaut) et le mot de passe selon votre configuration.

### 4. Exécuter les Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

### 5. Générer le Client Prisma

```bash
npx prisma generate
```

### 6. Vérifier la Connexion

```bash
# Tester la connexion
npx prisma db pull

# Ou via le serveur
curl http://localhost:3000/health/db
```

## 🔍 Dépannage

### Erreur : "User was denied access"
- Vérifier que l'utilisateur `postgres` existe
- Vérifier le mot de passe dans DATABASE_URL
- Vérifier les permissions PostgreSQL

### Erreur : "Database does not exist"
- Créer la base de données manuellement (voir étape 2)
- Vérifier le nom dans DATABASE_URL

### Erreur : "Connection refused"
- Vérifier que PostgreSQL est en cours d'exécution
- Vérifier le port (5432 par défaut)
- Vérifier les paramètres de connexion dans DATABASE_URL

### psql non trouvé
- Ajouter PostgreSQL au PATH système
- Ou utiliser pgAdmin pour créer la base de données
- Ou utiliser le chemin complet : `C:\Program Files\PostgreSQL\16\bin\psql.exe`

## ✅ Vérification

Une fois la base de données créée et les migrations exécutées, vous devriez voir :

- 4 tables créées : `inventories`, `inventory_items`, `inventory_images`, `reports`
- Le client Prisma généré dans `node_modules/@prisma/client`
- Le endpoint `/health/db` retournant `{"status": "ok", "database": "connected"}`
