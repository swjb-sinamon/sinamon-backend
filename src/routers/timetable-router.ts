import express from 'express';
import { body } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import {
  createTimetable,
  getThisWeekTimetables,
  getTimetables,
  removeTimetable,
  updateTimetable
} from '../services/school/timetable-service';
import ServiceException from '../exceptions';
import { makeError } from '../error/error-system';
import { logger } from '../index';
import ErrorMessage from '../error/error-message';
import { checkValidation } from '../middlewares/validator';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Timetable
 *  description: 시간표
 * components:
 *  schemas:
 *    Timetable:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: ID
 *        subject:
 *          type: string
 *          description: 과목명
 *        teacher:
 *          type: string
 *          description: 담당 선생님
 *        url:
 *          type: string
 *          description: Zoom 등의 학습 링크
 */

/**
 * @swagger
 * /timetable:
 *  get:
 *    summary: 모든 시간표 가져오기
 *    tags: [Timetable]
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: 한 페이지당 데이터 개수
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: 페이지
 *      - in: query
 *        name: key
 *        schema:
 *          type: string
 *          enum: [subject, teacher]
 *        description: 검색 조건 (과목명, 선생님)
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        description: 검색어
 *    responses:
 *      200:
 *        description: 시간표 데이터
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Timetable'
 */
router.get('/', requireAuthenticated(['admin', 'teacher']), async (req, res) => {
  try {
    const { limit, offset, key, search } = req.query;

    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;

    const searchOption = (key && search) ? {
      key: key.toString() as any,
      query: search.toString()
    } : undefined;

    const result = await getTimetables(
      offsetValue,
      limitValue,
      searchOption
    );

    res.status(200).json({
      success: true,
      count: result.count,
      data: result.data
    });

    logger.info('시간표 데이터를 불러왔습니다.');
  } catch (e) {
    logger.error('시간표 데이터를 불러오는 중 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

/**
 * @swagger
 * /timetable/{grade}/{fullClass}:
 *  get:
 *    summary: 학급의 이번주 시간표 가져오기
 *    tags: [Timetable]
 *    parameters:
 *      - in: path
 *        name: grade
 *        schema:
 *          type: integer
 *        description: 학년 (1~3)
 *      - in: path
 *        name: fullClass
 *        schema:
 *          type: integer
 *        description: 반 (1~9)
 *    responses:
 *      200:
 *        description: 학급의 이번주 시간표 데이터
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */
router.get('/:grade/:fullClass', requireAuthenticated(), async (req, res) => {
  try {
    const { grade, fullClass } = req.params;

    const data = await getThisWeekTimetables(
      parseInt(grade, 10),
      parseInt(fullClass, 10)
    );

    res.status(200).json({
      success: true,
      data
    });
  } catch (e) {
    logger.error('이번주 시간표를 불러오는 중 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

/**
 * @swagger
 * /timetable:
 *  post:
 *    summary: 시간표 만들기
 *    tags: [Timetable]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              subject:
 *                type: string
 *                description: 과목명
 *              teacher:
 *                type: string
 *                description: 담당 선생님
 *              url:
 *                type: string
 *                description: 학습 링크
 *    responses:
 *      201:
 *        description: 시간표 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Timetable'
 */
const createTimetableValidator = [
  body('subject').isString(),
  body('teacher').isString(),
  body('url').isString()
];
router.post('/',
  requireAuthenticated(['admin', 'teacher']),
  createTimetableValidator,
  checkValidation,
  async (req: express.Request, res: express.Response) => {
    try {
      const { subject, teacher, url } = req.body;

      const data = await createTimetable({
        subject,
        teacher,
        url
      });

      res.status(201).json({
        success: true,
        data
      });

      logger.info('시간표 데이터를 만들었습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('시간표 데이터를 만드는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

/**
 * @swagger
 * /timetable/{id}:
 *  put:
 *    summary: 시간표 수정하기
 *    tags: [Timetable]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        description: 수정할 시간표 ID
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              subject:
 *                type: string
 *                description: 과목명
 *              teacher:
 *                type: string
 *                description: 담당 선생님
 *              url:
 *                type: string
 *                description: 학습 링크
 *    responses:
 *      200:
 *        description: 시간표 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Timetable'
 */
router.put('/:id',
  requireAuthenticated(['admin', 'teacher']),
  createTimetableValidator,
  checkValidation,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { subject, teacher, url } = req.body;

      const data = await updateTimetable(
        parseInt(id, 10),
        {
          subject,
          teacher,
          url
        }
      );

      res.status(200).json({
        success: true,
        data
      });

      logger.info('시간표 데이터를 수정했습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('시간표 데이터를 수정하는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

/**
 * @swagger
 * /timetable/{id}:
 *  delete:
 *    summary: 시간표 삭제하기
 *    tags: [Timetable]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        description: 삭제할 시간표 ID
 *    responses:
 *      200:
 *        description: 시간표 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Timetable'
 */
router.delete('/:id',
  requireAuthenticated(['admin', 'teacher']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const data = await removeTimetable(parseInt(id, 10));

      res.status(200).json({
        success: true,
        data
      });

      logger.info('시간표 데이터를 삭제했습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('시간표 데이터를 삭제하는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

export default router;
