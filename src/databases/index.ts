import { Sequelize } from 'sequelize';
import config from '../config';
import { logger } from '../index';

const db = new Sequelize(
  config.database.db,
  config.database.userName,
  config.database.password,
  {
    logging: false,
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    timezone: '+09:00'
  }
);

db.sync().then(() => logger.info('Database connect completed successfully'));

export default db;
