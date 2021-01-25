import express from 'express';
import { body } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import ServerConfigs from '../databases/models/server-configs';
import { checkValidation } from '../middlewares/validator';
import { logger } from '../index';

const router = express.Router();

/**
 * @api {get} /notice 공지사항 가져오기
 * @apiName GetNotice
 * @apiGroup Notice
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
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

const noticeValidator = [
  body('notice').isString()
];
/**
 * @api {put} /notice 공지사항 수정
 * @apiName UpdateNotice
 * @apiGroup Notice
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 데이터
 *
 * @apiError (Error 401) NO_PERMISSION 권한이 없습니다.
 * @apiError (Error 500) SERVER_ERROR 오류가 발생하였습니다. 잠시후 다시 시도해주세요.
 */
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
