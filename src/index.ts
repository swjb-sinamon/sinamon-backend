import express from 'express';
import dotenv from 'dotenv';
import log4js from 'log4js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import AuthPassport from './auth';
import DatabaseAssociation from './databases/association';
import db from './databases';
import Router from './routers';

export const app = express();
export const logger = log4js.getLogger();

const RATE_MINUTES = 1;

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
  await db.query('ALTER TABLE subjects AUTO_INCREMENT=100;');
  await db.query('ALTER TABLE onlinetimetables AUTO_INCREMENT=10000;');
  logger.info('Database connect completed successfully');
});

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: config.frontendHost, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true
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
