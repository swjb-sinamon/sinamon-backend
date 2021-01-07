import express from 'express';
import { body } from 'express-validator';
import { requireAuthenticated, requirePermission } from '../middlewares/permission';
import ServerConfigs from '../databases/models/server-configs';
import { checkValidation } from '../middlewares/validator';

const router = express.Router();

router.get('/', requireAuthenticated, async (req, res) => {
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
router.put('/', requireAuthenticated, requirePermission(['admin', 'teacher']), noticeValidator, checkValidation, async (req: express.Request, res: express.Response) => {
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
  notice.update({
    configValue: noticeValue
  });

  res.status(200).json({
    success: true,
    data: notice.configValue
  });
});

export default router;
