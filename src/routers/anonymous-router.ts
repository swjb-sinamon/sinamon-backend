import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { checkValidation } from '../middlewares/validator';
import { requireAuthenticated } from '../middlewares/permission';
import ServiceException from '../exceptions';
import { makeError } from '../error/error-system';
import { logger } from '../index';
import ErrorMessage from '../error/error-message';
import {
  createAnonymous,
  createAnonymousReply,
  getAllAnonymous,
  getAnonymous
} from '../services/anonymous-service';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Anonymous
 *  description: 익명 건의
 * components:
 *  schemas:
 *    Anonymous:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *          description: 익명 건의 ID
 *        title:
 *          type: string
 *          description: 제목
 *        content:
 *          type: string
 *          description: 내용
 *        reply:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/AnonymousReply'
 *        createdAt:
 *          type: string
 *          description: 생성일
 *        updatedAt:
 *          type: string
 *          description: 수정일
 *    AnonymousReply:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *          description: 답변 ID
 *        content:
 *          type: string
 *          description: 내용
 *        author:
 *          type: string
 *          description: 작성자 UUID
 *        user:
 *          type: object
 *          $ref: '#/components/schemas/User'
 *        createdAt:
 *          type: string
 *          description: 생성일
 *        updatedAt:
 *          type: string
 *          description: 수정일
 */

/**
 * @swagger
 * /anonymous:
 *  get:
 *    summary: 익명 건의 가져오기
 *    tags: [Anonymous]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Anonymous'
 */
router.get('/', requireAuthenticated(), async (req, res) => {
  const { count, data } = await getAllAnonymous();
  res.status(200).json({
    success: true,
    count,
    data
  });
});

/**
 * @swagger
 * /anonymous/{id}:
 *  get:
 *    summary: 익명 건의 가져오기
 *    tags: [Anonymous]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: number
 *        description: 익명 건의 ID
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Anonymous'
 */
const getAnonymousValidator = [param('id').isNumeric()];
router.get(
  '/:id',
  requireAuthenticated(),
  getAnonymousValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const data = await getAnonymous(parseInt(id, 10));
      res.status(200).json({
        success: true,
        data
      });
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error(`${id} 익명 건의를 가져오는 중 오류가 발생하였습니다.`, e);
    }
  }
);

/**
 * @swagger
 * /anonymous:
 *  post:
 *    summary: 익명 건의 만들기
 *    tags: [Anonymous]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: 제목
 *              content:
 *                type: string
 *                description: 내용
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Anonymous'
 */
const createAnonymousValidator = [body('title').isString(), body('content').isString()];
router.post(
  '/',
  requireAuthenticated(),
  createAnonymousValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { title, content } = req.body;
      const data = await createAnonymous(title, content);
      res.status(201).json({
        success: true,
        data
      });
      logger.info('새로운 익명 건의를 등록했습니다.');
    } catch (e) {
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error(`익명 건의를 만드는 중 오류가 발생하였습니다.`, e);
    }
  }
);

/**
 * @swagger
 * /anonymous/{id}/reply:
 *  post:
 *    summary: 답변 등록
 *    tags: [Anonymous]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *                description: 내용
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AnonymousReply'
 */
const createAnonymousReplyValidator = [body('content').isString()];
router.post(
  '/:id/reply',
  requireAuthenticated(),
  createAnonymousReplyValidator,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (!req.user) return;
      const { uuid } = req.user;

      const data = await createAnonymousReply(parseInt(id, 10), content, uuid);

      res.status(201).json({
        success: true,
        data
      });
      logger.info('새로운 익명 건의 답변을 등록했습니다.');
    } catch (e) {
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
      logger.error(`익명 건의 답변을 만드는 중 오류가 발생하였습니다.`, e);
    }
  }
);

export default router;
