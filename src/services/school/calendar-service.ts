import dayjs from 'dayjs';
import { range } from 'fxjs';
import { CalendarCache } from '../../cache';

const MonthDate = [31,28,31,30,31,30,31,30,31,31,30,31];
export const getThisWeekCalendar = async (): Promise<string[]> => {
  const calender = await CalendarCache.getCacheData();

  const result = range(0, 5).map((v: string, i: number) => {
    const thisWeeks = dayjs().date() + (i + 1 - dayjs().day());
    if(MonthDate[dayjs().month()]<thisWeeks){
      const thisWeek =  i + 1 - dayjs().day();
      const thisDay = dayjs().set('date', thisWeek).date();
      return calender[thisDay];
    }
      const thisWeek = dayjs().date() + (i + 1 - dayjs().day());
      const thisDay = dayjs().set('date', thisWeek).date();
      return calender[thisDay];
  
  });

  return result;
};