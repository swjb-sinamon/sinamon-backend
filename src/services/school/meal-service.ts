import dayjs from 'dayjs';
import { MealCache } from '../../cache';

const deleteUnusedString = (original: string): string => {
  const result = original
    .replace('[중식]\n', '')
    .replace(/[0-9]/g, '')
    .replace(/\./g, '')
    .replace(/J/g, '')
    .replace(/H/g, '')
    .replace(/N/g, '')
    .replace(/\*/g, '')
    .replace('&amp;', '&')
	.replace('()', '');

  return result;
};

export const getTodayMeal = async (): Promise<string> => {
  const meal = await MealCache.getCacheData();
  return deleteUnusedString(meal.today);
};

export const getTomorrowMeal = async (): Promise<string> => {
  const tomorrowDay = dayjs().add(1, 'day').date();
  const meal = await MealCache.getCacheData();
  return deleteUnusedString(meal[tomorrowDay]);
};
