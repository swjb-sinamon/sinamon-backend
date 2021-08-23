import { Op } from 'sequelize';
import { ApplicationType, SubjectType } from '../../types';
import Subjects from '../../databases/models/subject/subjects';
import { filter, pagination } from '../../utils/router-util';
import { PaginationResult } from '../../types/pagination-result';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import SubjectData from '../../databases/models/subject/subject-data';

interface AddSubjectProps {
  readonly name: string;
  readonly description: string;
  readonly type: SubjectType;
  readonly applicationType: ApplicationType;
  readonly maxPeople: number;
}

interface SearchOption {
  readonly name: string;
}

export const getSubjects = async (
  page = 0,
  limit = 10,
  searchQuery?: SearchOption
): Promise<PaginationResult<Array<Subjects & { subjectData: SubjectData }>>> => {
  const paginationOption = pagination(page, limit);
  const searchOption = searchQuery
    ? filter<Subjects>([[Op.like, 'name', `%${searchQuery.name}%`]])
    : {};

  const { rows, count } = await Subjects.findAndCountAll({
    ...paginationOption,
    where: {
      ...searchOption
    },
    include: [
      {
        model: SubjectData,
        as: 'subjectData'
      }
    ] as never
  });

  return {
    count,
    data: rows as Array<Subjects & { subjectData: SubjectData }>
  };
};

export const getSubject = async (id: number): Promise<Subjects & { subjectData: SubjectData }> => {
  const result = await Subjects.findOne({
    where: {
      id
    },
    include: [
      {
        model: SubjectData,
        as: 'subjectData'
      }
    ] as never
  });

  if (!result) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  return result as Subjects & { subjectData: SubjectData };
};

export const addSubject = async (
  options: AddSubjectProps
): Promise<Subjects & { subjectData: SubjectData }> => {
  const subject = await Subjects.create({
    type: options.type,
    name: options.name,
    description: options.description
  });

  const subjectData = await SubjectData.create({
    subjectId: subject.id,
    applicationType: options.applicationType,
    maxPeople: options.maxPeople,
    currentPeople: 0
  });

  const result = subject as Subjects & {
    subjectData: SubjectData;
  };
  result.subjectData = subjectData;

  return result;
};
