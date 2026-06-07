# GeoStreet 🌍

GeoGuessr-a bənzər Google Maps Street View oyunu.

## Quraşdırma

1. Asılılıqları yüklə:
```bash
npm install
```

2. `.env` faylı yarat:
```bash
cp .env.example .env
```

3. `.env` faylında Google Maps API key-ini daxil et:
```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

> Google Cloud Console-da **Maps JavaScript API** və **Street View Static API** aktiv edilməlidir.

4. Dev serveri başlat:
```bash
npm run dev
```

5. Build:
```bash
npm run build
```

## Oyun qaydaları

- Street View-da 3D gəz
- Xəritəyə klikləyib yerini işarələ
- 90 saniyə vaxtın var
- 5 tur oyna, max 25,000 xal topla
