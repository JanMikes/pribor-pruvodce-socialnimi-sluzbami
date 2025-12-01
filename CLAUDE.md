# CLAUDE.md

## Project Overview

This is a monorepo for "Průvodce sociálními službami Příbor" (Social Services Guide for Příbor city). The goal is to transform a static PDF guide into a fully functional web application with CMS capabilities.

**Source PDF**: `Pruvodce_Socialnimi_Sluzbami.pdf` - contains social services information for citizens of Příbor
**Parsed data**: `services.json` - structured JSON extracted from the PDF (see `docs/structure.md` for schema)

## Architecture

```
├── frontend/          # Next.js 15 (TypeScript, Tailwind CSS)
├── strapi/            # Strapi 5 CMS (TypeScript)
├── nginx/             # Reverse proxy for uploads
├── docs/              # Documentation
├── services.json      # Parsed PDF data (source for CMS seeding)
└── compose.yaml       # Docker Compose orchestration
```

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **CMS**: Strapi 5 (headless CMS)
- **Database**: PostgreSQL 17
- **Containerization**: Docker Compose

## Development

**All development happens inside Docker containers.** Never run npm commands directly on the host machine - always use `docker compose exec`. This ensures consistent environments and avoids dependency conflicts.

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Public website |
| Strapi | http://localhost:1337/admin | Content management |
| Adminer | http://localhost:8000 | Database admin |
| Nginx | http://localhost:8080 | Media/uploads proxy |

### Common Commands

```bash
# Start all services
docker compose up

# View logs
docker compose logs -f strapi
docker compose logs -f frontend

# Restart a service
docker compose restart frontend

# Install npm packages (always via docker)
docker compose exec frontend npm install <package>
docker compose exec strapi npm install <package>

# Run lint to verify Next.js changes
docker compose exec frontend npm run lint

# Stop services
docker compose down

# Stop and remove data
docker compose down -v
```

### Important Development Notes

#### Never Run Next.js Production Build Locally

**Do not run `npm run build` for the frontend on your local machine.** Running a production build locally can contaminate the development server with production assets, causing unexpected behavior and hard-to-debug issues. The dev server should only serve development builds.

#### Strapi Schema Changes

After modifying Strapi content-type structure (adding/removing fields, components, etc.), you must rebuild and restart the Strapi container:

```bash
docker compose exec strapi npm run build
docker compose restart strapi
```

#### Strapi 5 Population

Strapi 5 does **not** deeply populate relations and components by default. When fetching data via the API, you must explicitly specify which fields to populate using the `populate` parameter. For nested components and relations, use deep population:

```typescript
// Example: Explicitly populate all nested content
const response = await fetch('/api/providers?populate[services][populate]=*&populate[contacts]=*');

// Or use populate=* for simple cases (first level only)
const response = await fetch('/api/providers?populate=*');
```

Always check that your API queries include the necessary `populate` parameters to retrieve all required nested data.

## Data Structure

The `services.json` contains these main sections (see `docs/structure.md` for details):

- **metadata**: Document info (title, publisher, date)
- **lifeSituations**: Categories like "I need help with..." linking to providers
- **providers**: Social service organizations with nested services
- **crisisLines**: Emergency and crisis hotlines (24/7, free calls, etc.)
- **authorities**: Government offices with departments and contacts
- **healthcare**: Doctors, dentists, pharmacies organized by specialty
- **emergencyNumbers**: Basic emergency contacts (112, 155, 158)

## Content Types to Implement in Strapi

Based on `services.json` structure, create these content types:

1. **Provider** - Social service organizations
2. **Service** - Individual services (nested under providers)
3. **LifeSituation** - Categories with provider references
4. **CrisisLine** - Emergency hotlines
5. **Authority** - Government offices
6. **Department** - Authority departments
7. **HealthcareProvider** - Doctors, pharmacies, etc.
8. **EmergencyNumber** - Basic emergency contacts

## Frontend Features to Implement

1. Homepage with quick access to emergency numbers and crisis lines
2. "What help do I need?" wizard using life situations
3. Provider directory with search and filtering
4. Healthcare providers organized by specialty
5. Government offices and departments
6. Mobile-responsive design for accessibility

## Language

- All content is in Czech (cs)
- Code, comments, and documentation can be in English
- UI labels should be in Czech

## Key Files

- `compose.yaml` - Docker services configuration
- `services.json` - Source data from PDF
- `docs/structure.md` - JSON schema documentation
- `strapi/config/` - Strapi configuration (database, server, etc.)
- `frontend/src/` - Next.js application source

## Code Guidelines

### Clean Architecture & Maintainability

Write clean, well-structured, and maintainable code. Follow these principles:

- **Separation of concerns** - Keep components, utilities, and API logic separate
- **Single responsibility** - Each function/component should do one thing well
- **Meaningful names** - Use descriptive names for variables, functions, and components
- **Consistent patterns** - Follow established patterns throughout the codebase

### Reuse Before Writing New Code

Before implementing new functionality:

1. **Search the codebase** for existing solutions, utilities, or patterns
2. **Check for similar components** that can be extended or composed
3. **Look for established patterns** in how similar features are implemented
4. **Reuse shared utilities** instead of duplicating logic

Only write new code when no suitable existing solution exists. When adding new utilities or components, consider if they should be generalized for reuse elsewhere.
