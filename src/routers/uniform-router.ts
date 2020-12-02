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
  addUniformScore,
  getUniformPersonal,
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
 * @api {put} /uniform/:grade/:fullClass?date=:date 반별 교복데이 점수 올리기
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
router.put('/:grade/:fullClass',
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
 * @api {delete} /uniform/:grade/:fullClass 반별 교복데이 점수 내리기
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
router.delete('/:grade/:fullClass',
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

const getUniformPersonalValidator = [
  query('name').isString(),
  query('department').isNumeric(),
  query('grade').isNumeric(),
  query('class').isNumeric(),
  query('number').isNumeric(),
  query('date').isString()
];
/* eslint-disable max-len */ // For apidoc
/**
 * @api {get} /uniform/personal?name=:name&department=:department&grade=:grade&class=:class&number=:number&date=:date 개인별 교복데이 데이터 가져오기
 * @apiName GetUniformPersonalByInfo
 * @apiGroup Uniform
 *
 * @apiParam {String} name 이름
 * @apiParam {Number} department 학과
 * @apiParam {Number} grade 학년
 * @apiParam {Number} class 반 (1~2)
 * @apiParam {Number} number 번호
 * @apiParam {String} date 날짜
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 교복데이 데이터
 *
 * @apiError (Error 404) UNIFORM_NOT_FOUND 존재하지 않는 교복데이 데이터입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/personal',
  getUniformPersonalValidator,
  checkValidation,
  requireAuthenticated,
  requirePermission(['admin', 'teacher', 'schoolunion']),
  async (req: express.Request, res: express.Response) => {
    const {
      name: oName,
      department: oDepartment,
      grade: oGrade,
      class: oClass,
      number: oNumber,
      date: oDate
    } = req.query;

    const name = oName ? oName.toString() : '';
    const department = oDepartment ? parseInt(oDepartment.toString(), 10) : 0;
    const grade = oGrade ? parseInt(oGrade.toString(), 10) : 0;
    const clazz = oClass ? parseInt(oClass.toString(), 10) : 0;
    const number = oNumber ? parseInt(oNumber.toString(), 10) : 0;
    const date = new Date(oDate ? oDate.toString() : '');

    try {
      const result = await getUniformPersonal(
        name,
        department,
        grade,
        clazz,
        number,
        date
      );

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info('개인별 교복데이 데이터를 가져왔습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('개인별 교복데이 데이터를 가져오는 중 오류가 발생하였습니다.');
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
