import { Op } from 'sequelize';
import Contests from '../databases/models/contests';
import { ContestRole } from '../types';
import { getUser } from './auth-service';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { PaginationResult } from '../types/pagination-result';
import { filter, FilterParam, pagination } from '../utils/router-util';

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
    role,
    isJoin: false
  });

  return result;
};

export const getContestMembers = async (
  limit?: number,
  offset?: number,
  query?: string,
  role?: ContestRole,
  filterOption?: Record<keyof Contests, unknown>
): Promise<PaginationResult<Contests[]>> => {
  const paginationOption = offset && limit ? pagination(offset, limit) : {};

  const filtering: FilterParam<Contests> = [];
  if (query) filtering.push([Op.like, 'name', `%${query}%`]);
  if (role !== undefined) filtering.push([Op.eq, 'role', role]);
  if (filterOption !== undefined) {
    Object.entries(filterOption).forEach(([key, value]) => {
      filtering.push([Op.eq, key as keyof Contests, value]);
    });
  }

  const { count, rows } = await Contests.findAndCountAll({
    ...paginationOption,
    where: {
      ...filter(filtering)
    }
  });

  return {
    count,
    data: rows
  };
};
