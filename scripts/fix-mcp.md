# Guide de Dépannage MCP - Cursor

## Diagnostic Rapide

Exécuter le script de diagnostic :
```bash
node scripts/diagnose-mcp.js
```

## Solutions par Problème

### 1. Node.js Version Incorrecte

**Symptôme** : Erreur "Node.js version 22+ required"

**Solution** :
```bash
# Avec nvm (recommandé)
nvm install 22
nvm use 22

# Ou installer directement depuis nodejs.org
# Télécharger Node.js 22 LTS
```

**Vérification** :
```bash
node --version  # Doit afficher v22.x.x ou supérieur
```

---

### 2. Problèmes de Cache npx

**Symptôme** : Modules MCP ne se chargent pas

**Solution** :
```bash
# Windows PowerShell
Remove-Item -Path $env:APPDATA\npm-cache -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path $env:LOCALAPPDATA\npm-cache -Recurse -Force -ErrorAction SilentlyContinue

# Ou via npm
npm cache clean --force
```

---

### 3. Espaces dans le Chemin Utilisateur

**Symptôme** : Erreurs de chargement de modules

**Solution** :
- Si possible, créer un utilisateur Windows sans espaces dans le nom
- Ou utiliser un chemin alternatif pour les projets

**Vérification** :
```powershell
echo $env:USERPROFILE
# Si le chemin contient des espaces, cela peut causer des problèmes
```

---

### 4. Configuration MCP dans Cursor

**Vérifier les logs MCP** :
1. Ouvrir Cursor
2. `Ctrl+Shift+U` (ou `Cmd+Shift+U` sur Mac)
3. Sélectionner "MCP Logs" dans le panneau Output
4. Vérifier les erreurs

**Redémarrer MCP** :
1. Fermer complètement Cursor
2. Redémarrer Cursor
3. Vérifier que les outils MCP sont disponibles

---

### 5. Test Manuel des Outils MCP

**Tester dans le terminal** :
```bash
# Tester Playwright MCP
npx --yes @playwright/mcp@latest

# Si ça fonctionne dans le terminal mais pas dans Cursor,
# c'est un problème de configuration Cursor
```

---

## Checklist de Vérification

Avant de signaler un problème, vérifier :

- [ ] Node.js version 22+ (`node --version`)
- [ ] npm fonctionne (`npm --version`)
- [ ] npx fonctionne (`npx --version`)
- [ ] Pas d'espaces dans le chemin utilisateur
- [ ] Cache npx nettoyé
- [ ] Cursor redémarré
- [ ] Logs MCP vérifiés dans Cursor (`Ctrl+Shift+U`)

---

## Commandes de Test

### Test Complet
```bash
# 1. Vérifier Node.js
node --version

# 2. Vérifier npm
npm --version

# 3. Nettoyer le cache
npm cache clean --force

# 4. Tester un package MCP
npx --yes @playwright/mcp@latest --version

# 5. Redémarrer Cursor
```

---

## Support

Si les problèmes persistent :

1. **Vérifier les logs Cursor** : `Ctrl+Shift+U > MCP Logs`
2. **Forum Cursor** : [cursor.com](https://cursor.com)
3. **GitHub Issues** : Si c'est un bug connu

---

## Notes

- Les outils MCP peuvent être temporairement désactivés par Cursor pour stabilité
- Certaines versions de Cursor peuvent avoir des problèmes MCP connus
- Vérifier les notes de version de Cursor pour les problèmes connus
