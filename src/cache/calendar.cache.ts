import dayjs from 'dayjs';
import { ApiCache } from './api-cache';
import school from '../utils/school-lib';
import { redisUtil } from '../index';

let i = 0;
const thisWeeks = dayjs().date() + (i + 1 - dayjs().day());
const MonthDate = [31,28,31,30,31,30,31,30,31,31,30,31];
class CalendarCache implements ApiCache<any> {
  readonly cacheKey: string = 'calendar';

  async fetchCache(): Promise<void> {
    
    if(thisWeeks>MonthDate[dayjs().month()]){
      const data = await school.getCalendar(dayjs().year(),dayjs().month()+2);
        await redisUtil.setAsync(this.cacheKey, JSON.stringify(data));
        // eslint-disable-next-line no-plusplus
        i++;
    }else{
      const data = await school.getCalendar(dayjs().year(),dayjs().month()+1);
      await redisUtil.setAsync(this.cacheKey, JSON.stringify(data));
      // eslint-disable-next-line no-plusplus
      i++;
    }
    if(i===6){
      i=0;
    }
    
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