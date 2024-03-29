import { CalendarCache, MealCache, WeatherCache } from './index';

export const initApiCache = async (): Promise<void> => {
  const cacheList = [WeatherCache, MealCache, CalendarCache];
  const run = cacheList.map(async (i) => {
    await i.fetchCache();
  });
  await Promise.all(run);
};
