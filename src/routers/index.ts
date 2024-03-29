import express from 'express';
import AuthRouter from './auth-router';
import UmbrellaRouter from './umbrella/umbrella-router';
import UmbrellaGetterRouter from './umbrella/umbrella-getter-router';
import QrRouter from './qr-router';
import SchoolRouter from './school-router';
import WeatherRouter from './weather-router';
import NoticeRouter from './notice-router';
import CodeRouter from './activation-code-router';
import TimetableRouter from './timetable-router';
import AnonymousRouter from './anonymous-router';
import SubjectRouter from './subject/subject-router';
import ApplicationRouter from './subject/application-subject-router';

const router = express.Router();

router.use('/auth', AuthRouter);
router.use('/umbrella', UmbrellaRouter);
router.use('/umbrella', UmbrellaGetterRouter);
router.use('/qr', QrRouter);
router.use('/school', SchoolRouter);
router.use('/weather', WeatherRouter);
router.use('/notice', NoticeRouter);
router.use('/code', CodeRouter);
router.use('/timetable', TimetableRouter);
router.use('/anonymous', AnonymousRouter);
router.use('/subject', SubjectRouter);
router.use('/application', ApplicationRouter);

export default router;
