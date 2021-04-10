import { DustPayload, WeatherPayload } from '../types';
import { DustCache, WeatherCache } from '../cache';

export const getWeatherStatus = async (): Promise<WeatherPayload> => {
  const result = await WeatherCache.getCacheData();
  return result;
};

export const getDustData = async (): Promise<DustPayload> => {
  const result = await DustCache.getCacheData();
  return result;
};
