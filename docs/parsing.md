# PDF Parsing Logic

`scripts/parse_pdf.py` deterministically converts the 44-page PDF guide (`Pruvodce_Socialnimi_Sluzbami.pdf`) into `strapi/services.json`. This document explains how each section of the PDF is parsed.

## Dependencies

- `pdfplumber` - PDF text extraction with word-level font/position metadata
- `unidecode` - Czech diacritics removal for slug generation

## PDF Page Layout (0-indexed)

| Pages | Content | Parser Function |
|-------|---------|-----------------|
| 0 | Cover page | Skipped |
| 1 | Introduction | Skipped |
| 2-4 | Table of Contents | `parse_toc()` (used for reference only) |
| 5-8 | Life Situations | `parse_life_situations()` |
| 9-32 | Social Service Providers | `parse_providers()` |
| 33-34 | Crisis Lines | `parse_crisis_lines()` |
| 35-36 | Government Authorities | `parse_authorities()` |
| 37-40 | Healthcare Providers | `parse_healthcare()` |
| 41 | Emergency Numbers | `parse_emergency_numbers()` |
| 42 | Crisis Preparedness | Skipped |
| 43 | Publication Info | `parse_metadata()` |

## Text Extraction Pipeline

All text extraction goes through a filtering step to remove PDF decoration:

1. **`get_page_words()`** extracts words with font name, size, and position metadata
2. **`_is_decoration()`** filters out:
   - Sidebar text (Lora-BoldItalic font - rotated decorative text)
   - Large page numbers (Lora-Bold font)
   - Small corner page numbers (1-2 digits at x < 50 or x > 400)
3. **`get_page_text()`** groups filtered words into lines by y-coordinate proximity (3pt tolerance), sorted left-to-right

## Section Parsers

### Emergency Numbers (page 41)

**Function:** `parse_emergency_numbers()`

Simple line-by-line parsing:
- Normalizes `+ 420` to `+420`
- Extracts phone numbers using regex patterns for: `+420 XXX XXX XXX`, `800 XXX XXX`, `116 XXX`, bare mobile `[67]XX XXX XXX`, and short emergency codes (112, 150, 155, 158)
- Name is the text before the first phone number on the line
- Outputs `phone` (single) or `phones` (array) depending on count

### Crisis Lines (pages 33-34)

**Function:** `parse_crisis_lines()`

Font-based structural parsing:
1. Extracts all words with font size info, groups into lines
2. Splits lines into entries by **header lines** (font size >= 14pt, Switzer-Extrabold)
3. Multi-line headers are supported (continuation lines at same font size)
4. For each entry:
   - Extracts phone from header parentheses, e.g. `Linka bezpeci (116 111)`
   - Body lines provide: description, website, email
   - **Availability** is inferred from keywords: "24/7", "nonstop", "pondeli do patku", time ranges
   - **Free** status from: "bezplatne", "zdarma", or phone starting with `8` or `116`
   - **Target group** from: "starsi 15 let" or "od 15 let"

### Providers (pages 9-32)

**Function:** `parse_providers()`

The most complex parser. Uses word-level font analysis:

1. **Word collection:** Extracts all words from pages 9-32 with font name, size, and position
2. **Line grouping:** Groups words into lines by y-coordinate (3pt tolerance)
3. **Font classification:**
   - **Provider names:** Switzer-Extrabold font, size >= 14pt
   - **Service names:** Switzer-Bold (not Extrabold) font, size >= 10.5pt
   - **Body text:** Everything else
4. **Multi-line heading merge:** Consecutive heading lines of the same type are merged if:
   - Previous line ends with hyphen (word break)
   - Previous line ends with comma
   - Next line starts with lowercase letter
5. **Block structure:** Provider heading starts a new provider block. Service headings within a provider start service sub-blocks. Body text accumulates below the current heading.
6. **Contact extraction** (`_split_description_and_contact()`):
   - Works backwards from end of body text
   - Lines containing phones, emails, websites, or postal codes (XXX XX pattern) are classified as contact info
   - Everything before the first contact line is description
   - Address is extracted by removing phone/email/website from contact lines
7. **Service ID deduplication** (`_deduplicate_service_ids()`):
   - If two services across different providers have the same slug ID, prefix with provider ID
8. **Post-processing:**
   - `post_process_providers()`: When re-parsing (existing services.json exists), preserves original IDs
   - `fix_special_providers()`: Strips non-standard contact fields (only keeps address, phone, phones, email, website)

### Life Situations (pages 5-8)

**Function:** `parse_life_situations()`

Depends on providers and crisis lines being parsed first.

1. **Category detection:** Lines in ALL CAPS (Czech uppercase including diacritics) and length > 3 are treated as category headers
2. **Reference text:** Lines between headers list providers in format: `Provider name (str. XX) | Another provider (str. YY)`
3. **Reference resolution** (`_parse_provider_refs()`):
   - Builds lookup map from provider names, service names, and crisis line names (all lowercased) to their IDs
   - Also maps simplified names (without legal suffixes like `, z.s.`, `, o.p.s.`)
   - Pre-processes text: fixes hyphenated line breaks (`Studen- ka` -> `Studenka`), splits merged refs (lowercase immediately followed by uppercase)
   - Splits by `|` separator
   - Removes page references `(str. XX)` and trailing parenthetical clarifications
   - Matching priority: direct name match -> slug match -> substring match -> slugified name match
   - Has hardcoded alias map for refs that cannot be fuzzy-matched (4 entries)
4. **Title case conversion** (`_title_case_czech()`):
   - Uses a hardcoded lookup table of 26 known titles for exact conversion from ALL CAPS to proper Czech title case
   - Falls back to simple lowercase with first-word capitalization

### Authorities (pages 35-36)

**Function:** `parse_authorities()`

**Semi-hardcoded** due to complex multi-column layout that is difficult to parse generically:
- 5 authorities are constructed manually with data extracted from the PDF text
- Department contacts include role, phone, and email
- Phone numbers with extension ranges (e.g. `+420 556 879 (480/478/470)`) are kept as-is

### Healthcare (pages 37-40)

**Function:** `parse_healthcare()`

Two-column layout parsing with font-size-based section headers:

1. **Column splitting:** Words are split into left/right columns by x-coordinate midpoint (240pt)
2. **Two parsing modes:**
   - **Full-width headers** (`_get_sections_fullwidth()`): Headers span both columns. Used for pages 37, 39, 40. Merges all words into lines first, detects headers, then splits content between headers into L/R columns.
   - **Per-column headers** (`_get_sections_per_column()`): Each column has independent headers at the same y-position. Used for page 38 (specialists). Splits columns first, then detects headers independently.
3. **Doctor entry parsing** (`_parse_doctor_entries()`):
   - Names at font size >= 9.5pt (Bold 10pt+)
   - Details (address, phone, website) follow at size < 9.5pt
   - Address detected by postal code pattern (XXX XX)
4. **Category mapping:**
   - Page 37 (header >= 14pt): Pediatricians ("pro deti") vs General Practitioners ("praktick", "dospel")
   - Page 38 (header >= 12pt): Specialists mapped by Czech keyword to English code (gynekologie->gynecology, chirurgie->surgery, etc.)
   - Page 39 (header >= 12pt): Dentists, Dental Hygiene, ENT
   - Page 40 (header >= 14pt): Physiotherapy, Opticians, Pharmacies

## Utility Functions

### `slugify(text)`
Converts Czech text to URL-friendly ID:
1. Transliterates diacritics via `unidecode` (e.g. `Pribor` -> `pribor`)
2. Strips common Czech legal suffixes (`, z.s.`, `, o.p.s.`, `, p.o.`, etc.)
3. Replaces non-alphanumeric chars with hyphens
4. Collapses multiple hyphens

### `extract_phones(text)`
Extracts phone numbers matching these patterns (in order):
1. `+420 XXX XXX XXX` (standard Czech format)
2. `800 XXX XXX` (toll-free)
3. `116 XXX` (European harmonized)
4. `[67]XX XXX XXX` (bare mobile, auto-prefixed with `+420`)
5. `1[125]X` (short emergency: 112, 150, 155, 158)

### `extract_website(text)`
Matches URLs in priority order: `https://...` -> `www....` -> bare domain patterns (`.cz`, `.eu`, etc.)

## Validation

`validate()` checks:
- Section counts against expected values (~26 life situations, ~10 crisis lines, 6 emergency numbers, 5 authorities, 30+ providers)
- Duplicate IDs across all sections
- Broken `providerRefs` in life situations (refs that don't match any provider or service ID)
- Providers with no contact info

## Running the Parser

```bash
cd scripts
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 parse_pdf.py ../Pruvodce_Socialnimi_Sluzbami.pdf ../strapi/services.json
```

When re-running on an existing `services.json`, the parser reads the existing file and preserves stable IDs via `post_process_providers()`.
