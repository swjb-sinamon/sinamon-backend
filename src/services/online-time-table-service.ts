import OnlineTimeTables from '../databases/models/online-time-tables';
import { DayWeek, NotFound, TupleError } from '../types';
import Subjects from '../databases/models/subjects';

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

export const getOnlineTimeTable = async (id: number):
  Promise<OnlineTimeTables | NotFound> => {
  const result = await OnlineTimeTables.findOne({
    where: {
      id
    }
  });

  if (!result) return undefined;

  return result;
};

export const createOnlineTimeTable = async (createProps: OnlineTimeTableProps):
  Promise<OnlineTimeTables | NotFound> => {
  const { subjectId, teacher, type, url, startTime, dayWeek } = createProps;

  const subject = await Subjects.findOne({
    where: {
      id: subjectId
    }
  });

  if (!subject) return undefined;

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
  Promise<OnlineTimeTables | TupleError> => {
  const { subjectId, teacher, type, url, startTime, dayWeek } = updateProps;

  const subject = await Subjects.findOne({
    where: {
      id: subjectId
    }
  });

  if (!subject) return { prepareError: true, error: false };

  const current = await OnlineTimeTables.findOne({
    where: {
      id
    }
  });

  if (!current) return { prepareError: false, error: true };

  await current?.update({
    teacher,
    type,
    url,
    startTime,
    dayWeek
  });

  return current;
};

export const removeOnlineTimeTables = async (id: number): Promise<OnlineTimeTables | NotFound> => {
  const current = await OnlineTimeTables.findOne({
    where: {
      id
    }
  });

  if (!current) {
    return undefined;
  }

  await current.destroy();

  return current;
};
