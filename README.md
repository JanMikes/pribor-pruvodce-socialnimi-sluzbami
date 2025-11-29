# Průvodce sociálními službami Příbor

Informační portál sociálních služeb pro občany města Příbor.

## Architektura

- **Frontend**: Next.js 15 (TypeScript, Tailwind CSS)
- **CMS**: Strapi 5
- **Databáze**: PostgreSQL 17
- **Reverse proxy**: Nginx

## Požadavky

- Docker
- Docker Compose

## Rychlý start

```bash
# 1. Zkopírovat soubor s proměnnými prostředí
cp .env.example .env

# 2. Vygenerovat tajné klíče a aktualizovat .env
openssl rand -base64 32  # opakovat pro každý klíč

# 3. Spustit všechny služby
docker compose up

# 4. Vytvořit admin účet
# Otevřít http://localhost:1337/admin a zaregistrovat se
```

## Služby (lokální vývoj)

| Služba | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Strapi Admin | http://localhost:1337/admin |
| Nginx (uploads) | http://localhost:8080 |
| Adminer | http://localhost:8000 |

## Časté příkazy

```bash
# Zobrazit logy
docker compose logs -f strapi
docker compose logs -f frontend

# Restartovat službu
docker compose restart frontend

# Zastavit (zachovat data)
docker compose down

# Zastavit a smazat data
docker compose down -v

# Instalace npm balíčku (vždy přes docker)
docker compose exec frontend npm install <package>
docker compose exec strapi npm install <package>
```

## Databáze

Přístup přes Adminer: http://localhost:8000
- Server: postgres
- Uživatel: postgres
- Heslo: postgres
- Databáze: strapi

## Produkční nasazení

GitHub Actions automaticky buildí a nasazuje při push do `main` větve:
- Frontend → `ghcr.io/janmikes/pribor-pruvodce:main`
- Strapi → `ghcr.io/janmikes/pribor-pruvodce-strapi:main`
- Nginx → `ghcr.io/janmikes/pribor-pruvodce-nginx:main`

Vyžadované GitHub secrets:
- `DEPLOY_USERNAME` - SSH uživatel
- `DEPLOY_PRIVATE_KEY` - SSH privátní klíč
