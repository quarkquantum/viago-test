import { Seeder } from '../core';
import countriesData from '../data/countries.json';

interface CountryItem {
  code: string;
  name: string;
  nativeName: string;
}

export function createCountriesSeeder() {
  const seeder = new Seeder<CountryItem>({
    name: 'Countries',
    data: countriesData as CountryItem[],
    batchSize: 50,
    progressInterval: 50,
    processor: async (item, _index, prisma) => {
      await prisma.country.upsert({
        create: { code: item.code, name: item.name, native: item.nativeName },
        update: { name: item.name, native: item.nativeName },
        where: { code: item.code },
      });
    },
  });
  return () => seeder.run();
}
