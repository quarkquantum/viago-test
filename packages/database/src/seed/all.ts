import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { keys } from '../../keys';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });

async function seedLanguages() {
  console.log('Seeding languages...');

  const languages = [
    { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      create: lang,
      update: lang,
    });
  }

  console.log(`Seeded ${languages.length} languages`);
}

async function seedCountries() {
  console.log('Seeding countries...');

  const countries = [
    {
      code: 'CM',
      name: 'Cameroon',
      native: 'Cameroun',
      emoji: '🇨🇲',
      emojiU: 'U+1F1E8 U+1F1F2',
      phoneCode: '+237',
      capital: 'Yaoundé',
      regionId: 'Africa',
      currencyCode: 'XAF',
      tld: '.cm',
      iso3: 'CMR',
      nationality: 'Cameroonian',
      latitude: 7.369_722,
      longitude: 12.354_722,
    },
    {
      code: 'SN',
      name: 'Senegal',
      native: 'Sénégal',
      emoji: '🇸🇳',
      emojiU: 'U+1F1F8 U+1F1F3',
      phoneCode: '+221',
      capital: 'Dakar',
      regionId: 'Africa',
      currencyCode: 'XOF',
      tld: '.sn',
      iso3: 'SEN',
      nationality: 'Senegalese',
      latitude: 14.497_401,
      longitude: -14.452_362,
    },
    {
      code: 'CI',
      name: "Côte d'Ivoire",
      native: "Côte d'Ivoire",
      emoji: '🇨🇮',
      emojiU: 'U+1F1E8 U+1F1EE',
      phoneCode: '+225',
      capital: 'Yamoussoukro',
      regionId: 'Africa',
      currencyCode: 'XOF',
      tld: '.ci',
      iso3: 'CIV',
      nationality: 'Ivorian',
      latitude: 7.539_988,
      longitude: -5.547_08,
    },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      create: country,
      update: country,
    });
  }

  console.log(`Seeded ${countries.length} countries`);
}

async function seedCities() {
  console.log('Seeding cities...');

  const cities = [
    // Cameroon
    { name: 'Douala', countryCode: 'CM', latitude: 4.0511, longitude: 9.7679 },
    { name: 'Yaoundé', countryCode: 'CM', latitude: 3.848, longitude: 11.5021 },
    { name: 'Bafoussam', countryCode: 'CM', latitude: 5.4777, longitude: 10.4176 },
    { name: 'Bamenda', countryCode: 'CM', latitude: 5.9534, longitude: 10.1603 },
    { name: 'Garoua', countryCode: 'CM', latitude: 9.3015, longitude: 13.3959 },
    { name: 'Kousséri', countryCode: 'CM', latitude: 12.0781, longitude: 15.0305 },
    { name: 'Kumba', countryCode: 'CM', latitude: 4.6373, longitude: 9.3124 },
    { name: 'Maroua', countryCode: 'CM', latitude: 10.591, longitude: 14.3159 },
    { name: 'Ngaoundéré', countryCode: 'CM', latitude: 7.3277, longitude: 13.5845 },
    { name: 'Buea', countryCode: 'CM', latitude: 4.1535, longitude: 9.2426 },
    { name: 'Edea', countryCode: 'CM', latitude: 3.8, longitude: 10.1333 },
    { name: 'Loum', countryCode: 'CM', latitude: 4.6167, longitude: 9.7333 },
    { name: 'Kpalimé', countryCode: 'CM', latitude: 6.9, longitude: 0.6333 },
    { name: 'Mbouda', countryCode: 'CM', latitude: 5.6333, longitude: 10.25 },
    { name: 'Dschang', countryCode: 'CM', latitude: 5.45, longitude: 9.8333 },
    { name: 'Ebolowa', countryCode: 'CM', latitude: 2.9, longitude: 11.15 },
    { name: 'Akonolinga', countryCode: 'CM', latitude: 3.7667, longitude: 12.35 },
    { name: 'Bafia', countryCode: 'CM', latitude: 4.7333, longitude: 11.2333 },
    { name: 'Wum', countryCode: 'CM', latitude: 6.3833, longitude: 10.0667 },
    { name: 'Bangangté', countryCode: 'CM', latitude: 5.15, longitude: 10.5167 },
    // Senegal
    { name: 'Dakar', countryCode: 'SN', latitude: 14.7167, longitude: -17.4677 },
    { name: 'Pikine', countryCode: 'SN', latitude: 14.75, longitude: -17.4 },
    { name: 'Touba', countryCode: 'SN', latitude: 14.85, longitude: -15.8833 },
    { name: 'Thiès', countryCode: 'SN', latitude: 14.7833, longitude: -16.9167 },
    { name: 'Saint-Louis', countryCode: 'SN', latitude: 16.0179, longitude: -16.4896 },
    { name: 'Kaolack', countryCode: 'SN', latitude: 14.15, longitude: -16.25 },
    { name: "M'backé", countryCode: 'SN', latitude: 14.8167, longitude: -16.2167 },
    { name: 'Diourbel', countryCode: 'SN', latitude: 14.65, longitude: -16.2333 },
    { name: 'Louga', countryCode: 'SN', latitude: 15.6167, longitude: -16.2333 },
    { name: 'Tambacounda', countryCode: 'SN', latitude: 13.7667, longitude: -13.6667 },
    // Côte d'Ivoire
    { name: 'Abidjan', countryCode: 'CI', latitude: 5.36, longitude: -4.0083 },
    { name: 'Bouaké', countryCode: 'CI', latitude: 7.69, longitude: -5.03 },
    { name: 'Daloa', countryCode: 'CI', latitude: 6.8774, longitude: -6.4502 },
    { name: 'Man', countryCode: 'CI', latitude: 7.4125, longitude: -7.5547 },
    { name: 'San-Pédro', countryCode: 'CI', latitude: 4.7485, longitude: -6.6833 },
    { name: 'Yamoussoukro', countryCode: 'CI', latitude: 6.82, longitude: -5.28 },
    { name: 'Divo', countryCode: 'CI', latitude: 5.8333, longitude: -5.3667 },
    { name: 'Korhogo', countryCode: 'CI', latitude: 9.46, longitude: -5.63 },
    { name: 'Gagnoa', countryCode: 'CI', latitude: 6.1319, longitude: -5.8778 },
    { name: 'Agboville', countryCode: 'CI', latitude: 5.9333, longitude: -4.2167 },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: city.name.toLowerCase().replace(/\s+/g, '-') + '-' + city.countryCode.toLowerCase() },
      create: {
        id: city.name.toLowerCase().replace(/\s+/g, '-') + '-' + city.countryCode.toLowerCase(),
        ...city,
      },
      update: city,
    });
  }

  console.log(`Seeded ${cities.length} cities`);
}

async function seedCurrencies() {
  console.log('Seeding currencies...');

  const currencies = [
    { id: 'XAF', code: 'XAF', name: 'Central African CFA franc', symbol: 'Fr' },
    { id: 'XOF', code: 'XOF', name: 'West African CFA franc', symbol: 'Fr' },
    { id: 'EUR', code: 'EUR', name: 'Euro', symbol: '€' },
    { id: 'USD', code: 'USD', name: 'US Dollar', symbol: '$' },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { id: currency.id },
      create: currency,
      update: currency,
    });
  }

  console.log(`Seeded ${currencies.length} currencies`);
}

async function seedAlphaUser() {
  console.log('Seeding alpha user...');

  const email = process.env.ALPHA_USER_EMAIL || 'admin@viago.com';
  const password = process.env.ALPHA_USER_PASSWORD || 'Admin123!';
  const fullName = process.env.ALPHA_USER_NAME || 'Admin';

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`Alpha user already exists: ${email}`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: nanoid(),
      email,
      fullName,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      profile: {
        create: {
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' ') || undefined,
          languageCode: 'fr',
        },
      },
    },
  });

  const hashedPassword = await hashPassword(password);

  await prisma.account.create({
    data: {
      id: nanoid(),
      userId: user.id,
      accountId: nanoid(),
      providerId: 'credential',
      password: hashedPassword,
    },
  });

  console.log('Alpha user created successfully!');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`User ID: ${user.id}`);
}

async function main() {
  console.log('Starting seed...\n');

  await seedLanguages();
  await seedCurrencies();
  await seedCountries();
  await seedCities();
  await seedAlphaUser();

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
