# Guide de Design UI/UX - Application d'Inventaire IA

## Vue d'Ensemble

Ce document définit les principes de design, les composants UI, et les guidelines pour créer une interface moderne, légère et intuitive pour l'application d'inventaire IA. Le design s'appuie sur shadcn/ui, Font Awesome, et une palette de couleurs vibrante alignée avec les tendances 2026.

---

## Principes de Design

### 1. **Modernité & Légèreté**
- Interface minimaliste avec beaucoup d'espace blanc
- Design "barely-there" qui met l'accent sur le contenu
- Transitions fluides et micro-interactions subtiles
- Performance optimale pour une expérience rapide

### 2. **Centré sur l'Utilisateur**
- Navigation intuitive et prévisible
- Feedback immédiat pour toutes les actions
- Accessibilité conforme WCAG 2.1
- Responsive mobile-first

### 3. **Cohérence Visuelle**
- Utilisation cohérente de la palette de couleurs
- Typographie hiérarchisée
- Espacement systématique (système 4px/8px)
- Composants réutilisables

---

## Palette de Couleurs

### Couleurs Principales

```css
/* Main Accent - Jaune vif */
--color-primary: #FFD41D;
--color-primary-hover: #FFE066;
--color-primary-light: #FFF4CC;

/* Secondary - Orange chaud */
--color-secondary: #FFA240;
--color-secondary-hover: #FFB366;
--color-secondary-light: #FFE6CC;

/* Third - Rouge profond */
--color-accent: #D73535;
--color-accent-hover: #E04A4A;
--color-accent-light: #F5CCCC;

/* Fourth - Rouge vif */
--color-danger: #FF4646;
--color-danger-hover: #FF6B6B;
--color-danger-light: #FFCCCC;
```

### Couleurs Neutres

```css
/* Base colors pour DaisyUI */
--color-base-100: #FFFFFF;        /* Fond principal */
--color-base-200: #F5F5F5;        /* Fond secondaire */
--color-base-300: #E5E5E5;        /* Bordures */
--color-base-content: #1F2937;    /* Texte principal */

/* États */
--color-success: #10B981;
--color-info: #3B82F6;
--color-warning: #FFA240;         /* Utilise secondary */
--color-error: #FF4646;           /* Utilise danger */
```

### Utilisation des Couleurs

| Couleur | Usage | Exemples |
|---------|-------|----------|
| **Primary (#FFD41D)** | Actions principales, highlights, badges importants | Boutons CTA, icônes importantes, valeurs monétaires |
| **Secondary (#FFA240)** | Actions secondaires, états actifs, hover states | Boutons secondaires, onglets actifs, progress bars |
| **Accent (#D73535)** | Alerts, warnings, éléments critiques | Messages d'alerte, statuts d'erreur |
| **Danger (#FF4646)** | Actions destructives, erreurs critiques | Boutons supprimer, erreurs de validation |

---

## Configuration shadcn/ui

### Installation

```bash
npx shadcn@latest init  # puis npx shadcn@latest add button card input ...
```

### Configuration Tailwind (tailwind.config.js)

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FFD41D',
        'secondary': '#FFA240',
        'accent': '#D73535',
        'danger': '#FF4646',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  // Thème via CSS variables dans src/index.css (voir shadcn theming)
  // Ancienne config daisyui remplacée par shadcn. Exemple conservé :
  _daisyui_example: {
    themes: [
      {
        light: {
          "primary": "#FFD41D",
          "primary-focus": "#FFE066",
          "primary-content": "#1F2937",
          
          "secondary": "#FFA240",
          "secondary-focus": "#FFB366",
          "secondary-content": "#FFFFFF",
          
          "accent": "#D73535",
          "accent-focus": "#E04A4A",
          "accent-content": "#FFFFFF",
          
          "neutral": "#3D4451",
          "neutral-focus": "#2A2E37",
          "neutral-content": "#FFFFFF",
          
          "base-100": "#FFFFFF",
          "base-200": "#F5F5F5",
          "base-300": "#E5E5E5",
          "base-content": "#1F2937",
          
          "info": "#3B82F6",
          "success": "#10B981",
          "warning": "#FFA240",
          "error": "#FF4646",
          
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
}
```

---

## Typographie

### Hiérarchie Typographique

```css
/* Headings */
h1: 2.5rem (40px) - font-bold - color: base-content
h2: 2rem (32px) - font-semibold - color: base-content
h3: 1.5rem (24px) - font-semibold - color: base-content
h4: 1.25rem (20px) - font-medium - color: base-content

/* Body */
body: 1rem (16px) - font-normal - color: base-content
small: 0.875rem (14px) - font-normal - color: neutral
caption: 0.75rem (12px) - font-normal - color: neutral
```

### Police de Caractères

```css
/* Recommandation: Inter ou System Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
  'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Poids de Police

- **Regular (400)**: Texte de corps
- **Medium (500)**: Labels, sous-titres
- **Semibold (600)**: Titres de sections
- **Bold (700)**: Titres principaux, valeurs importantes

---

## Icônes - Font Awesome

### Installation

```bash
npm install @fortawesome/fontawesome-svg-core
npm install @fortawesome/free-solid-svg-icons
npm install @fortawesome/react-fontawesome
```

### Icônes Principales par Contexte

#### Navigation & Actions
- `faHome` - Accueil
- `faPlus` - Ajouter/Créer
- `faUpload` - Upload d'images
- `faDownload` - Télécharger rapport
- `faTrash` - Supprimer
- `faEdit` - Modifier
- `faSearch` - Rechercher
- `faFilter` - Filtrer

#### Inventaire & Items
- `faBox` - Inventaire
- `faCouch` - Meubles
- `faTv` - Électronique
- `faShirt` - Vêtements
- `faBlender` - Électroménagers
- `faPalette` - Décoration
- `faTag` - Prix/Valeur
- `faImage` - Images

#### États & Status
- `faCheckCircle` - Complété/Succès
- `faSpinner` - En traitement
- `faExclamationTriangle` - Avertissement
- `faTimesCircle` - Erreur
- `faClock` - En attente

#### Valeurs & Données
- `faDollarSign` - Montant/Valeur
- `faChartLine` - Statistiques
- `faFilePdf` - Rapport PDF
- `faDatabase` - Données

### Exemple d'Utilisation

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons';

<button className="btn btn-primary">
  <FontAwesomeIcon icon={faUpload} className="mr-2" />
  Upload Images
</button>
```

---

## Composants UI - Cards

### Card Standard (Inventaire)

```tsx
<div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
  <div className="card-body">
    <div className="flex items-center justify-between">
      <h2 className="card-title text-xl">
        <FontAwesomeIcon icon={faBox} className="text-primary" />
        Inventaire #12345
      </h2>
      <span className="badge badge-primary">Complété</span>
    </div>
    <div className="flex items-center gap-4 mt-2">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faTag} className="text-secondary" />
        <span className="font-semibold text-lg">$15,234.50</span>
      </div>
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faCouch} className="text-accent" />
        <span>12 items</span>
      </div>
    </div>
    <div className="card-actions justify-end mt-4">
      <button className="btn btn-sm btn-primary">
        <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
        Rapport
      </button>
      <button className="btn btn-sm btn-ghost">
        <FontAwesomeIcon icon={faEdit} />
      </button>
    </div>
  </div>
</div>
```

### Card Item (Objet Identifié)

```tsx
<div className="card bg-base-100 border border-base-300 hover:border-primary transition-colors">
  <figure className="px-4 pt-4">
    <img 
      src={itemImage} 
      alt={itemName}
      className="rounded-lg w-full h-48 object-cover"
    />
  </figure>
  <div className="card-body p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="card-title text-lg mb-1">{itemName}</h3>
        {brand && (
          <p className="text-sm text-base-content/70">
            <FontAwesomeIcon icon={faTag} className="mr-1" />
            {brand} {model && `- ${model}`}
          </p>
        )}
      </div>
      <span className={`badge ${
        condition === 'excellent' ? 'badge-success' :
        condition === 'good' ? 'badge-primary' :
        condition === 'fair' ? 'badge-warning' :
        'badge-error'
      }`}>
        {condition}
      </span>
    </div>
    
    <div className="divider my-2"></div>
    
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-base-content/60">Valeur estimée</p>
        <p className="text-lg font-bold text-primary">
          <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
          {estimatedValue.toLocaleString('fr-CA', { 
            style: 'currency', 
            currency: 'CAD' 
          })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-base-content/60">Remplacement</p>
        <p className="text-lg font-semibold text-secondary">
          <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
          {replacementValue.toLocaleString('fr-CA', { 
            style: 'currency', 
            currency: 'CAD' 
          })}
        </p>
      </div>
    </div>
  </div>
</div>
```

### Card Upload (Zone de Drop)

```tsx
<div className="card bg-base-200 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
  <div className="card-body items-center justify-center min-h-[300px]">
    <FontAwesomeIcon 
      icon={faUpload} 
      className="text-6xl text-primary mb-4" 
    />
    <h3 className="card-title text-xl mb-2">
      Glissez vos images ici
    </h3>
    <p className="text-base-content/70 text-center mb-4">
      Ou cliquez pour sélectionner des fichiers
    </p>
    <button className="btn btn-primary">
      <FontAwesomeIcon icon={faImage} className="mr-2" />
      Sélectionner des images
    </button>
    <p className="text-xs text-base-content/50 mt-2">
      Formats supportés: JPG, PNG, WEBP (max 10MB)
    </p>
  </div>
</div>
```

### Card Statut (Processing)

```tsx
<div className="card bg-base-100 shadow-md">
  <div className="card-body items-center text-center">
    <FontAwesomeIcon 
      icon={faSpinner} 
      className="text-4xl text-primary animate-spin mb-4" 
    />
    <h3 className="card-title justify-center">Traitement en cours</h3>
    <p className="text-base-content/70">
      Analyse de {imageCount} image(s)... Veuillez patienter.
    </p>
    <progress 
      className="progress progress-primary w-full mt-4" 
      value={progress} 
      max="100"
    ></progress>
  </div>
</div>
```

---

## Layout & Structure

### Structure Globale

```
┌─────────────────────────────────────┐
│         Header (Fixed)              │
│  [Logo] [Title]        [Actions]    │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│  ┌──────────┐  ┌──────────┐        │
│  │  Card 1  │  │  Card 2  │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │  Card 3  │  │  Card 4  │        │
│  └──────────┘  └──────────┘        │
│                                     │
└─────────────────────────────────────┘
```

### Header Component

```tsx
<header className="navbar bg-base-100 shadow-md sticky top-0 z-50">
  <div className="flex-1">
    <a className="btn btn-ghost text-xl">
      <FontAwesomeIcon icon={faBox} className="text-primary mr-2" />
      Inventory AI
    </a>
  </div>
  <div className="flex-none gap-2">
    <button className="btn btn-primary">
      <FontAwesomeIcon icon={faPlus} className="mr-2" />
      Nouvel Inventaire
    </button>
  </div>
</header>
```

### Grid Layout (Inventaires)

```tsx
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {inventories.map(inventory => (
      <InventoryCard key={inventory.id} inventory={inventory} />
    ))}
  </div>
</div>
```

### Grid Layout (Items)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>
```

---

## Boutons & Actions

### Boutons Principaux

```tsx
// Primary Action
<button className="btn btn-primary">
  <FontAwesomeIcon icon={faUpload} className="mr-2" />
  Upload Images
</button>

// Secondary Action
<button className="btn btn-secondary">
  <FontAwesomeIcon icon={faEdit} className="mr-2" />
  Modifier
</button>

// Danger Action
<button className="btn btn-error">
  <FontAwesomeIcon icon={faTrash} className="mr-2" />
  Supprimer
</button>

// Ghost (Subtle)
<button className="btn btn-ghost">
  <FontAwesomeIcon icon={faSearch} />
</button>
```

### Boutons avec États

```tsx
// Loading State
<button className="btn btn-primary loading">
  Traitement...
</button>

// Disabled State
<button className="btn btn-primary" disabled>
  <FontAwesomeIcon icon={faUpload} className="mr-2" />
  Upload Images
</button>
```

---

## Formulaires

### Input avec Icône

```tsx
<div className="form-control">
  <label className="label">
    <span className="label-text">
      <FontAwesomeIcon icon={faSearch} className="mr-2" />
      Rechercher un inventaire
    </span>
  </label>
  <div className="relative">
    <input 
      type="text" 
      placeholder="Rechercher..." 
      className="input input-bordered w-full pl-10"
    />
    <FontAwesomeIcon 
      icon={faSearch} 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
    />
  </div>
</div>
```

### File Input Styled

```tsx
<div className="form-control">
  <label className="label">
    <span className="label-text">Sélectionner des images</span>
  </label>
  <input 
    type="file" 
    className="file-input file-input-bordered file-input-primary w-full"
    accept="image/*"
    multiple
  />
</div>
```

---

## Badges & Status

### Badges de Statut

```tsx
// Status: Complété
<span className="badge badge-success gap-2">
  <FontAwesomeIcon icon={faCheckCircle} />
  Complété
</span>

// Status: En traitement
<span className="badge badge-primary gap-2">
  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
  En traitement
</span>

// Status: Erreur
<span className="badge badge-error gap-2">
  <FontAwesomeIcon icon={faTimesCircle} />
  Erreur
</span>
```

### Badges de Catégorie

```tsx
const categoryIcons = {
  furniture: faCouch,
  electronics: faTv,
  clothing: faShirt,
  appliances: faBlender,
  decor: faPalette,
  other: faBox,
};

<span className="badge badge-outline gap-2">
  <FontAwesomeIcon icon={categoryIcons[category]} />
  {category}
</span>
```

---

## Modals & Dialogs

### Modal de Confirmation

```tsx
<input type="checkbox" id="delete-modal" className="modal-toggle" />
<label htmlFor="delete-modal" className="modal cursor-pointer">
  <label className="modal-box">
    <h3 className="font-bold text-lg mb-4">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-error mr-2" />
      Supprimer l'inventaire
    </h3>
    <p className="py-4">
      Êtes-vous sûr de vouloir supprimer cet inventaire ? Cette action est irréversible.
    </p>
    <div className="modal-action">
      <label htmlFor="delete-modal" className="btn btn-ghost">
        Annuler
      </label>
      <button className="btn btn-error">
        <FontAwesomeIcon icon={faTrash} className="mr-2" />
        Supprimer
      </button>
    </div>
  </label>
</label>
```

---

## Animations & Transitions

### Micro-interactions

```css
/* Hover sur Cards */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Boutons */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: scale(1.02);
}

.btn:active {
  transform: scale(0.98);
}

/* Loading Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Transitions de Page

```tsx
// Fade in pour nouveaux contenus
<div className="animate-fade-in">
  {content}
</div>

// CSS
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

---

## Responsive Design

### Breakpoints (Tailwind)

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Exemples Responsive

```tsx
// Grid adaptatif
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Navigation mobile
<div className="navbar">
  <div className="flex-1 md:hidden">
    <button className="btn btn-ghost">
      <FontAwesomeIcon icon={faBars} />
    </button>
  </div>
  <div className="hidden md:flex flex-1">
    {/* Navigation desktop */}
  </div>
</div>
```

---

## Accessibilité

### Contraste des Couleurs

- **Texte sur fond clair**: Utiliser `base-content` (#1F2937)
- **Texte sur primary**: Utiliser `primary-content` (sombre)
- **Texte sur secondary**: Utiliser `secondary-content` (blanc)

### Navigation Clavier

```tsx
// Focus visible
.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

// Skip to content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Aller au contenu principal
</a>
```

### ARIA Labels

```tsx
<button 
  className="btn btn-primary"
  aria-label="Upload images pour créer un nouvel inventaire"
>
  <FontAwesomeIcon icon={faUpload} aria-hidden="true" />
  Upload
</button>
```

---

## Tendances 2026 Intégrées

### 1. **Minimalisme "Barely-There"**
- Beaucoup d'espace blanc
- Bordures subtiles
- Ombres légères
- Focus sur le contenu

### 2. **Adaptive Transparency**
- Cards avec backdrop-blur (optionnel)
- Overlays semi-transparents pour modals
- Glassmorphism subtil

### 3. **Micro-interactions**
- Hover states sur tous les éléments interactifs
- Transitions fluides (0.2s - 0.3s)
- Feedback visuel immédiat

### 4. **Typography Dynamique**
- Hiérarchie claire
- Poids variables pour l'emphase
- Espacement généreux

### 5. **Cards comme Élément Central**
- Tous les contenus dans des cards
- Grid layouts flexibles
- Hover effects subtils

---

## Checklist de Design

### Avant le Développement
- [ ] DaisyUI configuré avec palette personnalisée
- [ ] Font Awesome installé et configuré
- [ ] Système de couleurs défini
- [ ] Typographie configurée
- [ ] Composants de base créés (Card, Button, etc.)

### Pendant le Développement
- [ ] Utilisation cohérente des couleurs
- [ ] Icônes Font Awesome partout (pas d'emojis)
- [ ] Cards pour tous les contenus
- [ ] Responsive sur tous les breakpoints
- [ ] Accessibilité (contraste, ARIA, clavier)

### Tests
- [ ] Test sur mobile (320px+)
- [ ] Test sur tablette (768px+)
- [ ] Test sur desktop (1024px+)
- [ ] Test accessibilité (contraste, navigation clavier)
- [ ] Test performance (lighthouse score >90)

---

## Ressources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
