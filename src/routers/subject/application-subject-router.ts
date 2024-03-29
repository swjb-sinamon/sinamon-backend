import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuthenticated } from '../../middlewares/permission';
import { logger } from '../../index';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import { makeError } from '../../error/error-system';
import { checkValidation } from '../../middlewares/validator';
import { SubjectApplicationStatus } from '../../types';
import {
  applicationSubject,
  cancelSubject,
  getApplicationSubjects,
  getApplicationSubjectsByUserId,
  getCanSubject,
  pickApplication,
  setCanSubject
} from '../../services/subject/application-subject-service';
import { getSubjects } from '../../services/subject/subject-service';
import { sendCsv } from '../../utils/router-util';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: ApplicationSubject
 *  description: 고교학점제 신청하기
 * components:
 *  schemas:
 *    ApplicationSubject:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *          description: ID
 *        userId:
 *          type: string
 *          description: 신청자
 *        subjectId:
 *          type: number
 *          description: 과목 ID
 *        status:
 *          type: string
 *          enum: [WAITING, FAIL]
 *          description: 상태 (대기 중, 실패)
 *        priority:
 *          type: number
 *          description: 우선순위 (지망)
 *          nullable: true
 *        createdAt:
 *          type: string
 *          description: 생성일
 *        updatedAt:
 *          type: string
 *          description: 수정일
 *        deletedAt:
 *          type: string
 *          description: 취소일
 */

/**
 * @swagger
 * /application/config:
 *  get:
 *    summary: 과목 신청 가능 여부 가져오기
 *    tags: [ApplicationSubject]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: boolean
 */
router.get('/config', requireAuthenticated(), async (req, res) => {
  try {
    const data = await getCanSubject();

    res.status(200).json({
      success: true,
      data
    });

    logger.info('과목 신청 가능 여부를 가져왔습니다.');
  } catch (e) {
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    logger.error('과목 신청 가능 여부를 가져오는 중 오류가 발생하였습니다.');
    logger.error(e);
  }
});

/**
 * @swagger
 * /application/config:
 *  put:
 *    summary: 과목 신청 가능 여부 설정하기
 *    tags: [ApplicationSubject]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              value:
 *                type: boolean
 *                description: 신청 가능 여부
 *    responses:
 *      200:
 */
const setConfigValidator = [body('value').isBoolean()];
router.put(
  '/config',
  requireAuthenticated(['admin', 'teacher']),
  setConfigValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { value } = req.body;

      await setCanSubject(value);

      res.status(200).json({
        success: true
      });

      logger.info(`과목 신청 가능 여부를 설정했습니다. ${value}`);
    } catch (e) {
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('과목 신청 가능 여부를 설정하는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  }
);

/**
 * @swagger
 * /application:
 *  get:
 *    summary: 전체 지원 정보 가져오기
 *    tags: [ApplicationSubject]
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
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ApplicationSubject'
 */
router.get('/', requireAuthenticated(['admin', 'teacher']), async (req, res) => {
  try {
    const { offset, limit } = req.query as Record<string, unknown>;

    const { data, count } = await getApplicationSubjects(Number(offset), Number(limit));

    res.status(200).json({
      success: true,
      count,
      data
    });

    logger.info('모든 지원정보를 가져왔습니다.');
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    logger.error('모든 지원정보를 가져오는 중 오류가 발생하였습니다.');
    logger.error(e);
  }
});

/**
 * @swagger
 * /application/me:
 *  get:
 *    summary: 본인이 신청한 과목 가져오기
 *    tags: [ApplicationSubject]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ApplicationSubject'
 */
router.get('/me', requireAuthenticated(), async (req, res) => {
  try {
    if (!req.user) return;
    const { uuid } = req.user;

    const data = await getApplicationSubjectsByUserId(uuid);

    res.status(200).json({
      success: true,
      data
    });

    logger.info('신청한 과목 목록을 가져왔습니다.');
  } catch (e) {
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    logger.error('신청한 과목을 가져오는 중 오류가 발생하였습니다.');
    logger.error(e);
  }
});

/**
 * @swagger
 * /application:
 *  post:
 *    summary: 과목 수강신청
 *    tags: [ApplicationSubject]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              subjectId:
 *                type: number
 *                description: 과목 ID
 *              priority:
 *                type: number
 *                description: 우선 순위 (지망)
 *                nullable: true
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ApplicationSubject'
 */
const addValidator = [body('subjectId').isNumeric()];
router.post(
  '/',
  requireAuthenticated(),
  addValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) return;
      const { uuid } = req.user;

      const { subjectId, priority } = req.body;

      const data = await applicationSubject({
        userId: uuid,
        subjectId,
        status: SubjectApplicationStatus.WAITING,
        priority
      });

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${uuid} 님이 ${subjectId} 과목을 수강신청했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('수강신청하는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  }
);

/**
 * @swagger
 * /application/{id}:
 *  delete:
 *    summary: 과목 수강취소
 *    tags: [ApplicationSubject]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        description: 수강신청 ID
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ApplicationSubject'
 */
router.delete('/:id', requireAuthenticated(), async (req: Request, res: Response) => {
  try {
    if (!req.user) return;
    const { uuid } = req.user;
    const { id } = req.params;

    const data = await cancelSubject(Number(id), uuid);

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${uuid} 님이 ${id} 과목을 수강 취소했습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    logger.error('과목 수강 취소 중 오류가 발생하였습니다.');
    logger.error(e);
  }
});

/**
 * @swagger
 * /application/pick:
 *  post:
 *    summary: 고교학점제 뽑기 및 배정
 *    tags: [ApplicationSubject]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              subjectId:
 *                type: number
 *                description: 뽑기를 진행할 과목 ID
 *    responses:
 *      200:
 *        content:
 *          application/json:
 */
const pickValidator = [body('subjectId').isNumeric()];
router.post(
  '/pick',
  requireAuthenticated(['admin', 'teacher']),
  pickValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { subjectId } = req.body;

      await pickApplication(Number(subjectId));

      res.status(200).json({
        success: true
      });

      logger.info('과목 뽑기를 진행했습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('과목 뽑기를 하는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  }
);

/**
 * @swagger
 * /application/csv:
 *  get:
 *    summary: 지원정보 CSV
 *    tags: [ApplicationSubject]
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
      const data = await getApplicationSubjects();

      sendCsv(res, ['id', 'userId', 'subjectId', 'status', 'priority'], data.data);

      logger.info('지원정보 CSV를 다운로드했습니다.');
    } catch (e) {
      logger.error('지원정보 CSV를 다운로드하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  }
);

export default router;
