import express from 'express';
import AuthRouter from './auth-router';
import SubjectRouter from './subject-router';
import UmbrellaRouter from './umbrella-router';
import OnlineTimeTableRouter from './online-time-table-router';

const router = express.Router();

router.use('/auth', AuthRouter);
router.use('/subject', SubjectRouter);
router.use('/umbrella', UmbrellaRouter);
router.use('/ott', OnlineTimeTableRouter);

export default router;
