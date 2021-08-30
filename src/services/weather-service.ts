import { WeatherPayload } from '../types';
import { WeatherCache } from '../cache';

export const getWeatherStatus = async (): Promise<WeatherPayload> => {
  const result = await WeatherCache.getCacheData();
  return result;
};
