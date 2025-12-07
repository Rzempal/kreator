# Instrukcja wdrożenia aplikacji KreatorPaneliTapicerowanych

## Wymagania wstępne
- Konto GitHub z repozytorium projektu
- Node.js 18+ (do testów lokalnych)

---

## Opcja 1: Vercel (Rekomendowane dla Next.js)

### Krok 1: Przygotowanie repozytorium
```bash
cd /home/user/kreator
git add -A
git commit -m "Przygotowanie do deploymentu"
git push origin main
```

### Krok 2: Rejestracja na Vercel
1. Wejdź na https://vercel.com
2. Kliknij "Sign Up" i wybierz "Continue with GitHub"
3. Autoryzuj dostęp do swojego konta GitHub

### Krok 3: Import projektu
1. Kliknij "Add New..." → "Project"
2. Znajdź repozytorium `kreator` i kliknij "Import"
3. Skonfiguruj projekt:
   - **Framework Preset**: Next.js (wykryje automatycznie)
   - **Root Directory**: `kreator-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Krok 4: Deploy
1. Kliknij "Deploy"
2. Poczekaj na zakończenie buildu (2-3 minuty)
3. Po zakończeniu otrzymasz URL: `https://kreator-xxx.vercel.app`

### Krok 5: Własna domena (opcjonalnie)
1. W dashboardzie projektu → "Settings" → "Domains"
2. Dodaj swoją domenę
3. Skonfiguruj DNS według instrukcji Vercel

---

## Opcja 2: Netlify

### Krok 1: Rejestracja
1. Wejdź na https://netlify.com
2. Zarejestruj się przez GitHub

### Krok 2: Nowy projekt
1. Kliknij "Add new site" → "Import an existing project"
2. Wybierz "GitHub" i znajdź repozytorium

### Krok 3: Konfiguracja buildu
```
Base directory: kreator-app
Build command: npm run build
Publish directory: kreator-app/.next
```

### Krok 4: Zainstaluj plugin Next.js
1. W "Site settings" → "Build & deploy" → "Plugins"
2. Zainstaluj "@netlify/plugin-nextjs"

### Krok 5: Deploy
1. Kliknij "Deploy site"
2. Otrzymasz URL: `https://xxx.netlify.app`

---

## Opcja 3: Self-hosted (VPS/Docker)

### Krok 1: Przygotowanie serwera
```bash
# Zainstaluj Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Zainstaluj PM2 (process manager)
sudo npm install -g pm2
```

### Krok 2: Sklonuj i zbuduj
```bash
cd /var/www
git clone https://github.com/TWOJ_USER/kreator.git
cd kreator/kreator-app
npm install
npm run build
```

### Krok 3: Uruchom z PM2
```bash
pm2 start npm --name "kreator" -- start
pm2 save
pm2 startup
```

### Krok 4: Konfiguracja Nginx
```nginx
# /etc/nginx/sites-available/kreator
server {
    listen 80;
    server_name twojadomena.pl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kreator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Krok 5: SSL z Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d twojadomena.pl
```

---

## Opcja 4: Docker

### Krok 1: Utwórz Dockerfile
```dockerfile
# kreator-app/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

### Krok 2: Zbuduj i uruchom
```bash
cd kreator-app
docker build -t kreator-paneli .
docker run -d -p 3000:3000 --name kreator kreator-paneli
```

### Krok 3: Docker Compose (opcjonalnie)
```yaml
# docker-compose.yml
version: '3.8'
services:
  kreator:
    build: ./kreator-app
    ports:
      - "3000:3000"
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## Zmienne środowiskowe

Jeśli w przyszłości będą potrzebne zmienne środowiskowe:

### Vercel
1. Dashboard → Settings → Environment Variables
2. Dodaj zmienne (np. `DATABASE_URL`, `API_KEY`)

### Netlify
1. Site settings → Build & deploy → Environment
2. Dodaj zmienne

### Self-hosted
```bash
# Utwórz plik .env.local
echo "ZMIENNA=wartosc" >> .env.local
```

---

## Aktualizacja aplikacji

### Vercel/Netlify (automatyczne)
Push do brancha main automatycznie triggeruje nowy deploy.

### Self-hosted
```bash
cd /var/www/kreator
git pull origin main
cd kreator-app
npm install
npm run build
pm2 restart kreator
```

---

## Troubleshooting

### Build fails na Vercel
- Sprawdź czy `Root Directory` jest ustawiony na `kreator-app`
- Sprawdź logi błędów w zakładce "Deployments"

### 404 na podstronach
- Next.js wymaga odpowiedniej konfiguracji routingu
- Na Netlify upewnij się że plugin Next.js jest zainstalowany

### Wolne ładowanie
- Włącz cache w Nginx
- Rozważ CDN (Cloudflare)

---

## Rekomendacja

Dla tego projektu **Vercel** jest najlepszym wyborem:
- Natywne wsparcie Next.js (twórcy Next.js = Vercel)
- Darmowy plan wystarczający dla małych projektów
- Automatyczne deploye przy każdym pushu
- Wbudowany CDN i optymalizacje
- Zero konfiguracji
