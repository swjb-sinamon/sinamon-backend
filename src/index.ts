import express from 'express';
import dotenv from 'dotenv';
import log4js from 'log4js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { schedule } from 'node-cron';
import redis from 'redis';
import config from './config';
import AuthPassport from './auth';
import DatabaseAssociation from './databases/association';
import db from './databases';
import Router from './routers';
import Rentals from './databases/models/rentals';
import { initializeServerConfig, initializeUniformData } from './databases/Initialize';
import { setExpire } from './services/rental-service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const connectRedis = require('connect-redis');

export const app = express();
export const logger = log4js.getLogger();

const RATE_MINUTES = 1;
const MAXAGE_DATE = 14;

dotenv.config();

log4js.configure({
  appenders: {
    console: {
      type: 'console'
    },
    default: {
      type: 'file',
      filename: 'logs/sinamon.log',
      pattern: '-yyyy-MM-dd',
      compress: true
    }
  },
  categories: {
    default: {
      appenders: ['default', 'console'],
      level: 'DEBUG'
    }
  }
});
logger.level = 'ALL';

DatabaseAssociation();
db.sync().then(async () => {
  await db.query('ALTER TABLE timetables AUTO_INCREMENT=10000;');
  logger.info('Database connect completed successfully');

  await initializeServerConfig();
  await initializeUniformData();
});

const RedisStore = connectRedis(session);
const client = redis.createClient(config.redis.port, config.redis.host);

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: [config.frontendHost, config.adminHost], credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  store: new RedisStore({
    client
  }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: Date.now() + (MAXAGE_DATE * 86400 * 1000)
  }
}));
app.use(passport.initialize());
app.use(passport.session());

AuthPassport();

app.use(rateLimit({
  windowMs: RATE_MINUTES * 60 * 1000,
  max: 500
}));
app.use('*', (req, res, next) => {
  logger.info(`${req.ip} ${req.method} ${req.originalUrl} ${req.get('User-Agent')}`);
  next();
});

app.use('/v1', Router);

schedule('0 */4 * * *', async () => {
  logger.info('우산 연체 여부를 확인합니다.');

  const now = Math.floor(new Date().getTime() / 1000);
  const current = await Rentals.findAll({
    where: {
      isExpire: false
    }
  });

  let count = 0;
  const promise = current.map(async (info) => {
    const time = Math.floor(info.expiryDate.getTime() / 1000);
    if (now >= time) {
      await setExpire(info.uuid);
      count += 1;
    }
  });

  await Promise.all(promise);

  logger.info(`우산 ${count}개가 연체되었습니다.`);
  logger.info('우산 연체 여부를 확인 완료했습니다.');
});
