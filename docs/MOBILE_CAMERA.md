# Accès Caméra Mobile - AIA-APP

## 📱 Fonctionnalités Caméra

L'application supporte l'accès à la caméra sur tous les appareils mobiles (iPhone, iPad, Android, tablettes).

---

## 🎯 Implémentation

### Détection Mobile
L'application détecte automatiquement si l'utilisateur est sur un appareil mobile via `navigator.userAgent`.

### Méthodes d'Accès Caméra

#### 1. **API MediaDevices.getUserMedia()** (Recommandé)
- Accès direct à la caméra via l'API Web
- Permet un contrôle complet (prévisualisation, capture)
- Fonctionne sur tous les navigateurs modernes
- **Caméra arrière** : `facingMode: 'environment'` (meilleure qualité pour les objets)

#### 2. **Input File avec `capture="environment"`** (Fallback caméra)
- Si `getUserMedia()` échoue ou n'est pas disponible
- Un seul `<input type="file" accept="image/*" capture="environment">` dédié au bouton « Prendre une photo »
- Ouvre la **caméra arrière** sur iOS et Android (choix natif caméra)

#### 3. **Input File sans `capture`** (Galerie)
- Un **second** `<input type="file" accept="image/*">` **sans** attribut `capture` pour le bouton « Galerie »
- Sur iOS : ouvre **Photos** (bibliothèque)
- Sur Android : ouvre **Galerie / Fichiers**
- Ne pas réutiliser le même input que la caméra, sinon certains appareils ouvrent la caméra au lieu de la galerie

---

## 🔧 Fonctionnalités

### Sur Mobile
- **Bouton "Prendre une photo"** : `getUserMedia` (prévisualisation in-app) ou fallback input avec `capture="environment"` → caméra arrière
- **Bouton "Galerie"** : Input file **sans** `capture` → ouvre Photos (iOS) / Galerie (Android)
- **Zone de drop** : Toujours disponible pour drag & drop (si supporté)

### Sur Desktop
- **Zone de drop** : Drag & drop de fichiers
- **Clic pour sélectionner** : Ouvrir le sélecteur de fichiers
- **Caméra** : Disponible si l'appareil a une webcam

---

## 📸 Flux de Capture

1. **Clic sur "Prendre une photo"**
   - Demande permission d'accès à la caméra
   - Ouvre la prévisualisation vidéo
   - Affiche les contrôles (Annuler / Prendre la photo)

2. **Capture**
   - Dessine l'image sur un canvas
   - Convertit en Blob (JPEG, qualité 0.9)
   - Crée un File object
   - Ajoute à la liste des fichiers

3. **Fermeture**
   - Arrête le stream vidéo
   - Nettoie les ressources
   - Retourne à la vue normale

---

## 🎨 Interface Utilisateur

### Boutons Mobile
```
┌─────────────────────┬─────────────────────┐
│  📷 Prendre photo   │  🖼️ Galerie         │
└─────────────────────┴─────────────────────┘
```

### Vue Caméra
```
┌─────────────────────────────────────┐
│  📷 Caméra                          │
├─────────────────────────────────────┤
│                                     │
│     [Prévisualisation Vidéo]       │
│                                     │
├─────────────────────────────────────┤
│  [Annuler]    [📷 Prendre photo]   │
└─────────────────────────────────────┘
```

---

## 🔒 Permissions

### iOS (Safari)
- Nécessite HTTPS (ou localhost en développement)
- Demande permission utilisateur
- Geste utilisateur (clic sur bouton) requis pour `getUserMedia`
- `<video>` doit avoir `playsInline` et `muted` pour que la prévisualisation fonctionne
- Input avec `capture="environment"` ouvre la caméra ; input sans `capture` ouvre Photos

### Android (Chrome)
- Nécessite HTTPS (ou localhost en développement)
- Demande permission utilisateur
- `facingMode: 'environment'` pour caméra arrière
- Input avec `capture="environment"` → caméra ; input sans `capture` → Galerie / Fichiers

### Desktop
- Fonctionne avec webcam
- Demande permission utilisateur
- Peut nécessiter HTTPS selon le navigateur

---

## 🐛 Gestion d'Erreurs

### Erreur: Permission refusée
- Affiche un message d'erreur
- Fallback vers input file avec `capture`
- Suggère d'autoriser l'accès dans les paramètres

### Erreur: Caméra non disponible
- Fallback vers input file
- Message informatif pour l'utilisateur

### Erreur: HTTPS requis
- Avertissement si en production sans HTTPS
- Fonctionne en localhost pour le développement

---

## 📋 Code Clé

### Détection Mobile
```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
```

### Deux inputs distincts (mobile)
- **Caméra** : `<input type="file" accept="image/*" capture="environment">` (un seul, dédié au bouton « Prendre une photo »).
- **Galerie** : `<input type="file" accept="image/*" multiple>` **sans** `capture` (dédié au bouton « Galerie »).

### Accès Caméra (getUserMedia)
```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // Caméra arrière
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  audio: false,
});
```

### Capture Photo
```typescript
canvas.toBlob((blob) => {
  const file = new File([blob], `photo_${Date.now()}.jpg`, {
    type: 'image/jpeg',
  });
  setFiles((prev) => [...prev, file]);
}, 'image/jpeg', 0.9);
```

---

## ✅ Tests

### À Tester
- [x] Accès caméra sur iPhone (Safari)
- [x] Accès caméra sur Android (Chrome)
- [x] Accès caméra sur iPad
- [x] Fallback vers galerie si caméra refusée
- [x] Prévisualisation vidéo
- [x] Capture et ajout à la liste
- [x] Nettoyage des ressources (stream, URLs)

### Navigateurs Supportés
- ✅ Safari iOS 11+
- ✅ Chrome Android 60+
- ✅ Firefox Android 55+
- ✅ Chrome Desktop 60+
- ✅ Firefox Desktop 55+
- ✅ Edge 79+

---

## 🚀 Améliorations Futures

1. **Mode rafale** : Prendre plusieurs photos rapidement
2. **Flash** : Contrôle du flash (si disponible)
3. **Zoom** : Contrôle du zoom numérique
4. **Filtres** : Filtres de base pour améliorer la qualité
5. **Retake** : Possibilité de reprendre une photo avant de l'ajouter
6. **Orientation** : Détection et correction automatique de l'orientation

---

## 📚 Références

- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: HTMLInputElement.capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
- [Can I Use: getUserMedia](https://caniuse.com/stream)
