import { Seeder } from '../core';

interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isEnabled: boolean;
}

const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isEnabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', isEnabled: true },
];

export function createLanguagesSeeder() {
  const seeder = new Seeder<LanguageItem>({
    name: 'Languages',
    data: LANGUAGES,
    batchSize: 10,
    progressInterval: 10,
    processor: async (item, _index, prisma) => {
      await prisma.language.upsert({
        where: { code: item.code },
        update: item,
        create: item,
      });
    },
  });
  return () => seeder.run();
}
