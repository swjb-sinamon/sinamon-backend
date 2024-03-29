import dotenv from 'dotenv';

dotenv.config();

const config = {
  database: {
    host: process.env.DATABASE_HOST! || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    userName: process.env.DATABASE_USERNAME! || 'root',
    password: process.env.DATABASE_PASSWORD! || 'password',
    db: process.env.DATABASE_DB! || 'sinamon'
  },
  frontendHost: process.env.FRONTEND_HOST!,
  sessionSecret: process.env.SESSION_SECRET!,
  saltRound: parseInt(process.env.BCRYPT_SALT_ROUNDS!, 10),
  qrSecret: process.env.QR_SECRET!,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY!,
  redis: {
    host: process.env.REDIS_HOST! || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  },
  discordWebhook: process.env.DISCORD_WEBHOOK || ''
};

export const swaggerConfig = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Sinamon Backend API',
      version: '2.0.0'
    },
    servers: [
      {
        url: 'http://localhost:8080/v2',
        description: 'Development API Server'
      }
    ]
  },
  apis: ['src/routers/**/*.ts']
};

export default config;
