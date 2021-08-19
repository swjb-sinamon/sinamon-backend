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
  applicationMajorSubject,
  applicationSelectSubject,
  getApplicationSubjects
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
 * /application/me:
 *  get:
 *    summary: 본인이 신청한 과목 가져오기
 *    tags: [ApplicationSubject]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                major:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/ApplicationSubject'
 *                select:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/ApplicationSubject'
 */
router.get('/me', requireAuthenticated(), async (req, res) => {
  try {
    if (!req.user) return;
    const { uuid } = req.user;

    const data = await getApplicationSubjects(uuid);

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
 * /application/major:
 *  post:
 *    summary: 전공 코스 수강신청
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
const addMajorValidator = [body('subjectId').isNumeric()];
router.post(
  '/major',
  requireAuthenticated(),
  addMajorValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) return;
      const { uuid } = req.user;

      const { subjectId, priority } = req.body;

      const data = await applicationMajorSubject({
        userId: uuid,
        subjectId,
        status: SubjectApplicationStatus.WAITING,
        priority
      });

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${uuid} 님이 ${subjectId} 전공 코스를 신청했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('전공 코스를 신청하는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  }
);

/**
 * @swagger
 * /application/select:
 *  post:
 *    summary: 선택 과목 수강신청
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
router.post(
  '/select',
  requireAuthenticated(),
  addMajorValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) return;
      const { uuid } = req.user;

      const { subjectId, priority } = req.body;

      const data = await applicationSelectSubject({
        userId: uuid,
        subjectId,
        status: SubjectApplicationStatus.WAITING,
        priority
      });

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${uuid} 님이 ${subjectId} 선택 과목을 신청했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('선택 과목을 신청하는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  }
);

export default router;
