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
  getApplicationSubjectsByUserId,
  getCanSubject,
  setCanSubject
} from '../../services/subject/application-subject-service';

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
router.get('/config', requireAuthenticated(['admin', 'teacher']), async (req, res) => {
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

export default router;
