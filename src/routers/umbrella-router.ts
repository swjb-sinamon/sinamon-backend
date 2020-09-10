import express from 'express';
import { body, param } from 'express-validator';
import { requireAuthenticated } from '../middlewares/permission';
import {
  createUmbrella,
  getUmbrella,
  getUmbrellas,
  removeUmbrella,
  updateUmbrella
} from '../services/umbrella-service';
import { logger } from '../index';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { checkValidation } from '../middlewares/validator';
import { UmbrellaStatus } from '../types';
import ServiceException from '../exceptions';

const router = express.Router();

router.get('/', requireAuthenticated, async (req, res) => {
  try {
    const data = await getUmbrellas();
    res.status(200).json({
      success: true,
      data
    });
    logger.info('전체 우산을 가져왔습니다.');
  } catch (e) {
    logger.error('전체 우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const getUmbrellaValidator = [
  param('name').isString()
];
router.get('/:name', getUmbrellaValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { name } = req.params;
    const data = await getUmbrella(name);

    res.status(200).json({
      success: true,
      data
    });

    logger.info(`${name} 우산을 가져왔습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 가져오는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const createUmbrellaValidator = [
  body('name').isString(),
  body('status').isIn(Object.values(UmbrellaStatus))
];
router.post('/', createUmbrellaValidator, checkValidation, requireAuthenticated, async (req: express.Request, res: express.Response) => {
  const { name, status } = req.body;

  try {
    const data = await createUmbrella(name, status);

    res.status(201).json({
      success: true,
      data
    });

    logger.info(`${name} 우산을 만들었습니다.`);
  } catch (e) {
    if (e instanceof ServiceException) {
      res.status(e.httpStatus).json(makeError(e.message));
      return;
    }

    logger.error('우산을 추가하는 중에 오류가 발생하였습니다.');
    logger.error(e);
    res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
  }
});

const updateUmbrellaValidator = [
  param('name').isString(),
  body('status').isIn(Object.values(UmbrellaStatus))
];
router.put('/:name', updateUmbrellaValidator, checkValidation, requireAuthenticated,
  async (req: express.Request, res: express.Response) => {
    const { name } = req.params;
    const { status } = req.body;
    try {
      const data = await updateUmbrella(name, status);

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${name} 우산을 수정했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('우산을 수정하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

const removeUmbrellaValidator = [
  param('name').isString()
];
router.delete('/:name', removeUmbrellaValidator, checkValidation, requireAuthenticated,
  async (req: express.Request, res: express.Response) => {
    const { name } = req.params;
    try {
      const data = await removeUmbrella(name);

      res.status(200).json({
        success: true,
        data
      });

      logger.info(`${name} 우산을 삭제했습니다.`);
    } catch (e) {
      if (e instanceof ServiceException) {
        res.status(e.httpStatus).json(makeError(e.message));
        return;
      }

      logger.error('우산을 삭제하는 중에 오류가 발생하였습니다.');
      logger.error(e);
      res.status(500).json(makeError(ErrorMessage.SERVER_ERROR));
    }
  });

export default router;
