import { Op } from 'sequelize';
import { SubjectType } from '../../types';
import Subjects from '../../databases/models/subject/subjects';
import { filter, pagination } from '../../utils/router-util';
import { PaginationResult } from '../../types/pagination-result';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';

interface AddSubjectProps {
  readonly name: string;
  readonly description: string;
  readonly type: SubjectType;
  readonly maxPeople: number;
}

interface SearchOption {
  readonly name: string;
}

export const getSubjects = async (
  page = 0,
  limit = 10,
  searchQuery?: SearchOption
): Promise<PaginationResult<Subjects[]>> => {
  const paginationOption = pagination(page, limit);
  const searchOption = searchQuery
    ? filter<Subjects>([[Op.like, 'name', `%${searchQuery.name}%`]])
    : {};

  const { rows, count } = await Subjects.findAndCountAll({
    ...paginationOption,
    where: {
      ...searchOption
    }
  });

  return {
    count,
    data: rows
  };
};

export const getSubject = async (id: number): Promise<Subjects> => {
  const result = await Subjects.findOne({
    where: {
      id
    }
  });

  if (!result) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  return result;
};

export const addSubject = async (options: AddSubjectProps): Promise<Subjects> => {
  const result = await Subjects.create({
    ...options,
    currentPeople: 0
  });
  return result;
};
