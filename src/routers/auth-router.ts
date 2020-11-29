import express from 'express';
import passport from 'passport';
import { body, query } from 'express-validator';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';
import { getMyPermission, getUser, getUsers, initUserPermission, registerUser } from '../services/auth-service';
import { requireAuthenticated, requirePermission } from '../middlewares/permission';
import { checkValidation } from '../middlewares/validator';
import { useActivationCode } from '../services/activation-code-service';
import ServiceException from '../exceptions';
import Users from '../databases/models/users';

const router = express.Router();

const loginValidator = [
  query('admin').isBoolean(),
  body('id').isString(),
  body('password')
];
/**
 * @api {post} /auth/login?admin=:admin User Login
 * @apiName UserLogin
 * @apiGroup Auth
 *
 * @apiParam {Boolean} admin 관리자 페이지 로그인 여부 (true 시 권한이 없으면 로그인을 무시합니다.)
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 로그인한 유저 데이터
 *
 * @apiError (Error 404) USER_NOT_FOUND 이메일이 존재하지 않거나 비밀번호가 올바르지 않습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/login', loginValidator, checkValidation, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { admin } = req.query;

  const adminQuery = admin || 'false';
  const isAdminLogin = adminQuery.toString().toLowerCase() === 'true';

  passport.authenticate('login', async (error, user, info) => {
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

    const myPermission = await getMyPermission(user.uuid);
    const isHavePermission = myPermission.some((v) => ['admin', 'teacher', 'schoolunion'].includes(v));
    if (isAdminLogin && !isHavePermission) {
      logger.warn(`${user.uuid} ${user.id} 사용자가 관리자 페이지 로그인을 시도하였습니다.`);
      res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
      return;
    }

    req.login(user, (err) => {
      if (err) {
        logger.error('로그인 완료 중 오류가 발생하였습니다.');
        logger.error(err);
        res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
        return;
      }

      logger.info(`${user.uuid} ${user.id} 님이 로그인하였습니다.`);

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
  body('id').isString(),
  body('password').isString(),
  body('name').isString(),
  body('department').isNumeric(),
  body('studentGrade').isNumeric(),
  body('studentClass').isNumeric(),
  body('studentNumber').isNumeric(),
  body('code').isString()
];
/**
 * @api {post} /auth/register User Register
 * @apiName UserRegister
 * @apiGroup Auth
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 회원가입한 유저 데이터
 *
 * @apiError (Error 409) USER_ALREADY_EXISTS 이미 존재하는 이메일입니다.
 * @apiError (Error 404) ACTIVATION_CODE_NOT_FOUND 존재하지 않는 인증코드입니다.
 * @apiError (Error 409) ACTIVATION_CODE_USED 이미 사용된 인증코드입니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/register', registerValidator, checkValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { id, name, department, studentGrade, studentClass, studentNumber, code } = req.body;
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
      await useActivationCode(code);

      const result = await registerUser({
        id,
        name,
        department,
        studentGrade,
        studentClass,
        studentNumber
      });

      await initUserPermission(result.uuid);

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info(`${user.uuid} ${user.id} 님이 ${code} 인증코드를 사용하였습니다.`);
      logger.info(`${result.uuid} ${result.id} 님이 회원가입하였습니다.`);
      logger.info(`${result.uuid} ${result.id} 님의 권한을 설정했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        await Users.destroy({
          where: {
            id
          },
          force: true
        });
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('회원가입 완료 중 오류가 발생하였습니다.');
      logger.error(error);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  })(req, res, next);
});

/**
 * @api {get} /auth/me Get User Profile
 * @apiName GetUserProfile
 * @apiGroup Auth
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 현재 로그인한 유저 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 */
router.get('/me', requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const result: any = req.user;
  if (!result) return;

  result.password = '';

  res.status(200).json({
    success: true,
    data: result
  });

  logger.info(`${result.uuid} ${result.id} 님의 정보를 요청했습니다.`);
});

/**
 * @api {get} /auth/user/:uuid Get User Profile By UUID
 * @apiName GetUserProfileByUUID
 * @apiGroup Auth
 *
 * @apiParam {String} uuid UUID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 현재 로그인한 유저 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 */
router.get('/user/:uuid', requireAuthenticated, requirePermission(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  const { uuid } = req.params;

  const data = await getUser(uuid);

  data.password = '';

  res.status(200).json({
    success: true,
    data
  });

  logger.info(`${uuid} 님의 정보를 요청했습니다.`);
});

/**
 * @api {get} /auth/user?limit=:limit&offset=:offset&search=:search 모든 유저 가져오기
 * @apiName GetUsers
 * @apiGroup Auth
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 * @apiParam {String} 검색어
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 현재 로그인한 유저 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 */
router.get('/user', requireAuthenticated, requirePermission(['admin', 'teacher']), async (req: express.Request, res: express.Response) => {
  const { offset, limit, search } = req.query;
  const isPagination = offset !== undefined && limit !== undefined;

  const offsetValue = offset ? parseInt(offset.toString(), 10) : 0;
  const limitValue = limit ? parseInt(limit.toString(), 10) : 0;
  const searchValue = search ? search.toString() : undefined;

  const { data, count } = await getUsers(isPagination, offsetValue, limitValue, searchValue);

  res.status(200).json({
    success: true,
    count,
    data
  });

  logger.info('모든 유저 정보를 요청했습니다.');
});

/**
 * @api {delete} /auth/logout User Logout
 * @apiName UserLogout
 * @apiGroup Auth
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 로그아웃한 유저 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 */
router.delete('/logout', requireAuthenticated, (req: express.Request, res: express.Response) => {
  const result: any = req.user;

  result.password = '';

  logger.info(`${result.uuid} ${result.id} 님이 로그아웃을 하였습니다.`);
  req.logout();

  res.status(200).json({
    success: true,
    data: result
  });
});

export default router;
