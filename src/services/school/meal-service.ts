import dayjs from 'dayjs';
import { getMealCache } from '../../cache/api-cache';

const deleteUnusedString = (original: string): string => {
  const result = original
    .replace('[중식]\n', '')
    .replace(/[0-9]/g, '')
    .replace(/\./g, '')
    .replace(/J/g, '')
    .replace(/H/g, '')
    .replace(/N/g, '')
    .replace(/\*/g, '')
    .replace('&amp;', '&');

  return result;
};

export const getTodayMeal = async (): Promise<string> => {
  const meal = await getMealCache();
  return deleteUnusedString(meal.today);
};

export const getTomorrowMeal = async (): Promise<string> => {
  const tomorrowDay = dayjs()
    .add(1, 'date')
    .format('D');
  const meal = await getMealCache();
  return deleteUnusedString(meal[tomorrowDay]);
};
