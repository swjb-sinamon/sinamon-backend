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
import {
  borrowRentalBySchoolInfo,
  borrowRentalByUUID,
  returnRental,
  returnRentalBySchoolInfo
} from '../services/rental-service';

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
/**
 * @api {post} /umbrella/qr Borrow Umbrella with QRCode
 * @apiName BorrowUmbrellawithQRCode
 * @apiGroup Umbrella
 *
 * @apiSuccess {Boolean} success 성공 여부
 *
 * @apiError (Error 401) QRCODE_EXPIRE QR코드 유효기간이 지났습니다.
 * @apiError (Error 404) UMBRELLA_NOT_FOUND 존재하지 않는 우산입니다.
 * @apiError (Error 403) RENTAL_EXPIRE 우산 대여가 연체된 학생입니다.
 * @apiError (Error 409) RENTAL_USER_ALREADY_EXISTS 이미 우산을 대여한 학생입니다.
 * @apiError (Error 409) RENTAL_UMBRELLA_ALREADY_EXISTS 누군가 대여한 우산입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
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
    await borrowRentalByUUID(decodeData.uuid, {
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

const infoRentalValidator = [
  body('name').isString(),
  body('department').isNumeric(),
  body('grade').isNumeric(),
  body('class').isNumeric(),
  body('number').isNumeric(),
  body('umbrellaName').isString()
];
/**
 * @api {post} /umbrella/info Borrow Umbrella with Manual
 * @apiName BorrowUmbrellawithManual
 * @apiGroup Umbrella
 *
 * @apiSuccess {Boolean} success 성공 여부
 *
 * @apiError (Error 404) USER_NOT_FOUND 존재하지 않는 사용자입니다.
 * @apiError (Error 404) UMBRELLA_NOT_FOUND 존재하지 않는 우산입니다.
 * @apiError (Error 403) RENTAL_EXPIRE 우산 대여가 연체된 학생입니다.
 * @apiError (Error 409) RENTAL_USER_ALREADY_EXISTS 이미 우산을 대여한 학생입니다.
 * @apiError (Error 409) RENTAL_UMBRELLA_ALREADY_EXISTS 누군가 대여한 우산입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/info', infoRentalValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { name, department, grade, class: clazz, number, umbrellaName } = req.body;

  if (!req.user) return;
  const { user }: any = req;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    await borrowRentalBySchoolInfo(
      name,
      parseInt(department, 10),
      parseInt(grade, 10),
      parseInt(clazz, 10),
      parseInt(number, 10),
      {
        umbrellaName,
        expiryDate: tomorrow
      }
    );

    logger.info(`${user.uuid} 사용자가 ${name} 사용자의 우산을 학번으로 대여 처리하였습니다.`);

    res.status(200).json({
      success: true
    });
  } catch (e) {
    if (e instanceof ServiceException) {
      if (e.message === ErrorMessage.RENTAL_EXPIRE) {
        logger.warn(`연체된 ${name} 사용자가 대여를 시도하였습니다.`);
      }

      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 학번을 이용하여 대여하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const qrReturnValidator = [
  body('data').isString()
];
/**
 * @api {post} /umbrella/return/qr Return Umbrella with QRCode
 * @apiName ReturnUmbrellawithQRCode
 * @apiGroup Umbrella
 *
 * @apiSuccess {Boolean} success 성공 여부
 *
 * @apiError (Error 401) QRCODE_EXPIRE QR코드 유효기간이 지났습니다.
 * @apiError (Error 404) USER_NOT_FOUND 존재하지 않는 사용자입니다.
 * @apiError (Error 404) RENTAL_NOT_FOUND 존재하지 않는 대여 정보입니다.
 * @apiError (Error 403) RENTAL_EXPIRE 우산 대여가 연체된 학생입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/return/qr', qrReturnValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { data } = req.body;

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

  try {
    await returnRental(decodeData.uuid);

    logger.info(`${user.uuid} 사용자가 ${decodeData.uuid} 사용자의 우산을 QR코드로 반납 처리하였습니다.`);

    res.status(200).json({
      success: true
    });
  } catch (e) {
    if (e instanceof ServiceException) {
      if (e.message === ErrorMessage.RENTAL_EXPIRE) {
        logger.warn(`연체된 ${decodeData.uuid} 사용자가 반납을 시도하였습니다.`);
      }

      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 QR코드를 이용하여 반납하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const infoReturnValidator = [
  body('name').isString(),
  body('department').isNumeric(),
  body('grade').isNumeric(),
  body('class').isNumeric(),
  body('number').isNumeric()
];
/**
 * @api {post} /umbrella/return/info Return Umbrella with Manual
 * @apiName ReturnUmbrellawithManual
 * @apiGroup Umbrella
 *
 * @apiSuccess {Boolean} success 성공 여부
 *
 * @apiError (Error 404) USER_NOT_FOUND 존재하지 않는 사용자입니다.
 * @apiError (Error 404) RENTAL_NOT_FOUND 존재하지 않는 대여 정보입니다.
 * @apiError (Error 403) RENTAL_EXPIRE 우산 대여가 연체된 학생입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/return/info', infoReturnValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { name, department, grade, class: clazz, number } = req.body;

  if (!req.user) return;
  const { user }: any = req;

  try {
    await returnRentalBySchoolInfo(
      name,
      parseInt(department, 10),
      parseInt(grade, 10),
      parseInt(clazz, 10),
      parseInt(number, 10)
    );

    logger.info(`${user.uuid} 사용자가 ${name} 사용자의 우산을 학번으로 반납 처리하였습니다.`);

    res.status(200).json({
      success: true
    });
  } catch (e) {
    if (e instanceof ServiceException) {
      if (e.message === ErrorMessage.RENTAL_EXPIRE) {
        logger.warn(`연체된 ${name} 사용자가 반납을 시도하였습니다.`);
      }

      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 학번을 이용하여 반납하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

export default router;
