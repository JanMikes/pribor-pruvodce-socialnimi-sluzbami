# services.json Structure

## Overview

The `services.json` file contains parsed data from the Příbor social services guide PDF. It's designed as a backend data source for a website.

## Top-Level Sections

```
{
  "metadata": {...},
  "lifeSituations": [...],
  "providers": [...],
  "crisisLines": [...],
  "authorities": [...],
  "healthcare": {...},
  "emergencyNumbers": [...]
}
```

## Section Details

### metadata
Document information.
```json
{
  "title": "string",
  "city": "string",
  "region": "string",
  "publisher": "string",
  "publishDate": "YYYY-MM",
  "language": "cs"
}
```

### lifeSituations
Categories of life situations with references to relevant providers. Enables "What help do I need?" navigation.
```json
{
  "id": "slug-id",
  "name": "Display name",
  "providerRefs": ["provider-id-1", "provider-id-2"]
}
```

### providers
Social service organizations. May contain nested services with their own IDs and contacts.
```json
{
  "id": "slug-id",
  "name": "Organization name",
  "description": "What they do",
  "services": [
    {
      "id": "service-id",           // optional, for cross-referencing
      "name": "Service name",
      "description": "Service details",
      "contact": {...}              // optional, service-specific contact
    }
  ],
  "contact": {
    "address": "string",
    "phone": "string",              // single phone
    "phones": ["string"],           // or multiple phones
    "email": "string",
    "website": "https://..."
  }
}
```

### crisisLines
Emergency and crisis hotlines.
```json
{
  "id": "slug-id",
  "name": "Line name",
  "phone": "116 111",
  "description": "Who it helps",
  "availability": "24/7" | "Po-Pá 9:00-17:00" | etc,
  "free": true | false,
  "email": "string",                // optional
  "website": "https://...",         // optional
  "targetGroup": "15+"              // optional
}
```

### authorities
Government offices with departments and contacts.
```json
{
  "id": "slug-id",
  "name": "Office name",
  "address": "string",              // optional at top level
  "website": "https://...",
  "departments": [
    {
      "id": "dept-id",              // optional
      "name": "Department name",
      "address": "string",          // optional
      "description": "string",      // optional
      "contacts": [
        {
          "role": "What they handle",
          "phone": "string",
          "email": "string"
        }
      ]
    }
  ]
}
```

### healthcare
Healthcare providers organized by type.
```json
{
  "pediatricians": [...],
  "generalPractitioners": [...],
  "specialists": {
    "gynecology": [...],
    "surgery": [...],
    "cardiology": [...],
    "ophthalmology": [...],
    "pulmonary": [...],
    "allergology": [...],
    "rehabilitation": [...],
    "ent": [...]
  },
  "dentists": [...],
  "dentalHygiene": [...],
  "physiotherapy": [...],
  "opticians": [...],
  "pharmacies": [...]
}
```

Each healthcare entry:
```json
{
  "id": "slug-id",
  "name": "Doctor/Facility name",
  "address": "string",
  "phone": "string",                // or "phones": [...]
  "website": "string"               // optional
}
```

### emergencyNumbers
Basic emergency contacts.
```json
{
  "name": "Service name",
  "phone": "string",                // or "phones": [...]
}
```

## ID Conventions

- All IDs are slugified (lowercase, hyphens, no diacritics)
- Provider IDs match their organization name
- Service IDs within providers are prefixed or descriptive
- IDs in `lifeSituations.providerRefs` can reference either provider IDs or specific service IDs

## Phone Format

- Czech numbers: `+420 XXX XXX XXX`
- Emergency numbers: short format (`112`, `155`)
- Some entries have single `phone`, others have `phones` array
