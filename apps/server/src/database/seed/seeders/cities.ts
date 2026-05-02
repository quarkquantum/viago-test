import { prisma } from '@repo/database';
import type { SeederResult } from '../core';
import { Seeder } from '../core';
import cameroonCitiesData from '../data/cameroon_cities.json';

interface CityItem {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export function createCitiesSeeder() {
  return async (): Promise<SeederResult> => {
    const existing = await prisma.city.findMany({ select: { name: true } });
    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
    const processedNames = new Set<string>();

    const dedupedCities = (cameroonCitiesData as CityItem[]).filter((city) => {
      const normalized = city.name.toLowerCase();
      if (existingNames.has(normalized) || processedNames.has(normalized)) return false;
      processedNames.add(normalized);
      return true;
    });

    const seeder = new Seeder<CityItem>({
      name: 'Cities',
      data: dedupedCities,
      batchSize: 1,
      progressInterval: 100,
      processor: async (item, _index, prisma) => {
        await prisma.city.create({
          data: {
            name: item.name,
            countryCode: item.country,
            latitude: item.latitude,
            longitude: item.longitude,
          },
        });
      },
    });

    return seeder.run();
  };
}
