import express from 'express';
import { Parser } from 'json2csv';
import { requireAuthenticated } from '../middlewares/permission';
import { logger } from '../index';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { addActivationCode, getActivationCodes } from '../services/activation-code-service';
import { sendCsv } from '../utils/router-util';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: ActivationCode
 *  description: 인증코드
 * components:
 *  schemas:
 *    ActivationCode:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: 인증코드 ID
 *        code:
 *          type: string
 *          description: 인증코드
 *        isUse:
 *          type: boolean
 *          description: 사용 여부
 *        useAt:
 *          type: string
 *          description: 사용 날짜
 *        createdAt:
 *          type: string
 *          description: 인증코드 발급일
 *        updatedAt:
 *          type: string
 *          description: 인증코드 수정일
 */

/**
 * @swagger
 * /code:
 *  get:
 *    summary: 모든 인증코드 가져오기
 *    tags: [ActivationCode]
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
 *    responses:
 *      200:
 *        description: 인증코드 데이터
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ActivationCode'
 */
router.get(
  '/',
  requireAuthenticated(['admin', 'teacher']),
  async (req: express.Request, res: express.Response) => {
    try {
      const { offset, limit } = req.query;

      const offsetValue = offset ? parseInt(offset.toString(), 10) : undefined;
      const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;

      const { count, data } = await getActivationCodes(offsetValue, limitValue);

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
  }
);

/**
 * @swagger
 * /code:
 *  post:
 *    summary: 인증코드 만들기
 *    tags: [ActivationCode]
 *    responses:
 *      200:
 *        description: 인증코드 데이터
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: string
 *                  description: 인증코드
 */
router.post(
  '/',
  requireAuthenticated(['admin', 'teacher']),
  async (req: express.Request, res: express.Response) => {
    try {
      const code = await addActivationCode();

      res.status(200).json({
        success: true,
        data: code.code
      });

      logger.info('인증코드를 만들었습니다.');
    } catch (e) {
      logger.error('인증코드를 만드는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  }
);

/**
 * @swagger
 * /code/csv:
 *  get:
 *    summary: 인증코드 CSV
 *    tags: [ActivationCode]
 *    responses:
 *      200:
 *        description: CSV 파일
 *        content:
 *          text/csv: {}
 */
router.get(
  '/csv',
  requireAuthenticated(['admin', 'teacher']),
  async (req: express.Request, res: express.Response) => {
    try {
      const code = await getActivationCodes();

      sendCsv(res, ['id', 'code', 'isUse', 'useAt'], code.data);

      logger.info('인증코드 CSV를 다운로드했습니다.');
    } catch (e) {
      logger.error('인증코드 CSV를 다운로드하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  }
);

export default router;
