import express from 'express';
import { getDustData, getWeatherStatus } from '../services/weather-service';

const router = express.Router();

/**
 * @api {get} /weather Get Weather
 * @apiName GetWeather
 * @apiGroup Weather
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {String} data 오늘 날씨 상태
 */
router.get('/', async (req: express.Request, res: express.Response) => {
  const data = await getWeatherStatus();
  res.status(200).json({
    success: true,
    data
  });
});

/**
 * @api {get} /weather/dust Get Dust
 * @apiName GetDust
 * @apiGroup Weather
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 오늘 미세먼지, 초미세먼지 상태
 */
router.get('/dust', async (req: express.Request, res: express.Response) => {
  const data = await getDustData();
  res.status(200).json({
    success: true,
    data
  });
});

export default router;
