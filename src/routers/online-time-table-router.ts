import express from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import { logger } from '../index';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { checkValidation } from '../middlewares/validator';
import { DayWeekArray, TupleError } from '../types';
import {
  createOnlineTimeTable,
  getOnlineTimeTable,
  getOnlineTimeTables,
  removeOnlineTimeTable,
  updateOnlineTimeTable
} from '../services/online-time-table-service';

const router = express.Router();

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
router.get('/:id', getOnlineTimeTableValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const data = await getOnlineTimeTable(parseInt(id, 10));

    if (!data) {
      res.status(404).json(makeError(ErrorMessage.ONLINETIMETABLE_NOT_FOUND));
      return;
    }

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 온라인 시간표를 가져왔습니다.`);
  } catch (e) {
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

    if (!data) {
      res.status(404).json(makeError(ErrorMessage.SUBJECT_NOT_FOUND));
      return;
    }

    res.status(201).json({
      success: true,
      data
    });

    logger.info('새로운 온라인 시간표를 만들었습니다.');
  } catch (e) {
    logger.error('온라인 시간표를 추가하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const updateOnlineTimeTableValidator = [
  param('id').isNumeric(),
  ...createOnlineTimeTableValidator
];
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

      if ((data as TupleError).prepareError) {
        res.status(404).json(makeError(ErrorMessage.SUBJECT_NOT_FOUND));
        return;
      }

      if ((data as TupleError).error) {
        res.status(404).json(makeError(ErrorMessage.ONLINETIMETABLE_NOT_FOUND));
        return;
      }

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${id} 온라인 시간표를 수정했습니다.`);
    } catch (e) {
      logger.error('온라인 시간표를 수정하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const removeOnlineTimeTableValidator = [
  param('id').isNumeric()
];
router.delete('/:id', removeOnlineTimeTableValidator, checkValidation, requireAuthenticated,
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
      const data = await removeOnlineTimeTable(parseInt(id, 10));

      if (!data) {
        res.status(404).json(makeError(ErrorMessage.ONLINETIMETABLE_NOT_FOUND));
        return;
      }

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${id} 온라인 시간표를 삭제했습니다.`);
    } catch (e) {
      logger.error('온라인 시간표를 삭제하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

export default router;
