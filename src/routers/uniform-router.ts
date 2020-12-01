import express from 'express';
import { param, query } from 'express-validator';
import { checkValidation } from '../middlewares/validator';
import { requireAuthenticated, requirePermission } from '../middlewares/permission';
import ServiceException from '../exceptions';
import { makeError } from '../error/error-system';
import { logger } from '../index';
import ErrorMessage from '../error/error-message';
import { addUniformScore, getUniforms, subUniformScore } from '../services/uniform-service';

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

export default router;
