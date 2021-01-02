import { Op } from 'sequelize';
import { getTimetableInstance } from '../../utils/timetable-lib';
import { ComciganTimetable } from '../../types';
import TimeTables from '../../databases/models/time-tables';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import { pagination, search } from '../../utils/router-util';

type TimetableType = Record<string, // Grade
  Record<string, // fullClass
    ComciganTimetable[][]>>; // thisWeek

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
): Promise<{ data: TimeTables[], count: number }> => {
  const paginationOption = pagination(page, limit);
  const searchOption = search<TimeTables>(searchQuery?.query, searchQuery?.key);

  const count = await TimeTables.count({
    ...searchOption
  });

  const data = await TimeTables.findAll({
    ...paginationOption,
    ...searchOption
  });

  return {
    count,
    data
  };
};

export const getThisWeekTimetables = async (grade: number, fullClass: number): Promise<unknown> => {
  const timetable = await getTimetableInstance();

  return timetable.getTimetable().then((v: TimetableType) => {
    const thisWeekTimetable = v[grade][fullClass];
    const result = thisWeekTimetable.map((today: ComciganTimetable[]) => {
      const timeTableWithURL = today.map(async (value: ComciganTimetable) => {
        const subject = value.subject.trim().replace('d', '').replace('Ⅰ', '');

        const timeTable = await TimeTables.findOne({
          where: {
            subject: {
              [Op.like]: `%${subject}%`
            },
            teacher: {
              [Op.like]: `%${value.teacher.replace('*', '')}%`
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
  });
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
