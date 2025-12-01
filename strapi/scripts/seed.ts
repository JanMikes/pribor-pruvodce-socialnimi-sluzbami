import { createStrapi } from '@strapi/strapi';
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

interface EmergencyNumber {
  name: string;
  phone?: string;
  phones?: string[];
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
  emergencyNumbers: EmergencyNumber[];
}

// Map specialty keys to enum values
const specialtyMapping: { [key: string]: string } = {
  gynecology: 'gynecology',
  surgery: 'surgery',
  cardiology: 'cardiology',
  ophthalmology: 'ophthalmology',
  pulmonary: 'pulmonary',
  allergology: 'allergology',
  rehabilitation: 'rehabilitation',
  ent: 'ent',
};

async function seed() {
  console.log('Starting seed process...');

  // Load services.json (mounted at /app/services.json in Docker)
  const servicesPath = path.resolve('/app/services.json');
  const servicesData: ServicesData = JSON.parse(fs.readFileSync(servicesPath, 'utf-8'));

  // Initialize Strapi
  const strapi = await createStrapi({ distDir: './dist' }).load();

  try {
    // 1. Seed Site Metadata
    console.log('Seeding site metadata...');
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
      console.log('Site metadata created.');
    } else {
      console.log('Site metadata already exists, skipping.');
    }

    // 2. Seed Emergency Numbers
    console.log('Seeding emergency numbers...');
    for (let i = 0; i < servicesData.emergencyNumbers.length; i++) {
      const emergency = servicesData.emergencyNumbers[i];
      const existing = await strapi.documents('api::emergency-number.emergency-number').findMany({
        filters: { name: emergency.name },
      });
      if (existing.length === 0) {
        await strapi.documents('api::emergency-number.emergency-number').create({
          data: {
            name: emergency.name,
            phone: emergency.phone,
            phones: emergency.phones,
            order: i,
            publishedAt: new Date(),
          },
        });
      }
    }
    console.log(`Seeded ${servicesData.emergencyNumbers.length} emergency numbers.`);

    // 3. Seed Crisis Lines
    console.log('Seeding crisis lines...');
    for (let i = 0; i < servicesData.crisisLines.length; i++) {
      const line = servicesData.crisisLines[i];
      const existing = await strapi.documents('api::crisis-line.crisis-line').findMany({
        filters: { name: line.name },
      });
      if (existing.length === 0) {
        await strapi.documents('api::crisis-line.crisis-line').create({
          data: {
            lineId: line.id,
            name: line.name,
            phone: line.phone,
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
    }
    console.log(`Seeded ${servicesData.crisisLines.length} crisis lines.`);

    // 4. Seed Providers
    console.log('Seeding providers...');
    for (const provider of servicesData.providers) {
      const existing = await strapi.documents('api::provider.provider').findMany({
        filters: { providerId: provider.id },
      });
      if (existing.length === 0) {
        const services = provider.services?.map((service) => ({
          serviceId: service.id,
          name: service.name,
          description: service.description,
          contact: service.contact
            ? {
                address: service.contact.address,
                phone: service.contact.phone,
                phones: service.contact.phones,
                email: service.contact.email,
                website: service.contact.website,
              }
            : undefined,
        }));

        await strapi.documents('api::provider.provider').create({
          data: {
            providerId: provider.id,
            name: provider.name,
            description: provider.description,
            services: services,
            contact: provider.contact
              ? {
                  address: provider.contact.address,
                  phone: provider.contact.phone,
                  phones: provider.contact.phones,
                  email: provider.contact.email,
                  website: provider.contact.website,
                }
              : undefined,
            publishedAt: new Date(),
          },
        });
      }
    }
    console.log(`Seeded ${servicesData.providers.length} providers.`);

    // 5. Seed Life Situations
    console.log('Seeding life situations...');
    for (let i = 0; i < servicesData.lifeSituations.length; i++) {
      const situation = servicesData.lifeSituations[i];
      const existing = await strapi.documents('api::life-situation.life-situation').findMany({
        filters: { situationId: situation.id },
      });
      if (existing.length === 0) {
        await strapi.documents('api::life-situation.life-situation').create({
          data: {
            situationId: situation.id,
            name: situation.name,
            providerRefs: situation.providerRefs,
            order: i,
            publishedAt: new Date(),
          },
        });
      }
    }
    console.log(`Seeded ${servicesData.lifeSituations.length} life situations.`);

    // 6. Seed Authorities
    console.log('Seeding authorities...');
    for (const authority of servicesData.authorities) {
      const existing = await strapi.documents('api::authority.authority').findMany({
        filters: { authorityId: authority.id },
      });
      if (existing.length === 0) {
        const departments = authority.departments?.map((dept) => ({
          departmentId: dept.id,
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
    }
    console.log(`Seeded ${servicesData.authorities.length} authorities.`);

    // 7. Seed Healthcare Providers
    console.log('Seeding healthcare providers...');
    let healthcareCount = 0;

    // Healthcare category type
    type HealthcareCategory = 'pediatrician' | 'generalPractitioner' | 'gynecology' | 'surgery' | 'cardiology' | 'ophthalmology' | 'pulmonary' | 'allergology' | 'rehabilitation' | 'ent' | 'dentist' | 'dentalHygiene' | 'physiotherapy' | 'optician' | 'pharmacy';

    // Helper function to seed healthcare entries
    async function seedHealthcareCategory(
      entries: HealthcareEntry[] | undefined,
      category: HealthcareCategory
    ) {
      if (!entries) return;
      for (const entry of entries) {
        const existing = await strapi
          .documents('api::healthcare-provider.healthcare-provider')
          .findMany({
            filters: { providerId: entry.id },
          });
        if (existing.length === 0) {
          await strapi.documents('api::healthcare-provider.healthcare-provider').create({
            data: {
              providerId: entry.id,
              name: entry.name,
              category: category,
              address: entry.address,
              phone: entry.phone,
              phones: entry.phones,
              website: entry.website,
              staff: entry.staff?.map((s) => ({
                name: s.name,
                phone: s.phone,
                specialty: s.specialty,
              })),
              publishedAt: new Date(),
            },
          });
          healthcareCount++;
        }
      }
    }

    // Seed all healthcare categories
    await seedHealthcareCategory(servicesData.healthcare.pediatricians, 'pediatrician');
    await seedHealthcareCategory(
      servicesData.healthcare.generalPractitioners,
      'generalPractitioner'
    );
    await seedHealthcareCategory(servicesData.healthcare.dentists, 'dentist');
    await seedHealthcareCategory(servicesData.healthcare.dentalHygiene, 'dentalHygiene');
    await seedHealthcareCategory(servicesData.healthcare.physiotherapy, 'physiotherapy');
    await seedHealthcareCategory(servicesData.healthcare.opticians, 'optician');
    await seedHealthcareCategory(servicesData.healthcare.pharmacies, 'pharmacy');

    // Seed specialists
    if (servicesData.healthcare.specialists) {
      for (const [key, entries] of Object.entries(servicesData.healthcare.specialists)) {
        const category = (specialtyMapping[key] || key) as HealthcareCategory;
        await seedHealthcareCategory(entries, category);
      }
    }

    console.log(`Seeded ${healthcareCount} healthcare providers.`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await strapi.destroy();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
