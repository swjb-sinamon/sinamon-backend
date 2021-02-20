import express from 'express';
import { query } from 'express-validator';
import { getTodayMeal, getTomorrowMeal } from '../services/school/meal-service';
import { checkValidation } from '../middlewares/validator';
import { getThisWeekCalendar } from '../services/school/calendar-service';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: School
 *  description: 급식, 학사일정
 */

/**
 * @swagger
 * /meal:
 *  get:
 *    summary: 급식 가져오기
 *    tags: [School]
 *    parameters:
 *      - in: query
 *        name: type
 *        schema:
 *          type: string
 *          enum: [today, tomorrow]
 *        description: 오늘 또는 내일 급식
 *    responses:
 *      200:
 *        description: 급식 데이터
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 */
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

/**
 * @swagger
 * /calendar:
 *  get:
 *    summary: 학사일정 가져오기
 *    tags: [School]
 *    responses:
 *      200:
 *        description: 이번주 학사일정
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 */
router.get('/calendar', async (req, res) => {
  const data = await getThisWeekCalendar();
  res.status(200).json({
    success: true,
    data
  });
});

export default router;
