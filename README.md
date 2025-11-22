# Kreator Paneli Tapicerowanych

**Wersja:** v0.030
**Status:** Aktywny rozwój
**Design:** Modern Dark Theme + Glassmorphism ✨

---

## 1. Cel Projektu

Stworzenie zaawansowanego, przeglądarkowego narzędzia umożliwiającego użytkownikom samodzielne projektowanie układu paneli tapicerowanych na ścianie o dowolnym kształcie (w tym skosy i trapezy). Aplikacja łączy funkcję wizualną (układanie i kolorowanie) z precyzyjnym kalkulatorem ceny, uwzględniającym specyfikę produkcji, grupy materiałowe oraz logistykę.

---

## 2. Co zostało zrobione

### A. Design Wizualny (v0.030 - Major Redesign)

#### Modern Dark Theme
- **Background**: Gradient dark navy (#0f172a → #7c3aed → #1e293b)
- **Glassmorphism**: Przezroczyste karty z `backdrop-filter: blur(12px)`
- **Gradient Accents**: Cyan (#06b6d4) → Purple (#a855f7) → Pink (#ec4899)
- **Typography**: Font **Readex Pro** (Google Fonts) - elegancki, nowoczesny krój pisma

#### Animated Background
- **Floating Blobs**: 3 kolorowe kule unoszące się w tle (purple, cyan, pink)
- **Animacja**: 20-sekundowa pętla z blur 40px
- **Efekt**: Subtelna, dynamiczna warstwa wizualna

#### Animacje i Przejścia
- **Fade-in-up**: Wszystkie sekcje wlatują od dołu przy załadowaniu
- **Staggered Delays**: 0.1s, 0.2s, 0.3s, 0.4s dla kolejnych sekcji
- **Hover Effects**: Scale + glow shadows na przyciskach i kartach
- **Smooth Transitions**: 0.3s ease-out na wszystkich interakcjach

#### Glassmorphism Components
- **Cards**: Przezroczyste szkło z gradient glow borders na hover
- **Buttons**: Gradienty + shimmer effect (przesuwający się blask)
- **Inputs**: Dark glass z accent glow przy focus
- **Toolbar**: Glassmorphism między widokami

#### Gradient Text
- **Główny Header**: "✨ Kreator Paneli Tapicerowanych" (cyan → purple → pink)
- **View Headers**: "📐 Widok Frontalny" i "🔍 Widok z Góry" z gradientem
- **Cena**: Zielony gradient dla lepszej czytelności

#### Custom Styling
- **Scrollbars**: Fioletowe z smooth hover
- **Segment Rows**: Dark rows z purple accents
- **Messages**: Dark themed z color-coded alerts
- **Canvas**: Dark theme z cieniami i efektami świetlnymi

#### Accessibility
- **Reduced Motion**: Support dla `prefers-reduced-motion`
- **Color Contrast**: Ulepszone kontrasty dla lepszej czytelności
- **Focus States**: Wyraźne stany focus z accent colors

### B. Widok z Góry + Kąty (v0.027-0.029)

#### Dual View System
- **Widok Frontalny**: Klasyczne rozwinięcie ściany (2D)
- **Widok z Góry**: Rzut poziomy (top-down) pokazujący geometrię kątów
- **Synchronizacja**: Oba widoki zsynchronizowane - zmiany w jednym odzwierciedlają się w drugim

#### Kąty Segmentów
- **Definicja Kątów**: Każdy segment ma kąt połączenia (90°, 180°, 270°)
- **UI**: Przyciski +/- do cyklicznego przełączania kątów
- **Wizualizacja**: Etykiety kątów przy punktach łączenia z białym tłem i pomarańczową ramką
- **Geometria**: Precyzyjna trigonometria (sin/cos) dla pozycji 2D

#### Master Segment
- **Selekcja**: Radio buttons do wyboru segmentu referencyjnego
- **Alignment**: Master segment wyrównany lewo-prawo między widokami
- **Transformacja**: Względna rotacja i translacja wszystkich segmentów

#### Toolbar Między Widokami
- **Centralne Pozycjonowanie**: Toolbar zsynchronizowany dla obu widoków
- **Kontrolki**: Zoom (+/-), Cofnij (↩), Resetuj (🗑️)
- **Glass Effect**: Przezroczyste tło z blur

### C. Interfejs Użytkownika (UI)

#### Layout i Struktura
- **Nowy Layout "Wokół-ekranowy"**: Podział na wąski panel konfiguracyjny (lewa strona) i duży obszar roboczy (prawa strona)
- **Nagłówek "Projekt"**: Gradient fioletowy, wizualnie oddzielający obszar projektowania
- **Top Bar (Górny Pasek)**: Przyciski szybkiego dodawania paneli z możliwością **toggle** (kliknięcie włącza/wyłącza preview)
- **Left Vertical Bar (Pasek Narzędzi)**: Pionowy pasek z paletą kolorów/tekstur i narzędziem "Gumka"
- **Przycisk "Wyczyść obszar roboczy"** 🗑️: Możliwość szybkiego usunięcia wszystkich paneli z potwierdzeniem

#### Sekcje Konfiguracyjne
- **Kształt Ściany**: Tabelaryczna lista odcinków ściany z wizualizacją kierunku skosu (strzałki) i możliwością usuwania
- **Panele**: Definiowanie wymiarów paneli do układania
- **Wycena i Materiały**: Szczegółowa lista kosztów z rozbiciem na kategorie

### D. Logika Wizualizacji (SVG)

#### Renderowanie
- **Renderowanie Wektorowe**: SVG zapewnia idealną ostrość przy każdym powiększeniu
- **Obsługa Skosów**: System segmentów (width + startHeight + endHeight) dla dowolnych kształtów
- **Smart Height**: Automatyczne obliczanie wysokości panelu na podstawie geometrii ściany

#### Wymiarowanie
- **Wymiary wewnątrz paneli**: Font 11px (spójny z zewnętrznym wymiarowaniem)
- **Automatyczny kontrast tekstu**: Czarny tekst na jasnym tle, biały na ciemnym (algorytm luminancji WCAG)
- **Wymiarowanie zewnętrzne**: Linie wymiarowe dla szerokości segmentów

#### Panele poza obszarem
- **Przezroczystość zamiast zakreskowania**: Część panelu poza obszarem pokazana z opacity 30% + dashowy kontur
- **ClipPath**: Część w obszarze pełna, część poza przezroczysta
- **Wizualne oznaczenie**: Użytkownik widzi dokładnie co zostanie ucięte

### E. System Interakcji

#### Dodawanie Paneli
- **Auto-preview**: Pokazuje ostatnio użyty panel (działa na desktop i mobile)
- **Preview lock**: Po kliknięciu w obszar preview zamraża się, można dojechać do przycisku "Dodaj"
- **Toggle przycisków**: Powtórne kliknięcie rozmiaru wyłącza preview

#### Inteligentny Snap
- **Snap wertykalny (pionowa projekcja)**: Kliknięcie nad panelem → dodaje się nad nim
- **Priorytet osi Y**: Preferuje układanie NAD zamiast OBOK (zachowanie naturalnej wysokości)
- **Strong snap**: Snap do najbliższej krawędzi w lewo i w dół
- **Collision avoidance**: Dwupoziomowy algorytm z wagą kierunkową (Y × 3)

#### System Preview (4 kolory)
- 🔴 **Czerwony** - kolizja z innym panelem (BLOKADA)
- 🟡 **Żółty** - częściowo poza obszarem (OSTRZEŻENIE - można dodać)
- 🟢 **Zielony** - hover, wszystko OK
- 🔵 **Niebieski** - auto-preview, wszystko OK

#### Komunikaty Osadzone
- **Komunikaty w projekcie**: Zamiast alert/confirm - komunikaty osadzone poniżej top-bar
- **4 typy**: success (✓), info (ℹ), warning (⚠), error (✕)
- **Auto-hide**: Znikają po 4 sekundach
- **Przyciski confirm**: TAK / ANULUJ z callback
- **Nie blokują UI**: Użytkownik może dalej pracować

#### Tryby Edycji
- **Tryb Gumki**: Kliknięcie w panel przy aktywnym narzędziu "Kosz" usuwa go
- **Tryb Malowania**: Kliknięcie w panel przy aktywnym kolorze zmienia jego wygląd
- **Cofnij**: Przycisk ↩ do usunięcia ostatniego panelu
- **Zoom**: Przyciski +/- do powiększania/pomniejszania widoku

### F. Silnik Wyceny i Mapowanie

#### Szczegółowa Lista Materiałów
Zamiast prostego podsumowania, pełna lista z rozbiciem:

**═══ PANELE ═══**
- Grupowanie po: rozmiar × tkanina × kategoria
- 30×100 cm (DIANA) - 3 szt × 50.00 zł = 150.00 zł

**═══ DODATKI ═══**
- Podwójna pianka - z zakresami cen (6-100 zł) zależnie od powierzchni
- Rzep montażowy - z zakresami cen (8-120 zł)
- Otwory na kontakt - liczba × 39 zł
- Klej montażowy - liczba × 36 zł

**═══ LOGISTYKA ═══**
- Wysyłka = 39 zł

**═══ PODSUMOWANIE ═══**
- Suma paneli: X zł (Y szt, Z m²)
- Suma dodatków: X zł
- Wysyłka: X zł
- **RAZEM: X zł**

#### Logika Cenowa
- **Rozdzielenie Wyglądu od Ceny**: Kolory wizualne vs rzeczywiste kolekcje tkanin
- **Manualne Mapowanie**: Przypisywanie kolorów do konkretnych kolekcji (DIANA, KRONOS, itp.)
- **Grupy Cenowe**: Standard / Premium / Exclusive
- **Tabele cenowe**: RozmStandard, RozmPremium, RozmExclusive (inline w HTML)
- **Fallback**: Cena za m² (300 zł/m²) dla nietypowych wymiarów
- **Dopłaty**: Pianka i rzep zależne od powierzchni (przedziały: <0.4, 0.4-0.9, 0.9-1.5, 1.5-2.0, ≥2.0 m²)

### G. Zapis Danych

- **System FIFO**: 5 ostatnich projektów w localStorage
- **Zapisywane dane**: kształt ściany, panele, warianty, mapowanie, tryb
- **Wczytywanie**: Przywrócenie pełnego stanu projektu

---

## 3. Jak działa aplikacja (User Flow)

### 1. Konfiguracja Ściany
Definiowanie kształtu przez dodawanie segmentów (szerokość, wysokość początkowa, wysokość końcowa)

### 2. Definiowanie Paneli
Określanie wymiarów paneli do układania (np. 30×100, 20×140) - pojawiają się jako przyciski

### 3. Układanie Paneli
**Workflow:**
1. **Kliknij rozmiar** (np. 30×100) → przycisk się podświetla, pokazuje się preview
2. **Kliknij w obszar** → preview snapuje do krawędzi i zamraża się
3. **Kliknij "✓ Dodaj"** → panel dodaje się do projektu

**Alternatywnie:**
- Samo kliknięcie przycisku bez ustawiania pozycji → auto-dodanie sekwencyjne

**Dodawanie na skosach:**
- Żółty preview = ostrzeżenie (częściowo poza obszarem)
- Panel można dodać - część poza będzie przezroczysta
- Warning nie blokuje dodawania

### 4. Edycja Wizualna
- **Kolory/wzory**: Wybór z lewego paska, klikanie w panele
- **Usuwanie**: Ikona kosza + klikanie w panele
- **Czyszczenie**: Przycisk 🗑️ usuwa wszystkie panele (z potwierdzeniem)

### 5. Konfiguracja Cenowa
W sekcji "Wycena i Materiały":
- Lista użytych kolorów z swatchami
- Przypisanie: "Kolor Szary = tkanina MONOLITH (Premium)"
- System automatycznie przelicza ceny

### 6. Finalizacja
- Wybór dodatków (pianka, rzep, otwory, klej)
- Podgląd szczegółowej listy materiałów
- Finalna cena

---

## 4. Stack Technologiczny

- **HTML5 / CSS3** (CSS Grid, Flexbox, CSS Variables, Keyframe Animations, Backdrop Filter, Gradients)
- **Vanilla JavaScript** (ES6+)
- **SVG** (Skalowalna grafika wektorowa do wizualizacji)
- **Google Fonts** (Readex Pro - typography)
- **LocalStorage** (Zapis stanu po stronie klienta)
- **ClipPath** (Przycinanie paneli do obszaru roboczego)
- **Glassmorphism** (Backdrop blur + transparency dla modern UI)

---

## 5. Główne Algorytmy

### Snap Algorithm
1. **Pionowa projekcja**: Sprawdza czy istnieją panele "pod" kursorem
2. **Fallback snap**: Snap do najbliższych krawędzi (lewo + dół)
3. **Collision resolution**: Priorytet zachowania Y (przesuwanie tylko X)
4. **Weighted search**: Y × 3 przy szukaniu alternatywnej pozycji

### Collision Detection
- Rectangle overlap check
- Pozwala na panele częściowo poza obszarem
- Blokuje nakładanie paneli

### Panel Fit Check
- Sampling (5 punktów) wysokości panelu
- Interpolacja wysokości dla skosów
- Sprawdzanie czy panel mieści się w szerokości obszaru

### Contrast Color Algorithm
- Konwersja hex → RGB
- Obliczanie luminancji: `0.299*R + 0.587*G + 0.114*B`
- Luminance > 0.5 → czarny tekst
- Luminance ≤ 0.5 → biały tekst

### Top View Positioning Algorithm (v0.027+)
1. **2D Position Calculation**: Trigonometryczne obliczanie pozycji segmentów
   ```javascript
   // Dla każdego segmentu:
   positions.push({ x: currentX, y: currentY, angle: currentAngle, width: seg.width });
   const dx = seg.width * Math.cos(currentAngle);
   const dy = seg.width * Math.sin(currentAngle);
   currentX += dx; currentY += dy;
   ```
2. **Angle Update**: `turnAngle = nextSeg.angle - 180°` (konwersja z UI do kierunku ruchu)
3. **Master Segment Transform**: Translacja + rotacja względem segmentu referencyjnego
   ```javascript
   // Rotacja o -masterAngle aby master miał kąt 0°
   rotatedX = relX * cos(-masterAngle) - relY * sin(-masterAngle);
   rotatedY = relX * sin(-masterAngle) + relY * cos(-masterAngle);
   ```
4. **ViewBox Alignment**: Oba widoki używają tej samej szerokości `W = totalW + padX * 2`

---

## 6. Historia Wersji (Ostatnie Zmiany)

### v0.030 - Design: Full Redesign (MAJOR UPDATE)
- **Dark Theme**: Gradient background (#0f172a → #7c3aed → #1e293b)
- **Glassmorphism**: Backdrop-filter blur na wszystkich kartach
- **Animated Background**: 3 floating blobs (purple, cyan, pink)
- **Font**: Import Readex Pro z Google Fonts
- **Gradient Accents**: Cyan → Purple → Pink
- **Animations**: Fade-in-up dla sekcji z staggered delays
- **Hover Effects**: Scale + glow shadows
- **Buttons**: Gradient backgrounds ze shimmer effect
- **Inputs**: Dark glass z accent focus states
- **Gradient Text**: Headers z cyan-purple-pink gradientem
- **Custom Scrollbars**: Purple styling
- **Messages**: Dark themed z color-coded alerts
- **Accessibility**: Reduced motion support

### v0.029 - UX: Uproszczenie widoku z góry
- Usunięcie renderingu paneli z widoku z góry (za dużo szczegółów)
- Przeniesienie toolbara (zoom, cofnij, resetuj) między dwa widoki
- Centralne pozycjonowanie przybornika

### v0.028 - UX: Opisy kątów z ramką
- Etykiety kątów przy punktach łączenia
- Białe tło z pomarańczową ramką dla lepszej czytelności
- Offset 15px od punktu połączenia

### v0.027 - Feature: Master segment + alignment
- Radio buttons do wyboru master segmentu
- Wyrównanie master segment lewo-prawo między widokami
- Fix: ViewBox width alignment (oba widoki używają tej samej szerokości)
- Stała grubość ściany (wallDepth = 2.5cm)

### v0.026 - Feature: Widok z góry (Top View)
- Dodanie drugiego widoku (rzut poziomy)
- Kąty połączeń segmentów (90°, 180°, 270°)
- Trigonometria dla pozycji 2D
- Przyciski +/- do zmiany kątów
- Layout: frontal view na górze, top view na dole

### v0.025 - Feature: Panel depth
- Dodanie głębokości panelu (2.5cm default, 5cm dla "Podwójna pianka")
- Checkbox "Podwójna pianka" wpływa na grubość panelu

### v0.024 - Feature: Kąty segmentów (Initial)
- Dodanie pola `angle` do segmentów (45-270°, default 180°)
- Podstawowa implementacja kątów

### v0.023 - Fix: Bugi z dodawaniem paneli
- Naprawa false positive warning dla paneli które pasują
- Naprawa pozycji panelu gdy fits: false

### v0.022 - UX: Panel poza obszarem
- Warning zamiast error dla paneli poza obszarem
- Przezroczystość zamiast zakreskowania (Opcja A z clipPath)
- Toggle przycisków paneli (włącz/wyłącz preview)

### v0.021 - UX: Komunikaty osadzone
- System komunikatów w projekcie zamiast alert/confirm
- 4 typy z ikonami i kolorami
- Auto-hide po 4s

### v0.020 - Feature: Panele na skosach
- Żółty preview dla ostrzeżenia
- Szare oznaczenie części do ucięcia
- Możliwość dodawania paneli częściowo poza obszarem

### v0.019 - UX: Nagłówek i szczegółowa wycena
- Nagłówek "Projekt" z gradientem
- Przycisk czyszczenia obszaru
- Szczegółowa lista materiałów (panele, dodatki, logistyka, podsumowanie)

### v0.018 - Fix: Wycena + wymiary
- Import danych cenowych inline (RozmStandard/Premium/Exclusive)
- Font 11px dla wymiarów
- Automatyczny kontrast tekstu

### v0.017 - Fix: Inteligentny snap wertykalny
- Pionowa projekcja (kliknij nad panelem → dodaje się nad nim)
- Fallback do standardowego snapa

### v0.016 - Fix: Priorytet osi Y
- Preferowanie układania NAD zamiast OBOK
- Waga kierunkowa (Y × 3)

### v0.015 - Fix: Preview lock
- Zamrożenie preview po snapie
- Możliwość dojechania do przycisku "Dodaj"

---

## 7. Pliki Projektu

```
kreator/
├── kreator.html           # Główny plik aplikacji (all-in-one)
├── references/
│   ├── analiza_cenowa.md   # Dokumentacja algorytmów wyceny
│   ├── rozmiary.js         # Tabele cenowe (referencyjna kopia)
│   └── Kalkulator wyceny.html  # Oryginalny kalkulator (referencja)
├── README.md               # Ten plik
└── CLAUDE.md              # Instrukcje dla AI asystenta
```

---

## 8. Roadmap / TODO

### Priorytet: Wysoki
- [ ] Walidacja formularzy z lepszymi komunikatami
- [ ] Obsługa touch events dla mobile (testowanie)
- [ ] Export projektu do PDF/obrazka
- [ ] Rendering paneli w widoku z góry (opcjonalnie toggle on/off)

### Priorytet: Średni
- [ ] Undo/Redo stack (historia zmian)
- [ ] Kopiowanie/wklejanie paneli
- [ ] Tryb "fill" - automatyczne wypełnienie obszaru
- [ ] Więcej presetów kątów (45°, 135°, 225°, 315°)
- [ ] 3D preview (isometric view)

### Priorytet: Niski
- [ ] Szablony projektów (gotowe układy)
- [ ] Import kształtu ściany z pliku
- [ ] Eksport listy materiałów do Excel
- [ ] Light theme toggle (dla użytkowników preferujących jasny motyw)
- [ ] Customizable color schemes

---

## 9. Znane Ograniczenia

- **Brak backend**: Wszystkie dane w localStorage (max 5 projektów)
- **Brak multi-user**: Jeden użytkownik na przeglądarkę
- **Brak walidacji wymiarów**: Użytkownik może wprowadzić dowolne wartości
- **Uproszczona logistyka**: Stała cena wysyłki (39 zł), bez kalkulacji gabarytu

---

## 10. Dla Deweloperów

### Uruchomienie
```bash
# Otwórz plik w przeglądarce
open kreator2.html

# Lub uruchom lokalny serwer
python -m http.server 8000
# http://localhost:8000/kreator2.html
```

### Struktura Kodu (kreator2.html)
- Linie 1-315: HTML + CSS (style inline)
- Linie 316-520: Dane (tabele cenowe, kolekcje, palety)
- Linie 521-1500: JavaScript (logika aplikacji)

### Główne Funkcje
- `draw()` - Renderowanie SVG (widok frontalny)
- `drawTopView()` - Renderowanie widoku z góry z geometrią kątów
- `addPanel()` - Dodawanie panelu
- `findBestSnapPosition()` - Inteligentny snap
- `checkPanelFits()` - Sprawdzanie czy panel mieści się
- `recalculatePrice()` - Przeliczanie wyceny
- `showProjectMessage()` - Komunikaty osadzone
- `cycleAngle()` - Cykliczne przełączanie kątów (90° → 180° → 270°)
- `setMasterSegment()` - Ustawianie segmentu referencyjnego
- `updatePanelDepth()` - Aktualizacja głębokości panelu

---

## 11. Licencja

Projekt prywatny - brak publicznej licencji.

---

**Ostatnia aktualizacja:** 2025-11-22
**Autor:** Rzempal
**Design Version:** v0.030 - Modern Dark Theme ✨
