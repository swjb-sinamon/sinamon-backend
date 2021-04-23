import dayjs from 'dayjs';
import { range } from 'fxjs';
import { CalendarCache } from '../../cache';
import { getDateByWeekday, MONTH_DATE } from '../../utils/date-util';

export const getThisWeekCalendar = async (): Promise<string[]> => {
  const calender = await CalendarCache.getCacheData();

  const result = range(0, 5).map((value: number) => {
    const thisWeeks = getDateByWeekday(value);

    if (MONTH_DATE[dayjs().month()] < thisWeeks) {
      const thisWeek = value + 1 - dayjs().day();
      const thisDay = dayjs().set('date', thisWeek).date();
      return calender[thisDay];
    }

    const thisWeek = dayjs().date() + (value + 1 - dayjs().day());
    const thisDay = dayjs().set('date', thisWeek).date();
    return calender[thisDay];
  });

  return result;
};
