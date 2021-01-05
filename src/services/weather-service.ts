import { DustPayload, WeatherPayload } from '../types';
import { getDustCache, getWeatherCache } from '../cache/api-cache';

export const getWeatherStatus = async (): Promise<WeatherPayload> => {
  const result = await getWeatherCache();
  return result;
};

export const getDustData = async (): Promise<DustPayload> => {
  const result = await getDustCache();
  return result;
};
