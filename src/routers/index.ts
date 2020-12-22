import express from 'express';
import AuthRouter from './auth-router';
import UmbrellaRouter from './umbrella/umbrella-router';
import UmbrellaGetterRouter from './umbrella/umbrella-getter-router';
import QrRouter from './qr-router';
import SchoolRouter from './school-router';
import WeatherRouter from './weather-router';
import NoticeRouter from './notice-router';
import CodeRouter from './activation-code-router';
import UniformRouter from './uniform-router';

const router = express.Router();

router.use('/auth', AuthRouter);
router.use('/umbrella', UmbrellaRouter);
router.use('/umbrella', UmbrellaGetterRouter);
router.use('/qr', QrRouter);
router.use('/school', SchoolRouter);
router.use('/weather', WeatherRouter);
router.use('/notice', NoticeRouter);
router.use('/code', CodeRouter);
router.use('/uniform', UniformRouter);

export default router;
