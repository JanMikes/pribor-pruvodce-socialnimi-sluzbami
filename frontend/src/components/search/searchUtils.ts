import type {
  SearchableContent,
  SearchResult,
  SearchResultType,
  Provider,
  LifeSituation,
  CrisisLine,
  Authority,
  HealthcareProvider,
  EmergencyNumber,
  healthcareCategoryLabels,
} from '@/lib/types';

// Remove Czech diacritics for matching
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return removeDiacritics(text.toLowerCase().trim());
}

// Check if text matches query (diacritics-insensitive)
function matchesQuery(text: string | undefined | null, query: string): boolean {
  if (!text) return false;
  return normalizeText(text).includes(normalizeText(query));
}

// Score weights
const SCORE_WEIGHTS = {
  titleExact: 100,
  titleStartsWith: 80,
  titleContains: 60,
  descriptionContains: 40,
  phoneMatch: 90,
  addressContains: 30,
  subtitleContains: 50,
};

// Type priority boost (emergency info ranks higher)
const TYPE_PRIORITY: Record<SearchResultType, number> = {
  emergency: 50,
  crisisLine: 40,
  provider: 30,
  lifeSituation: 25,
  healthcare: 20,
  authority: 15,
};

// Category labels for Czech UI
export const CATEGORY_LABELS: Record<SearchResultType, string> = {
  provider: 'Poskytovatelé',
  lifeSituation: 'Životní situace',
  crisisLine: 'Krizové linky',
  authority: 'Úřady',
  healthcare: 'Zdravotnictví',
  emergency: 'Tísňová čísla',
};

// Brand color styles for each type
export const CATEGORY_STYLES: Record<SearchResultType, {
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconBgClass: string;
}> = {
  provider: {
    bgClass: 'bg-primary-50',
    borderClass: 'border-primary-200',
    textClass: 'text-primary-700',
    iconBgClass: 'bg-primary-100',
  },
  lifeSituation: {
    bgClass: 'bg-primary-50',
    borderClass: 'border-primary-200',
    textClass: 'text-primary-700',
    iconBgClass: 'bg-primary-100',
  },
  crisisLine: {
    bgClass: 'bg-secondary-50',
    borderClass: 'border-secondary-200',
    textClass: 'text-secondary-700',
    iconBgClass: 'bg-secondary-100',
  },
  healthcare: {
    bgClass: 'bg-healthcare-50',
    borderClass: 'border-healthcare-200',
    textClass: 'text-healthcare-700',
    iconBgClass: 'bg-healthcare-100',
  },
  authority: {
    bgClass: 'bg-authority-50',
    borderClass: 'border-authority-200',
    textClass: 'text-authority-700',
    iconBgClass: 'bg-authority-100',
  },
  emergency: {
    bgClass: 'bg-secondary-50',
    borderClass: 'border-secondary-200',
    textClass: 'text-secondary-700',
    iconBgClass: 'bg-secondary-100',
  },
};

// Calculate score for a result
function calculateScore(
  query: string,
  title: string,
  description?: string,
  phone?: string,
  address?: string,
  subtitle?: string,
): number {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(title);

  let score = 0;

  // Title matching
  if (normalizedTitle === normalizedQuery) {
    score += SCORE_WEIGHTS.titleExact;
  } else if (normalizedTitle.startsWith(normalizedQuery)) {
    score += SCORE_WEIGHTS.titleStartsWith;
  } else if (normalizedTitle.includes(normalizedQuery)) {
    score += SCORE_WEIGHTS.titleContains;
  }

  // Description matching
  if (description && matchesQuery(description, query)) {
    score += SCORE_WEIGHTS.descriptionContains;
  }

  // Phone matching (important for emergency lookups)
  if (phone && phone.replace(/\s/g, '').includes(query.replace(/\s/g, ''))) {
    score += SCORE_WEIGHTS.phoneMatch;
  }

  // Address matching
  if (address && matchesQuery(address, query)) {
    score += SCORE_WEIGHTS.addressContains;
  }

  // Subtitle matching
  if (subtitle && matchesQuery(subtitle, query)) {
    score += SCORE_WEIGHTS.subtitleContains;
  }

  return score;
}

// Strip HTML tags from rich text
function stripHtml(html: string | undefined | null): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

// Convert Provider to SearchResult
function providerToSearchResult(provider: Provider, query: string): SearchResult | null {
  const description = stripHtml(provider.description);
  const score = calculateScore(
    query,
    provider.name,
    description,
    provider.contact?.phone,
    provider.contact?.address,
  );

  if (score === 0) return null;

  return {
    id: `provider-${provider.providerId}`,
    type: 'provider',
    title: provider.name,
    description: description.slice(0, 150) + (description.length > 150 ? '...' : ''),
    href: `/poskytovatele/${provider.providerId}`,
    phone: provider.contact?.phone,
    address: provider.contact?.address,
    score: score + TYPE_PRIORITY.provider,
  };
}

// Convert LifeSituation to SearchResult
function lifeSituationToSearchResult(situation: LifeSituation, query: string): SearchResult | null {
  const score = calculateScore(query, situation.name);

  if (score === 0) return null;

  return {
    id: `situation-${situation.situationId}`,
    type: 'lifeSituation',
    title: situation.name,
    subtitle: `${situation.providerRefs?.length || 0} poskytovatelů`,
    href: `/zivotni-situace/${situation.situationId}`,
    score: score + TYPE_PRIORITY.lifeSituation,
  };
}

// Convert CrisisLine to SearchResult
function crisisLineToSearchResult(line: CrisisLine, query: string): SearchResult | null {
  const description = stripHtml(line.description);
  const score = calculateScore(
    query,
    line.name,
    description,
    line.phone,
    undefined,
    line.targetGroup,
  );

  if (score === 0) return null;

  return {
    id: `crisis-${line.lineId || line.id}`,
    type: 'crisisLine',
    title: line.name,
    subtitle: line.targetGroup,
    description: description.slice(0, 150) + (description.length > 150 ? '...' : ''),
    href: '/krizove-linky',
    phone: line.phone,
    availability: line.availability,
    score: score + TYPE_PRIORITY.crisisLine,
  };
}

// Convert Authority to SearchResult
function authorityToSearchResult(authority: Authority, query: string): SearchResult | null {
  // Check main authority name
  let score = calculateScore(query, authority.name, undefined, undefined, authority.address);

  // Also check department names
  if (authority.departments) {
    for (const dept of authority.departments) {
      if (matchesQuery(dept.name, query)) {
        score += SCORE_WEIGHTS.subtitleContains;
      }
      if (matchesQuery(dept.description, query)) {
        score += SCORE_WEIGHTS.descriptionContains / 2;
      }
    }
  }

  if (score === 0) return null;

  const deptCount = authority.departments?.length || 0;
  return {
    id: `authority-${authority.authorityId}`,
    type: 'authority',
    title: authority.name,
    subtitle: deptCount > 0 ? `${deptCount} odborů` : undefined,
    href: '/urady',
    address: authority.address,
    score: score + TYPE_PRIORITY.authority,
  };
}

// Healthcare category labels import
import { healthcareCategoryLabels as categoryLabels } from '@/lib/types';

// Convert HealthcareProvider to SearchResult
function healthcareToSearchResult(provider: HealthcareProvider, query: string): SearchResult | null {
  const categoryLabel = categoryLabels[provider.category] || provider.category;
  const score = calculateScore(
    query,
    provider.name,
    undefined,
    provider.phone,
    provider.address,
    categoryLabel,
  );

  // Also check staff specialties
  let staffScore = 0;
  if (provider.staff) {
    for (const staff of provider.staff) {
      if (matchesQuery(staff.name, query) || matchesQuery(staff.specialty, query)) {
        staffScore += SCORE_WEIGHTS.subtitleContains / 2;
      }
    }
  }

  const totalScore = score + staffScore;
  if (totalScore === 0) return null;

  return {
    id: `healthcare-${provider.providerId}`,
    type: 'healthcare',
    title: provider.name,
    subtitle: categoryLabel,
    href: '/zdravotnictvi',
    phone: provider.phone,
    address: provider.address,
    score: totalScore + TYPE_PRIORITY.healthcare,
  };
}

// Convert EmergencyNumber to SearchResult
function emergencyToSearchResult(emergency: EmergencyNumber, query: string): SearchResult | null {
  const phone = emergency.phone || emergency.phones?.[0];
  const score = calculateScore(query, emergency.name, undefined, phone);

  if (score === 0) return null;

  return {
    id: `emergency-${emergency.id}`,
    type: 'emergency',
    title: emergency.name,
    href: '/',
    phone: phone,
    score: score + TYPE_PRIORITY.emergency,
  };
}

// Main search function
export function searchContent(content: SearchableContent, query: string): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  // Search providers
  for (const provider of content.providers) {
    const result = providerToSearchResult(provider, query);
    if (result) results.push(result);
  }

  // Search life situations
  for (const situation of content.lifeSituations) {
    const result = lifeSituationToSearchResult(situation, query);
    if (result) results.push(result);
  }

  // Search crisis lines
  for (const line of content.crisisLines) {
    const result = crisisLineToSearchResult(line, query);
    if (result) results.push(result);
  }

  // Search authorities
  for (const authority of content.authorities) {
    const result = authorityToSearchResult(authority, query);
    if (result) results.push(result);
  }

  // Search healthcare providers
  for (const provider of content.healthcareProviders) {
    const result = healthcareToSearchResult(provider, query);
    if (result) results.push(result);
  }

  // Search emergency numbers
  for (const emergency of content.emergencyNumbers) {
    const result = emergencyToSearchResult(emergency, query);
    if (result) results.push(result);
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  return results;
}

// Group results by type for display
export function groupResultsByType(results: SearchResult[]): Record<SearchResultType, SearchResult[]> {
  const grouped: Record<SearchResultType, SearchResult[]> = {
    emergency: [],
    crisisLine: [],
    provider: [],
    lifeSituation: [],
    healthcare: [],
    authority: [],
  };

  for (const result of results) {
    grouped[result.type].push(result);
  }

  return grouped;
}

// Get display order for result types
export const TYPE_DISPLAY_ORDER: SearchResultType[] = [
  'emergency',
  'crisisLine',
  'lifeSituation',
  'provider',
  'healthcare',
  'authority',
];
