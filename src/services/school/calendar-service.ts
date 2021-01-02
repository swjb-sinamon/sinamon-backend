import dayjs from 'dayjs';
import { range } from 'fxjs';
import school from '../../utils/school-lib';

export const getThisWeekCalendar = async (): Promise<string[]> => {
  const calender: any = await school.getCalendar();

  const result = range(0, 5)
    .map((v: string, i: number) => {
      const thisWeek = dayjs().date() + ((i + 1) - dayjs().day());
      const thisDay = dayjs()
        .set('date', thisWeek)
        .date();
      return calender[thisDay];
    });

  return result;
};
