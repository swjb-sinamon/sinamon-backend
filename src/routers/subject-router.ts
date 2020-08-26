import express from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import { createSubject, getSubject, getSubjects, removeSubject, updateSubject } from '../services/subject-service';
import { checkValidation } from '../middlewares/validator';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';

const router = express.Router();

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
router.get('/:id', getSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const data = await getSubject(parseInt(id, 10));

    if (!data) {
      res.status(404).json(makeError(ErrorMessage.SUBJECT_NOT_FOUND));
      return;
    }

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 과목을 불러왔습니다.`);
  } catch (e) {
    logger.error('과목을 불러오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const createSubjectValidator = [
  body('subjectName').isString()
];
router.post('/', createSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { subjectName } = req.body;
    const data = await createSubject(subjectName);

    if (!data) {
      res.status(409).json(makeError(ErrorMessage.SUBJECT_ALREADY_EXISTS));
      return;
    }

    res.status(201).json({
      success: true,
      data
    });

    logger.info(`${data.id} 새로운 과목을 추가했습니다.`);
  } catch (e) {
    logger.error('과목을 추가하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const updateSubjectValidator = [
  param('id').isNumeric(),
  body('subjectName').isString()
];
router.put('/:id', updateSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { subjectName } = req.body;
    const data = await updateSubject(parseInt(id, 10), subjectName);

    if (!data) {
      res.status(404).json(makeError(ErrorMessage.SUBJECT_NOT_FOUND));
      return;
    }

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 과목을 수정하였습니다.`);
  } catch (e) {
    logger.error('과목을 수정하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const removeSubjectValidator = [
  param('id').isNumeric()
];
router.delete('/:id', removeSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const data = await removeSubject(parseInt(id, 10));

    if (!data) {
      res.status(404).json(makeError(ErrorMessage.SUBJECT_NOT_FOUND));
      return;
    }

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${id} 과목을 삭제하였습니다.`);
  } catch (e) {
    logger.error('과목을 삭제하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

export default router;
