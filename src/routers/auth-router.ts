import express from 'express';
import passport from 'passport';
import { body, query } from 'express-validator';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';
import { editUser, getUser, getUsers, GetUsersFilters } from '../services/auth-service';
import { requireAuthenticated } from '../middlewares/permission';
import { checkValidation } from '../middlewares/validator';
import ServiceException from '../exceptions';
import { subscribeAllTopic } from '../services/fcm-service';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: 계정
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        uuid:
 *          type: string
 *          description: 유저 UUID
 *        id:
 *          type: string
 *          description: 유저 아이디
 *        name:
 *          type: string
 *          description: 유저 이름 (실명)
 *        department:
 *          type: integer
 *          description: 학과 (1~5)
 *        studentGrade:
 *          type: integer
 *          description: 학년 (1~3)
 *        studentClass:
 *          type: integer
 *          description: 반 (1~2)
 *        studentNumber:
 *          type: integer
 *          description: 번호
 *        password:
 *          type: string
 *          description: 유저 비밀번호 (공백)
 *          nullable: true
 *        permissions:
 *          type: object
 *          properties:
 *            isAdmin:
 *              type: boolean
 *              description: 관리자 권한 여부
 *            isTeacher:
 *              type: boolean
 *              description: 선생님 권한 여부
 *            isSchoolUnion:
 *              type: boolean
 *              description: 학생회 권한 여부
 *        createdAt:
 *          type: string
 *          description: 계정 생성일
 *        updatedAt:
 *          type: string
 *          description: 계정 수정일
 *    UserWithoutPermission:
 *      type: object
 *      properties:
 *        uuid:
 *          type: string
 *          description: 유저 UUID
 *        id:
 *          type: string
 *          description: 유저 아이디
 *        name:
 *          type: string
 *          description: 유저 이름 (실명)
 *        department:
 *          type: integer
 *          description: 학과 (1~5)
 *        studentGrade:
 *          type: integer
 *          description: 학년 (1~3)
 *        studentClass:
 *          type: integer
 *          description: 반 (1~2)
 *        studentNumber:
 *          type: integer
 *          description: 번호
 *        password:
 *          type: string
 *          description: 유저 비밀번호 (공백)
 *          nullable: true
 *        createdAt:
 *          type: string
 *          description: 계정 생성일
 *        updatedAt:
 *          type: string
 *          description: 계정 수정일
 */

/**
 * @swagger
 * /auth/login:
 *  post:
 *    summary: 로그인 하기
 *    tags: [Auth]
 *    parameters:
 *      - in: query
 *        name: admin
 *        schema:
 *          type: boolean
 *        description: 관리자 페이지 로그인 (권한이 없으면 로그인 무시)
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                description: 아이디
 *              password:
 *                type: string
 *                description: 비밀번호
 *    responses:
 *      200:
 *        description: 로그인 유저 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
const loginValidator = [
  query('admin').isBoolean(),
  body('id').isString(),
  body('password')
];
router.post('/login', loginValidator, checkValidation, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  passport.authenticate('login', async (error, user, info) => {
    if (error) {
      logger.error('로그인 완료 중 오류가 발생하였습니다.', error);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      return;
    }

    if (info) {
      const errorMessage = JSON.parse(info.message);
      res.status(errorMessage.status).json(makeError(errorMessage.message));
      return;
    }

    req.login(user, (err) => {
      if (err) {
        logger.error('로그인 완료 중 오류가 발생하였습니다.', err);
        res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
        return;
      }

      logger.info(`${user.uuid} ${user.id} 님이 로그인하였습니다.`);

      const result = user;
      result.password = null;

      res.status(200).json({
        success: true,
        data: result
      });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /auth/register:
 *  post:
 *    summary: 회원가입 하기
 *    tags: [Auth]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                description: 아이디
 *              password:
 *                type: string
 *                description: 비밀번호
 *              name:
 *                type: string
 *                description: 이름
 *              department:
 *                type: integer
 *                description: 학과
 *              studentGrade:
 *                type: integer
 *                description: 학년
 *              studentClass:
 *                type: integer
 *                description: 반
 *              studentNumber:
 *                type: integer
 *                description: 번호
 *              code:
 *                type: string
 *                description: 인증코드
 *    responses:
 *      200:
 *        description: 회원가입 유저 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserWithoutPermission'
 */
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
router.post('/register',
  registerValidator,
  checkValidation,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    passport.authenticate('register', async (error, user, info) => {
      if (error) {
        logger.error('회원가입 완료 중 오류가 발생하였습니다.', error);
        res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
        return;
      }

      if (info) {
        const errorMessage = JSON.parse(info.message);
        res.status(errorMessage.status).json(makeError(errorMessage.message));
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });

      logger.info(`${user.uuid} ${user.id} 님이 회원가입하였습니다.`);
      logger.info(`${user.uuid} ${user.id} 님의 권한을 설정했습니다.`);
    })(req, res, next);
  });

/**
 * @swagger
 * /auth/me:
 *  get:
 *    summary: 로그인한 유저 정보 가져오기
 *    tags: [Auth]
 *    responses:
 *      200:
 *        description: 유저 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.get('/me', requireAuthenticated(), async (req: express.Request, res: express.Response) => {
  try {
    const result = req.user;
    if (!result) return;

    await subscribeAllTopic(result.uuid);

    res.status(200).json({
      success: true,
      data: result
    });

    logger.info(`${result.uuid} ${result.id} 님의 정보를 요청했습니다.`);
  } catch (e) {
    logger.error('내 정보를 요청하는 중 오류가 발생하였습니다.', e);

    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

/**
 * @swagger
 * /auth/user/{uuid}:
 *  get:
 *    summary: UUID로 유저 정보 가져오기
 *    tags: [Auth]
 *    parameters:
 *      - in: path
 *        name: uuid
 *        schema:
 *          type: string
 *        description: 유저 UUID
 *    responses:
 *      200:
 *        description: 유저 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.get('/user/:uuid', requireAuthenticated(['admin', 'teacher', 'schoolunion']), async (req: express.Request, res: express.Response) => {
  try {
    const { uuid } = req.params;

    const data = await getUser(uuid);

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${uuid} 님의 정보를 요청했습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(500).json(makeError(e.message));
      return;
    }

    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    logger.error('유저 정보를 요청하는 중 오류가 발생하였습니다.', e);
  }
});

/**
 * @swagger
 * /auth/user:
 *  get:
 *    summary: 유저 정보 가져오기
 *    tags: [Auth]
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
 *        description: 학생 이름 검색
 *      - in: query
 *        name: filters
 *        type: array
 *        collectionFormat: multi
 *        description: 학과(department), 학년(grade), 반(class) 필터링
 *    responses:
 *      200:
 *        description: 유저 데이터
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 */
router.get('/user', requireAuthenticated(['admin', 'teacher']), async (req: express.Request, res: express.Response) => {
  const { offset, limit, search, filters } = req.query as Record<string, unknown>;

  let filterOption: GetUsersFilters = {};
  if (filters) {
    const { department, grade, class: clazz } = filters as {
      department?: number;
      grade?: number;
      class?: number;
    };

    filterOption = {
      department,
      studentGrade: grade,
      studentClass: clazz
    };
  }

  const { data, count } = await getUsers(
    parseInt(offset as string, 10),
    parseInt(limit as string, 10),
    search as string,
    filterOption
  );

  res.status(200).json({
    success: true,
    count,
    data
  });

  logger.info('모든 유저 정보를 요청했습니다.');
});

/**
 * @swagger
 * /auth/logout:
 *  delete:
 *    summary: 로그아웃
 *    tags: [Auth]
 *    responses:
 *      200:
 *        description: 로그아웃한 유저 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.delete('/logout', requireAuthenticated(), (req: express.Request, res: express.Response) => {
  const result = req.user;

  if (!result) return;

  logger.info(`${result.uuid} ${result.id} 님이 로그아웃을 하였습니다.`);
  req.logout();

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @swagger
 * /auth/me:
 *  put:
 *    summary: 유저 정보 수정
 *    tags: [Auth]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              studentGrade:
 *                type: integer
 *                description: 학년
 *              studentClass:
 *                type: integer
 *                description: 반
 *              studentNumber:
 *                type: integer
 *                description: 번호
 *              currentPassword:
 *                type: string
 *                description: 현재 비밀번호
 *              newPassword:
 *                type: string
 *                description: 새로 바꿀 비밀번호
 *                nullable: true
 *    responses:
 *      200:
 *        description: 수정된 유저 데이터
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
const editUserValidator = [
  body('studentGrade').isNumeric(),
  body('studentClass').isNumeric(),
  body('studentNumber').isNumeric(),
  body('currentPassword').isString(),
];
router.put('/me',
  requireAuthenticated(),
  editUserValidator,
  checkValidation,
  async (req: express.Request, res: express.Response) => {
    const { studentGrade, studentClass, studentNumber, currentPassword, newPassword } = req.body;
    if (!req.user) return;

    try {
      const data = await editUser(req.user.uuid, {
        studentGrade,
        studentClass,
        studentNumber,
        currentPassword,
        newPassword
      });

      req.logout();
      req.login(data, (err) => {
        if (err) throw new ServiceException(ErrorMessage.SERVER_ERROR, 500);
      });

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${req.user.uuid} 사용자 정보를 수정했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        if (e.message === ErrorMessage.USER_PASSWORD_NOT_MATCH) {
          logger.warn(`${req.user.uuid} 사용자 정보 수정을 위한 비밀번호가 틀렸습니다.`);
        }
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('사용자 정보를 수정하는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  });

export default router;
