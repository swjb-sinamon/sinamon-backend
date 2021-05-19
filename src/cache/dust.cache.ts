import axios from 'axios';
import { ApiCache } from './api-cache';
import { DustPayload } from '../types';
import config from '../config';
import { redisUtil } from '../index';

class DustCache implements ApiCache<DustPayload> {
  readonly cacheKey: string = 'dust';

  async fetchCache(): Promise<void> {
    let url = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
    url += `?serviceKey=${config.dustApiKey}`;
    url += '&returnType=json';
    url += '&numOfRows=1';
    url += '&pageNo=1';
    url += `&stationName=${encodeURI('인계동')}`;
    url += '&dataTerm=DAILY';
    url += '&ver=1.0';

    const result = await axios.get(url);
    const response = result.data.response.body.items[0];

    const data = {
      pm25: parseInt(response.pm25Value, 10),
      pm10: parseInt(response.pm10Value, 10)
    };

    await redisUtil.setAsync(this.cacheKey, JSON.stringify(data));
  }

  async getCacheData(): Promise<DustPayload> {
    const current = await redisUtil.getAsync(this.cacheKey);

    if (!current) {
      await this.fetchCache();
    }

    const result = await redisUtil.getAsync(this.cacheKey);
    return JSON.parse(result as string);
  }
}

export default new DustCache();
