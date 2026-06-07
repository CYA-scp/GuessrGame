# GeoStreet 🌍

GeoGuessr-a bənzər Google Maps Street View oyunu.

## GitHub Pages-ə deploy etmək

### 1. API Key-i GitHub Secret kimi əlavə et
GitHub repo → Settings → Secrets and variables → Actions → New repository secret
- Name: VITE_GOOGLE_MAPS_API_KEY
- Value: Google Maps API key-in

### 2. GitHub Pages-i aktiv et
GitHub repo → Settings → Pages → Source: GitHub Actions

### 3. Push et
git push etdikdən sonra GitHub avtomatik build edib deploy edəcək.

## Lokal işlətmək
npm install
cp .env.example .env
npm run dev
