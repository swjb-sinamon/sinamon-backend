import dayjs from 'dayjs';
import { range } from 'fxjs';
import school from '../../utils/school-lib';

// eslint-disable-next-line import/prefer-default-export
export const getThisWeekCalender = async (): Promise<string[]> => {
  const calender: any = await school.getCalendar();

  const result = range(0, 5)
    .map((v: string, i: number) => {
      const thisWeek = dayjs().date() + (i - dayjs().day());
      const thisDay = dayjs()
        .set('date', thisWeek)
        .date();
      return calender[thisDay];
    });

  return result;
};
