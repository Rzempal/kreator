# hostido.md v0.002 Przepisano instrukcję wdrożenia dla początkujących - fokus na Vercel

# Jak uruchomić Kreator Paneli w internecie - Przewodnik dla początkujących

## Spis treści

1. [Wprowadzenie - co to znaczy "wdrożyć aplikację"?](#1-wprowadzenie)
2. [Wymagania wstępne](#2-wymagania-wstępne)
3. [ETAP 1: Wdrożenie na Vercel (krok po kroku)](#3-etap-1-wdrożenie-na-vercel)
4. [Aktualizacja aplikacji](#4-aktualizacja-aplikacji)
5. [Rozwiązywanie problemów](#5-rozwiązywanie-problemów)
6. [Rekomendacje na przyszłość](#6-rekomendacje-na-przyszłość)

---

## 1. Wprowadzenie

### Co to znaczy "wdrożyć aplikację"?

**Wdrożenie (deploy)** to proces umieszczenia Twojej aplikacji na serwerze w internecie, tak aby inni ludzie mogli z niej korzystać przez przeglądarkę.

```
TERAZ:                              PO WDROŻENIU:
┌─────────────────┐                 ┌─────────────────┐
│  Twój komputer  │                 │  Serwer Vercel  │
│                 │                 │                 │
│  localhost:3000 │       →         │  kreator.pl     │
│                 │                 │                 │
│  Tylko Ty widzisz                │  Każdy może wejść
└─────────────────┘                 └─────────────────┘
```

### Dlaczego Vercel?

Twoja aplikacja (Kreator Paneli) jest napisana w **Next.js**. Vercel to firma, która stworzyła Next.js, dlatego:

| Zaleta | Opis |
|--------|------|
| **Darmowy plan** | Wystarczający dla małych i średnich projektów |
| **Zero konfiguracji** | Vercel automatycznie rozpoznaje Next.js |
| **Automatyczne aktualizacje** | Każdy `git push` = nowa wersja online |
| **Szybkość** | Serwery na całym świecie (CDN) |
| **SSL gratis** | Certyfikat HTTPS automatycznie |

### Słowniczek pojęć

| Pojęcie | Co to znaczy? |
|---------|---------------|
| **Deploy** | Wdrożenie aplikacji na serwer |
| **Build** | Kompilacja kodu do wersji produkcyjnej |
| **Repository (repo)** | Miejsce przechowywania kodu (np. GitHub) |
| **Domena** | Adres strony (np. `kreator-paneli.pl`) |
| **DNS** | System tłumaczący domenę na adres serwera |
| **CNAME** | Typ rekordu DNS wskazujący na inną domenę |
| **SSL/HTTPS** | Szyfrowane połączenie (kłódka w przeglądarce) |

---

## 2. Wymagania wstępne

Przed rozpoczęciem upewnij się, że masz:

### Konto GitHub

- [ ] Masz konto na [github.com](https://github.com)
- [ ] Twój kod jest w repozytorium na GitHub

**Nie masz konta GitHub?** Załóż je teraz:
1. Wejdź na https://github.com
2. Kliknij "Sign up"
3. Podaj email, hasło i nazwę użytkownika
4. Potwierdź email

### Kod w repozytorium

- [ ] Projekt `kreator` jest na GitHub
- [ ] Folder `kreator-app` zawiera aplikację Next.js

**Nie masz repo na GitHub?** Utwórz je:
```bash
# W terminalu, w folderze projektu:
cd /sciezka/do/kreator

# Inicjalizacja git (jeśli jeszcze nie zrobione)
git init

# Dodaj wszystkie pliki
git add -A

# Pierwszy commit
git commit -m "Inicjalizacja projektu"

# Połącz z GitHub (zamień TWOJ_USER na swoją nazwę)
git remote add origin https://github.com/TWOJ_USER/kreator.git

# Wyślij kod na GitHub
git push -u origin main
```

---

## 3. ETAP 1: Wdrożenie na Vercel

### Krok 1: Rejestracja na Vercel

1. **Otwórz przeglądarkę** i wejdź na:
   ```
   https://vercel.com
   ```

2. **Kliknij przycisk "Sign Up"** (prawy górny róg)

3. **Wybierz "Continue with GitHub"**
   ```
   ┌─────────────────────────────────────┐
   │                                     │
   │   Sign up to Vercel                 │
   │                                     │
   │   ┌─────────────────────────────┐   │
   │   │  ◉ Continue with GitHub     │   │  ← Kliknij to
   │   └─────────────────────────────┘   │
   │   ┌─────────────────────────────┐   │
   │   │    Continue with GitLab     │   │
   │   └─────────────────────────────┘   │
   │   ┌─────────────────────────────┐   │
   │   │   Continue with Bitbucket   │   │
   │   └─────────────────────────────┘   │
   │                                     │
   └─────────────────────────────────────┘
   ```

4. **Autoryzuj dostęp** - GitHub zapyta czy Vercel może widzieć Twoje repozytoria
   - Kliknij "Authorize Vercel"

5. **Gotowe!** Jesteś zalogowany na Vercel

---

### Krok 2: Import projektu

1. **Na dashboardzie Vercel** kliknij:
   ```
   ┌─────────────────────────────────────┐
   │                                     │
   │   ┌─────────────────────────────┐   │
   │   │    + Add New...             │   │  ← Kliknij
   │   └─────────────────────────────┘   │
   │                                     │
   │   Potem wybierz: "Project"          │
   │                                     │
   └─────────────────────────────────────┘
   ```

2. **Znajdź swoje repozytorium** na liście:
   ```
   Import Git Repository

   ┌─────────────────────────────────────┐
   │  🔍 Search...                       │
   ├─────────────────────────────────────┤
   │                                     │
   │  📁 TWOJ_USER/kreator        Import │  ← Kliknij "Import"
   │  📁 TWOJ_USER/inne-repo      Import │
   │                                     │
   └─────────────────────────────────────┘
   ```

   **Nie widzisz repo?** Kliknij "Adjust GitHub App Permissions" i dodaj dostęp.

---

### Krok 3: Konfiguracja projektu

To **najważniejszy krok** - musisz ustawić odpowiedni folder:

```
Configure Project

┌─────────────────────────────────────────────────────┐
│                                                     │
│  Project Name:  kreator-paneli                      │
│                 (możesz zmienić)                    │
│                                                     │
│  Framework Preset:  Next.js  ✓                      │
│                     (wykryje automatycznie)         │
│                                                     │
│  Root Directory:    ┌──────────────────────┐        │
│                     │  kreator-app         │  ← WAŻNE!
│                     └──────────────────────┘        │
│                     Kliknij "Edit" i wpisz:         │
│                     kreator-app                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**UWAGA:** Musisz ustawić **Root Directory** na `kreator-app`, ponieważ:
```
kreator/                    ← To jest repo
├── kreator-app/            ← Tu jest aplikacja Next.js
│   ├── src/
│   ├── package.json
│   └── next.config.ts
├── hostido.md
└── README.md
```

**Jak ustawić Root Directory:**
1. Kliknij "Edit" obok "Root Directory"
2. Wpisz: `kreator-app`
3. Kliknij "Continue" lub naciśnij Enter

---

### Krok 4: Deploy!

1. **Kliknij niebieski przycisk "Deploy"**
   ```
   ┌─────────────────────────────────────┐
   │                                     │
   │   ┌─────────────────────────────┐   │
   │   │         Deploy              │   │  ← Kliknij!
   │   └─────────────────────────────┘   │
   │                                     │
   └─────────────────────────────────────┘
   ```

2. **Poczekaj na build** (2-5 minut)

   Zobaczysz logi z procesu budowania:
   ```
   ⠋ Building...

   Cloning github.com/TWOJ_USER/kreator
   Installing dependencies...
   npm install
   Running build...
   npm run build

   ✓ Build completed!
   ```

3. **Sukces!** 🎉
   ```
   ┌─────────────────────────────────────────────────┐
   │                                                 │
   │   🎉 Congratulations!                           │
   │                                                 │
   │   Your project has been deployed!               │
   │                                                 │
   │   ┌─────────────────────────────────────────┐   │
   │   │  https://kreator-abc123.vercel.app     │   │
   │   └─────────────────────────────────────────┘   │
   │                                                 │
   │   [Visit]  [Add Domain]  [Go to Dashboard]      │
   │                                                 │
   └─────────────────────────────────────────────────┘
   ```

4. **Kliknij link** aby zobaczyć swoją aplikację online!

---

### Krok 5: Podłączenie własnej domeny (opcjonalnie)

Jeśli masz własną domenę (np. z Hostido.pl), możesz ją podłączyć do Vercel.

#### 5.1. Dodaj domenę w Vercel

1. W dashboardzie projektu kliknij **"Settings"** (górne menu)
2. W lewym menu kliknij **"Domains"**
3. Wpisz swoją domenę i kliknij **"Add"**:
   ```
   ┌─────────────────────────────────────────────────┐
   │                                                 │
   │  Add Domain                                     │
   │                                                 │
   │  ┌─────────────────────────────────┐            │
   │  │  twojadomena.pl                 │  [Add]     │
   │  └─────────────────────────────────┘            │
   │                                                 │
   └─────────────────────────────────────────────────┘
   ```

4. Vercel pokaże instrukcje konfiguracji DNS:
   ```
   Configure your domain's DNS settings:

   ┌────────────────────────────────────────────────┐
   │  Type    Name    Value                         │
   ├────────────────────────────────────────────────┤
   │  A       @       76.76.21.21                   │
   │  CNAME   www     cname.vercel-dns.com          │
   └────────────────────────────────────────────────┘
   ```

#### 5.2. Skonfiguruj DNS w Hostido

1. **Zaloguj się do panelu Hostido** (DirectAdmin)
   ```
   https://panel.hostido.pl  (lub link z maila)
   ```

2. **Znajdź sekcję DNS**
   ```
   DirectAdmin → Twoje konto → DNS Management
   lub
   DirectAdmin → Zaawansowane → Rekordy DNS
   ```

3. **Dodaj rekordy DNS** (usuń stare jeśli istnieją):

   **Rekord A** (dla domeny głównej):
   ```
   Typ:      A
   Nazwa:    @  (lub zostaw puste)
   Wartość:  76.76.21.21
   TTL:      3600
   ```

   **Rekord CNAME** (dla www):
   ```
   Typ:      CNAME
   Nazwa:    www
   Wartość:  cname.vercel-dns.com
   TTL:      3600
   ```

4. **Zapisz zmiany**

5. **Poczekaj na propagację DNS** (od 5 minut do 24 godzin)

#### 5.3. Sprawdź status w Vercel

Po konfiguracji DNS wróć do Vercel → Settings → Domains:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  twojadomena.pl           ✓ Valid Configuration    │
│  www.twojadomena.pl       ✓ Valid Configuration    │
│                                                     │
│  SSL Certificate: ✓ Issued                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Gdy zobaczysz zielone ✓ - Twoja domena działa!

---

## 4. Aktualizacja aplikacji

### Automatyczne aktualizacje

Po wdrożeniu, **każdy push do GitHub** automatycznie aktualizuje stronę:

```bash
# Zrobiłeś zmiany w kodzie? Wyślij je:
git add -A
git commit -m "Opis zmian"
git push

# Vercel automatycznie:
# 1. Wykryje nowy commit
# 2. Zbuduje aplikację
# 3. Wdroży nową wersję
# 4. Wyśle email z potwierdzeniem
```

### Sprawdzanie statusu

1. Wejdź na https://vercel.com
2. Kliknij swój projekt
3. Zakładka **"Deployments"** pokazuje historię wdrożeń:
   ```
   Deployments

   ┌─────────────────────────────────────────────────┐
   │  ✓ Production  2 min ago   "Dodano nową..."    │
   │  ✓ Production  1 day ago   "Poprawiono..."     │
   │  ✓ Production  3 days ago  "Pierwszy deploy"   │
   └─────────────────────────────────────────────────┘
   ```

### Cofanie do poprzedniej wersji

Jeśli nowa wersja ma błędy:
1. Wejdź w **"Deployments"**
2. Znajdź działającą wersję
3. Kliknij **"..."** → **"Promote to Production"**

---

## 5. Rozwiązywanie problemów

### Problem: Build fails (błąd budowania)

**Objawy:** Czerwony komunikat "Build Failed"

**Rozwiązanie:**
1. Kliknij na nieudany deployment
2. Sprawdź logi błędów
3. Najczęstsze przyczyny:

| Błąd | Rozwiązanie |
|------|-------------|
| `Root Directory not found` | Ustaw Root Directory na `kreator-app` |
| `npm install failed` | Sprawdź `package.json` - brakuje zależności? |
| `Build error` | Uruchom `npm run build` lokalnie i napraw błędy |
| `Type error` | Błędy TypeScript - napraw je w kodzie |

### Problem: Strona nie działa po zmianie DNS

**Objawy:** Błąd 404 lub stara strona

**Rozwiązanie:**
1. **Poczekaj** - propagacja DNS trwa do 24h
2. **Sprawdź DNS**: https://dnschecker.org - wpisz swoją domenę
3. **Wyczyść cache przeglądarki**: Ctrl+Shift+R

### Problem: Brak HTTPS (kłódki)

**Objawy:** Przeglądarka pokazuje "Niezabezpieczone"

**Rozwiązanie:**
1. Vercel automatycznie generuje SSL
2. Poczekaj 5-10 minut po dodaniu domeny
3. W Vercel → Settings → Domains sprawdź status SSL

### Problem: "You've reached the free tier limit"

**Objawy:** Komunikat o limitach

**Rozwiązanie:**
1. Darmowy plan ma limity (100GB bandwidth/miesiąc)
2. Dla małego projektu to wystarczy
3. Jeśli przekraczasz - rozważ plan Pro ($20/mies.) lub VPS

---

## 6. Rekomendacje na przyszłość

### Kiedy Vercel (darmowy) wystarczy?

```
✅ ZOSTAŃ NA VERCEL GDY:

├── Ruch na stronie < 100 000 wizyt/miesiąc
├── Brak bazy danych (lub używasz Supabase free tier)
├── Projekt hobbystyczny lub MVP
├── Mały zespół (1-3 osoby)
└── Bandwidth < 100GB/miesiąc
```

### Kiedy rozważyć upgrade?

```
⚠️ ROZWAŻ UPGRADE GDY:

ETAP 2 - Vercel Pro ($20/mies.) lub VPS (~50-100 zł/mies.)
├── Potrzebujesz bazy danych (PostgreSQL, MongoDB)
├── Masz > 100 000 wizyt/miesiąc
├── Potrzebujesz więcej niż 100GB bandwidth
├── Chcesz panel administratora z autoryzacją
└── Wielu użytkowników zapisuje projekty

ETAP 3 - VPS/Serwer dedykowany (100-500 zł/mies.)
├── Aplikacja SaaS z wieloma klientami B2B
├── Wymagania RODO (dane muszą być w Polsce)
├── Potrzebujesz pełnej kontroli nad serwerem
├── Integracje z zewnętrznymi systemami
└── > 1 000 000 wizyt/miesiąc
```

### Ścieżka rozwoju projektu

```
TERAZ                    PRZYSZŁOŚĆ
  │                          │
  ▼                          ▼
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│  ETAP 1     │        │  ETAP 2     │        │  ETAP 3     │
│  Vercel     │   →    │  VPS +      │   →    │  Serwer     │
│  (darmowy)  │        │  Supabase   │        │  dedykowany │
├─────────────┤        ├─────────────┤        ├─────────────┤
│ • MVP       │        │ • Baza      │        │ • SaaS B2B  │
│ • Demo      │        │   danych    │        │ • Multi-    │
│ • Testy     │        │ • Panel     │        │   tenant    │
│ • Wizytówka │        │   admina    │        │ • Płatności │
│             │        │ • Logowanie │        │ • White-    │
│             │        │   users     │        │   label     │
├─────────────┤        ├─────────────┤        ├─────────────┤
│ Koszt: 0 zł │        │ ~100 zł/m.  │        │ ~500 zł/m.  │
└─────────────┘        └─────────────┘        └─────────────┘
```

### Konkretne sygnały do upgrade'u

| Sygnał | Akcja |
|--------|-------|
| Vercel pokazuje "Bandwidth limit reached" | Kup Vercel Pro lub przenieś na VPS |
| Potrzebujesz bazy danych | Dodaj Supabase (darmowy) lub VPS z PostgreSQL |
| Klienci pytają o zapisywanie projektów | Czas na Etap 2 (baza + autoryzacja) |
| Firmy chcą własne logo/domenę | Czas na Etap 3 (multi-tenancy) |
| RODO wymaga danych w Polsce | VPS u polskiego dostawcy (OVH.pl, Hetzner) |

### Rekomendowani dostawcy na przyszłość

| Etap | Dostawca | Koszt | Link |
|------|----------|-------|------|
| 2 | Vercel Pro | $20/mies. | vercel.com |
| 2 | Supabase | 0-25$/mies. | supabase.com |
| 2-3 | Mikrus.pl | ~30 zł/rok | mikrus.pl |
| 2-3 | OVH VPS | ~15-50 zł/mies. | ovh.pl |
| 3 | Hetzner | ~20-100€/mies. | hetzner.com |

---

## Podsumowanie

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🚀 SZYBKI START - CO MUSISZ ZROBIĆ:                       │
│                                                             │
│  1. Wejdź na vercel.com                                    │
│  2. Zaloguj się przez GitHub                               │
│  3. Kliknij "Add New" → "Project"                          │
│  4. Wybierz repo "kreator"                                 │
│  5. Ustaw Root Directory: kreator-app                      │
│  6. Kliknij "Deploy"                                       │
│  7. Poczekaj 2-5 minut                                     │
│  8. Gotowe! Twoja aplikacja jest online 🎉                 │
│                                                             │
│  Opcjonalnie: Dodaj własną domenę w Settings → Domains     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*Ostatnia aktualizacja: Grudzień 2024*
*Wersja dokumentu: 0.002*
