import dayjs from 'dayjs';
import school from '../../utils/school-lib';

// eslint-disable-next-line import/prefer-default-export
export const getThisWeekCalender = async (): Promise<string[]> => {
  const arr = ['', '', '', '', ''];
  const calender: any = await school.getCalendar();

  const result = arr.map((v, i) => {
    const thisWeek = dayjs().date() + (i - dayjs().day());
    const thisDay = dayjs()
      .set('date', thisWeek)
      .date();
    return calender[thisDay];
  });

  return result;
};
