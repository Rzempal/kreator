# Kreator Paneli Tapicerowanych

Aplikacja webowa do projektowania i wyceny paneli tapicerowanych na ścianę. Umożliwia wizualne rozmieszczanie paneli na ścianie z automatycznym snapowaniem, wykrywaniem kolizji i generowaniem wyceny.

## Demo

![Kreator Preview](kreator-app/public/preview.png)

## Technologie

- **Next.js 16** - React framework z App Router
- **TypeScript** - typowanie statyczne
- **Tailwind CSS** - stylowanie
- **Zustand** - zarządzanie stanem
- **SVG** - wizualizacja paneli

## Funkcje

### Zaimplementowane (Etap 1 - Lite)
- [x] Konfiguracja ściany (segmenty, skosy, wyrównanie góra/dół)
- [x] Biblioteka 592 tkanin w 26 kolekcjach (Standard/Premium/Exclusive)
- [x] Wymiary paneli (standardowe + własne 10-300cm)
- [x] Snap do krawędzi i innych paneli
- [x] Wykrywanie kolizji
- [x] Soft clamp - panele mogą wychodzić poza obszar ściany (dla skosów)
- [x] Historia ostatnich 6 rozmiarów paneli
- [x] Narzędzia: dodawanie, malowanie, gumka
- [x] Wycena z algorytmem dla nietypowych wymiarów
- [x] Accordion sidebar (Ściana/Tkaniny/Wymiary/Wycena)
- [x] Podgląd tekstur tkanin na panelach

### Planowane (Etap 2 - Full)
- [ ] Eksport PDF z wizualizacją
- [ ] Baza danych (Supabase)
- [ ] Panel administratora
- [ ] Konta użytkowników
- [ ] Zapisywanie projektów

### Przyszłość (Etap 3 - SaaS)
- [ ] Multi-tenancy
- [ ] White-label branding
- [ ] Płatności (Stripe)

## Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/TWOJ_USER/kreator.git
cd kreator

# Instalacja zależności
cd kreator-app
npm install

# Uruchomienie deweloperskie
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## Struktura projektu

```
kreator/
├── kreator-app/              # Aplikacja Next.js
│   ├── src/
│   │   ├── app/              # App Router (page.tsx)
│   │   ├── components/
│   │   │   ├── canvas/       # Wall, Panel, Canvas (SVG)
│   │   │   └── ui/           # Sidebar, ColorPicker, SizePicker, Toolbar
│   │   ├── data/             # JSON (fabrics, prices)
│   │   ├── lib/              # geometry, pricing, utils
│   │   ├── store/            # Zustand store
│   │   └── types/            # TypeScript definitions
│   └── public/               # Statyczne zasoby
├── references/               # Dane referencyjne (tkaniny, ceny)
├── scripts/                  # Skrypty pomocnicze
├── hostido.md               # Instrukcja wdrożenia
└── README.md
```

## Komendy

```bash
npm run dev       # Serwer deweloperski
npm run build     # Build produkcyjny
npm run start     # Uruchomienie buildu
npm run lint      # Sprawdzenie kodu
```

## Konfiguracja danych

### Tkaniny (`src/data/fabrics.json`)
- 26 kolekcji tkanin
- 592 kolory ze zdjęciami
- Kategorie: Standard, Premium, Exclusive

### Ceny (`src/data/prices.json`)
- Standardowe wymiary paneli
- Mnożniki kategorii (1.0 / 1.15 / 1.25)
- Algorytm wyceny nietypowych wymiarów

## Wdrożenie

Szczegółowa instrukcja w pliku [hostido.md](hostido.md).

**Rekomendowane**: Vercel (natywne wsparcie Next.js)

```bash
# Quick deploy
npm run build
vercel --prod
```

## Rozwój

### Dodawanie nowej kolekcji tkanin

1. Dodaj obrazy do `public/images/fabrics/NAZWA_KOLEKCJI/`
2. Zaktualizuj `src/data/fabrics.json`
3. Ustaw kategorię w `collections.NAZWA.category`

### Zmiana cen

Edytuj `src/data/prices.json`:
```json
{
  "standardDimensions": [...],
  "customPricing": {
    "categoryMultipliers": {
      "standard": 1.0,
      "premium": 1.15,
      "exclusive": 1.25
    }
  }
}
```

## Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone.

---

## Roadmapa strategiczna

### Etap 1: Lite (MVP) ✅
Cyfrowy Asystent Sprzedaży - narzędzie przyspieszające wycenę.

### Etap 2: Full
Profesjonalne Studio Projektowe - pełna samoobsługa klienta.

### Etap 3: SaaS
Twój Własny Konfigurator - oferta B2B white-label dla tapicerów.
