import Contests from '../databases/models/Contests';
import { ContestRole } from '../types';
import { getUser } from './auth-service';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { PaginationResult } from '../types/pagination-result';
import { pagination, search } from '../utils/router-util';

export const addContestMember = async (uuid: string, role: ContestRole): Promise<Contests> => {
  const user = await getUser(uuid);

  const current = await Contests.findOne({
    where: {
      uuid
    }
  });

  if (current) throw new ServiceException(ErrorMessage.CONTEST_ALREADY_EXISTS, 409);

  const result = await Contests.create({
    uuid,
    name: user.name,
    role
  });

  return result;
};

export const getContestMembers = async (
  limit?: number,
  offset?: number,
  query?: string,
  role?: ContestRole
): Promise<PaginationResult<Contests[]>> => {
  const searchOption = search<Contests>(query, 'name');
  const paginationOption = pagination(offset, limit);

  const count = await Contests.count({
    ...searchOption,
    where: {
      role
    }
  });

  const result = await Contests.findAll({
    ...searchOption,
    ...paginationOption,
    where: {
      role
    }
  });

  return {
    count,
    data: result
  };
};
