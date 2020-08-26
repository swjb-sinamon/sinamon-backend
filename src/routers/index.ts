import express from 'express';
import AuthRouter from './auth-router';
import SubjectRouter from './subject-router';
import UmbrellaRouter from './umbrella-router';

const router = express.Router();

router.use('/auth', AuthRouter);
router.use('/subject', SubjectRouter);
router.use('/umbrella', UmbrellaRouter);

export default router;
