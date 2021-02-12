import express from 'express';
import { body } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import { addContestMember, getContestMembers, setContestJoinStatus } from '../services/contest-service';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';
import { ContestRole } from '../types';
import { checkValidation } from '../middlewares/validator';
import { getUserWithInfo } from '../services/auth-service';
import ServiceException from '../exceptions';
import Contests from '../databases/models/contests';

const router = express.Router();

/**
 * @api {get} /contest 공모전에 참여한 학생 가져오기
 * @apiName GetContestMembers
 * @apiGroup Contest
 *
 * @apiParam {Number} limit 한 페이지당 데이터 수
 * @apiParam {Number} offset 페이지
 * @apiParam {String} search 검색
 * @apiParam {String} role 필터링할 역할 (IDEA, DEVELOP, DESIGN)
 * @apiParam {String} filters[] 데이터 필터
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Number} count 전체 데이터 개수
 * @apiSuccess {Object} data 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 400) CONTEST_ROLE_NOT_FOUND 존재하지 않는 역할입니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/',
  requireAuthenticated(['admin', 'teacher', 'schoolunion']),
  async (req, res) => {
    try {
      const { offset, limit, search, role, filters } = req.query as Record<string, unknown>;

      if (role && !(Object.keys(ContestRole).includes(role as string))) {
        res.status(404).json(makeError(ErrorMessage.CONTEST_ROLE_NOT_FOUND));
        logger.warn('존재하지 않은 역할을 입력했습니다.');
        return;
      }

      const {
        data,
        count
      } = await getContestMembers(
        limit as number | undefined,
        offset as number | undefined,
        search as string,
        ContestRole[role as keyof typeof ContestRole],
        filters as Record<keyof Contests, unknown>
      );

      res.status(200).json({
        success: true,
        count,
        data
      });
    } catch (e) {
      logger.error('공모전 참여 학생을 가져오는 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const addContestMemberValidator = [
  body('name').isString(),
  body('department').isNumeric(),
  body('grade').isNumeric(),
  body('class').isNumeric(),
  body('number').isNumeric(),
  body('role').isIn(Object.keys(ContestRole))
];
/**
 * @api {post} /contest 공모전 참여하기
 * @apiName AddContestMember
 * @apiGroup Contest
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 400) CONTEST_ROLE_NOT_FOUND 존재하지 않는 역할입니다.
 * @apiError (Error 404) USER_ALREADY_EXISTS 이미 존재하는 아이디입니다.
 * @apiError (Error 409) CONTEST_ALREADY_EXISTS 이미 참가 신청 되었습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/',
  requireAuthenticated(),
  addContestMemberValidator,
  checkValidation,
  async (req: express.Request, res: express.Response) => {
    try {
      const { name, department, grade, class: clazz, number, role } = req.body;

      if (!(Object.keys(ContestRole).includes(role))) {
        res.status(404).json(makeError(ErrorMessage.CONTEST_ROLE_NOT_FOUND));
        logger.warn('존재하지 않은 역할을 입력했습니다.');
        return;
      }

      const user = await getUserWithInfo(
        name,
        department,
        grade,
        clazz,
        number
      );

      const data = await addContestMember(user.uuid, ContestRole[role as keyof typeof ContestRole]);

      res.status(201).json({
        success: true,
        data
      });
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('공모전 참가 신청 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const setContestJoinValidator = [
  body('uuid').isString(),
];
/**
 * @api {patch} /contest 공모전 참가한 상태로 변경하기
 * @apiName SetContestJoin
 * @apiGroup Contest
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 데이터
 *
 * @apiError (Error 404) CONTEST_JOIN_NOT_FOUND 참여하지 않은 사용자입니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.patch('/',
  requireAuthenticated(['admin', 'teacher', 'schoolunion']),
  setContestJoinValidator,
  checkValidation,
  async (req: express.Request, res: express.Response) => {
    try {
      const { uuid } = req.body;

      const data = await setContestJoinStatus(uuid, true);

      res.status(200).json({
        success: true,
        data
      });
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('공모전 참가 상태 변경 중 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

export default router;
