import express from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import { createSubject, getSubject, getSubjects, removeSubject, updateSubject } from '../services/subject-service';
import { checkValidation } from '../middlewares/validator';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';

const router = express.Router();

router.get('/', requireAuthenticated, async (req, res) => {
  const data = await getSubjects();
  res.status(200).json({
    success: true,
    data
  });
});

const getSubjectValidator = [
  param('id').isNumeric()
];
router.get('/:id', getSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
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
});

const createSubjectValidator = [
  body('subjectName').isString()
];
router.post('/', createSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
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
});

const updateSubjectValidator = [
  param('id').isNumeric(),
  body('subjectName').isString()
];
router.put('/:id', updateSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
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
});

const removeSubjectValidator = [
  param('id').isNumeric()
];
router.delete('/:id', removeSubjectValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
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
});

export default router;
