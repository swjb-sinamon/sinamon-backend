import express from 'express';
import dotenv from 'dotenv';
import log4js from 'log4js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import config from './config';
import AuthPassport from './auth';
import DatabaseAssociation from './databases/association';
import db from './databases';

export const app = express();
export const logger = log4js.getLogger();

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

db.sync().then(() => {
  DatabaseAssociation();
  logger.info('Database connect completed successfully');
});

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true
}));

AuthPassport();
