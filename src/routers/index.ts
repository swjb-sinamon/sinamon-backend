import express from 'express';
import AuthRouter from './auth-router';
import SubjectRouter from './subject-router';
import UmbrellaRouter from './umbrella/umbrella-router';
import UmbrellaGetterRouter from './umbrella/umbrella-getter-router';
import OnlineTimeTableRouter from './online-time-table-router';
import QrRouter from './qr-router';
import SchoolRouter from './school-router';
import WeatherRouter from './weather-router';
import NoticeRouter from './notice-router';

const router = express.Router();

router.use('/auth', AuthRouter);
router.use('/subject', SubjectRouter);
router.use('/umbrella', UmbrellaRouter);
router.use('/umbrella', UmbrellaGetterRouter);
router.use('/ott', OnlineTimeTableRouter);
router.use('/qr', QrRouter);
router.use('/school', SchoolRouter);
router.use('/weather', WeatherRouter);
router.use('/notice', NoticeRouter);

export default router;
