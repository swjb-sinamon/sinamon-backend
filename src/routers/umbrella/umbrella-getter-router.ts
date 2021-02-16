import express from 'express';
import { param } from 'express-validator';
import { requireAuthenticated } from '../../middlewares/permission';
import {
  getBorrowedUmbrellas,
  getExpiryUmbrellas,
  getUmbrella,
  getUmbrellaAllData,
  getUmbrellas
} from '../../services/umbrella-service';
import { logger } from '../../index';
import { makeError } from '../../error/error-system';
import ErrorMessage from '../../error/error-message';
import { checkValidation } from '../../middlewares/validator';
import ServiceException from '../../exceptions';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: UmbrellaGetter
 *  description: 우산대여제 Getter
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
 *    UmbrellaWithRental:
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
 *        rental:
 *          type: object
 *          nullable: true
 *          properties:
 *            lender:
 *              type: string
 *              description: 대여자 UUID
 *            expiryDate:
 *              type: string
 *              description: 연체 날자
 *            isExpiry:
 *              type: boolean
 *              description: 연체 여부
 */

/**
 * @swagger
 * /umbrella:
 *  get:
 *    summary: 빌릴 수 있는 우산 가져오기
 *    tags: [UmbrellaGetter]
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: 한 페이지당 데이터 개수
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: 페이지
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        description: 검색어
 *    responses:
 *      200:
 *        description: 빌릴 수 있는 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Umbrella'
 */
router.get('/', requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  try {
    const { offset, limit, search } = req.query;

    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;
    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    const searchValue = search ? search.toString() : undefined;

    const { data, count } = await getUmbrellas(offsetValue, limitValue, searchValue);

    res.status(200).json({
      success: true,
      count,
      data
    });

    logger.info('빌릴 수 있는 전체 우산을 가져왔습니다.');
  } catch (e) {
    logger.error('빌릴 수 있는 전체 우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

/**
 * @swagger
 * /umbrella/rental:
 *  get:
 *    summary: 빌린 우산 가져오기
 *    tags: [UmbrellaGetter]
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: 한 페이지당 데이터 개수
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: 페이지
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        description: 검색어
 *    responses:
 *      200:
 *        description: 빌린 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Umbrella'
 */
router.get('/rental', requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  try {
    const { offset, limit, search } = req.query;

    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;
    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    const searchValue = search ? search.toString() : undefined;

    const { data, count } = await getBorrowedUmbrellas(
      offsetValue,
      limitValue,
      searchValue
    );

    res.status(200).json({
      success: true,
      count,
      data
    });

    logger.info('대여 상태인 전체 우산을 가져왔습니다.');
  } catch (e) {
    logger.error('대여 상태인 전체 우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

/**
 * @swagger
 * /umbrella/expiry:
 *  get:
 *    summary: 연체된 우산 가져오기
 *    tags: [UmbrellaGetter]
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: 한 페이지당 데이터 개수
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: 페이지
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        description: 검색어
 *    responses:
 *      200:
 *        description: 연체된 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Umbrella'
 */
router.get('/expiry', requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  try {
    const { offset, limit, search } = req.query;

    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;
    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    const searchValue = search ? search.toString() : undefined;

    const { data, count } = await getExpiryUmbrellas(
      offsetValue,
      limitValue,
      searchValue
    );

    res.status(200).json({
      success: true,
      count,
      data
    });

    logger.info('연체된 전체 우산을 가져왔습니다.');
  } catch (e) {
    logger.error('연체된 전체 우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

/**
 * @swagger
 * /umbrella/all:
 *  get:
 *    summary: 대여 정보를 포함한 모든 우산 가져오기
 *    tags: [UmbrellaGetter]
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: 한 페이지당 데이터 개수
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: 페이지
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        description: 검색어
 *    responses:
 *      200:
 *        description: 대여 정보를 포함한 모든 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UmbrellaWithRental'
 */
router.get('/all', requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  try {
    const { offset, limit, search } = req.query;

    const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;
    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    const searchValue = search ? search.toString() : undefined;

    const result = await getUmbrellaAllData(
      offsetValue,
      limitValue,
      searchValue
    );

    res.status(200).json({
      success: true,
      count: result.count,
      data: result.data
    });

    logger.info('대여 정보와 함께 전체 우산을 가져왔습니다.');
  } catch (e) {
    logger.error('대여 정보와 함께 전체 우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

/**
 * @swagger
 * /umbrella/{name}:
 *  get:
 *    summary: 우산 이름으로 가져오기
 *    tags: [UmbrellaGetter]
 *    parameters:
 *      - in: path
 *        name: name
 *        required: true
 *        schema:
 *          type: string
 *        description: 우산 이름
 *    responses:
 *      200:
 *        description: 우산 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Umbrella'
 */
const getUmbrellaValidator = [
  param('name').isString()
];
router.get('/:name', getUmbrellaValidator, checkValidation, requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
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

export default router;
