import express from 'express';
import { body, param } from 'express-validator';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { requireAuthenticated } from '../../middlewares/permission';
import { createUmbrella, removeUmbrella, updateUmbrella } from '../../services/umbrella-service';
import { logger } from '../../index';
import { makeError } from '../../error/error-system';
import ErrorMessage from '../../error/error-message';
import { checkValidation } from '../../middlewares/validator';
import { UmbrellaStatus } from '../../types';
import ServiceException from '../../exceptions';
import { qrKey } from '../../managers/qr-crypto';
import {
  borrowRentalBySchoolInfo,
  borrowRentalByUUID,
  returnRental,
  returnRentalBySchoolInfo
} from '../../services/rental-service';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Umbrella
 *  description: 우산대여제
 * components:
 *  schemas:
 *    Umbrella:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: 우산 이름
 *        status:
 *          type: string
 *          description: 우산 상태 (good OR worse)
 *        createdAt:
 *          type: string
 *          description: 데이터 생성일
 *        updatedAt:
 *          type: string
 *          description: 데이터 수정일
 */

/**
 * @swagger
 * /umbrella:
 *  post:
 *    summary: 우산 만들기
 *    tags: [Umbrella]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: 우산 이름
 *                example: 우산
 *              status:
 *                type: string
 *                enum: [good, worse]
 *                description: 우산 상태
 *    responses:
 *      201:
 *        description: 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Umbrella'
 */
const createUmbrellaValidator = [
  body('name').isString(),
  body('status').isIn(Object.values(UmbrellaStatus))
];
router.post('/', createUmbrellaValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
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

/**
 * @swagger
 * /umbrella/{name}:
 *  put:
 *    summary: 우산 수정하기
 *    tags: [Umbrella]
 *    parameters:
 *      - in: path
 *        name: name
 *        required: true
 *        schema:
 *          type: string
 *        description: 우산 이름
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: 우산 이름
 *                example: 우산
 *              status:
 *                type: string
 *                enum: [good, worse]
 *                description: 우산 상태
 *    responses:
 *      200:
 *        description: 수정된 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Umbrella'
 */
const updateUmbrellaValidator = [
  param('name').isString(),
  body('status').isIn(Object.values(UmbrellaStatus))
];
router.put('/:name', updateUmbrellaValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']),
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

/**
 * @swagger
 * /umbrella/{name}:
 *  delete:
 *    summary: 우산 삭제하기
 *    tags: [Umbrella]
 *    parameters:
 *      - in: path
 *        name: name
 *        required: true
 *        schema:
 *          type: string
 *        description: 우산 이름
 *    responses:
 *      200:
 *        description: 삭제된 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Umbrella'
 */
const removeUmbrellaValidator = [
  param('name').isString()
];
router.delete('/:name', removeUmbrellaValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']),
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

/**
 * @swagger
 * /umbrella/qr:
 *  post:
 *    summary: QR코드로 우산 빌리기
 *    tags: [Umbrella]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              data:
 *                type: string
 *                description: QR코드 데이터
 *              umbrellaName:
 *                type: string
 *                description: 대여할 우산
 *    responses:
 *      200:
 *        description: 우산 대여 성공
 */
const qrRentalValidator = [
  body('data').isString(),
  body('umbrellaName').isString()
];
router.post('/qr', qrRentalValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  const { data, umbrellaName } = req.body;

  if (!req.user) return;
  const { user }: any = req;

  let plain = '';

  try {
    const passDecipher = crypto.createDecipher('aes-256-cbc', qrKey);
    plain = passDecipher.update(data, 'base64', 'utf8');
    plain += passDecipher.final('utf8');
  } catch (e) {
    res.status(404).json(makeError(ErrorMessage.QRCODE_ERROR));
    return;
  }

  const decodeData: {
    uuid: string;
    id: string;
    createdAt: number;
    expiresIn: number;
  } = JSON.parse(plain);

  const now = dayjs().unix();

  if (now > decodeData.expiresIn) {
    logger.warn(`${user.uuid} ${user.id} 사용자가 만료된 QR코드를 사용했습니다.`);
    res.status(401).json(makeError(ErrorMessage.QRCODE_EXPIRE));
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19);

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

/**
 * @swagger
 * /umbrella/info:
 *  post:
 *    summary: 학번으로 우산 빌리기
 *    tags: [Umbrella]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: 이름
 *              department:
 *                type: integer
 *                description: 학과 (1~5)
 *              grade:
 *                type: integer
 *                description: 학년 (1~3)
 *              class:
 *                type: integer
 *                description: 반 (1~2)
 *              number:
 *                type: integer
 *                description: 번호
 *              umbrellaName:
 *                type: string
 *                description: 대여할 우산
 *    responses:
 *      200:
 *        description: 우산 대여 성공
 */
const infoRentalValidator = [
  body('name').isString(),
  body('department').isNumeric(),
  body('grade').isNumeric(),
  body('class').isNumeric(),
  body('number').isNumeric(),
  body('umbrellaName').isString()
];
router.post('/info', infoRentalValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  const { name, department, grade, class: clazz, number, umbrellaName } = req.body;

  if (!req.user) return;
  const { user }: any = req;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19);

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

/**
 * @swagger
 * /umbrella/return/qr:
 *  post:
 *    summary: QR코드로 우산 반납하기
 *    tags: [Umbrella]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              data:
 *                type: string
 *                description: QR코드 데이터
 *    responses:
 *      200:
 *        description: 우산 반납 성공
 */
const qrReturnValidator = [
  body('data').isString()
];
router.post('/return/qr', qrReturnValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  const { data } = req.body;

  if (!req.user) return;
  const { user }: any = req;

  let plain = '';
  try {
    const passDecipher = crypto.createDecipher('aes-256-cbc', qrKey);
    plain = passDecipher.update(data, 'base64', 'utf8');
    plain += passDecipher.final('utf8');
  } catch (e) {
    res.status(404).json(makeError(ErrorMessage.QRCODE_ERROR));
    return;
  }

  const decodeData: {
    uuid: string;
    id: string;
    createdAt: number;
    expiresIn: number;
  } = JSON.parse(plain);

  const now = dayjs().unix();

  if (now > decodeData.expiresIn) {
    logger.warn(`${user.uuid} ${user.id} 사용자가 만료된 QR코드를 사용했습니다.`);
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

/**
 * @swagger
 * /umbrella/return/info:
 *  post:
 *    summary: 학번으로 우산 반납하기
 *    tags: [Umbrella]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: 이름
 *              department:
 *                type: integer
 *                description: 학과 (1~5)
 *              grade:
 *                type: integer
 *                description: 학년 (1~3)
 *              class:
 *                type: integer
 *                description: 반 (1~2)
 *              number:
 *                type: integer
 *                description: 번호
 *    responses:
 *      200:
 *        description: 우산 반납 성공
 */
const infoReturnValidator = [
  body('name').isString(),
  body('department').isNumeric(),
  body('grade').isNumeric(),
  body('class').isNumeric(),
  body('number').isNumeric()
];
router.post('/return/info', infoReturnValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
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
