import express from 'express';
import { requireAuthenticated } from '../middlewares/permission';
import ServerConfigs from '../databases/models/server-configs';

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

export default router;
