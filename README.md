# VMA Tracker — PWA EPS

Application Progressive Web App pour les séances de course de durée basées sur la VMA.

## 🚀 Déploiement GitHub Pages

### 1. Créer le dépôt
```bash
git init
git add .
git commit -m "Initial commit — VMA Tracker PWA"
git remote add origin https://github.com/TON-USER/vma-tracker.git
git push -u origin main
```

### 2. Activer GitHub Pages
- Aller dans **Settings → Pages**
- Source : `Deploy from a branch`
- Branch : `main` / `/ (root)`
- Cliquer **Save**

### 3. URL finale
```
https://TON-USER.github.io/vma-tracker/
```

> ⚠️ Le Service Worker nécessite **HTTPS** — GitHub Pages le fournit automatiquement.

---

## 📁 Arborescence

```
vma-tracker/
├── index.html          ← Application principale (modifiée PWA)
├── manifest.json       ← Manifeste PWA
├── service-worker.js   ← Worker offline/cache
├── README.md
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png     ← Apple Touch Icon
    ├── icon-192.png     ← Android / maskable
    ├── icon-384.png
    └── icon-512.png     ← Splash / maskable
```

---

## 📱 Installation sur les appareils

### Android (Chrome)
1. Ouvrir l'URL dans Chrome
2. Menu ⋮ → **Ajouter à l'écran d'accueil**
3. L'app s'installe comme une app native

### iOS (Safari)
1. Ouvrir l'URL dans Safari
2. Bouton Partager → **Sur l'écran d'accueil**
3. Confirmer l'ajout

### PC / Mac (Chrome ou Edge)
1. Icône d'installation dans la barre d'adresse
2. Ou menu → **Installer VMA Tracker**

---

## ✈️ Fonctionnement hors ligne

Après la **première visite avec connexion**, l'application est entièrement disponible hors ligne :
- `index.html` mis en cache (Network-First : reçoit les mises à jour)
- Scripts CDN (qrcodejs, lz-string) mis en cache (Cache-First)
- Polices Google Fonts mises en cache (Cache-First)

En cas de mise à jour de l'app, une bannière propose de recharger.

---

## 🔄 Mise à jour du cache

Changer la version dans `service-worker.js` :
```js
const CACHE_NAME = 'vma-tracker-v2'; // incrémenter
```

Puis pousser sur GitHub — les utilisateurs verront la bannière de mise à jour.
