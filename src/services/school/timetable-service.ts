import { Op } from 'sequelize';
import { ComciganTimetable } from '../../types';
import TimeTables from '../../databases/models/time-tables';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import { filter, pagination } from '../../utils/router-util';
import { getTimetableCache } from '../../cache/api-cache';
import { PaginationResult } from '../../types/pagination-result';

interface CreateTimetableProps {
  readonly subject: string;
  readonly teacher: string;
  readonly url: string;
}

interface SearchOption {
  readonly key: 'subject' | 'teacher';
  readonly query: string;
}

export const getTimetables = async (
  page = 0,
  limit = 10,
  searchQuery?: SearchOption
): Promise<PaginationResult<TimeTables[]>> => {
  const paginationOption = pagination(page, limit);
  const searchOption = searchQuery
    ? filter<TimeTables>([[Op.like, searchQuery?.key, `%${searchQuery?.query}%`]])
    : {};

  const { rows, count } = await TimeTables.findAndCountAll({
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

const SUBJECT_REGEX = /[^(ㄱ-ㅎ가-힣a-zA-Z0-9)]/g;
export const getThisWeekTimetables = async (grade: number, fullClass: number): Promise<unknown> => {
  const timetableData = await getTimetableCache();

  const thisWeekTimetable = timetableData[grade][fullClass];
  const result = thisWeekTimetable.map((today: ComciganTimetable[]) => {
    const timeTableWithURL = today.map(async (value: ComciganTimetable) => {
      const subject = value.subject
        .replace('d', '')
        .replace(SUBJECT_REGEX, '');
      const teacher = value.teacher
        .replace('*', '');

      const timeTable = await TimeTables.findOne({
        where: {
          subject: {
            [Op.like]: `%${subject}%`
          },
          teacher: {
            [Op.like]: `%${teacher}%`
          }
        }
      });

      if (!timeTable) {
        return {
          ...value,
          subject,
          url: null
        };
      }

      return {
        ...value,
        subject,
        url: timeTable.url
      };
    });

    return Promise.all(timeTableWithURL);
  });

  return Promise.all(result);
};

export const createTimetable = async (data: CreateTimetableProps): Promise<TimeTables> => {
  const current = await TimeTables.findOne({
    where: {
      subject: data.subject,
      teacher: data.teacher
    }
  });

  if (current) throw new ServiceException(ErrorMessage.TIMETABLE_ALREADY_EXISTS, 409);

  const result = await TimeTables.create({
    subject: data.subject,
    teacher: data.teacher,
    url: data.url
  });

  return result;
};

export const updateTimetable = async (
  id: number,
  data: Partial<CreateTimetableProps>
): Promise<TimeTables> => {
  const current = await TimeTables.findOne({
    where: {
      id
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.TIMETABLE_NOT_FOUND, 404);

  await current.update(data);

  return current;
};

export const removeTimetable = async (id: number): Promise<TimeTables> => {
  const current = await TimeTables.findOne({
    where: {
      id
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.TIMETABLE_NOT_FOUND, 404);

  await current.destroy();

  return current;
};
