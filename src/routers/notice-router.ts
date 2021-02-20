import express from 'express';
import { body } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import ServerConfigs from '../databases/models/server-configs';
import { checkValidation } from '../middlewares/validator';
import { logger } from '../index';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Notice
 *  description: 공지사항
 */

/**
 * @swagger
 * /notice:
 *  get:
 *    summary: 공지사항 가져오기
 *    tags: [Notice]
 *    responses:
 *      200:
 *        description: 공지사항
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 */
router.get('/', requireAuthenticated(), async (req, res) => {
  const notice = await ServerConfigs.findOne({
    where: {
      configKey: 'notice'
    }
  });

  if (!notice) {
    res.status(404).json({ success: false });
    return;
  }

  res.status(200).json({
    success: true,
    data: notice.configValue
  });
});

/**
 * @swagger
 * /notice:
 *  put:
 *    summary: 공지사항 수정하기
 *    tags: [Notice]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            notion:
 *              type: string
 *              description: 공지시항
 *    responses:
 *      200:
 *        description: 수정된 공지사항
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 */
const noticeValidator = [
  body('notice').isString()
];
router.put('/',
  requireAuthenticated(['admin', 'teacher']),
  noticeValidator,
  checkValidation,
  async (req: express.Request, res: express.Response) => {
    const { notice: noticeValue } = req.body;

    const notice = await ServerConfigs.findOne({
      where: {
        configKey: 'notice'
      }
    });

    if (!notice) {
      res.status(404).json({ success: false });
      return;
    }

    await notice.update({
      configValue: noticeValue
    });

    res.status(200).json({
      success: true,
      data: notice.configValue
    });

    logger.info('공지시항 내용을 변경하였습니다.');
  });

export default router;
