import express from 'express';
import AuthRouter from './auth-router';
import SubjectRouter from './subject-router';

const router = express.Router();

router.use('/auth', AuthRouter);
router.use('/subject', SubjectRouter);

export default router;
