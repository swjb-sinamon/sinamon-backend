import express from 'express';
import { body } from 'express-validator';
import { checkValidation } from '../middlewares/validator';
import { requireAuthenticated } from '../middlewares/permission';
import ServiceException from '../exceptions';
import { makeError } from '../error/error-system';
import { logger } from '../index';
import ErrorMessage from '../error/error-message';
import { createOrUpdateFCMToken, subscribeAllTopic } from '../services/fcm-service';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: FCM
 *  description: 푸시알림
 * components:
 *  schemas:
 *    FCM:
 *      type: object
 *      properties:
 *        uuid:
 *          type: string
 *          description: 유저 UUID
 *        token:
 *          type: string
 *          description: FCM registration token
 *        createdAt:
 *          type: string
 *          description: Token 생성일
 *        updatedAt:
 *          type: string
 *          description: Token 수정일
 */

/**
 * @swagger
 * /fcm:
 *  post:
 *    summary: 자기 자신의 토큰을 등록하거나 업데이트하기
 *    tags: [FCM]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *                description: FCM registration token
 *    responses:
 *      200:
 *        description: FCM 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FCM'
 */

const fcmValidator = [
  body('token').isString()
];
router.post('/',
  fcmValidator,
  checkValidation,
  requireAuthenticated(),
  async (req: express.Request, res: express.Response) => {
    try {
      const { token } = req.body;
      const { user } = req;
      if (!user) return;

      const data = await createOrUpdateFCMToken(user.uuid, token);

      res.status(200).json({
        success: true,
        data
      });
    } catch (e) {
      logger.error('FCM Token 등록 중 오류가 발생하였습니다.', e);

      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

/**
 * @swagger
 * /fcm/subscribe:
 *  post:
 *    summary: 전체 푸시 알림을 위한 구독하기
 *    tags: [FCM]
 *    responses:
 *      200:
 *        description: 처리 완료 여부
 *        content:
 *          application/json:
 *            schema:
 *              type: boolean
 */
router.post('/subscribe', requireAuthenticated(), async (req: express.Request, res: express.Response) => {
  try {
    const { user } = req;
    if (!user) return;

    await subscribeAllTopic(user.uuid);

    logger.info(`${user.uuid} 사용자가 전체 푸시 알림을 구독했습니다.`);

    res.status(200).json({
      success: true
    });
  } catch (e) {
    logger.error('전체 푸시 알림 구독 중 오류가 발생하였습니다.', e);

    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

export default router;
