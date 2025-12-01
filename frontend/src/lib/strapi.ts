import type {
  StrapiResponse,
  StrapiSingleResponse,
  Provider,
  LifeSituation,
  CrisisLine,
  Authority,
  HealthcareProvider,
  EmergencyNumber,
  SiteMetadata,
  HealthcareCategory,
} from './types';

// Use Docker service name for SSR, localhost for client-side
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

interface FetchOptions {
  populate?: string | Record<string, unknown>;
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

function buildQueryString(options: FetchOptions): string {
  const params = new URLSearchParams();

  if (options.populate) {
    if (typeof options.populate === 'string') {
      params.set('populate', options.populate);
    } else {
      // Handle deep population
      const flattenPopulate = (obj: Record<string, unknown>, prefix = 'populate'): void => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            flattenPopulate(value as Record<string, unknown>, `${prefix}[${key}]`);
          } else {
            params.set(`${prefix}[${key}]`, String(value));
          }
        }
      };
      flattenPopulate(options.populate);
    }
  }

  if (options.filters) {
    const flattenFilters = (obj: Record<string, unknown>, prefix = 'filters'): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          // Handle arrays for $in filters: filters[field][$in][0]=a&filters[field][$in][1]=b
          value.forEach((item, index) => {
            params.set(`${prefix}[${key}][${index}]`, String(item));
          });
        } else if (typeof value === 'object' && value !== null) {
          flattenFilters(value as Record<string, unknown>, `${prefix}[${key}]`);
        } else {
          params.set(`${prefix}[${key}]`, String(value));
        }
      }
    };
    flattenFilters(options.filters);
  }

  if (options.sort) {
    const sortValue = Array.isArray(options.sort) ? options.sort.join(',') : options.sort;
    params.set('sort', sortValue);
  }

  if (options.pagination) {
    if (options.pagination.page) {
      params.set('pagination[page]', String(options.pagination.page));
    }
    if (options.pagination.pageSize) {
      params.set('pagination[pageSize]', String(options.pagination.pageSize));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

async function fetchStrapi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const queryString = buildQueryString(options);
  const url = `${STRAPI_URL}/api${endpoint}${queryString}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Strapi fetch error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Providers
export async function getProviders(): Promise<Provider[]> {
  const response = await fetchStrapi<StrapiResponse<Provider[]>>('/providers', {
    populate: {
      services: {
        populate: {
          contact: '*',
        },
      },
      contact: '*',
    },
    sort: 'name:asc',
    pagination: { pageSize: 100 },
  });
  return response.data;
}

export async function getProviderBySlug(slug: string): Promise<Provider | null> {
  const response = await fetchStrapi<StrapiResponse<Provider[]>>('/providers', {
    filters: { slug: { $eq: slug } },
    populate: {
      services: {
        populate: {
          contact: '*',
        },
      },
      contact: '*',
    },
  });
  return response.data[0] || null;
}

export async function getProviderById(providerId: string): Promise<Provider | null> {
  const response = await fetchStrapi<StrapiResponse<Provider[]>>('/providers', {
    filters: { providerId: { $eq: providerId } },
    populate: {
      services: {
        populate: {
          contact: '*',
        },
      },
      contact: '*',
    },
  });
  return response.data[0] || null;
}

export async function getProvidersByIds(providerIds: string[]): Promise<Provider[]> {
  if (providerIds.length === 0) return [];

  const response = await fetchStrapi<StrapiResponse<Provider[]>>('/providers', {
    filters: { providerId: { $in: providerIds } },
    populate: {
      services: {
        populate: {
          contact: '*',
        },
      },
      contact: '*',
    },
    pagination: { pageSize: 100 },
  });
  return response.data;
}

// Life Situations
export async function getLifeSituations(): Promise<LifeSituation[]> {
  const response = await fetchStrapi<StrapiResponse<LifeSituation[]>>('/life-situations', {
    sort: 'order:asc',
    pagination: { pageSize: 100 },
  });
  return response.data;
}

export async function getLifeSituationById(situationId: string): Promise<LifeSituation | null> {
  const response = await fetchStrapi<StrapiResponse<LifeSituation[]>>('/life-situations', {
    filters: { situationId: { $eq: situationId } },
  });
  return response.data[0] || null;
}

// Crisis Lines
export async function getCrisisLines(): Promise<CrisisLine[]> {
  const response = await fetchStrapi<StrapiResponse<CrisisLine[]>>('/crisis-lines', {
    sort: 'order:asc',
    pagination: { pageSize: 100 },
  });
  return response.data;
}

// Authorities
export async function getAuthorities(): Promise<Authority[]> {
  const response = await fetchStrapi<StrapiResponse<Authority[]>>('/authorities', {
    populate: {
      departments: {
        populate: {
          contacts: '*',
        },
      },
    },
    pagination: { pageSize: 100 },
  });
  return response.data;
}

export async function getAuthorityById(authorityId: string): Promise<Authority | null> {
  const response = await fetchStrapi<StrapiResponse<Authority[]>>('/authorities', {
    filters: { authorityId: { $eq: authorityId } },
    populate: {
      departments: {
        populate: {
          contacts: '*',
        },
      },
    },
  });
  return response.data[0] || null;
}

// Healthcare Providers
export async function getHealthcareProviders(): Promise<HealthcareProvider[]> {
  const response = await fetchStrapi<StrapiResponse<HealthcareProvider[]>>('/healthcare-providers', {
    populate: {
      staff: '*',
    },
    sort: 'name:asc',
    pagination: { pageSize: 200 },
  });
  return response.data;
}

export async function getHealthcareProvidersByCategory(category: HealthcareCategory): Promise<HealthcareProvider[]> {
  const response = await fetchStrapi<StrapiResponse<HealthcareProvider[]>>('/healthcare-providers', {
    filters: { category: { $eq: category } },
    populate: {
      staff: '*',
    },
    sort: 'name:asc',
    pagination: { pageSize: 100 },
  });
  return response.data;
}

// Emergency Numbers
export async function getEmergencyNumbers(): Promise<EmergencyNumber[]> {
  const response = await fetchStrapi<StrapiResponse<EmergencyNumber[]>>('/emergency-numbers', {
    sort: 'order:asc',
    pagination: { pageSize: 20 },
  });
  return response.data;
}

// Site Metadata
export async function getSiteMetadata(): Promise<SiteMetadata | null> {
  try {
    const response = await fetchStrapi<StrapiSingleResponse<SiteMetadata>>('/site-metadata');
    return response.data;
  } catch {
    return null;
  }
}
