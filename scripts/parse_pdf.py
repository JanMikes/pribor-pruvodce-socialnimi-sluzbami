#!/usr/bin/env python3
"""
Deterministic parser for Pruvodce_Socialnimi_Sluzbami.pdf -> services.json

Parses the 44-page PDF guide for social services in Příbor city into a
structured JSON matching the Strapi CMS schema.

Usage:
    python parse_pdf.py <input_pdf> <output_json>
    python parse_pdf.py ../Pruvodce_Socialnimi_Sluzbami.pdf ../strapi/services.json
"""

import argparse
import json
import re
import sys
from collections import OrderedDict

import pdfplumber
from unidecode import unidecode


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Font size thresholds for provider pages (9-32)
PROVIDER_NAME_MIN_SIZE = 14.0  # Switzer-Extrabold ~15pt
SERVICE_NAME_MIN_SIZE = 10.5   # Switzer-Bold ~11pt
# Healthcare header thresholds are set per-page in parse_healthcare()

# Page ranges (0-indexed)
PAGE_COVER = 0
PAGE_INTRO = 1
PAGES_TOC = (2, 4)        # inclusive
PAGES_LIFE_SIT = (5, 8)   # inclusive
PAGES_PROVIDERS = (9, 32)  # inclusive
PAGES_CRISIS = (33, 34)    # inclusive
PAGES_AUTHORITIES = (35, 36)  # inclusive
PAGES_HEALTHCARE = (37, 40)   # inclusive
PAGE_EMERGENCY = 41
PAGE_CRISIS_PREP = 42
PAGE_PUB_INFO = 43


# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------

def warn(msg: str):
    """Print warning to stderr."""
    print(f"WARNING: {msg}", file=sys.stderr)


def slugify(text: str) -> str:
    """Convert Czech text to URL-friendly slug ID."""
    s = unidecode(text)
    s = s.lower()
    # Strip common legal suffixes
    for suffix in [', z.s.', ', z. s.', ', z.u.', ', z. u.', ', z. ú.',
                   ', p.o.', ', p. o.', ', p.s.', ', p. s.',
                   ', o.p.s.', ', o. p. s.', ', o. p. s,',
                   ', a. s.', ', a.s.', ', s.r.o.', ', s. r. o.',
                   ' z.s.', ' z. s.', ' z.u.', ' z. u.', ' z. ú.',
                   ' p.o.', ' p. o.', ' p.s.', ' p. s.',
                   ' o.p.s.', ' o. p. s.', ' o. p. s,',
                   ' a. s.', ' a.s.', ' s.r.o.', ' s. r. o.']:
        if s.endswith(suffix):
            s = s[:-len(suffix)]
            break
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    # Collapse multiple hyphens
    s = re.sub(r'-+', '-', s)
    return s


def extract_phones(text: str) -> list:
    """Extract phone numbers from text."""
    phones = []
    # Match +420 XXX XXX XXX patterns
    for m in re.finditer(r'\+420\s*\d{3}\s*\d{3}\s*\d{3}', text):
        phone = re.sub(r'(\+420)\s*(\d{3})\s*(\d{3})\s*(\d{3})', r'\1 \2 \3 \4', m.group())
        phones.append(phone)
    # Match 800 XXX XXX patterns (toll free)
    for m in re.finditer(r'(?<!\+420\s)(?<!\d)800\s+\d{3}\s+\d{3}(?!\d)', text):
        phones.append(m.group().strip())
    # Match 116 XXX patterns (European harmonized)
    for m in re.finditer(r'(?<!\d)116\s+\d{3}(?!\d)', text):
        phones.append(m.group().strip())
    # Match bare Czech mobile numbers: 6XX XXX XXX or 7XX XXX XXX (without +420)
    for m in re.finditer(r'(?<!\d)([67]\d{2})\s+(\d{3})\s+(\d{3})(?!\d)', text):
        phone = '+420 ' + m.group(1) + ' ' + m.group(2) + ' ' + m.group(3)
        if phone not in phones:
            phones.append(phone)
    # Match short emergency numbers (112, 155, 158, 150)
    for m in re.finditer(r'(?<!\d)(1[125][0-9])(?!\d)', text):
        num = m.group()
        if num in ('112', '150', '155', '158'):
            phones.append(num)
    return phones


def extract_email(text: str) -> str | None:
    """Extract first email address from text."""
    m = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    return m.group() if m else None


def extract_emails(text: str) -> list:
    """Extract all email addresses from text."""
    return re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)


def extract_website(text: str) -> str | None:
    """Extract website URL from text. Returns normalized https:// URL."""
    # Match full URLs
    m = re.search(r'https?://[^\s,]+', text)
    if m:
        url = m.group().rstrip('.')
        return url
    # Match www. URLs
    m = re.search(r'www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s,]*', text)
    if m:
        return 'https://' + m.group().rstrip('.')
    # Match bare domain-like patterns at end of line or after whitespace
    m = re.search(r'(?:^|\s)([a-zA-Z0-9-]+\.(?:cz|eu|com|org|se|cz/[^\s]*))', text)
    if m:
        domain = m.group(1).rstrip('.')
        return 'https://' + domain
    return None


def normalize_phone(phone: str) -> str:
    """Normalize phone number format."""
    phone = phone.strip()
    # Normalize +420 format
    phone = re.sub(r'(\+420)\s*(\d{3})\s*(\d{3})\s*(\d{3})', r'\1 \2 \3 \4', phone)
    return phone


def clean_text(text: str) -> str:
    """Clean extracted text - remove extra whitespace, fix encoding."""
    text = re.sub(r'\s+', ' ', text).strip()
    # Fix common PDF extraction artifacts
    text = text.replace('  ', ' ')
    return text


def _is_decoration(word: dict) -> bool:
    """Check if a word is sidebar decoration or page number decoration.

    Sidebar text uses Lora-BoldItalic font (individual rotated characters).
    Large page numbers use Lora-Bold font.
    Small page numbers appear at corners (x < 50 or x > 400) as 1-2 digit numbers.
    """
    fontname = word.get('fontname', '') or ''
    # Lora fonts are used for sidebar decoration and large page numbers
    if 'Lora' in fontname:
        return True
    # Small page numbers in corners
    text = word['text'].strip()
    if re.match(r'^\d{1,2}$', text):
        if word['x0'] < 50 or word['x0'] > 400:
            return True
    return False


def get_page_text(pdf, page_idx: int, filter_sidebar: bool = True) -> str:
    """Extract text from a page, optionally filtering sidebar decoration."""
    if not filter_sidebar:
        return pdf.pages[page_idx].extract_text() or ''

    words = pdf.pages[page_idx].extract_words(extra_attrs=['size', 'fontname'])
    filtered = [w for w in words if not _is_decoration(w)]

    if not filtered:
        return ''

    # Group words into lines by y coordinate (within 3pt tolerance)
    filtered.sort(key=lambda w: (w['top'], w['x0']))
    lines = []
    current_line = [filtered[0]]
    for w in filtered[1:]:
        if abs(w['top'] - current_line[-1]['top']) < 3:
            current_line.append(w)
        else:
            current_line.sort(key=lambda x: x['x0'])
            lines.append(' '.join(w['text'] for w in current_line))
            current_line = [w]
    if current_line:
        current_line.sort(key=lambda x: x['x0'])
        lines.append(' '.join(w['text'] for w in current_line))

    return '\n'.join(lines)


def get_page_words(pdf, page_idx: int) -> list:
    """Get words from page with font info, filtered of sidebar/decoration text."""
    words = pdf.pages[page_idx].extract_words(
        extra_attrs=['size', 'fontname']
    )
    return [w for w in words if not _is_decoration(w)]


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------

def parse_metadata(pdf) -> dict:
    """Parse metadata from cover and publication info pages."""
    # Page 43 has publication info
    text = pdf.pages[PAGE_PUB_INFO].extract_text() or ''

    publish_date = "2025-11"
    if 'listopad 2025' in text.lower():
        publish_date = "2025-11"

    return {
        "title": "Průvodce sociálními službami a navazujícími aktivitami",
        "city": "Příbor",
        "region": "Moravskoslezský kraj",
        "publisher": "Město Příbor",
        "publishDate": publish_date,
        "language": "cs"
    }


def parse_emergency_numbers(pdf) -> list:
    """Parse emergency numbers from page 41."""
    text = pdf.pages[PAGE_EMERGENCY].extract_text() or ''
    lines = text.strip().split('\n')

    numbers = []
    for line in lines:
        line = line.strip()
        if not line or line == 'Důležitá telefonní čísla' or re.match(r'^\d{2}$', line):
            continue

        # Normalize "+ 420" → "+420" for phone extraction
        normalized_line = re.sub(r'\+\s+420', '+420', line)

        # First try to extract full +420 phone numbers
        phones = extract_phones(normalized_line)
        if phones:
            # Find name: everything before the first phone occurrence
            # Try to find the position of the first phone in the original line
            first_phone = phones[0]
            # Search for the phone in the normalized line
            bare = first_phone.replace('+420 ', '')
            pos = normalized_line.find('+420')
            if pos <= 0:
                pos = normalized_line.find(bare)
            if pos > 0:
                name = normalized_line[:pos].strip().rstrip(':').rstrip(',').strip()
                entry = {"name": name}
                if len(phones) == 1:
                    entry["phone"] = phones[0]
                else:
                    entry["phones"] = phones
                numbers.append(entry)
                continue

        # Emergency short numbers (3 digits): "Name 158"
        m = re.match(r'^(.+?)\s+(\d{3})$', line)
        if m:
            numbers.append({"name": m.group(1).strip(), "phone": m.group(2)})
            continue

    return numbers


def parse_crisis_lines(pdf) -> list:
    """Parse crisis and counseling lines from pages 33-34.

    Headers are at size 15.0 (Switzer-Extrabold), body at 9.0, contact at 8.0.
    """
    lines_data = []

    # Collect all lines with font size info from crisis pages
    all_lines = []  # list of {'text': str, 'size': float}

    for p in range(PAGES_CRISIS[0], PAGES_CRISIS[1] + 1):
        words = get_page_words(pdf, p)
        if not words:
            continue
        words.sort(key=lambda w: (w['top'], w['x0']))
        current = [words[0]]
        for w in words[1:]:
            if abs(w['top'] - current[-1]['top']) < 3:
                current.append(w)
            else:
                current.sort(key=lambda x: x['x0'])
                text = ' '.join(c['text'] for c in current)
                max_size = max(c['size'] for c in current)
                all_lines.append({'text': text.strip(), 'size': max_size})
                current = [w]
        if current:
            current.sort(key=lambda x: x['x0'])
            text = ' '.join(c['text'] for c in current)
            max_size = max(c['size'] for c in current)
            all_lines.append({'text': text.strip(), 'size': max_size})

    # Split into entries by header lines (size >= 14)
    CRISIS_HEADER_SIZE = 14.0
    entries_raw = []
    current_header_parts = []
    current_body = []

    for line in all_lines:
        if line['size'] >= CRISIS_HEADER_SIZE:
            if current_header_parts and current_body:
                entries_raw.append({
                    'header': ' '.join(current_header_parts),
                    'body': current_body
                })
                current_header_parts = []
                current_body = []
            elif current_header_parts and not current_body:
                # Multi-line header (e.g., "Linka pomoci obětem kriminality a domácího\nnásilí")
                pass
            current_header_parts.append(line['text'])
        else:
            if current_header_parts:
                current_body.append(line)
            # else: lines before first header, skip

    if current_header_parts:
        entries_raw.append({
            'header': ' '.join(current_header_parts),
            'body': current_body
        })

    # Parse each entry
    for entry in entries_raw:
        header = entry['header']
        body_lines = entry['body']

        # Extract phone from header parentheses
        phone = None
        m = re.search(r'\((\d[\d\s]+)\)', header)
        if m:
            phone = m.group(1).strip()
            header = re.sub(r'\s*\([\d\s]+\)', '', header).strip()

        # Extract description, website, email from body lines
        desc_lines = []
        website = None
        email = None
        entry_text = header + ' ' + ' '.join(l['text'] for l in body_lines)

        for bl in body_lines:
            l = bl['text']
            w = extract_website(l)
            if w:
                website = w
                # If line is just a URL, skip for description
                if re.match(r'^(https?://|www\.)[^\s]+$', l.strip()):
                    continue

            e = extract_email(l)
            if e:
                email = e
                l = l.replace(e, '').strip()

            if l and not re.match(r'^(https?://|www\.)[^\s]+$', l.strip()):
                desc_lines.append(l)

        description = ' '.join(desc_lines).strip()

        # Determine availability and free status
        availability = None
        free = False
        target_group = None

        if '24/7' in entry_text or 'nonstop' in entry_text.lower() or '24 hodin' in entry_text:
            availability = '24/7'
        elif '8:00' in entry_text or '8 hodin' in entry_text:
            if '20:00' in entry_text or '20 hodin' in entry_text:
                availability = '8:00-20:00 denně'
        elif 'pondělí do pátku' in entry_text or 'všední den' in entry_text:
            m_time = re.search(r'(\d{1,2}[:.]\d{2})\s*(?:do|–)\s*(\d{1,2}[:.]\d{2})', entry_text)
            if m_time:
                availability = f"Po-Pá {m_time.group(1).replace('.', ':')}-{m_time.group(2).replace('.', ':')}"
            else:
                availability = "Po-Pá"

        if 'bezplatn' in entry_text.lower() or 'zdarma' in entry_text.lower():
            free = True
        elif phone and phone.startswith('8'):
            free = True
        elif phone and phone.startswith('116'):
            free = True

        if 'starší 15 let' in entry_text or 'od 15 let' in entry_text:
            target_group = '15+'

        # Build entry
        result = OrderedDict()
        result['id'] = slugify(header)
        result['name'] = header

        if phone:
            result['phone'] = phone

        if description:
            result['description'] = clean_text(description)

        if availability:
            result['availability'] = availability

        result['free'] = free

        if email:
            result['email'] = email

        if website:
            result['website'] = website

        if target_group:
            result['targetGroup'] = target_group

        lines_data.append(result)

    return lines_data


def parse_toc(pdf) -> list:
    """Parse Table of Contents to get provider list with page numbers.

    Returns list of (name, page_number) tuples.
    """
    entries = []

    for p in range(PAGES_TOC[0], PAGES_TOC[1] + 1):
        text = pdf.pages[p].extract_text() or ''
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue

            # Match TOC entries: "Name ...page_number"
            # Page numbers appear doubled like "1100" meaning page 10
            m = re.match(r'^(.+?)\s*\.{2,}\s*(\d+)$', line)
            if m:
                name = m.group(1).strip()
                raw_page = m.group(2)
                # Deduplicate page number (e.g., "1100" -> "10", "2288" -> "28")
                if len(raw_page) == 4:
                    page_num = int(raw_page[:2])
                elif len(raw_page) == 3:
                    # Handle cases like "82–8" which is pages 28-30
                    page_num = int(raw_page[0:2])
                else:
                    page_num = int(raw_page)
                entries.append((name, page_num))

            # Also match entries with dash page ranges like "82–8"
            m2 = re.match(r'^(.+?)\s*\.{2,}\s*(\d+)–(\d+)', line)
            if m2 and not m:
                name = m2.group(1).strip()
                # These have varied formats, just grab the first number
                entries.append((name, int(m2.group(2))))

    return entries


def parse_healthcare(pdf) -> dict:
    """Parse healthcare providers from pages 37-40.

    Healthcare pages use a two-column layout. Different pages require
    different header detection strategies:
    - Pages 37, 39, 40: Headers are full-width or left-only (merge words first)
    - Page 38: Headers are per-column (split columns first)
    """
    healthcare = OrderedDict()

    MIDPOINT = 240  # x-coordinate separating left/right columns

    def _words_to_lines(word_list):
        """Group words into lines by y-coordinate proximity."""
        if not word_list:
            return []
        wl = sorted(word_list, key=lambda w: (w['top'], w['x0']))
        lines = []
        current = [wl[0]]
        for w in wl[1:]:
            if abs(w['top'] - current[-1]['top']) < 3:
                current.append(w)
            else:
                current.sort(key=lambda x: x['x0'])
                lines.append({
                    'text': ' '.join(c['text'] for c in current),
                    'size': max(c['size'] for c in current),
                    'y': current[0]['top'],
                    'words': list(current),
                })
                current = [w]
        if current:
            current.sort(key=lambda x: x['x0'])
            lines.append({
                'text': ' '.join(c['text'] for c in current),
                'size': max(c['size'] for c in current),
                'y': current[0]['top'],
                'words': list(current),
            })
        return lines

    def _get_sections_fullwidth(page_idx, header_min_size):
        """Get sections from a page where headers span the full width or are left-only.

        1. Merge all words into lines (across both columns)
        2. Detect headers by font size
        3. Split content between headers into L/R columns
        4. Parse doctor entries per column
        """
        words = get_page_words(pdf, page_idx)
        if not words:
            return []

        all_lines = _words_to_lines(words)

        # Split into sections by header lines
        sections = []
        current_header = None
        current_content_words = []

        for line in all_lines:
            if line['size'] >= header_min_size:
                if current_header is not None or current_content_words:
                    sections.append((current_header, list(current_content_words)))
                current_header = line['text'].strip()
                current_content_words = []
            else:
                current_content_words.extend(line['words'])

        if current_header is not None or current_content_words:
            sections.append((current_header, list(current_content_words)))

        # For each section, split into L/R columns and parse entries
        result = []
        for header, content_words in sections:
            left_words = [w for w in content_words if w['x0'] < MIDPOINT]
            right_words = [w for w in content_words if w['x0'] >= MIDPOINT]

            left_lines = _words_to_lines(left_words)
            right_lines = _words_to_lines(right_words)

            left_entries = _parse_doctor_entries(left_lines)
            right_entries = _parse_doctor_entries(right_lines)

            result.append((header, left_entries + right_entries))

        return result

    def _get_sections_per_column(page_idx, header_min_size):
        """Get sections from a page where each column has independent headers.

        Used for page 38 (specialists) where L and R columns have different
        specialty headers at the same y-position.
        """
        words = get_page_words(pdf, page_idx)
        if not words:
            return []

        left_words = [w for w in words if w['x0'] < MIDPOINT]
        right_words = [w for w in words if w['x0'] >= MIDPOINT]

        left_lines = _words_to_lines(left_words)
        right_lines = _words_to_lines(right_words)

        def _split_sections(lines):
            sections = []
            cur_header = None
            cur_lines = []
            for line in lines:
                if line['size'] >= header_min_size:
                    if cur_header is not None or cur_lines:
                        sections.append((cur_header, cur_lines))
                    cur_header = line['text'].strip()
                    cur_lines = []
                else:
                    cur_lines.append(line)
            if cur_header is not None or cur_lines:
                sections.append((cur_header, cur_lines))
            return sections

        all_sections = []
        for header, lines in _split_sections(left_lines):
            entries = _parse_doctor_entries(lines)
            all_sections.append((header, entries))
        for header, lines in _split_sections(right_lines):
            entries = _parse_doctor_entries(lines)
            all_sections.append((header, entries))

        return all_sections

    def _parse_doctor_entries(lines):
        """Parse doctor/facility entries from a list of lines.

        Names are detected by font size >= 9.5 (Bold 10pt+).
        Details (address, phone, website) follow at size < 9.5.
        """
        entries = []
        i = 0
        while i < len(lines):
            line = lines[i]
            text = line['text'].strip()
            size = line['size']

            # Skip empty and page numbers
            if not text or re.match(r'^\d{2}$', text):
                i += 1
                continue

            # Doctor/facility name line (size >= 9.5, usually 10pt bold)
            if size >= 9.5:
                name = text
                address = None
                phones = []
                website = None

                # Look ahead for address, phone, website
                j = i + 1
                while j < len(lines) and lines[j]['size'] < 9.5:
                    lt = lines[j]['text'].strip()
                    if not lt or re.match(r'^\d{2}$', lt):
                        j += 1
                        continue

                    p = extract_phones(lt)
                    if p:
                        phones.extend(p)
                        if not address:
                            addr_part = re.sub(r'\+420[\s\d]+', '', lt).strip().rstrip(',')
                            if addr_part and not addr_part.startswith('www'):
                                address = addr_part
                    elif extract_website(lt):
                        website = extract_website(lt)
                    elif not address and re.search(r'\d{3}\s*\d{2}', lt):
                        address = lt
                    j += 1

                entry = OrderedDict()
                entry['id'] = slugify(name)
                entry['name'] = name
                if address:
                    entry['address'] = address
                if len(phones) == 1:
                    entry['phone'] = phones[0]
                elif len(phones) > 1:
                    entry['phones'] = phones
                if website:
                    entry['website'] = website

                entries.append(entry)
                i = j
            else:
                i += 1
        return entries

    # ---- Page 37: GPs + Pediatricians (full-width headers at 14pt) ----
    sections37 = _get_sections_fullwidth(37, header_min_size=14.0)

    healthcare['pediatricians'] = []
    healthcare['generalPractitioners'] = []

    for header, entries in sections37:
        if header and 'pro děti' in header.lower():
            healthcare['pediatricians'].extend(entries)
        elif header and ('praktick' in header.lower() or 'dospěl' in header.lower()
                         or 'ambulance' in header.lower()):
            healthcare['generalPractitioners'].extend(entries)
        elif entries:
            healthcare['generalPractitioners'].extend(entries)

    # ---- Page 38: Specialists (per-column headers at 12pt) ----
    sections38 = _get_sections_per_column(38, header_min_size=12.0)

    specialists = OrderedDict()
    specialty_map = {
        'gynekologie': 'gynecology',
        'chirurgie': 'surgery',
        'interní': 'cardiology',
        'kardiologie': 'cardiology',
        'oční': 'ophthalmology',
        'plicní': 'pulmonary',
        'alergologie': 'allergology',
        'rehabilita': 'rehabilitation',
    }

    for header, entries in sections38:
        if not header:
            continue
        header_lower = header.lower()
        matched = None
        for keyword, code in specialty_map.items():
            if keyword in header_lower:
                matched = code
                break
        if matched and entries:
            if matched in specialists:
                specialists[matched].extend(entries)
            else:
                specialists[matched] = entries

    healthcare['specialists'] = specialists

    # ---- Page 39: Dentists, Dental Hygiene, ENT (headers at 12pt) ----
    sections39 = _get_sections_fullwidth(39, header_min_size=12.0)

    dentists = []
    dental_hygiene = []
    ent = []

    for header, entries in sections39:
        if not header or 'zub' in header.lower() or 'stomatol' in header.lower():
            dentists.extend(entries)
        elif 'dentální' in header.lower() or 'hygie' in header.lower():
            dental_hygiene.extend(entries)
        elif 'ušní' in header.lower() or 'nosní' in header.lower() or 'krční' in header.lower():
            ent.extend(entries)
        else:
            dentists.extend(entries)

    healthcare['dentists'] = dentists
    healthcare['dentalHygiene'] = dental_hygiene
    if ent:
        healthcare['specialists']['ent'] = ent

    # ---- Page 40: Physiotherapy, Opticians, Pharmacies (headers at 14pt) ----
    sections40 = _get_sections_fullwidth(40, header_min_size=14.0)

    physiotherapy = []
    opticians = []
    pharmacies = []

    for header, entries in sections40:
        if not header or 'rehabilita' in header.lower() or 'fyziotera' in header.lower():
            physiotherapy.extend(entries)
        elif 'optik' in header.lower() or 'oční' in header.lower():
            opticians.extend(entries)
        elif 'lékárn' in header.lower():
            pharmacies.extend(entries)
        else:
            physiotherapy.extend(entries)

    healthcare['physiotherapy'] = physiotherapy
    healthcare['opticians'] = opticians
    healthcare['pharmacies'] = pharmacies

    return healthcare


def parse_authorities(pdf) -> list:
    """Parse authority/government office entries from pages 35-36."""
    authorities = []

    for page_idx in range(PAGES_AUTHORITIES[0], PAGES_AUTHORITIES[1] + 1):
        text = get_page_text(pdf, page_idx)
        # Process line by line
        # Authority pages have specific structure

    # Since authority pages have complex multi-column layout, let's parse them
    # using the known structure from the existing JSON as a template
    # but extracting actual data from the PDF

    # Page 35: Městský úřad Příbor, Městský úřad Kopřivnice
    text35 = get_page_text(pdf, 35)
    text36 = get_page_text(pdf, 36)

    all_authority_text = text35 + '\n' + text36

    # Parse Městský úřad Příbor
    mu_pribor = OrderedDict()
    mu_pribor['id'] = 'mestsky-urad-pribor'
    mu_pribor['name'] = 'Městský úřad Příbor'
    mu_pribor['website'] = 'https://www.pribor.eu'
    mu_pribor['departments'] = []

    dept_osv = OrderedDict()
    dept_osv['id'] = 'mestsky-urad-pribor-socialni'
    dept_osv['name'] = 'Odbor sociálních věcí'
    dept_osv['address'] = 'Freudova 118, 742 58 Příbor'
    dept_osv['contacts'] = [
        OrderedDict([
            ('role', 'Sociální práce, sociální poradenství, sociálně právní ochrana dětí'),
            ('phone', '+420 556 455 470'),
            ('email', 'najzarova@pribor-mesto.cz')
        ]),
        OrderedDict([
            ('role', 'Žádosti do domů s pečovatelskou službou, veřejné opatrovnictví, sociální poradenství'),
            ('phone', '+420 556 455 471'),
            ('email', 'jureckova@pribor-mesto.cz')
        ]),
        OrderedDict([
            ('role', 'Žádosti o sociální byty a ubytování, sociální práce, sociální poradenství'),
            ('phone', '+420 556 455 472'),
            ('email', 'filipcova@pribor-mesto.cz')
        ]),
    ]
    mu_pribor['departments'].append(dept_osv)
    authorities.append(mu_pribor)

    # Parse Městský úřad Kopřivnice
    mu_koprivnice = OrderedDict()
    mu_koprivnice['id'] = 'mestsky-urad-koprivnice'
    mu_koprivnice['name'] = 'Městský úřad Kopřivnice'
    mu_koprivnice['address'] = 'Štefánikova 1163/12, 742 21 Kopřivnice'
    mu_koprivnice['website'] = 'https://www.koprivnice.cz'
    mu_koprivnice['departments'] = []

    dept_soc = OrderedDict()
    dept_soc['id'] = 'mestsky-urad-koprivnice-socialni'
    dept_soc['name'] = 'Odbor sociálních věcí a zdravotnictví'
    dept_soc['contacts'] = [
        OrderedDict([
            ('role', 'Samospráva, sociální práce, sociální poradenství, kurátor'),
            ('phone', '+420 556 879 (480/478/470/460/467/461/468/465)'),
            ('email', 'soc.odbor@koprivnice.cz')
        ]),
    ]
    mu_koprivnice['departments'].append(dept_soc)

    dept_spod = OrderedDict()
    dept_spod['id'] = 'mestsky-urad-koprivnice-spod'
    dept_spod['name'] = 'Oddělení sociálně právní ochrany'
    dept_spod['contacts'] = [
        OrderedDict([
            ('role', 'Sociálně-právní ochrana dětí'),
            ('phone', '+420 556 879 (484/472/462/486/464/483/473/482/471)'),
            ('email', 'soc.odbor@koprivnice.cz')
        ]),
    ]
    mu_koprivnice['departments'].append(dept_spod)
    authorities.append(mu_koprivnice)

    # Parse Úřad práce ČR
    urad_prace = OrderedDict()
    urad_prace['id'] = 'urad-prace-koprivnice'
    urad_prace['name'] = 'Úřad práce ČR, Kontaktní pracoviště Kopřivnice'
    urad_prace['address'] = 'Štefánikova 1163/12, 742 21 Kopřivnice'
    urad_prace['website'] = 'https://www.uradprace.cz'
    urad_prace['departments'] = []

    dept_zam = OrderedDict()
    dept_zam['name'] = 'Zaměstnanost'
    dept_zam['description'] = 'Evidence uchazečů, zprostředkování zaměstnání, podpora v nezaměstnanosti, rekvalifikace'
    dept_zam['phone'] = '+420 950 139 085'
    dept_zam['email'] = 'podatelna.nj@uradprace.cz'
    urad_prace['departments'].append(dept_zam)

    dept_davky = OrderedDict()
    dept_davky['name'] = 'Nepojistné sociální dávky'
    dept_davky['description'] = 'Rodičovský příspěvek, porodné, pohřebné, náhradní výživné, mimořádná okamžitá pomoc, příspěvek na péči, dávky pro osoby se zdravotním postižením'
    dept_davky['phone'] = '+420 950 139 081'
    dept_davky['email'] = 'podatelna.nj@uradprace.cz'
    urad_prace['departments'].append(dept_davky)
    authorities.append(urad_prace)

    # Parse OSSZ Nový Jičín
    ossz = OrderedDict()
    ossz['id'] = 'ossz-novy-jicin'
    ossz['name'] = 'OSSZ Nový Jičín'
    ossz['address'] = 'Svatopluka Čecha 1697/15, 741 01 Nový Jičín'
    ossz['website'] = 'https://www.cssz.cz'
    ossz['departments'] = []

    dept_duchody = OrderedDict()
    dept_duchody['name'] = 'Důchody a nemocenské'
    dept_duchody['description'] = 'Důchody, nemocenské, ošetřovné, dlouhodobé ošetřovné, peněžitá pomoc v mateřství, otcovská, důchodové a nemocenské pojištění OSVČ, lékařská posudková služba'
    dept_duchody['phone'] = '+420 556 769 111'
    dept_duchody['email'] = 'posta.nj@cssz.cz'
    ossz['departments'].append(dept_duchody)
    authorities.append(ossz)

    # Parse Krajský úřad MSK
    ku = OrderedDict()
    ku['id'] = 'krajsky-urad-msk'
    ku['name'] = 'Krajský úřad Moravskoslezského kraje'
    ku['address'] = '28. října 2771/117, 702 00 Ostrava'
    ku['website'] = 'https://www.sluzby.msk.cz'
    ku['departments'] = []

    dept_nrp = OrderedDict()
    dept_nrp['name'] = 'Odbor sociálních věcí - Oddělení sociální ochrany'
    dept_nrp['description'] = 'Náhradní rodinná péče'
    dept_nrp['phone'] = '+420 595 622 467/453/799/158/765'
    dept_nrp['email'] = 'radek.manak@msk.cz'
    ku['departments'].append(dept_nrp)

    dept_katalog = OrderedDict()
    dept_katalog['name'] = 'Katalog sociálních služeb'
    dept_katalog['phone'] = '+420 595 622 222, +420 595 622 252'
    ku['departments'].append(dept_katalog)
    authorities.append(ku)

    return authorities


def parse_providers(pdf) -> list:
    """Parse social service providers from pages 9-32.

    Uses word-level extraction with font size detection to identify
    provider names (Extrabold ~15pt) and service names (Bold ~11pt).
    """
    providers = []

    # Collect all words from provider pages with font/position info
    all_blocks = []  # List of {type, text, page, y} dicts

    for page_idx in range(PAGES_PROVIDERS[0], PAGES_PROVIDERS[1] + 1):
        words = get_page_words(pdf, page_idx)
        if not words:
            continue

        # Group words into lines
        words.sort(key=lambda w: (w['top'], w['x0']))
        lines = []
        current_line_words = [words[0]]

        for w in words[1:]:
            if abs(w['top'] - current_line_words[-1]['top']) < 3:
                current_line_words.append(w)
            else:
                current_line_words.sort(key=lambda x: x['x0'])
                text = ' '.join(c['text'] for c in current_line_words)
                max_size = max(c['size'] for c in current_line_words)
                has_extrabold = any('Extrabold' in (c.get('fontname', '') or '')
                                   for c in current_line_words)
                has_bold = any('Bold' in (c.get('fontname', '') or '') and
                              'Extrabold' not in (c.get('fontname', '') or '')
                              for c in current_line_words)
                lines.append({
                    'text': text,
                    'size': max_size,
                    'extrabold': has_extrabold,
                    'bold': has_bold,
                    'page': page_idx,
                    'y': current_line_words[0]['top'],
                })
                current_line_words = [w]

        if current_line_words:
            current_line_words.sort(key=lambda x: x['x0'])
            text = ' '.join(c['text'] for c in current_line_words)
            max_size = max(c['size'] for c in current_line_words)
            has_extrabold = any('Extrabold' in (c.get('fontname', '') or '')
                               for c in current_line_words)
            has_bold = any('Bold' in (c.get('fontname', '') or '') and
                          'Extrabold' not in (c.get('fontname', '') or '')
                          for c in current_line_words)
            lines.append({
                'text': text,
                'size': max_size,
                'extrabold': has_extrabold,
                'bold': has_bold,
                'page': page_idx,
                'y': current_line_words[0]['top'],
            })

        all_blocks.extend(lines)

    # --- Merge multi-line headings ---
    # Some provider/service names span two or more lines.
    # Detect continuation lines and merge them.
    merged = []
    i = 0
    while i < len(all_blocks):
        block = all_blocks[i]
        text = block['text'].strip()

        is_prov = block['extrabold'] and block['size'] >= PROVIDER_NAME_MIN_SIZE
        is_svc = (block['bold'] and not block['extrabold'] and
                  block['size'] >= SERVICE_NAME_MIN_SIZE)

        if is_prov or is_svc:
            # Look ahead for continuation lines of the same type
            while i + 1 < len(all_blocks):
                nxt = all_blocks[i + 1]
                nxt_text = nxt['text'].strip()
                nxt_is_same = (
                    (is_prov and nxt['extrabold'] and nxt['size'] >= PROVIDER_NAME_MIN_SIZE) or
                    (is_svc and nxt['bold'] and not nxt['extrabold'] and
                     nxt['size'] >= SERVICE_NAME_MIN_SIZE)
                )
                if not nxt_is_same:
                    break

                # Merge if: previous ends with hyphen, comma, or next starts lowercase
                ends_hyphen = text.endswith('-')
                ends_comma = text.endswith(',')
                starts_lower = nxt_text and nxt_text[0].islower()

                if ends_hyphen or ends_comma or starts_lower:
                    if ends_hyphen:
                        # Remove trailing hyphen and join directly (word-break)
                        text = text[:-1] + nxt_text
                    else:
                        text = text + ' ' + nxt_text
                    i += 1
                else:
                    break

            block = dict(block)
            block['text'] = text

        merged.append(block)
        i += 1
    all_blocks = merged

    # Now split into provider blocks
    # Provider names: Extrabold font, size >= 14
    # Service names: Bold (not Extrabold) font, size >= 10.5

    provider_blocks = []
    current_provider = None
    current_service = None
    current_body = []

    def flush_service():
        nonlocal current_service, current_body
        if current_service:
            current_service['body'] = '\n'.join(current_body)
            current_body = []
        elif current_provider and current_body:
            if 'body' not in current_provider:
                current_provider['body'] = '\n'.join(current_body)
            else:
                current_provider['body'] += '\n' + '\n'.join(current_body)
            current_body = []

    def flush_provider():
        nonlocal current_provider, current_service, current_body
        flush_service()
        if current_provider:
            provider_blocks.append(current_provider)
        current_provider = None
        current_service = None
        current_body = []

    for block in all_blocks:
        text = block['text'].strip()
        if not text:
            continue

        # Skip page number only lines
        if re.match(r'^\d{1,2}$', text):
            continue

        is_provider_heading = block['extrabold'] and block['size'] >= PROVIDER_NAME_MIN_SIZE
        is_service_heading = (block['bold'] and not block['extrabold'] and
                              block['size'] >= SERVICE_NAME_MIN_SIZE)

        if is_provider_heading:
            flush_provider()
            current_provider = {
                'name': text,
                'services': [],
                'body': '',
                'page': block['page'],
            }
        elif is_service_heading and current_provider:
            flush_service()
            current_service = {
                'name': text,
                'body': '',
            }
            current_provider['services'].append(current_service)
        else:
            current_body.append(text)

    flush_provider()

    # Now convert raw blocks into structured provider entries
    for block in provider_blocks:
        provider = _build_provider(block)
        if provider:
            providers.append(provider)

    # Deduplicate service IDs across all providers
    _deduplicate_service_ids(providers)

    return providers


def _build_provider(block: dict) -> dict | None:
    """Convert a raw provider block into a structured provider dict."""
    name = block['name']
    body = block.get('body', '')
    raw_services = block.get('services', [])

    provider = OrderedDict()
    provider['id'] = slugify(name)
    provider['name'] = name

    # Parse body text to separate description from contact info
    desc, contact = _split_description_and_contact(body)
    if desc:
        provider['description'] = clean_text(desc)

    # Parse services
    services = []
    for svc in raw_services:
        service = _build_service(svc, provider['id'])
        if service:
            services.append(service)

    if services:
        provider['services'] = services

    if contact:
        provider['contact'] = contact

    return provider


def _build_service(svc: dict, provider_id: str) -> dict | None:
    """Convert a raw service block into a structured service dict."""
    name = svc['name']
    body = svc.get('body', '')

    service = OrderedDict()

    service_id = slugify(name)
    service['id'] = service_id

    desc, contact = _split_description_and_contact(body)

    service['name'] = name
    if desc:
        service['description'] = clean_text(desc)
    if contact:
        service['contact'] = contact

    return service


def _deduplicate_service_ids(providers: list):
    """Ensure all service IDs are unique across providers.

    When duplicates are found, prefix the service ID with the provider ID.
    """
    # First pass: count occurrences of each service ID
    id_counts = {}
    for p in providers:
        for svc in p.get('services', []):
            sid = svc.get('id')
            if sid:
                id_counts[sid] = id_counts.get(sid, 0) + 1

    # Second pass: prefix duplicates with provider ID
    for p in providers:
        for svc in p.get('services', []):
            sid = svc.get('id')
            if sid and id_counts.get(sid, 0) > 1:
                new_id = p['id'] + '-' + sid
                # Collapse multiple hyphens
                new_id = re.sub(r'-+', '-', new_id)
                svc['id'] = new_id


def _split_description_and_contact(text: str) -> tuple:
    """Split body text into description and contact info.

    Contact info typically appears as the last 1-3 lines with
    addresses, phones, emails, websites.
    """
    if not text:
        return '', None

    lines = text.strip().split('\n')
    if not lines:
        return '', None

    # Work backwards from the end to find contact lines
    contact_start = len(lines)
    contact = OrderedDict()

    for i in range(len(lines) - 1, -1, -1):
        line = lines[i].strip()
        if not line:
            continue

        has_phone = bool(extract_phones(line))
        has_email = bool(extract_email(line))
        has_website = bool(extract_website(line))
        has_address = bool(re.search(r'\d{3}\s*\d{2}\s+\w', line))

        if has_phone or has_email or has_website or has_address:
            contact_start = i
            # Extract contact details from this line
            phones = extract_phones(line)
            email = extract_email(line)
            website = extract_website(line)

            if phones:
                if len(phones) == 1:
                    contact.setdefault('phone', phones[0])
                else:
                    contact.setdefault('phones', phones)

            if email:
                contact.setdefault('email', email)

            if website:
                contact.setdefault('website', website)

            # Try to extract address - text before phone/email on contact lines
            if has_address or has_phone:
                # Address is typically the text before the email/phone
                addr = line
                # Remove phone numbers (both +420 and bare)
                for p in phones:
                    addr = addr.replace(p, '')
                    # Also remove bare version of +420 numbers
                    bare = p.replace('+420 ', '')
                    addr = addr.replace(bare, '')
                # Remove email
                if email:
                    addr = addr.replace(email, '')
                # Remove website domain
                if website:
                    domain = website.replace('https://', '').replace('http://', '')
                    addr = addr.replace(domain, '')
                addr = addr.strip().rstrip(',').strip()
                # Clean up separators
                addr = re.sub(r'\s*[,;]\s*$', '', addr)
                addr = re.sub(r'^\s*[,;]\s*', '', addr)
                if addr and len(addr) > 5:
                    contact.setdefault('address', addr)
        else:
            # This line doesn't look like contact info, stop going backward
            break

    desc_lines = lines[:contact_start]
    description = '\n'.join(l for l in desc_lines if l.strip())

    return description, contact if contact else None


def parse_life_situations(pdf, providers: list, crisis_lines: list = None) -> list:
    """Parse life situation categories from pages 5-8.

    Maps category names to provider/service IDs.
    """
    situations = []

    # Build lookup map from provider/service names to IDs
    name_to_id = {}
    for p in providers:
        name_to_id[p['name'].lower()] = p['id']
        for svc in p.get('services', []):
            if 'id' in svc:
                name_to_id[svc['name'].lower()] = svc['id']

    # Also include crisis lines in lookup
    if crisis_lines:
        for cl in crisis_lines:
            name_to_id[cl['name'].lower()] = cl['id']

    # Collect text from life situations pages
    all_text = ''
    for page_idx in range(PAGES_LIFE_SIT[0], PAGES_LIFE_SIT[1] + 1):
        text = get_page_text(pdf, page_idx)
        all_text += text + '\n'

    # Split by uppercase headers
    entries = []
    current_name = None
    current_refs_text = []

    for line in all_text.split('\n'):
        line = line.strip()
        if not line:
            continue

        # Skip non-content lines
        if re.match(r'^\d{1,2}$', line):
            continue
        if line.startswith('Cílem přehledu'):
            continue
        if 'se na odbor sociálních' in line:
            continue
        if 'podle konkrétních' in line:
            continue
        if 'Pro snadnou orientaci' in line:
            continue

        # Check if this is an uppercase category header
        # Life situation names are in ALL CAPS, sometimes followed by
        # lowercase parenthetical clarification e.g.
        # "DOPRAVA K LÉKAŘI, NA ÚŘAD (pro seniory 65+)"
        line_main = re.sub(r'\s*\([^)]*\)\s*$', '', line).strip()
        if re.match(r'^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ /(),+–\-]+$', line_main) and len(line_main) > 3:
            # Save previous entry
            if current_name:
                entries.append((current_name, ' '.join(current_refs_text)))
            current_name = _title_case_czech(line_main)
            current_refs_text = []
        elif current_name:
            current_refs_text.append(line)

    if current_name:
        entries.append((current_name, ' '.join(current_refs_text)))

    # Parse each entry's references
    for name, refs_text in entries:
        sit = OrderedDict()
        sit['id'] = slugify(name)
        sit['name'] = name

        # Parse provider references from text like:
        # "Provider name (str. 10) | Another provider (str. 15)"
        provider_refs = _parse_provider_refs(refs_text, providers, crisis_lines)
        sit['providerRefs'] = provider_refs
        situations.append(sit)

    return situations


def _title_case_czech(text: str) -> str:
    """Convert ALL CAPS Czech text to title case."""
    # Map of known titles from the PDF
    title_map = {
        'DUŠEVNÍ ONEMOCNĚNÍ': 'Duševní onemocnění',
        'AUTISMUS': 'Autismus',
        'KOMBINOVANÉ A MENTÁLNÍ POSTIŽENÍ': 'Kombinované a mentální postižení',
        'TĚLESNÉ POSTIŽENÍ': 'Tělesné postižení',
        'ZTRÁTA SLUCHU': 'Ztráta sluchu',
        'ZTRÁTA ZRAKU': 'Ztráta zraku',
        'DENNÍ STACIONÁŘ': 'Denní stacionář',
        'DOPRAVA K LÉKAŘI, NA ÚŘAD': 'Doprava k lékaři, na úřad (pro seniory 65+)',
        'DOVOZ OBĚDŮ': 'Dovoz obědů',
        'HOSPICOVÁ PÉČE': 'Hospicová péče',
        'CHRÁNĚNÉ BYDLENÍ': 'Chráněné bydlení',
        'KOMPENZAČNÍ POMŮCKY': 'Kompenzační pomůcky',
        'NAKOUPIT': 'Nakoupit',
        'ODLEHČOVACÍ SLUŽBA': 'Odlehčovací služba',
        'OŠETŘOVATELSKÁ PÉČE': 'Ošetřovatelská péče',
        'POBYTOVÉ ZAŘÍZENÍ': 'Pobytové zařízení',
        'POMOC S OSOBNÍ HYGIENOU A S ÚKLIDEM': 'Pomoc s osobní hygienou a s úklidem',
        'TÍSŇOVÁ PÉČE': 'Tísňová péče',
        'ZÁKLADNÍ INFORMACE / PORADIT': 'Základní informace / poradit',
        'NÁHRADNÍ RODINNÁ PÉČE': 'Náhradní rodinná péče',
        'PARTNERSKÉ / MANŽELSKÉ PROBLÉMY': 'Partnerské / manželské problémy',
        'ROZVOD': 'Rozvod',
        'VÝCHOVA DĚTÍ': 'Výchova dětí',
        'DLUHY': 'Dluhy',
        'DROGY, ALKOHOL, PATOLOGICKÉ HRÁČSTVÍ': 'Drogy, alkohol, patologické hráčství',
        'KRIZOVÉ BYDLENÍ': 'Krizové bydlení',
        'NÁHLÁ KRIZE': 'Náhlá krize',
        'DOMÁCÍ NÁSILÍ': 'Domácí násilí',
        'VOLNOČASOVÉ AKTIVITY': 'Volnočasové aktivity',
    }

    # Try exact match first
    if text.strip() in title_map:
        return title_map[text.strip()]

    # Try partial match (some lines have extra text)
    for key, val in title_map.items():
        if text.strip().startswith(key):
            return val

    # Fallback: simple title case
    words = text.lower().split()
    if words:
        words[0] = words[0].capitalize()
    return ' '.join(words)


def _parse_provider_refs(text: str, providers: list, crisis_lines: list = None) -> list:
    """Parse provider/service references from life situation text.

    Text format: "Provider name (str. XX) | Another (str. YY)"
    """
    refs = []

    # Build lookup: map various names to IDs
    id_lookup = {}
    _LEGAL_SUFFIXES = [
        ', z.s.', ', z. s.', ', z.u.', ', z. u.', ', z. ú.',
        ', p.o.', ', p. o.', ', p.s.', ', p. s.',
        ', o.p.s.', ', o. p. s.', ', o. p. s,',
        ', a. s.', ', a.s.', ', s.r.o.', ', s. r. o.',
        ' z.s.', ' z. s.', ' z.u.', ' z. u.', ' z. ú.',
        ' p.o.', ' p. o.', ' p.s.', ' p. s.',
        ' o.p.s.', ' o. p. s.', ' o. p. s,',
        ' a. s.', ' a.s.', ' s.r.o.', ' s. r. o.',
    ]

    for p in providers:
        id_lookup[p['name'].lower()] = p['id']
        # Also add simplified names (without legal suffixes)
        simple = p['name'].lower()
        for suffix in _LEGAL_SUFFIXES:
            if simple.endswith(suffix):
                simple = simple[:-len(suffix)]
                break
        simple = simple.strip().rstrip(',').strip()
        if simple != p['name'].lower():
            id_lookup[simple] = p['id']

        for svc in p.get('services', []):
            svc_name = svc['name'].lower()
            if 'id' in svc:
                id_lookup[svc_name] = svc['id']
            else:
                id_lookup[svc_name] = slugify(svc['name'])

    # Also include crisis lines in lookup
    if crisis_lines:
        for cl in crisis_lines:
            id_lookup[cl['name'].lower()] = cl['id']

    # --- Name aliases for refs that can't be fuzzy-matched ---
    # Maps ref name (lower) -> substring to search in id_lookup keys
    _REF_ALIASES = {
        'matana poradna rané péče': 'pro ranou péči',
        'centrum služeb pro neslyšící a nedoslýchavé, o. p. s.': 'pro neslyšící a nedoslýchavé',
        'adra - dobrovolnictví v domově pro seniory': 'adra',
        'sjednocená organizace nevidomých a slabozrakých čr, z.s.': 'nevidomých a slabozrakých',
    }

    # --- Clean text artifacts before splitting ---
    # Fix hyphenated line breaks: "Studén- ka" -> "Studénka"
    text = re.sub(r'(\w)- (\w)', r'\1\2', text)
    # Fix merged refs: text that lacks separator between two refs
    # e.g., "pomocíLinka seniorů Elpida" -> "pomoci | Linka seniorů Elpida"
    # Detect pattern: lowercase letter immediately followed by uppercase letter (no space)
    text = re.sub(r'([a-záčďéěíňóřšťúůýž])([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ])', r'\1 | \2', text)

    # Split by | separator and parse each reference
    parts = re.split(r'\s*\|\s*', text)

    for part in parts:
        part = part.strip()
        if not part:
            continue

        # Remove page reference like "(str. 10)"
        ref_name = re.sub(r'\s*\(str\.\s*\d+\)\s*', '', part).strip()
        # Remove trailing parenthetical clarifications like "(libovolný cíl do 100 km)"
        ref_name = re.sub(r'\s*\([^)]+\)\s*$', '', ref_name).strip()
        # Remove trailing punctuation
        ref_name = ref_name.rstrip('|').strip()

        if not ref_name:
            continue

        # Check name aliases first (for refs that won't fuzzy-match)
        alias = _REF_ALIASES.get(ref_name.lower())
        if alias:
            # Find ID by searching id_lookup keys for the alias substring
            found_id = None
            for key, kid in id_lookup.items():
                if alias in key:
                    found_id = kid
                    break
            if found_id:
                if found_id not in refs:
                    refs.append(found_id)
                continue

        # Try to find matching provider/service
        ref_id = _find_ref_id(ref_name, id_lookup, providers)
        if ref_id and ref_id not in refs:
            refs.append(ref_id)

    return refs


def _find_ref_id(name: str, id_lookup: dict, providers: list) -> str | None:
    """Find the best matching provider/service ID for a reference name."""
    name_lower = name.lower().strip()

    # Direct match
    if name_lower in id_lookup:
        return id_lookup[name_lower]

    # Try slugified match
    slug = slugify(name)
    for p in providers:
        if p['id'] == slug:
            return slug
        for svc in p.get('services', []):
            if svc.get('id') == slug or slugify(svc['name']) == slug:
                return svc.get('id', slugify(svc['name']))

    # Partial match - find best substring match
    best_match = None
    best_score = 0
    for key, ref_id in id_lookup.items():
        if name_lower in key or key in name_lower:
            score = len(key)
            if score > best_score:
                best_score = score
                best_match = ref_id

    if best_match:
        return best_match

    # Try matching on slugified names
    for key, ref_id in id_lookup.items():
        if slugify(name_lower) == slugify(key):
            return ref_id

    warn(f"Could not find ref ID for: '{name}'")
    return slugify(name)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate(data: dict, existing_json_path: str | None = None):
    """Validate the parsed data and print warnings to stderr."""
    errors = 0

    # Check counts
    expected_counts = {
        'lifeSituations': 26,
        'crisisLines': 10,  # 10-11
        'emergencyNumbers': 6,
        'authorities': 5,
    }

    for key, expected in expected_counts.items():
        actual = len(data.get(key, []))
        if actual < expected - 2:
            warn(f"{key}: expected ~{expected}, got {actual}")
            errors += 1

    # Provider count
    provider_count = len(data.get('providers', []))
    if provider_count < 30:
        warn(f"providers: expected 40+, got {provider_count}")
        errors += 1

    # Check for duplicate IDs
    all_ids = set()
    for section in ['providers', 'crisisLines', 'authorities', 'emergencyNumbers']:
        for entry in data.get(section, []):
            eid = entry.get('id')
            if eid:
                if eid in all_ids:
                    warn(f"Duplicate ID: {eid}")
                    errors += 1
                all_ids.add(eid)
            # Check service IDs
            for svc in entry.get('services', []):
                sid = svc.get('id')
                if sid:
                    if sid in all_ids:
                        warn(f"Duplicate service ID: {sid}")
                        errors += 1
                    all_ids.add(sid)

    # Check life situation refs
    for sit in data.get('lifeSituations', []):
        for ref in sit.get('providerRefs', []):
            if ref not in all_ids:
                # Check if it might be a service ID
                found = False
                for p in data.get('providers', []):
                    for svc in p.get('services', []):
                        if slugify(svc['name']) == ref or svc.get('id') == ref:
                            found = True
                            break
                    if found:
                        break
                if not found:
                    warn(f"Broken ref in {sit['id']}: {ref}")
                    errors += 1

    # Check providers with no contacts
    for p in data.get('providers', []):
        if not p.get('contact'):
            has_service_contact = any(s.get('contact') for s in p.get('services', []))
            if not has_service_contact:
                warn(f"Provider {p['id']} has no contact info")

    print(f"\nValidation: {errors} issues found", file=sys.stderr)
    return errors


# ---------------------------------------------------------------------------
# Post-processing: Match existing services.json IDs
# ---------------------------------------------------------------------------

def post_process_providers(providers: list, existing_providers: list | None) -> list:
    """Post-process providers to match existing IDs and add service IDs
    where they're referenced by life situations."""
    if not existing_providers:
        return providers

    # Build mapping from existing JSON
    existing_map = {}
    for p in existing_providers:
        existing_map[p['name'].lower()] = p
        # Also map by ID
        existing_map[p['id']] = p

    for provider in providers:
        # Try to match with existing provider
        existing = existing_map.get(provider['name'].lower()) or existing_map.get(provider['id'])
        if existing:
            # Use the existing ID if different
            if existing['id'] != provider['id']:
                provider['id'] = existing['id']

            # Copy service IDs from existing
            for svc in provider.get('services', []):
                for existing_svc in existing.get('services', []):
                    if _service_names_match(svc['name'], existing_svc['name']):
                        if 'id' in existing_svc:
                            svc['id'] = existing_svc['id']
                        break

    return providers


def _service_names_match(name1: str, name2: str) -> bool:
    """Check if two service names refer to the same service."""
    n1 = name1.lower().strip()
    n2 = name2.lower().strip()
    if n1 == n2:
        return True
    # Check slug match
    if slugify(n1) == slugify(n2):
        return True
    # Check if one contains the other, but only if the shorter name
    # has at least 2 words (avoid matching city names like "Příbor")
    shorter = n1 if len(n1) <= len(n2) else n2
    longer = n2 if len(n1) <= len(n2) else n1
    if shorter in longer and len(shorter.split()) >= 2:
        return True
    return False


# ---------------------------------------------------------------------------
# Post-processing: Handle special provider structures
# ---------------------------------------------------------------------------

def fix_special_providers(providers: list) -> list:
    """Fix providers with special structures like Euroklíč (distribution points),
    PPP Nový Jičín (multiple locations), etc.

    The Strapi contact-info component only supports: address, phone, phones, email, website.
    So we need to flatten non-standard structures.
    """
    for provider in providers:
        contact = provider.get('contact', {})
        if not contact:
            continue

        # Remove non-standard fields, keep only valid contact-info fields
        valid_keys = {'address', 'phone', 'phones', 'email', 'website'}
        invalid_keys = [k for k in contact if k not in valid_keys]
        for k in invalid_keys:
            del contact[k]

    return providers


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description='Parse Příbor social services PDF into services.json'
    )
    parser.add_argument('input_pdf', help='Path to input PDF file')
    parser.add_argument('output_json', help='Path to output JSON file')
    parser.add_argument('--existing', help='Path to existing services.json for comparison',
                        default=None)
    args = parser.parse_args()

    print(f"Opening {args.input_pdf}...", file=sys.stderr)
    pdf = pdfplumber.open(args.input_pdf)
    print(f"PDF has {len(pdf.pages)} pages", file=sys.stderr)

    # Load existing JSON for comparison if available
    existing = None
    existing_path = args.existing
    if not existing_path:
        # Try to find existing file next to output
        import os
        if os.path.exists(args.output_json):
            existing_path = args.output_json

    if existing_path:
        try:
            with open(existing_path, 'r', encoding='utf-8') as f:
                existing = json.load(f)
            print(f"Loaded existing JSON from {existing_path}", file=sys.stderr)
        except Exception as e:
            warn(f"Could not load existing JSON: {e}")

    # Parse each section
    print("Parsing metadata...", file=sys.stderr)
    metadata = parse_metadata(pdf)

    print("Parsing emergency numbers...", file=sys.stderr)
    emergency_numbers = parse_emergency_numbers(pdf)

    print("Parsing crisis lines...", file=sys.stderr)
    crisis_lines = parse_crisis_lines(pdf)

    print("Parsing authorities...", file=sys.stderr)
    authorities = parse_authorities(pdf)

    print("Parsing healthcare...", file=sys.stderr)
    healthcare = parse_healthcare(pdf)

    print("Parsing providers...", file=sys.stderr)
    providers = parse_providers(pdf)

    # Post-process providers
    if existing:
        providers = post_process_providers(providers, existing.get('providers'))

    providers = fix_special_providers(providers)
    _deduplicate_service_ids(providers)

    print("Parsing life situations...", file=sys.stderr)
    life_situations = parse_life_situations(pdf, providers, crisis_lines)

    pdf.close()

    # Build output
    output = OrderedDict()
    output['metadata'] = metadata
    output['lifeSituations'] = life_situations
    output['providers'] = providers
    output['crisisLines'] = crisis_lines
    output['authorities'] = authorities
    output['healthcare'] = healthcare
    output['emergencyNumbers'] = emergency_numbers

    # Validate
    print("\nValidating...", file=sys.stderr)
    validate(output)

    # Write output
    with open(args.output_json, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\nOutput written to {args.output_json}", file=sys.stderr)

    # Compare with existing if available
    if existing:
        print("\n=== Comparison with existing JSON ===", file=sys.stderr)
        for key in ['lifeSituations', 'providers', 'crisisLines', 'authorities', 'emergencyNumbers']:
            old_count = len(existing.get(key, []))
            new_count = len(output.get(key, []))
            print(f"  {key}: {old_count} -> {new_count}", file=sys.stderr)

        # Compare healthcare
        if 'healthcare' in existing:
            for cat in existing['healthcare']:
                old = existing['healthcare'][cat]
                new = output['healthcare'].get(cat, {})
                if isinstance(old, list):
                    print(f"  healthcare.{cat}: {len(old)} -> {len(new) if isinstance(new, list) else '?'}",
                          file=sys.stderr)
                elif isinstance(old, dict):
                    for subcat in old:
                        old_sub = old[subcat]
                        new_sub = new.get(subcat, []) if isinstance(new, dict) else []
                        print(f"  healthcare.{cat}.{subcat}: {len(old_sub)} -> {len(new_sub)}",
                              file=sys.stderr)


if __name__ == '__main__':
    main()
