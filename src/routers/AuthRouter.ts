import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import { makeError, makeValidationError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';

const router = express.Router();

const loginValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
];
router.post('/login', loginValidator, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(makeValidationError(errors.array()));
    return;
  }

  passport.authenticate('login', (error, user, info) => {
    if (error) {
      logger.error('로그인 완료 중 오류가 발생하였습니다.');
      logger.error(error);
      return;
    }

    if (info) {
      if (info.message === ErrorMessage.USER_NOT_FOUND) {
        res.status(404).json(makeError(ErrorMessage.USER_NOT_FOUND));
        return;
      }
      return;
    }

    req.login(user, (err) => {
      if (err) {
        logger.error('로그인 완료 중 오류가 발생하였습니다.');
        logger.error(err);
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    });
  })(req, res, next);
});

export default router;
