import axios from 'axios';
import { redisUtil } from '../index';
import config from '../config';
import { ComciganTimetable, DustPayload, WeatherPayload } from '../types';
import school from '../utils/school-lib';
import { getTimetableInstance } from '../utils/timetable-lib';

const WEATHER_KEY = 'weather';
const DUST_KEY = 'dust';
const MEAL_KEY = 'meal';
const CALENDAR_KEY = 'calendar';
const TIMETALBE_KEY = 'timetable';

export const fetchWeatherCache = async (): Promise<void> => {
  const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Suwon,KR&appid=${config.openWeatherApiKey}&units=metric`);
  const data = {
    status: result.data.weather[0].main.toUpperCase(),
    temp: Math.floor(result.data.main.temp)
  };

  await redisUtil.setAsync(WEATHER_KEY, JSON.stringify(data));
};

export const getWeatherCache = async (): Promise<WeatherPayload> => {
  const current = await redisUtil.getAsync(WEATHER_KEY);

  if (!current) {
    await fetchWeatherCache();
  }

  const result = await redisUtil.getAsync(WEATHER_KEY);
  return JSON.parse(result as string);
};

export const fetchDustCache = async (): Promise<void> => {
  let url = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
  url += `?serviceKey=${config.dustApiKey}`;
  url += '&returnType=json';
  url += '&numOfRows=1';
  url += '&pageNo=1';
  url += `&stationName=${encodeURI('인계동')}`;
  url += '&dataTerm=DAILY';
  url += '&ver=1.0';

  const result = await axios.get(url);
  const response = result.data.response.body.items[0];

  const data = {
    pm25: parseInt(response.pm25Value, 10),
    pm10: parseInt(response.pm10Value, 10)
  };

  await redisUtil.setAsync(DUST_KEY, JSON.stringify(data));
};

export const getDustCache = async (): Promise<DustPayload> => {
  const current = await redisUtil.getAsync(DUST_KEY);

  if (!current) {
    await fetchDustCache();
  }

  const result = await redisUtil.getAsync(DUST_KEY);
  return JSON.parse(result as string);
};

export const fetchMealCache = async (): Promise<void> => {
  const meal = await school.getMeal({ default: '오늘 급식이 없습니다.' });
  await redisUtil.setAsync(MEAL_KEY, JSON.stringify(meal));
};

export const getMealCache = async (): Promise<any> => {
  const current = await redisUtil.getAsync(MEAL_KEY);

  if (!current) {
    await fetchMealCache();
  }

  const result = await redisUtil.getAsync(MEAL_KEY);
  return JSON.parse(result as string);
};

export const fetchCalendarCache = async (): Promise<void> => {
  const data = await school.getCalendar();
  await redisUtil.setAsync(CALENDAR_KEY, JSON.stringify(data));
};

export const getCalendarCache = async (): Promise<any> => {
  const current = await redisUtil.getAsync(CALENDAR_KEY);

  if (!current) {
    await fetchCalendarCache();
  }

  const result = await redisUtil.getAsync(CALENDAR_KEY);
  return JSON.parse(result as string);
};

type TimetableType = Record<string, // Grade
  Record<string, // fullClass
    ComciganTimetable[][]>>; // thisWeek

export const fetchTimetableCache = async (): Promise<void> => {
  const timetable = await getTimetableInstance();
  const data = await timetable.getTimetable();
  await redisUtil.setAsync(TIMETALBE_KEY, JSON.stringify(data));
};

export const getTimetableCache = async (): Promise<TimetableType> => {
  const current = await redisUtil.getAsync(TIMETALBE_KEY);

  if (!current) {
    await fetchTimetableCache();
  }

  const result = await redisUtil.getAsync(TIMETALBE_KEY);
  return JSON.parse(result as string);
};
