import express from 'express';
import { body } from 'express-validator';
import { checkValidation } from '../middlewares/validator';
import { requireAuthenticated } from '../middlewares/permission';
import ServiceException from '../exceptions';
import { makeError } from '../error/error-system';
import { logger } from '../index';
import ErrorMessage from '../error/error-message';
import { createOrUpdateFCMToken } from '../services/fcm-service';

const router = express.Router();

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

export default router;
