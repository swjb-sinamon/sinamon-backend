import { ApiCache } from './api-cache';
import school from '../utils/school-lib';
import { redisUtil } from '../index';

class MealCache implements ApiCache<any> {
  readonly cacheKey: string = 'meal';

  async fetchCache(): Promise<void> {
    const meal = await school.getMeal({ default: '오늘 급식이 없습니다.' });
    await redisUtil.setAsync(this.cacheKey, JSON.stringify(meal));
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

export default new MealCache();
