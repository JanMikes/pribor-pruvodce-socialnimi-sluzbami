# CLAUDE.md

## Project Overview

This is a monorepo for "Průvodce sociálními službami Příbor" (Social Services Guide for Příbor city). The goal is to transform a static PDF guide into a fully functional web application with CMS capabilities.

**Source PDF**: `Pruvodce_Socialnimi_Sluzbami.pdf` - contains social services information for citizens of Příbor
**Parsed data**: `strapi/services.json` - structured JSON extracted from the PDF
**Documentation**: `docs/structure.md` (data formats + Strapi schemas), `docs/parsing.md` (parser logic)

## Architecture

```
├── frontend/          # Next.js 15 (TypeScript, Tailwind CSS)
├── strapi/            # Strapi 5 CMS (TypeScript)
│   └── services.json  # Parsed PDF data (source for CMS seeding)
├── nginx/             # Reverse proxy for uploads
├── docs/              # Documentation
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

## Data Pipeline & Structure

**Full documentation:** `docs/structure.md` (data formats) and `docs/parsing.md` (parser logic)

The data flows: **PDF** -> `parse_pdf.py` -> **services.json** -> Strapi bootstrap seed -> **CMS database** -> REST API -> **Frontend**

### services.json (intermediate format)

Produced by the PDF parser, consumed by the Strapi seed script. Contains 7 sections:

- **metadata**: Document info (title, city, publisher, date)
- **lifeSituations**: "What help do I need?" categories with `providerRefs` (string IDs referencing providers, services, or crisis lines)
- **providers**: Social service organizations with nested services and contacts
- **crisisLines**: Emergency/counseling hotlines with availability, free status, target group
- **authorities**: Government offices with departments and per-role contacts
- **healthcare**: Doctors, dentists, pharmacies grouped by specialty (nested structure)
- **emergencyNumbers**: Basic emergency contacts (112, 155, 158)

### Strapi CMS content types

| Content Type | Strapi UID | Description |
|---|---|---|
| Provider | `api::provider.provider` | Social service organizations with services (relation) and contacts |
| Service | `api::service.service` | Individual services offered by providers |
| Life Situation | `api::life-situation.life-situation` | Categories with ManyToMany relations to providers, services + crisis lines |
| Crisis Line | `api::crisis-line.crisis-line` | Hotlines with phone components |
| Authority | `api::authority.authority` | Government offices with department components |
| Healthcare Provider | `api::healthcare-provider.healthcare-provider` | Doctors/pharmacies with category enum |
| Emergency Number | `api::emergency-number.emergency-number` | Basic emergency contacts |
| Site Metadata | `api::site-metadata.site-metadata` | Single type for document info |

Shared components: `shared.phone-number`, `shared.contact-info`, `shared.department`, `shared.department-contact`, `shared.staff-member`

### Key seed transformations

- `phone`/`phones` strings -> repeatable `shared.phone-number` components
- `contact` (single) -> `contacts` (repeatable array)
- Provider `services` (nested JSON) -> separate `api::service.service` entities linked via manyToOne relation
- `providerRefs` (string IDs) -> three ManyToMany relations: `providers`, `services`, and `crisisLines`
- Healthcare nested structure -> flat collection with `category` enum

### Re-seeding data

```bash
# Drop database and re-seed from services.json
docker compose down -v
docker compose up -d
```

The bootstrap in `strapi/src/index.ts` seeds automatically on first startup when the database is empty.

## Frontend Pages

- `/` - Homepage with emergency bar, crisis lines, life situation cards
- `/zivotni-situace/[situationId]` - Life situation detail with linked services, providers, and crisis lines
- `/poskytovatele` - Provider directory with search
- `/poskytovatele/[providerId]` - Provider detail with services and contacts
- `/poskytovatele/[providerId]/[serviceId]` - Service detail with contacts
- `/krizove-linky` - Crisis and counseling hotlines
- `/zdravotnictvi` - Healthcare providers by specialty
- `/urady` - Government offices with departments

## Language

- All content is in Czech (cs)
- Code, comments, and documentation can be in English
- UI labels should be in Czech

## PDF Parser

**Detailed documentation:** `docs/parsing.md`

`scripts/parse_pdf.py` deterministically parses the 44-page `Pruvodce_Socialnimi_Sluzbami.pdf` into `strapi/services.json`. Uses `pdfplumber` for word-level extraction with font size/name metadata to detect headings, and `unidecode` for slug generation. Re-run it whenever the source PDF changes.

```bash
cd scripts
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
python3 parse_pdf.py ../Pruvodce_Socialnimi_Sluzbami.pdf ../strapi/services.json
```

Key parsing strategies:
- **Providers (pp 9-32):** Font-based detection - Extrabold >= 14pt = provider name, Bold >= 10.5pt = service name
- **Healthcare (pp 37-40):** Two-column layout split at x=240pt, with full-width or per-column headers
- **Life situations (pp 5-8):** ALL CAPS lines = category headers, references resolved by fuzzy name matching
- **Authorities (pp 35-36):** Semi-hardcoded due to complex layout
- **Crisis lines (pp 33-34):** Header font >= 14pt, phone extracted from parentheses

The script validates output (broken refs, duplicate IDs, missing contacts) and prints warnings to stderr. When re-running on existing `services.json`, it preserves stable IDs.

## Key Files

- `compose.yaml` - Docker services configuration
- `strapi/services.json` - Source data from PDF (generated by `scripts/parse_pdf.py`)
- `strapi/src/index.ts` - Strapi bootstrap: seeds `services.json` into CMS on first startup
- `scripts/parse_pdf.py` - PDF parser (Python, uses pdfplumber + unidecode)
- `docs/structure.md` - Data structure documentation (services.json format + Strapi CMS schemas)
- `docs/parsing.md` - PDF parsing logic documentation (how parse_pdf.py works)
- `strapi/src/api/` - Strapi content type schemas
- `strapi/src/components/shared/` - Strapi shared component schemas
- `frontend/src/lib/types.ts` - Frontend TypeScript types matching Strapi schemas
- `frontend/src/lib/strapi.ts` - Frontend API layer (Strapi REST client)
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
