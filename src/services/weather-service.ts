import axios from 'axios';
import config from '../config';

// eslint-disable-next-line import/prefer-default-export
export const getWeatherStatus = async (): Promise<string> => {
  const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Suwon,KR&appid=${config.openWeatherApiKey}&units=metric`);
  return result.data.weather[0].main.toUpperCase();
};
