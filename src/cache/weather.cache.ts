import axios from 'axios';
import { WeatherPayload } from '../types';
import { ApiCache } from './api-cache';
import config from '../config';
import { redisUtil } from '../index';

class WeatherCache implements ApiCache<WeatherPayload> {
  readonly cacheKey: string = 'weather';

  async fetchCache(): Promise<void> {
    const result = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Suwon,KR&appid=${config.openWeatherApiKey}&units=metric`
    );
    const data = {
      status: result.data.weather[0].main.toUpperCase(),
      temp: Math.floor(result.data.main.temp)
    };

    await redisUtil.setAsync(this.cacheKey, JSON.stringify(data));
  }

  async getCacheData(): Promise<WeatherPayload> {
    const current = await redisUtil.getAsync(this.cacheKey);

    if (!current) {
      await this.fetchCache();
    }

    const result = await redisUtil.getAsync(this.cacheKey);
    return JSON.parse(result as string);
  }
}

export default new WeatherCache();
