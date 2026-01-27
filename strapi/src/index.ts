import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

interface ContactInfo {
  address?: string;
  phone?: string;
  phones?: string[];
  email?: string;
  website?: string;
}

interface Service {
  id?: string;
  name: string;
  description?: string;
  contact?: ContactInfo;
}

interface Provider {
  id: string;
  name: string;
  description?: string;
  services?: Service[];
  contact?: ContactInfo;
}

interface LifeSituation {
  id: string;
  name: string;
  providerRefs: string[];
}

interface CrisisLine {
  id?: string;
  name: string;
  phone?: string;
  description?: string;
  availability?: string;
  free?: boolean;
  email?: string;
  website?: string;
  targetGroup?: string;
}

interface DepartmentContact {
  role: string;
  phone?: string;
  email?: string;
}

interface Department {
  id?: string;
  name: string;
  address?: string;
  description?: string;
  phone?: string;
  email?: string;
  contacts?: DepartmentContact[];
}

interface Authority {
  id: string;
  name: string;
  address?: string;
  website?: string;
  departments?: Department[];
}

interface StaffMember {
  name: string;
  phone?: string;
  specialty?: string;
}

interface HealthcareEntry {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  phones?: string[];
  website?: string;
  staff?: StaffMember[];
}

interface ServicesData {
  metadata: {
    title: string;
    city: string;
    region?: string;
    publisher?: string;
    publishDate?: string;
    language?: string;
  };
  lifeSituations: LifeSituation[];
  providers: Provider[];
  crisisLines: CrisisLine[];
  authorities: Authority[];
  healthcare: {
    pediatricians?: HealthcareEntry[];
    generalPractitioners?: HealthcareEntry[];
    specialists?: {
      [key: string]: HealthcareEntry[];
    };
    dentists?: HealthcareEntry[];
    dentalHygiene?: HealthcareEntry[];
    physiotherapy?: HealthcareEntry[];
    opticians?: HealthcareEntry[];
    pharmacies?: HealthcareEntry[];
  };
  emergencyNumbers: { name: string; phone?: string; phones?: string[] }[];
}

type HealthcareCategory = 'pediatrician' | 'generalPractitioner' | 'gynecology' | 'surgery' | 'cardiology' | 'ophthalmology' | 'pulmonary' | 'allergology' | 'rehabilitation' | 'ent' | 'dentist' | 'dentalHygiene' | 'physiotherapy' | 'optician' | 'pharmacy';

const specialtyMapping: { [key: string]: HealthcareCategory } = {
  gynecology: 'gynecology',
  surgery: 'surgery',
  cardiology: 'cardiology',
  ophthalmology: 'ophthalmology',
  pulmonary: 'pulmonary',
  allergology: 'allergology',
  rehabilitation: 'rehabilitation',
  ent: 'ent',
};

// Convert phone/phones from JSON to repeatable phone-number components
function toPhoneComponents(phone?: string, phones?: string[]): { number: string }[] {
  const result: { number: string }[] = [];
  if (phone) result.push({ number: phone });
  if (phones) {
    for (const p of phones) {
      if (!result.some(r => r.number === p)) result.push({ number: p });
    }
  }
  return result;
}

async function seedData(strapi: Core.Strapi) {
  const servicesPath = path.resolve('/app/services.json');

  if (!fs.existsSync(servicesPath)) {
    strapi.log.warn('services.json not found, skipping seed');
    return;
  }

  // Check if data already exists using direct DB query (more reliable than document API)
  const existingCount = await strapi.db.query('api::emergency-number.emergency-number').count({});
  if (existingCount > 0) {
    strapi.log.info(`Data already seeded (${existingCount} emergency numbers found), skipping`);
    return;
  }

  strapi.log.info('Starting data seed...');

  const servicesData: ServicesData = JSON.parse(fs.readFileSync(servicesPath, 'utf-8'));

  // 1. Seed Site Metadata
  strapi.log.info('Seeding site metadata...');
  const existingMetadata = await strapi.documents('api::site-metadata.site-metadata').findFirst({});
  if (!existingMetadata) {
    await strapi.documents('api::site-metadata.site-metadata').create({
      data: {
        title: servicesData.metadata.title,
        city: servicesData.metadata.city,
        region: servicesData.metadata.region,
        publisher: servicesData.metadata.publisher,
        publishDate: servicesData.metadata.publishDate,
        language: servicesData.metadata.language || 'cs',
      },
    });
  }

  // 2. Seed Emergency Numbers
  strapi.log.info('Seeding emergency numbers...');
  for (let i = 0; i < servicesData.emergencyNumbers.length; i++) {
    const emergency = servicesData.emergencyNumbers[i];
    await strapi.documents('api::emergency-number.emergency-number').create({
      data: {
        name: emergency.name,
        phones: toPhoneComponents(emergency.phone, emergency.phones),
        order: i,
        publishedAt: new Date(),
      },
    });
  }

  // 3. Seed Crisis Lines
  strapi.log.info('Seeding crisis lines...');
  for (let i = 0; i < servicesData.crisisLines.length; i++) {
    const line = servicesData.crisisLines[i];
    await strapi.documents('api::crisis-line.crisis-line').create({
      data: {
        lineId: line.id,
        name: line.name,
        phones: toPhoneComponents(line.phone),
        description: line.description,
        availability: line.availability,
        free: line.free ?? false,
        email: line.email,
        website: line.website,
        targetGroup: line.targetGroup,
        order: i,
        publishedAt: new Date(),
      },
    });
  }

  // 4. Seed Providers (without services - those are now separate entities)
  strapi.log.info('Seeding providers...');
  for (const provider of servicesData.providers) {
    await strapi.documents('api::provider.provider').create({
      data: {
        providerId: provider.id,
        name: provider.name,
        description: provider.description,
        contacts: provider.contact
          ? [{
              address: provider.contact.address,
              phones: toPhoneComponents(provider.contact.phone, provider.contact.phones),
              email: provider.contact.email,
              website: provider.contact.website,
            }]
          : [],
        publishedAt: new Date(),
      },
    });
  }

  // 5. Seed Services as separate entities linked to providers
  strapi.log.info('Seeding services...');

  // Build provider lookup: providerId -> documentId
  const allProviders = await strapi.documents('api::provider.provider').findMany({
    limit: 1000,
  });
  const providerIdToDocId = new Map<string, string>();
  for (const p of allProviders) {
    providerIdToDocId.set((p as any).providerId, p.documentId);
  }

  const serviceIdToDocId = new Map<string, string>();

  for (const providerData of servicesData.providers) {
    const providerDocId = providerIdToDocId.get(providerData.id);
    if (!providerDocId) continue;

    for (const svc of providerData.services || []) {
      const serviceEntry = await strapi.documents('api::service.service').create({
        data: {
          serviceId: svc.id || `${providerData.id}-${svc.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: svc.name,
          description: svc.description,
          contacts: svc.contact
            ? [{
                address: svc.contact.address,
                phones: toPhoneComponents(svc.contact.phone, svc.contact.phones),
                email: svc.contact.email,
                website: svc.contact.website,
              }]
            : [],
          provider: { connect: [{ documentId: providerDocId }] } as any,
          publishedAt: new Date(),
        },
      });
      if (svc.id) {
        serviceIdToDocId.set(svc.id, serviceEntry.documentId);
      }
    }
  }

  // 6. Seed Life Situations (with relation lookups for providers, services, crisis lines)
  strapi.log.info('Seeding life situations...');

  const allCrisisLines = await strapi.documents('api::crisis-line.crisis-line').findMany({
    limit: 1000,
  });
  const lineIdToDocId = new Map<string, string>();
  for (const cl of allCrisisLines) {
    if ((cl as any).lineId) {
      lineIdToDocId.set((cl as any).lineId, cl.documentId);
    }
  }

  for (let i = 0; i < servicesData.lifeSituations.length; i++) {
    const situation = servicesData.lifeSituations[i];

    // Classify each providerRef into providers, services, or crisis lines
    const providerDocIds = new Set<string>();
    const serviceDocIds = new Set<string>();
    const crisisLineDocIds = new Set<string>();

    for (const ref of situation.providerRefs || []) {
      if (providerIdToDocId.has(ref)) {
        providerDocIds.add(providerIdToDocId.get(ref)!);
      } else if (serviceIdToDocId.has(ref)) {
        serviceDocIds.add(serviceIdToDocId.get(ref)!);
      } else if (lineIdToDocId.has(ref)) {
        crisisLineDocIds.add(lineIdToDocId.get(ref)!);
      } else {
        strapi.log.warn(`Life situation "${situation.name}": unresolved ref "${ref}"`);
      }
    }

    await strapi.documents('api::life-situation.life-situation').create({
      data: {
        situationId: situation.id,
        name: situation.name,
        providers: { connect: [...providerDocIds].map(id => ({ documentId: id })) } as any,
        services: { connect: [...serviceDocIds].map(id => ({ documentId: id })) } as any,
        crisisLines: { connect: [...crisisLineDocIds].map(id => ({ documentId: id })) } as any,
        order: i,
        publishedAt: new Date(),
      },
    });
  }

  // 6. Seed Authorities
  strapi.log.info('Seeding authorities...');
  for (const authority of servicesData.authorities) {
    const departments = authority.departments?.map((dept) => ({
      name: dept.name,
      address: dept.address,
      description: dept.description,
      phone: dept.phone,
      email: dept.email,
      contacts: dept.contacts?.map((contact) => ({
        role: contact.role,
        phone: contact.phone,
        email: contact.email,
      })),
    }));

    await strapi.documents('api::authority.authority').create({
      data: {
        authorityId: authority.id,
        name: authority.name,
        address: authority.address,
        website: authority.website,
        departments: departments,
        publishedAt: new Date(),
      },
    });
  }

  // 7. Seed Healthcare Providers
  strapi.log.info('Seeding healthcare providers...');

  async function seedHealthcareCategory(entries: HealthcareEntry[] | undefined, category: HealthcareCategory) {
    if (!entries) return;
    for (const entry of entries) {
      await strapi.documents('api::healthcare-provider.healthcare-provider').create({
        data: {
          providerId: entry.id,
          name: entry.name,
          category: category,
          address: entry.address,
          phones: toPhoneComponents(entry.phone, entry.phones),
          website: entry.website,
          staff: entry.staff?.map((s) => ({
            name: s.name,
            phone: s.phone,
            specialty: s.specialty,
          })),
          publishedAt: new Date(),
        },
      });
    }
  }

  await seedHealthcareCategory(servicesData.healthcare.pediatricians, 'pediatrician');
  await seedHealthcareCategory(servicesData.healthcare.generalPractitioners, 'generalPractitioner');
  await seedHealthcareCategory(servicesData.healthcare.dentists, 'dentist');
  await seedHealthcareCategory(servicesData.healthcare.dentalHygiene, 'dentalHygiene');
  await seedHealthcareCategory(servicesData.healthcare.physiotherapy, 'physiotherapy');
  await seedHealthcareCategory(servicesData.healthcare.opticians, 'optician');
  await seedHealthcareCategory(servicesData.healthcare.pharmacies, 'pharmacy');

  if (servicesData.healthcare.specialists) {
    for (const [key, entries] of Object.entries(servicesData.healthcare.specialists)) {
      const category = specialtyMapping[key] || key as HealthcareCategory;
      await seedHealthcareCategory(entries, category);
    }
  }

  strapi.log.info('Data seed completed!');
}

async function configurePublicPermissions(strapi: Core.Strapi) {
  // Get the public role
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    strapi.log.warn('Public role not found');
    return;
  }

  // Define permissions for all content types
  const contentTypes = [
    'api::provider.provider',
    'api::service.service',
    'api::life-situation.life-situation',
    'api::crisis-line.crisis-line',
    'api::authority.authority',
    'api::healthcare-provider.healthcare-provider',
    'api::emergency-number.emergency-number',
    'api::site-metadata.site-metadata',
  ];

  const actions = ['find', 'findOne'];

  for (const contentType of contentTypes) {
    for (const action of actions) {
      // Check if permission already exists
      const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: {
          role: publicRole.id,
          action: `${contentType}.${action}`,
        },
      });

      if (!existingPermission) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            role: publicRole.id,
            action: `${contentType}.${action}`,
          },
        });
        strapi.log.info(`Created permission: ${contentType}.${action}`);
      }
    }
  }

  strapi.log.info('Public permissions configured');
}

export default {
  register(/* { strapi } */) {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedData(strapi);
    await configurePublicPermissions(strapi);
  },
  destroy(/* { strapi } */) {},
};
