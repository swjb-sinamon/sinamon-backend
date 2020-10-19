import express from 'express';
import { getDustData, getWeatherStatus } from '../services/weather-service';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  const data = await getWeatherStatus();
  res.status(200).json({
    success: true,
    data
  });
});

router.get('/dust', async (req: express.Request, res: express.Response) => {
  const data = await getDustData();
  res.status(200).json({
    success: true,
    data
  });
});

export default router;
