import express from 'express';
import { body } from 'express-validator';
import { requireAuthenticated, requirePermission } from '../middlewares/permission';
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
 * @api {get} /timetable 모든 시간표 데이터 가져오기
 * @apiName GetTimetables
 * @apiGroup Timetable
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 * @apiParam {String} key 검색 키(subject, teacher)
 * @apiParam {String} query 검색
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 시간표 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/', requireAuthenticated, requirePermission(['admin', 'teacher']), async (req, res) => {
  try {
    const { limit, offset, key, query } = req.query;

    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;

    const searchOption = (key && query) ? {
      key: key.toString() as any,
      query: query.toString()
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
 * @api {get} /timetable/:grade/:fullClass 이번주 시간표 가져오기
 * @apiName GetThisWeekTimetables
 * @apiGroup Timetable
 *
 * @apiParam {Number} grade 학년
 * @apiParam {Number} fullClass 반(1~9)
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 시간표 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/:grade/:fullClass', requireAuthenticated, async (req, res) => {
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

    logger.info('이번주 시간표를 불러왔습니다.');
  } catch (e) {
    logger.error('이번주 시간표를 불러오는 중 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const createTimetableValidator = [
  body('subject').isString(),
  body('teacher').isString(),
  body('url').isString()
];
/**
 * @api {post} /timetable 시간표 데이터 만들기
 * @apiName CreateTimetable
 * @apiGroup Timetable
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 시간표 데이터
 *
 * @apiError (Error 409) TIMETABLE_ALREADY_EXISTS 이미 존재하는 시간표입니다. 과목명, 선생님을 확인해주세요.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/',
  requireAuthenticated,
  requirePermission(['admin', 'teacher']),
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
 * @api {put} /timetable/:id 시간표 데이터 수정하기
 * @apiName UpdateTimetable
 * @apiGroup Timetable
 *
 * @apiParam {Number} id 시간표 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 시간표 데이터
 *
 * @apiError (Error 404) TIMETABLE_NOT_FOUND 존재하지 않는 시간표입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/:id',
  requireAuthenticated,
  requirePermission(['admin', 'teacher']),
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
 * @api {delete} /timetable/:id 시간표 데이터 삭제하기
 * @apiName UpdateTimetable
 * @apiGroup Timetable
 *
 * @apiParam {Number} id 시간표 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 시간표 데이터
 *
 * @apiError (Error 404) TIMETABLE_NOT_FOUND 존재하지 않는 시간표입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.delete('/:id',
  requireAuthenticated,
  requirePermission(['admin', 'teacher']),
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
