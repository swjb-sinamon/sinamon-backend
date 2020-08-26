import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';
import { registerUser } from '../services/auth-service';
import { requireAuthenticated } from '../middlewares/permission';
import { checkValidation } from '../middlewares/validator';

const router = express.Router();

const loginValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
];
router.post('/login', loginValidator, checkValidation, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  passport.authenticate('login', (error, user, info) => {
    if (error) {
      logger.error('로그인 완료 중 오류가 발생하였습니다.');
      logger.error(error);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
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
        res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
        return;
      }

      logger.info(`${user.uuid} ${user.email} 님이 로그인하였습니다.`);

      const result = user;
      result.password = '';

      res.status(200).json({
        success: true,
        data: result
      });
    });
  })(req, res, next);
});

const registerValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isString(),
  body('studentGrade').isNumeric(),
  body('studentClass').isNumeric(),
  body('studentNumber').isNumeric()
];
router.post('/register', registerValidator, checkValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  passport.authenticate('register', async (error, user, info) => {
    if (error) {
      logger.error('회원가입 완료 중 오류가 발생하였습니다.');
      logger.error(error);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      return;
    }

    if (info) {
      if (info.message === ErrorMessage.USER_ALREADY_EXISTS) {
        res.status(409).json(makeError(ErrorMessage.USER_ALREADY_EXISTS));
      }
      return;
    }

    try {
      const { email, name, studentGrade, studentClass, studentNumber } = req.body;

      const result = await registerUser({ email, name, studentGrade, studentClass, studentNumber });

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info(`${user.uuid} ${user.email} 님이 회원가입하였습니다.`);
    } catch (e) {
      logger.error('회원가입 완료 중 오류가 발생하였습니다.');
      logger.error(error);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  })(req, res, next);
});

router.get('/me', requireAuthenticated, (req: express.Request, res: express.Response) => {
  const result: any = req.user;
  if (!result) return;

  result.password = '';

  res.status(200).json({
    success: true,
    data: result
  });
});

export default router;
