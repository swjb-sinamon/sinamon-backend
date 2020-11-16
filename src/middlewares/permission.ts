import express from 'express';
import { makeError } from '../error/error-system';
import ErrorMessage from '../error/error-message';
import { PermissionType } from '../types';
import Permissions from '../databases/models/permissions';
import { logger } from '../index';

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

export const requirePermission = (type: PermissionType[]) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { user }: any = req;

  if (!user) {
    res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
    return;
  }

  Permissions.findOne({
    where: {
      uuid: user.uuid
    }
  }).then((data) => {
    if (!data) {
      res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
      return;
    }

    const myPermission: PermissionType[] = [];

    if (data.isAdmin) {
      myPermission.push('admin');
    }

    if (data.isTeacher) {
      myPermission.push('teacher');
    }

    if (data.isSchoolUnion) {
      myPermission.push('schoolunion');
    }

    const result = myPermission.some((v) => type.includes(v));
    if (result) next();
    else res.status(401).json(makeError(ErrorMessage.NO_PERMISSION));
  });
};
