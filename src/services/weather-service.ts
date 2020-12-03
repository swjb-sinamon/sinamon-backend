import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import config from '../config';

interface WeatherPayload {
  readonly status: string;
  readonly temp: number;
}

interface DustPayload {
  readonly pm25: number;
  readonly pm10: number;
}

export const getWeatherStatus = async (): Promise<WeatherPayload> => {
  const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Suwon,KR&appid=${config.openWeatherApiKey}&units=metric`);
  return {
    status: result.data.weather[0].main.toUpperCase(),
    temp: Math.floor(result.data.main.temp)
  };
};

export const getDustData = async (): Promise<DustPayload> => {
  const apiUrl = `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst?numOfRows=13&pageNo=1&sidoName=%EA%B2%BD%EA%B8%B0&searchCondition=HOUR&ServiceKey=${config.dustApiKey}`;
  const result = await axios.get(apiUrl);
  const xml = await parseStringPromise(result.data);

  const data = xml.response.body[0].items[0].item[12];
  const pm25 = data.pm25Value[0];
  const pm10 = data.pm10Value[0];

  return {
    pm25,
    pm10
  };
};
