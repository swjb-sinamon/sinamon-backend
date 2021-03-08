import { Op } from 'sequelize';
import FCM from '../databases/models/fcm';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { filter, FilterParam, pagination } from '../utils/router-util';
import Users from '../databases/models/users';
import { PaginationResult } from '../types/pagination-result';

export const getFCMTokens = async (
  offset?: number,
  limit?: number,
  nameSearchQuery?: string
): Promise<PaginationResult<Array<FCM & { user: Users }>>> => {
  const pageOption = offset && limit ? pagination(offset, limit) : {};

  const filtering: FilterParam<never> = [];
  if (nameSearchQuery) {
    filtering.push([Op.like, 'name', `%${nameSearchQuery}%`]);
  }

  const { count, rows } = await FCM.findAndCountAll({
    ...pageOption,
    include: [
      {
        model: Users,
        attributes: ['name', 'department', 'studentGrade', 'studentClass', 'studentNumber'],
        as: 'user',
        where: {
          ...filter(filtering)
        }
      }
    ] as never
  });

  return {
    count,
    data: rows as Array<FCM & { user: Users }>
  };
};

export const getFCMToken = async (uuid: string): Promise<FCM> => {
  const current = await FCM.findOne({
    where: {
      uuid
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.FCM_TOKEN_NOT_FOUND, 404);

  return current;
};

export const createOrUpdateFCMToken = async (uuid: string, token: string): Promise<FCM> => {
  try {
    const current = await getFCMToken(uuid);

    await current.update({
      token
    });

    return current;
  } catch (e) {
    if (e instanceof ServiceException && e.message === ErrorMessage.FCM_TOKEN_NOT_FOUND) {
      const result = await FCM.create({
        uuid,
        token
      });

      return result;
    }

    throw e;
  }
};
