import crypto from 'crypto';
import config from '../config';

export const QRCODE_EXPIRE_MINUTE = 5;
export const qrKey = crypto
  .createHash('sha256')
  .update(config.qrSecret)
  .digest('base64');
