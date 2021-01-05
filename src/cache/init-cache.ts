import {
  fetchCalendarCache,
  fetchDustCache,
  fetchMealCache,
  fetchTimetableCache,
  fetchWeatherCache
} from './api-cache';

export const initApiCache = async (): Promise<void> => {
  await fetchWeatherCache();
  await fetchDustCache();
  await fetchMealCache();
  await fetchCalendarCache();
  await fetchTimetableCache();
};
