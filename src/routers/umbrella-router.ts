import express from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import {
  createUmbrella,
  getUmbrella,
  getUmbrellas,
  removeUmbrella,
  updateUmbrella
} from '../services/umbrella-service';
import { logger } from '../index';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { checkValidation } from '../middlewares/validator';
import { UmbrellaStatus } from '../types';
import ServiceException from '../exceptions';

const router = express.Router();

/**
 * @api {get} /umbrella Get Umbrellas
 * @apiName GetUmbrellas
 * @apiGroup Umbrella
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 모든 우산 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/', requireAuthenticated, async (req, res) => {
  try {
    const data = await getUmbrellas();
    res.status(200).json({
      success: true,
      data
    });
    logger.info('전체 우산을 가져왔습니다.');
  } catch (e) {
    logger.error('전체 우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const getUmbrellaValidator = [
  param('name').isString()
];
/**
 * @api {get} /umbrella/:name Get Umbrella
 * @apiName GetUmbrella
 * @apiGroup Umbrella
 *
 * @apiParam {String} name 우산 이름
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 우산 데이터
 *
 * @apiError (Error 404) UMBRELLA_NOT_FOUND 존재하지 않는 우산입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/:name', getUmbrellaValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { name } = req.params;
    const data = await getUmbrella(name);

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${name} 우산을 가져왔습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const createUmbrellaValidator = [
  body('name').isString(),
  body('status').isIn(Object.values(UmbrellaStatus))
];
/**
 * @api {post} /umbrella Create Umbrella
 * @apiName CreateUmbrella
 * @apiGroup Umbrella
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 추가된 우산 데이터
 *
 * @apiError (Error 409) UMBRELLA_ALREADY_EXISTS 이미 존재하는 우산입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/', createUmbrellaValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { name, status } = req.body;

  try {
    const data = await createUmbrella(name, status);

    res.status(201).json({
      success: true,
      data
    });

    logger.info(`${name} 우산을 만들었습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 추가하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const updateUmbrellaValidator = [
  param('name').isString(),
  body('status').isIn(Object.values(UmbrellaStatus))
];
/**
 * @api {put} /umbrella/:name Update Umbrella
 * @apiName UpdateUmbrella
 * @apiGroup Umbrella
 *
 * @apiParam {String} name 우산 이름
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 수정된 우산 데이터
 *
 * @apiError (Error 404) UMBRELLA_NOT_FOUND 존재하지 않는 우산입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/:name', updateUmbrellaValidator, checkValidation, requireAuthenticated,
  async (req: express.Request, res: express.Response) => {
    const { name } = req.params;
    const { status } = req.body;
    try {
      const data = await updateUmbrella(name, status);

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${name} 우산을 수정했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('우산을 수정하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const removeUmbrellaValidator = [
  param('name').isString()
];
/**
 * @api {delete} /umbrella/:name Delete Umbrella
 * @apiName DeleteUmbrella
 * @apiGroup Umbrella
 *
 * @apiParam {String} name 우산 이름
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 삭제된 우산 데이터
 *
 * @apiError (Error 404) UMBRELLA_NOT_FOUND 존재하지 않는 우산입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.delete('/:name', removeUmbrellaValidator, checkValidation, requireAuthenticated,
  async (req: express.Request, res: express.Response) => {
    const { name } = req.params;
    try {
      const data = await removeUmbrella(name);

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${name} 우산을 삭제했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('우산을 삭제하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

export default router;
