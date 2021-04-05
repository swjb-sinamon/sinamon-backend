import { fetchCalendarCache, fetchDustCache, fetchMealCache, fetchWeatherCache } from './api-cache';

export const initApiCache = async (): Promise<void> => {
  await fetchWeatherCache();
  await fetchDustCache();
  await fetchMealCache();
  await fetchCalendarCache();
};
