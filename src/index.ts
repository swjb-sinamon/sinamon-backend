import express from 'express';
import dotenv from 'dotenv';
import log4js from 'log4js';
import cookieParser from 'cookie-parser';

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

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
