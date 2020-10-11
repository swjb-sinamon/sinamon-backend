import express from 'express';
import { query } from 'express-validator';
import { getTodayMeal, getTomorrowMeal } from '../services/school/meal-service';
import { checkValidation } from '../middlewares/validator';
import { getThisWeekCalender } from '../services/school/calender-service';

const router = express.Router();

const mealValidator = [
  query('type').isString()
];
router.get('/meal', mealValidator, checkValidation, async (req: express.Request, res: express.Response) => {
  const { type } = req.query;

  if (type === 'today') {
    const data = await getTodayMeal();
    res.status(200).json({
      success: true,
      data
    });
  } else {
    const data = await getTomorrowMeal();
    res.status(200).json({
      success: true,
      data
    });
  }
});

router.get('/calender', async (req, res) => {
  const data = await getThisWeekCalender();
  res.status(200).json({
    success: true,
    data
  });
});

export default router;
