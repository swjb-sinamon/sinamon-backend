import dayjs from 'dayjs';
import { ApiCache } from './api-cache';
import school from '../utils/school-lib';
import { redisUtil } from '../index';

interface ReturnData {
  readonly thisMonth: any;
  readonly nextMonth: any;
}

class CalendarCache implements ApiCache<ReturnData> {
  readonly cacheKey: string = 'calendar';

  async fetchCache(): Promise<void> {
    const nextMonth = await school.getCalendar(dayjs().year(), dayjs().month() + 2);
    const thisMonth = await school.getCalendar(dayjs().year(), dayjs().month() + 1);

    const data = {
      thisMonth,
      nextMonth
    };

    await redisUtil.setAsync(this.cacheKey, JSON.stringify(data));
  }

  async getCacheData(): Promise<ReturnData> {
    const current = await redisUtil.getAsync(this.cacheKey);

    if (!current) {
      await this.fetchCache();
    }

    const result = await redisUtil.getAsync(this.cacheKey);
    return JSON.parse(result as string);
  }
}

export default new CalendarCache();
