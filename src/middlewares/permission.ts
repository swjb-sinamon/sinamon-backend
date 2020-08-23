import express from 'express';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';

// eslint-disable-next-line import/prefer-default-export
export const requireAuthenticated = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.isAuthenticated()) {
    res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
    return;
  }

  next();
};
