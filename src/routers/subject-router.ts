import express from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import { createSubject, getSubject, getSubjects, removeSubject, updateSubject } from '../services/subject-service';
import { checkValidation } from '../middlewares/validator';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';
import ServiceException from '../exceptions';

const router = express.Router();

/**
 * @api {get} /subject Get Subjects
 * @apiName GetSubjects
 * @apiGroup Subject
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 모든 과목 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/', requireAuthenticated, async (req, res) => {
  try {
    const data = await getSubjects();
    res.status(200).json({
      success: true,
      data
    });

    logger.info('전체 과목을 불러왔습니다.');
  } catch (e) {
    logger.error('전체 과목을 불러오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const getSubjectValidator = [
  param('id').isNumeric()
];
/**
 * @api {get} /subject/:id Get Subject
 * @apiName GetSubject
 * @apiGroup Subject
 *
 * @apiParam {Number} id 과목 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 과목 데이터
 *
 * @apiError (Error 404) SUBJECT_NOT_FOUND 존재하지 않는 과목입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.get('/:id', getSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const data = await getSubject(parseInt(id, 10));

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 과목을 불러왔습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('과목을 불러오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const createSubjectValidator = [
  body('subjectName').isString()
];
/**
 * @api {post} /subject Create Subject
 * @apiName CreateSubject
 * @apiGroup Subject
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 추가된 과목 데이터
 *
 * @apiError (Error 404) SUBJECT_NOT_FOUND 존재하지 않는 과목입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.post('/', createSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { subjectName } = req.body;
    const data = await createSubject(subjectName);

    res.status(201).json({
      success: true,
      data
    });

    logger.info(`${data.id} 새로운 과목을 추가했습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('과목을 추가하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const updateSubjectValidator = [
  param('id').isNumeric(),
  body('subjectName').isString()
];
/**
 * @api {put} /subject/:id Update Subject
 * @apiName UpdateSubject
 * @apiGroup Subject
 *
 * @apiParam {Number} id 과목 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 수정된 과목 데이터
 *
 * @apiError (Error 404) SUBJECT_NOT_FOUND 존재하지 않는 과목입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.put('/:id', updateSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { subjectName } = req.body;
    const data = await updateSubject(parseInt(id, 10), subjectName);

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 과목을 수정하였습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('과목을 수정하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const removeSubjectValidator = [
  param('id').isNumeric()
];
/**
 * @api {delete} /subject/:id Delete Subject
 * @apiName DeleteSubject
 * @apiGroup Subject
 *
 * @apiParam {Number} id 과목 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 삭제된 과목 데이터
 *
 * @apiError (Error 404) SUBJECT_NOT_FOUND 존재하지 않는 과목입니다.
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
router.delete('/:id', removeSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const data = await removeSubject(parseInt(id, 10));

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 과목을 삭제하였습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('과목을 삭제하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

export default router;
