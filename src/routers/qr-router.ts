import express from 'express';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { body } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import config from '../config';
import { logger } from '../index';
import { checkValidation } from '../middlewares/validator';

const router = express.Router();

const QRCODE_EXPIRE_MINUTE = 1;
const key = crypto
  .createHash('sha256')
  .update(config.qrSecret)
  .digest('base64');

router.get('/', requireAuthenticated, (req, res) => {
  const { uuid, email }: any = req.user;
  if (!uuid) return;

  const expire = dayjs().add(QRCODE_EXPIRE_MINUTE, 'second').unix();
  const data = {
    uuid,
    email,
    createdAt: dayjs().unix(),
    expiresIn: expire
  };

  const passCipher = crypto.createCipher('aes-256-cbc', key);
  let cipher = passCipher.update(JSON.stringify(data), 'utf8', 'base64');
  cipher += passCipher.final('base64');

  res.status(200).json({
    success: true,
    data: cipher
  });

  logger.info(`${uuid} ${email} 님이 QR코드를 발급하였습니다.`);
});

const decodeValidator = [
  body('data').isString()
];
router.post('/decode', decodeValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { data } = req.body;

  const passDecipher = crypto.createDecipher('aes-256-cbc', key);
  let plain = passDecipher.update(data, 'base64', 'utf8');
  plain += passDecipher.final('utf8');

  const decodeData: {
    uuid: string;
    email: string;
    createdAt: number;
    expiresIn: number;
  } = JSON.parse(plain);

  const now = dayjs().unix();

  if (now > decodeData.expiresIn) {
    // TODO: QR 만료 시 코드
    return;
  }

  // TODO: 우산 대여하는 코드
  // TODO: 연체 시 거부하는 코드

  res.status(200).json({
    success: true
  });
});

export default router;
