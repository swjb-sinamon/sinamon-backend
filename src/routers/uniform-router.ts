import express from 'express';
import { body, param, query } from 'express-validator';
import { checkValidation } from '../middlewares/validator';
import { requireAuthenticated, requirePermission } from '../middlewares/permission';
import ServiceException from '../exceptions';
import { makeError } from '../error/error-system';
import { logger } from '../index';
import ErrorMessage from '../error/error-message';
import {
  addUniformPersonalScore,
  addUniformScore, getUniformPersonalRank, getUniformPersonals,
  getUniforms, subUniformPersonalScore,
  subUniformScore
} from '../services/uniform-service';

const router = express.Router();

const getUniformsValidator = [
  param('grade').isNumeric(),
  param('fullClass').isNumeric()
];
/**
 * @api {get} /uniform/:grade/:fullClass 반별 교복데이 데이터 가져오기
 * @apiName GetUniformsByClass
 * @apiGroup Uniform
 *
 * @apiParam {Number} grade 학년
 * @apiParam {Number} fullClass 반 (1반 ~ 9반)
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/:grade/:fullClass',
  getUniformsValidator,
  checkValidation,
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const { grade, fullClass } = req.params;

    try {
      const result = await getUniforms(
        parseInt(grade, 10),
        parseInt(fullClass, 10)
      );

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info(`${grade}학년 ${fullClass}반 교복데이 데이터를 가져왔습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('반별 교복데이 데이터를 가져오는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const scoreValidator = [
  ...getUniformsValidator,
  query('date').isString()
];
/**
 * @api {put} /uniform/up/:grade/:fullClass?date=:date 반별 교복데이 점수 올리기
 * @apiName AddUniformScoreByClass
 * @apiGroup Uniform
 *
 * @apiParam {Number} grade 학년
 * @apiParam {Number} fullClass 반 (1반 ~ 9반)
 * @apiParam {String} date 날짜
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/up/:grade/:fullClass',
  scoreValidator,
  checkValidation,
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const { grade, fullClass } = req.params;

    const { date: originDate } = req.query;
    const date = new Date(originDate ? originDate.toString() : '');

    try {
      const result = await addUniformScore(
        parseInt(grade, 10),
        parseInt(fullClass, 10),
        date
      );

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info(`${grade}학년 ${fullClass}반 교복데이 점수를 올렸습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('반별 교복데이 점수를 올리는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

/**
 * @api {put} /uniform/down/:grade/:fullClass 반별 교복데이 점수 내리기
 * @apiName SubUniformScoreByClass
 * @apiGroup Uniform
 *
 * @apiParam {Number} grade 학년
 * @apiParam {Number} fullClass 반 (1반 ~ 9반)
 * @apiParam {String} date 날짜
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 409) UNIFORM_NOT_MINUS 점수를 더 내릴 수 없습니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/down/:grade/:fullClass',
  scoreValidator,
  checkValidation,
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const { grade, fullClass } = req.params;

    const { date: originDate } = req.query;
    const date = new Date(originDate ? originDate.toString() : '');

    try {
      const result = await subUniformScore(
        parseInt(grade, 10),
        parseInt(fullClass, 10),
        date
      );

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info(`${grade}학년 ${fullClass}반 교복데이 점수를 내렸습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('반별 교복데이 점수를 내리는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const getUniformPersonalsValidator = [
  query('date').isString()
];
/**
 * @api {get} /uniform/personal?date=:date&limit:limit&offset=:offset 날짜별 교복데이 데이터 가져오기
 * @apiName GetUniformPersonals
 * @apiGroup Uniform
 *
 * @apiParam {String} date 날짜 (필수)
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/personal',
  getUniformPersonalsValidator,
  checkValidation,
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const {
      date: oDate,
      offset,
      limit
    } = req.query;

    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;
    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    const date = new Date(oDate ? oDate.toString() : '');

    try {
      const { count, data } = await getUniformPersonals(
        date,
        offsetValue,
        limitValue
      );

      res.status(200).json({
        success: true,
        count,
        data
      });

      logger.info('개인별 교복데이 데이터를 날짜 기준으로 가져왔습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('개인별 교복데이 데이터를 날짜 기준으로 가져오는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

/**
 * @api {get} /uniform/prank?limit:limit&offset=:offset 개인별 교복데이 데이터 랭킹
 * @apiName GetUniformPersonalRank
 * @apiGroup Uniform
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/prank',
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const {
      offset,
      limit
    } = req.query;

    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;
    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;

    try {
      const { count, data } = await getUniformPersonalRank(
        offsetValue,
        limitValue
      );

      res.status(200).json({
        success: true,
        count,
        data
      });

      logger.info('개인별 교복데이 랭킹을 가져왔습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('개인별 교복데이 랭킹을 가져오는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const personalScoreValidator = [
  body('name').isString(),
  body('department').isNumeric(),
  body('grade').isNumeric(),
  body('class').isNumeric(),
  body('number').isNumeric(),
  body('date').isString()
];
/**
 * @api {put} /uniform/personal/up 개인별 교복데이 점수 올리기
 * @apiName AddUniformScoreByPersonal
 * @apiGroup Uniform
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/personal/up',
  personalScoreValidator,
  checkValidation,
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const { name, department, grade, class: clazz, number, date } = req.body;

    try {
      const result = await addUniformPersonalScore(
        name,
        department,
        grade,
        clazz,
        number,
        new Date(date)
      );

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info('개인별 교복데이 점수를 올렸습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('개인별 교복데이 점수를 올리는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

/**
 * @api {put} /uniform/personal/down 개인별 교복데이 점수 내리기
 * @apiName SubUniformScoreByPersonal
 * @apiGroup Uniform
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/personal/down',
  personalScoreValidator,
  checkValidation,
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const { name, department, grade, class: clazz, number, date } = req.body;

    try {
      const result = await subUniformPersonalScore(
        name,
        department,
        grade,
        clazz,
        number,
        new Date(date)
      );

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info('개인별 교복데이 점수를 내렸습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('개인별 교복데이 점수를 내리는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

export default router;
