# Instructions de déploiement

## Structure des fichiers

Votre repo GitHub doit contenir :

```
htmltopwa-claude/
├── index.html              ← Page d'accueil (choix App Élève / App Prof)
├── vma-tracker.html        ← Application Élève (votre fichier actuel)
├── agregateur-vma.html     ← Application Prof (nouveau fichier corrigé)
├── manifest.json
├── service-worker.js
└── icons/
```

## Modifications à faire sur votre vma-tracker.html existant

### 1. Renommer votre fichier actuel
Renommez votre `index.html` actuel en `vma-tracker.html`

### 2. Ajouter la constante URL (dans le <script> principal, tout en haut)
```javascript
const AGGREGATOR_BASE_URL = 'https://epsapp.github.io/htmltopwa-claude/agregateur-vma.html';
```

### 3. Modifier la fonction goStep5() — remplacer la ligne :
```javascript
const url = 'agregateur-vma.html?d=' + compressed;
```
Par :
```javascript
const url = AGGREGATOR_BASE_URL + '?d=' + compressed;
```

### 4. Remplacer le fichier index.html et agregateur-vma.html
- `index.html` → la page d'accueil fournie
- `agregateur-vma.html` → l'agrégateur corrigé fourni

## Fichiers fournis
- `index.html` — Page d'accueil avec choix des apps
- `agregateur-vma.html` — Agrégateur avec scanner jsQR corrigé
