import express from 'express';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { requireAuthenticated } from '../middlewares/permission';
import { logger } from '../index';
import { QRCODE_EXPIRE_MINUTE, qrKey } from '../managers/qr-crypto';

const router = express.Router();

router.get('/', requireAuthenticated, (req, res) => {
  const { uuid, email }: any = req.user;
  if (!uuid) return;

  const expire = dayjs().add(QRCODE_EXPIRE_MINUTE, 'minute').unix();
  const data = {
    uuid,
    email,
    createdAt: dayjs().unix(),
    expiresIn: expire
  };

  const passCipher = crypto.createCipher('aes-256-cbc', qrKey);
  let cipher = passCipher.update(JSON.stringify(data), 'utf8', 'base64');
  cipher += passCipher.final('base64');

  res.status(200).json({
    success: true,
    data: cipher
  });

  logger.info(`${uuid} ${email} 님이 QR코드를 발급하였습니다.`);
});

export default router;
