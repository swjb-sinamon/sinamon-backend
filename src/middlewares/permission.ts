import express from 'express';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { PermissionType } from '../types';
import { getMyPermission } from '../services/auth-service';

export const requireAuthenticated = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
    return;
  }

  next();
};

export const requirePermission = (type: PermissionType[]) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const { user }: any = req;

  if (!user) {
    res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
    return;
  }

  getMyPermission(user.uuid).then((my) => {
    if (my.length === 0) {
      res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
      return;
    }

    const result = my.some((v) => type.includes(v));
    if (result) {
      next();
    } else {
      res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
    }
  });
};
