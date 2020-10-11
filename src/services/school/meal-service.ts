import dayjs from 'dayjs';
import school from '../../utils/school-lib';

const deleteUnusedString = (original: string): string => {
  const result = original
    .replace('[중식]\n', '')
    .replace(/[0-9]/g, '')
    .replace(/\./g, '')
    .replace(/J/g, '')
    .replace(/H/g, '')
    .replace(/\*/g, '')
    .replace('&amp;', '&');

  return result;
};

export const getTodayMeal = async (): Promise<string> => {
  const meal = await school.getMeal({ default: '오늘 급식이 없습니다.' });
  return deleteUnusedString(meal.today);
};

export const getTomorrowMeal = async (): Promise<string> => {
  const tomorrowDay = dayjs()
    .add(1, 'day')
    .format('D');
  const meal: any = await school.getMeal({ default: '내일 급식이 없습니다.' });
  return deleteUnusedString(meal[tomorrowDay]);
};
