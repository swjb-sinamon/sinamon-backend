import express from 'express';
import { param } from 'express-validator';
import { requireAuthenticated } from '../../middlewares/permission';
import {
  getBorrowedUmbrellas,
  getExpiryUmbrellas,
  getUmbrella, getUmbrellaAllData, getUmbrellas
} from '../../services/umbrella-service';
import { logger } from '../../index';
import { makeError } from '../../error/error-system';
import ErrorMessage from '../../error/error-message';
import { checkValidation } from '../../middlewares/validator';
import ServiceException from '../../exceptions';

const router = express.Router();

/**
 * @api {get} /umbrella 빌릴 수 있는 우산 가져오기
 * @apiName GetUmbrellas
 * @apiGroup Umbrella
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 * @apiParam {String} search 검색
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 모든 우산 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
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
 * @api {get} /umbrella/rental 빌린 우산 가져오기
 * @apiName GetUmbrellasWithRental
 * @apiGroup Umbrella
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 * @apiParam {String} search 검색
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 모든 우산 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
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
 * @api {get} /umbrella/expiry 연체된 우산 가져오기
 * @apiName GetUmbrellasWithExpiry
 * @apiGroup Umbrella
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 * @apiParam {String} search 검색
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 연체된 모든 우산 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
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
 * @api {get} /umbrella/all?limit=:limit&offset=:offset&search=:search 대여 정보를 포함한 모든 우산 가져오기
 * @apiName GetUmbrellasWithRentalData
 * @apiGroup Umbrella
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 * @apiParam {String} search 검색
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 모든 대여 정보를 포함한 모든 우산 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
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
