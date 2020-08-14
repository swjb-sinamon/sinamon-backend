import { Sequelize } from 'sequelize';
import config from '../config';

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

export default db;
