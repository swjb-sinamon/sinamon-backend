import dayjs from 'dayjs';
import { range } from 'fxjs';
import { CalendarCache } from '../../cache';

export const getThisWeekCalendar = async (): Promise<string[]> => {
  const calender = await CalendarCache.getCacheData();

  const result = range(0, 5).map((v: string, i: number) => {
    const thisWeek = dayjs().date() + (i + 1 - dayjs().day());
    const thisDay = dayjs().set('date', thisWeek).date();
    return calender[thisDay];
  });

  return result;
};
