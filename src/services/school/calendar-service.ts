import dayjs from 'dayjs';
import { range } from 'fxjs';
import { CalendarCache } from '../../cache';
import { getDateByWeekday, MONTH_DATE } from '../../utils/date-util';

export const getThisWeekCalendar = async (): Promise<string[]> => {
  const calender = await CalendarCache.getCacheData();

  const result = range(0, 5).map((week: number) => {
    const thisWeeks = getDateByWeekday(week);

    // 다음달 학사일정
    if (thisWeeks > MONTH_DATE[dayjs().month()]) {
      const thisWeek = dayjs().date() + (week + 1 - dayjs().day());
      const thisDay = dayjs().set('date', thisWeek).date();
      return calender.nextMonth[thisDay];
    }

    // 이번달 학사일정
    return calender.thisMonth[thisWeeks];
  });

  return result;
};
