import { ApiCache } from './api-cache';
import school from '../utils/school-lib';
import { redisUtil } from '../index';

class CalendarCache implements ApiCache<any> {
  readonly cacheKey: string = 'calendar';

  async fetchCache(): Promise<void> {
    const data = await school.getCalendar();
    await redisUtil.setAsync(this.cacheKey, JSON.stringify(data));
  }

  async getCacheData(): Promise<any> {
    const current = await redisUtil.getAsync(this.cacheKey);

    if (!current) {
      await this.fetchCache();
    }

    const result = await redisUtil.getAsync(this.cacheKey);
    return JSON.parse(result as string);
  }
}

export default new CalendarCache();
