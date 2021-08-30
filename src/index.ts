import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import log4js from 'log4js';
import passport from 'passport';
import redis from 'redis';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import { promisify } from 'util';
import AuthPassport from './auth';
import { initApiCache } from './cache/init-cache';
import config, { swaggerConfig } from './config';
import cron from './cron';
import db from './databases';
import DatabaseAssociation from './databases/association';
import { initializeServerConfig } from './databases/Initialize';
import timetableParser from './managers/timetable-parser';
import { sendErrorToDiscord } from './managers/webhook';
import Router from './routers';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const connectRedis = require('connect-redis');

export const app = express();
export const logger = log4js.getLogger();
export const redisClient = redis.createClient(config.redis.port, config.redis.host);
export const redisUtil = {
  getAsync: promisify(redisClient.get).bind(redisClient),
  setAsync: promisify(redisClient.set).bind(redisClient)
};

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
  await db.query('ALTER TABLE subjects AUTO_INCREMENT=10000;');
  await db.query('ALTER TABLE subject_data AUTO_INCREMENT=10000;');
  await db.query('ALTER TABLE application_subjects AUTO_INCREMENT=10000;');
  await db.query('ALTER TABLE success_subjects AUTO_INCREMENT=10000;');
  logger.info('Database connect completed successfully');

  await initializeServerConfig();
});

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: config.frontendHost, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const RedisStore = connectRedis(session);
app.use(
  session({
    store: new RedisStore({
      client: redisClient
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Date.now() + MAXAGE_DATE * 86400 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
AuthPassport();

app.use(
  rateLimit({
    windowMs: RATE_MINUTES * 60 * 1000,
    max: 500
  })
);

app.use((req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode === 500 && process.env.NODE_ENV === 'production') {
      await sendErrorToDiscord(req.method, req.originalUrl);
    }
  });
  next();
});
app.use('/v2/*', (req, res, next) => {
  logger.info(`${req.ip} ${req.method} ${req.originalUrl} ${req.get('User-Agent')}`);
  next();
});
app.use('/v2', Router);

const specs = swaggerJSDoc(swaggerConfig);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

cron();

(async () => {
  await initApiCache();
  await timetableParser.fetchTimetable();
  logger.info('Fetch external API data successfully');
})();
