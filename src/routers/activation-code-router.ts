import express from 'express';
import { requireAuthenticated, requirePermission } from '../middlewares/permission';
import { logger } from '../index';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { getActivationCodes } from '../services/activation-code-service';

const router = express.Router();

/**
 * @api {get} /code?limit=:limit&offset=:offset 모든 인증코드 가져오기
 * @apiName GetActivationCodes
 * @apiGroup ActivationCode
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 모든 인증코드 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/', requireAuthenticated, requirePermission(['admin', 'teacher']), async (req: express.Request, res: express.Response) => {
  try {
    const { offset, limit } = req.query;
    const isPagination = offset !== undefined && limit !== undefined;

    const offsetValue = offset ? parseInt(offset.toString(), 10) : 0;
    const limitValue = limit ? parseInt(limit.toString(), 10) : 0;

    const { count, data } = await getActivationCodes(isPagination, offsetValue, limitValue);

    res.status(200).json({
      success: true,
      count,
      data
    });

    logger.info('전체 인증코드를 가져왔습니다.');
  } catch (e) {
    logger.error('전체 인증코드를 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

export default router;
