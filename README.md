Status Projektu: Kreator Paneli Tapicerowanych
1. Cel Projektu
Stworzenie zaawansowanego, przeglądarkowego narzędzia umożliwiającego użytkownikom samodzielne projektowanie układu paneli tapicerowanych na ścianie o dowolnym kształcie (w tym skosy i trapezy). Aplikacja ma łączyć funkcję wizualną (układanie i kolorowanie) z precyzyjnym kalkulatorem ceny, uwzględniającym specyfikę produkcji, grupy materiałowe oraz logistykę.
2. Co zostało zrobione
A. Interfejs Użytkownika (UI)
* Nowy Layout "Wokół-ekranowy": Wdrożono podział na wąski panel konfiguracyjny (lewa strona) i duży obszar roboczy (prawa strona).
* Top Bar (Górny Pasek): Miejsce na przyciski szybkiego dodawania paneli o zdefiniowanych szerokościach.
* Left Vertical Bar (Pasek Narzędzi): Pionowy pasek przy wizualizacji zawierający paletę kolorów/tekstur oraz narzędzie "Gumka" (tryb usuwania).
* Sekcja "Kształt Ściany": Tabelaryczna lista odcinków ściany z wizualizacją kierunku skosu (strzałki) i możliwością usuwania segmentów.
B. Logika Wizualizacji (SVG)
* Renderowanie Wektorowe: Ściana i panele są rysowane jako SVG, co zapewnia idealną ostrość przy każdym powiększeniu.
* Obsługa Skosów: System segmentów (width + endHeight) pozwala na rysowanie dowolnych kształtów (ścianki kolankowe, poddasza).
* Smart Height: Algorytm automatycznie oblicza wysokość każdego panela na podstawie geometrii ściany w miejscu, w którym panel został upuszczony (wycina kształt ze skosu).
C. System Interakcji
* Flow: Definiowanie szerokości (Magazyn) -> Dodawanie (Top Bar) -> Malowanie/Usuwanie (Left Bar).
* Tryb Gumki: Kliknięcie w panel przy aktywnym narzędziu "Kosz" usuwa go.
* Tryb Malowania: Kliknięcie w panel przy aktywnym kolorze zmienia jego wygląd.
D. Silnik Wyceny i Mapowanie
* Rozdzielenie Wyglądu od Ceny: Kolory na wizualizacji (np. "Fiolet") są tylko reprezentacją wizualną.
* Manualne Mapowanie: W sekcji "Wycena" system wykrywa użyte kolory i generuje listy rozwijane, gdzie użytkownik przypisuje konkretną kolekcję tkanin (np. "Ten fiolet to KRONOS").
* Grupy Cenowe: Automatyczne rozpoznawanie grupy (Standard/Premium) na podstawie wybranej kolekcji.
* Logika Kosztów:
   * Ceny z tabeli dla wymiarów standardowych.
   * Ceny z m² dla nietypowych.
   * Dopłaty za dodatki (pianka, rzep) zależne od powierzchni.
   * Logika kosztów wysyłki zależna od gabarytów.
E. Zapis Danych
* System FIFO: Możliwość zapisu 5 ostatnich projektów w pamięci przeglądarki (localStorage). Najnowszy projekt nadpisuje najstarszy.
3. Jak działa aplikacja (User Flow)
1. Konfiguracja Ściany: Użytkownik definiuje kształt ściany, dodając kolejne odcinki o określonej szerokości i wysokości końcowej.
2. Definiowanie Paneli: Użytkownik określa, jakie szerokości paneli chce układać (np. 30cm, 45cm). Pojawiają się one jako przyciski w górnym pasku.
3. Układanie: Klikanie w przyciski na górnym pasku dodaje panele do ściany.
4. Edycja Wizualna:
   * Wybór koloru/wzoru z lewego paska narzędzi i klikanie w panele, aby je pomalować.
   * Wybór ikony kosza i klikanie w panele, aby je usunąć.
5. Konfiguracja Cenowa (Kluczowy moment):
   * W sekcji "Wycena" pojawia się lista użytych kolorów.
   * Użytkownik decyduje: "Kolor Szary na wizualizacji to w rzeczywistości tkanina MONOLITH".
   * System przelicza cenę w oparciu o cennik grupy, do której należy MONOLITH (Premium).
6. Finalizacja: Wybór opcji dodatkowych (klej, pianka) i podgląd końcowej ceny.
4. Stack Technologiczny
* HTML5 / CSS3 (CSS Grid, Flexbox, Zmienne CSS)
* Vanilla JavaScript (ES6+)
* SVG (Skalowalna grafika wektorowa do wizualizacji)
* LocalStorage (Zapis stanu po stronie klienta)
