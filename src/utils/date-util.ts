import dayjs from 'dayjs';

type WeekIndex = 0 | 1 | 2 | 3 | 4; // 월, 화, 수, 목, 금

export const getDateByWeekday = (weekIndex: WeekIndex | number) =>
  dayjs().date() + (weekIndex + 1 - dayjs().day());

export const MONTH_DATE = [31, 28, 31, 30, 31, 30, 31, 30, 31, 31, 30, 31];
