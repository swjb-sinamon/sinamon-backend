import express from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import { logger } from '../index';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { checkValidation } from '../middlewares/validator';
import { DayWeekArray } from '../types';
import {
  createOnlineTimeTable,
  getOnlineTimeTable,
  getOnlineTimeTables,
  removeOnlineTimeTable,
  updateOnlineTimeTable
} from '../services/online-time-table-service';
import ServiceException from '../exceptions';

const router = express.Router();

/**
 * @api {get} /ott Get Onlinetimetables
 * @apiName GetOnlinetimetables
 * @apiGroup OnlineTimeTable
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 모든 온라인 시간표 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/', requireAuthenticated, async (req, res) => {
  try {
    const data = await getOnlineTimeTables();
    res.status(200).json({
      success: true,
      data
    });
    logger.info('전체 온라인 시간표를 가져왔습니다.');
  } catch (e) {
    logger.error('전체 온라인 시간표를 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const getOnlineTimeTableValidator = [
  param('id').isNumeric()
];
/**
 * @api {get} /ott/:id Get Onlinetimetable
 * @apiName GetOnlinetimetable
 * @apiGroup OnlineTimeTable
 *
 * @apiParam {Number} id 온라인 시간표 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 온라인 시간표 데이터
 *
 * @apiError (Error 404) ONLINETIMETABLE_NOT_FOUND 존재하지 않는 온라인 시간표입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/:id', getOnlineTimeTableValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const data = await getOnlineTimeTable(parseInt(id, 10));

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 온라인 시간표를 가져왔습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('온라인 시간표를 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const createOnlineTimeTableValidator = [
  body('subjectId').isNumeric(),
  body('teacher').isString(),
  body('type').isString(),
  body('url').isString(),
  body('startTime').isNumeric(), // unix time
  body('dayWeek').isIn(Object.values(DayWeekArray))
];
/**
 * @api {post} /ott Create Onlinetimetable
 * @apiName CreateOnlinetimetable
 * @apiGroup OnlineTimeTable
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 추가된 온라인 시간표 데이터
 *
 * @apiError (Error 404) SUBJECT_NOT_FOUND 존재하지 않는 과목입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/', createOnlineTimeTableValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { subjectId, teacher, type, url, startTime, dayWeek } = req.body;

  try {
    const data = await createOnlineTimeTable({
      subjectId: parseInt(subjectId, 10),
      teacher,
      type,
      url,
      startTime: new Date(parseInt(startTime, 10)),
      dayWeek
    });

    res.status(201).json({
      success: true,
      data
    });

    logger.info('새로운 온라인 시간표를 만들었습니다.');
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('온라인 시간표를 추가하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const updateOnlineTimeTableValidator = [
  param('id').isNumeric(),
  ...createOnlineTimeTableValidator
];
/**
 * @api {put} /ott/:id Update Onlinetimetable
 * @apiName UpdateOnlinetimetable
 * @apiGroup OnlineTimeTable
 *
 * @apiParam {Number} id 온라인 시간표 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 수정된 온라인 시간표 데이터
 *
 * @apiError (Error 404) ONLINETIMETABLE_NOT_FOUND 존재하지 않는 온라인 시간표입니다.
 * @apiError (Error 404) SUBJECT_NOT_FOUND 존재하지 않는 과목입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/:id', updateOnlineTimeTableValidator, checkValidation, requireAuthenticated,
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { subjectId, teacher, type, url, startTime, dayWeek } = req.body;

    try {
      const data = await updateOnlineTimeTable(parseInt(id, 10), {
        subjectId: parseInt(subjectId, 10),
        teacher,
        type,
        url,
        startTime: new Date(parseInt(startTime, 10)),
        dayWeek
      });

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${id} 온라인 시간표를 수정했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('온라인 시간표를 수정하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const removeOnlineTimeTableValidator = [
  param('id').isNumeric()
];
/**
 * @api {delete} /ott/:id Delete Onlinetimetable
 * @apiName DeleteOnlinetimetable
 * @apiGroup OnlineTimeTable
 *
 * @apiParam {Number} id 온라인 시간표 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 삭제된 온라인 시간표 데이터
 *
 * @apiError (Error 404) ONLINETIMETABLE_NOT_FOUND 존재하지 않는 온라인 시간표입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.delete('/:id', removeOnlineTimeTableValidator, checkValidation, requireAuthenticated,
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
      const data = await removeOnlineTimeTable(parseInt(id, 10));

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${id} 온라인 시간표를 삭제했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('온라인 시간표를 삭제하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

export default router;
