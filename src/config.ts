import dotenv from 'dotenv';

dotenv.config();

const config = {
  database: {
    host: process.env.DATABASE_HOST! || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    userName: process.env.DATABASE_USERNAME! || 'root',
    password: process.env.DATABASE_PASSWORD! || 'password',
    db: process.env.DATABASE_DB! || 'sinamon'
  }
};

export default config;
