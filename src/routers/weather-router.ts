import express from 'express';
import { getWeatherStatus } from '../services/weather-service';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Weather
 *  description: 날씨, 미세먼지
 */

/**
 * @swagger
 * /weather:
 *  get:
 *    summary: 날씨 정보 가져오기
 *    tags: [Weather]
 *    responses:
 *      200:
 *        description: 오늘 날씨 정보
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 */
router.get('/', async (req: express.Request, res: express.Response) => {
  const data = await getWeatherStatus();
  res.status(200).json({
    success: true,
    data
  });
});

export default router;
