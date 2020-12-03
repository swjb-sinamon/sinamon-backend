import OnlineTimeTables from '../databases/models/online-time-tables';
import { DayWeek } from '../types';
import Subjects from '../databases/models/subjects';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';

interface OnlineTimeTableProps {
  readonly subjectId: number;
  readonly teacher: string;
  readonly type: string;
  readonly url: string;
  readonly startTime: Date;
  readonly dayWeek: DayWeek;
}

export const getOnlineTimeTables = async (): Promise<OnlineTimeTables[]> => {
  const result = await OnlineTimeTables.findAll();
  return result;
};

export const getOnlineTimeTable = async (id: number): Promise<OnlineTimeTables> => {
  const result = await OnlineTimeTables.findOne({
    where: {
      id
    }
  });

  if (!result) throw new ServiceException(ErrorMessage.ONLINETIMETABLE_NOT_FOUND, 404);

  return result;
};

export const createOnlineTimeTable = async (createProps: OnlineTimeTableProps):
  Promise<OnlineTimeTables> => {
  const { subjectId, teacher, type, url, startTime, dayWeek } = createProps;

  const subject = await Subjects.findOne({
    where: {
      id: subjectId
    }
  });

  if (!subject) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  const result = await OnlineTimeTables.create({
    subjectId,
    teacher,
    type,
    url,
    startTime,
    dayWeek
  });

  return result;
};

export const updateOnlineTimeTable = async (id: number, updateProps: OnlineTimeTableProps):
  Promise<OnlineTimeTables> => {
  const { subjectId, teacher, type, url, startTime, dayWeek } = updateProps;

  const subject = await Subjects.findOne({
    where: {
      id: subjectId
    }
  });

  if (!subject) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  const current = await OnlineTimeTables.findOne({
    where: {
      id
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.ONLINETIMETABLE_NOT_FOUND, 404);

  await current?.update({
    teacher,
    type,
    url,
    startTime,
    dayWeek
  });

  return current;
};

export const removeOnlineTimeTable = async (id: number): Promise<OnlineTimeTables> => {
  const current = await OnlineTimeTables.findOne({
    where: {
      id
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.ONLINETIMETABLE_NOT_FOUND, 404);

  await current.destroy();

  return current;
};
