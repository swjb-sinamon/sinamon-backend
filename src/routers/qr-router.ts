import express from 'express';
import { requireAuthenticated } from '../middlewares/permission';

const router = express.Router();

router.get('/', requireAuthenticated, (req, res) => {
  const { uuid, email }: any = req.user;
  if (!uuid) return;

  res.status(200).json({
    success: true,
    data: {
      uuid,
      email,
      createdAt: new Date()
    }
  });
});

export default router;
