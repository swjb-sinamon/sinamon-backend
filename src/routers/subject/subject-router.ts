import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../../middlewares/permission';
import { addSubject, getSubject, getSubjects } from '../../services/subject/subject-service';
import { logger } from '../../index';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import { makeError } from '../../error/error-system';
import { checkValidation } from '../../middlewares/validator';
import { ApplicationType, SubjectType } from '../../types';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Subject
 *  description: 고교학점제 (선택 과목, 전공 코스)
 * components:
 *  schemas:
 *    Subject:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *          description: ID
 *        name:
 *          type: string
 *          description: 과목명
 *        description:
 *          type: string
 *          description: 과목 설명
 *        type:
 *          type: string
 *          enum: [SELECT_SUBJECT, MAJOR_SUBJECT]
 *          description: 과목 종류 (선택 과목, 전공 코스)
 *        applicationType:
 *          type: string
 *          enum: [ORDER, RANDOM]
 *          description: 배정 방식 (선착순, 지망)
 *        maxPeople:
 *          type: number
 *          description: 수강 가능 인원
 *        createdAt:
 *          type: string
 *          description: 생성일
 *        updatedAt:
 *          type: string
 *          description: 수정일
 */

/**
 * @swagger
 * /subject:
 *  get:
 *    summary: 전체 과목 가져오기
 *    tags: [Subject]
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
 *        description: 과목 이름
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Subject'
 */
router.get('/', requireAuthenticated(), async (req, res) => {
  try {
    const { offset, limit, search } = req.query as Record<string, unknown>;

    const { data, count } = await getSubjects(Number(offset), Number(limit), {
      name: search as string
    });

    res.status(200).json({
      success: true,
      count,
      data
    });

    logger.info('모든 과목 목록을 가져왔습니다.');
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    logger.error('모든 과목을 가져오는 중 오류가 발생하였습니다.');
    logger.error(e);
  }
});

/**
 * @swagger
 * /subject/{id}:
 *  get:
 *    summary: 과목 가져오기
 *    tags: [Subject]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: number
 *        description: 과목 ID
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Subject'
 */
const getValidator = [param('id').isNumeric()];
router.get(
  '/:id',
  requireAuthenticated(['admin', 'teacher']),
  getValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const data = await getSubject(Number(id));

      res.status(200).json({
        success: true,
        data
      });

      logger.info('과목 목록을 가져왔습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('과목을 가져오는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  }
);

/**
 * @swagger
 * /subject:
 *  post:
 *    summary: 과목 추가하기
 *    tags: [Subject]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: 과목명
 *              type:
 *                type: string
 *                enum: [SELECT_SUBJECT, MAJOR_SUBJECT]
 *                description: 과목 종류
 *              applicationType:
 *                type: string
 *                enum: [ORDER, RANDOM]
 *                description: 배정 방식 (선착순, 지망)
 *              description:
 *                type: string
 *                description: 과목 설명
 *              maxPeople:
 *                type: number
 *                description: 수강 가능 인원
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Subject'
 */
const addValidator = [
  body('name').isString(),
  body('type').isIn(Object.values(SubjectType)),
  body('applicationType').isIn(Object.values(ApplicationType)),
  body('description').isString(),
  body('maxPeople').isNumeric()
];
router.post(
  '/',
  requireAuthenticated(['admin', 'teacher']),
  addValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { name, type, applicationType, description, maxPeople } = req.body;

      const data = await addSubject({
        name,
        type,
        applicationType,
        description,
        maxPeople
      });

      res.status(201).json({
        success: true,
        data
      });

      logger.info('과목을 추가했습니다.');
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error('과목을 추가하는 중 오류가 발생하였습니다.');
      logger.error(e);
    }
  }
);

export default router;
