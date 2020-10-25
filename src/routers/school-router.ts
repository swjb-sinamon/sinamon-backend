import express from 'express';
import { query } from 'express-validator';
import { getTodayMeal, getTomorrowMeal } from '../services/school/meal-service';
import { checkValidation } from '../middlewares/validator';
import { getThisWeekCalendar } from '../services/school/calendar-service';

const router = express.Router();

const mealValidator = [
  query('type').isString()
];
/**
 * @api {get} /meal?type=:type Get Meal
 * @apiName GetMeal
 * @apiGroup School
 *
 * @apiParam {String} type today 또는 tomorrow
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {String} data 오늘 또는 내일 급식 데이터
 */
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

/**
 * @api {get} /calendar Get Calendar
 * @apiName GetCalendar
 * @apiGroup School
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Array} data 이번주 학사일정
 */
router.get('/calendar', async (req, res) => {
  const data = await getThisWeekCalendar();
  res.status(200).json({
    success: true,
    data
  });
});

export default router;
