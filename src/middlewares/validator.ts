import express from 'express';
import { validationResult } from 'express-validator';
import { makeValidationError } from '../error/error-system';

// eslint-disable-next-line import/prefer-default-export
export const checkValidation = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(makeValidationError(errors.array()));
    return;
  }

  next();
};
