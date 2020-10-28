import express from 'express';
import { body, param, query } from 'express-validator';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { requireAuthenticated } from '../middlewares/permission';
import {
  createUmbrella,
  getNoRentalUmbrellas,
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
import { qrKey } from '../managers/qr-crypto';
import { borrowRental } from '../services/rental-service';

const router = express.Router();

const getUmbrellasValidator = [
  query('rental').isBoolean()
];
/**
 * @api {get} /umbrella?rental=:rental Get Umbrellas
 * @apiName GetUmbrellas
 * @apiGroup Umbrella
 *
 * @apiParam {Boolean} rental 빌려간 우산을 포함할지 안할지 (false일시 미포함)
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 모든 우산 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/', getUmbrellasValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { rental } = req.query;

  const rentalQuery = rental || 'false';
  const isRental = rentalQuery.toString().toLowerCase() === 'true';

  try {
    logger.info('전체 우산을 가져왔습니다.');

    if (isRental) {
      const data = await getUmbrellas();
      res.status(200).json({
        success: true,
        data
      });
      return;
    }

    const data = await getNoRentalUmbrellas();
    res.status(200).json({
      success: true,
      data
    });
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

const qrRentalValidator = [
  body('data').isString(),
  body('umbrellaName').isString()
];
router.post('/qr', qrRentalValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { data, umbrellaName } = req.body;

  if (!req.user) return;
  const { user }: any = req;

  const passDecipher = crypto.createDecipher('aes-256-cbc', qrKey);
  let plain = passDecipher.update(data, 'base64', 'utf8');
  plain += passDecipher.final('utf8');

  const decodeData: {
    uuid: string;
    email: string;
    createdAt: number;
    expiresIn: number;
  } = JSON.parse(plain);

  const now = dayjs().unix();

  if (now > decodeData.expiresIn) {
    logger.warn(`${user.uuid} ${user.email} 사용자가 만료된 QR코드를 사용했습니다.`);
    res.status(401).json(makeError(ErrorMessage.QRCODE_EXPIRE));
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    await borrowRental({
      lender: decodeData.uuid,
      umbrellaName,
      expiryDate: tomorrow
    });

    logger.info(`${user.uuid} 사용자가 ${decodeData.uuid} 사용자의 우산을 QR코드로 대여 처리하였습니다.`);

    res.status(200).json({
      success: true
    });
  } catch (e) {
    if (e instanceof ServiceException) {
      if (e.message === ErrorMessage.RENTAL_EXPIRE) {
        logger.warn(`연체된 ${decodeData.uuid} 사용자가 대여를 시도하였습니다.`);
      }

      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 QR코드를 이용하여 대여하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

export default router;
