import { range } from 'fxjs';
import dayjs from 'dayjs';
import Uniform from '../databases/models/uniform';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { getUser } from './auth-service';
import UniformPersonal from '../databases/models/uniform-personal';

export const getUniforms = async (grade: number, fullClass: number): Promise<Uniform[]> => {
  const result = await Uniform.findAll({
    where: {
      grade,
      fullClass
    },
    order: [
      ['date', 'ASC']
    ]
  });

  return result;
};

export const addUniformScore = async (
  grade: number,
  fullClass: number,
  date: Date
): Promise<Uniform> => {
  const current = await Uniform.findOne({
    where: {
      grade,
      fullClass,
      date
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.UNIFORM_NOT_FOUND, 404);

  const currentScore = current.score;

  await current.update({
    score: currentScore + 1
  });

  return current;
};

export const subUniformScore = async (
  grade: number,
  fullClass: number,
  date: Date
): Promise<Uniform> => {
  const current = await Uniform.findOne({
    where: {
      grade,
      fullClass,
      date
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.UNIFORM_NOT_FOUND, 404);

  const currentScore = current.score;

  if (currentScore === 0) throw new ServiceException(ErrorMessage.UNIFORM_NOT_MINUS, 409);

  await current.update({
    score: currentScore - 1
  });

  return current;
};

const initUniformPersonalData = async (uuid: string): Promise<void> => {
  const user = await getUser(uuid);

  if (!user) return;

  const current = await UniformPersonal.findAll({
    where: {
      uuid
    }
  });

  if (current.length === 9) return;

  const promise = range(9, 17)
    .map(async (i: number) => {
      const date = dayjs()
        .set('month', 11)
        .set('date', i)
        .toDate();

      await UniformPersonal.create({
        uuid,
        date,
        score: 0
      });
    });

  await Promise.all(promise);
};

export const getUniformPersonal = async (uuid: string, date: Date): Promise<UniformPersonal> => {
  await initUniformPersonalData(uuid);

  const current = await UniformPersonal.findOne({
    where: {
      uuid,
      date
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.UNIFORM_NOT_FOUND, 404);

  return current;
};

export const addUniformPersonalScore = async (
  uuid: string,
  date: Date
): Promise<UniformPersonal> => {
  await initUniformPersonalData(uuid);

  const current = await UniformPersonal.findOne({
    where: {
      uuid,
      date
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.UNIFORM_NOT_FOUND, 404);

  const currentScore = current.score;

  await current.update({
    score: currentScore + 1
  });

  return current;
};

export const subUniformPersonalScore = async (
  uuid: string,
  date: Date
): Promise<UniformPersonal> => {
  await initUniformPersonalData(uuid);

  const current = await UniformPersonal.findOne({
    where: {
      uuid,
      date
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.UNIFORM_NOT_FOUND, 404);

  const currentScore = current.score;

  if (currentScore === 0) throw new ServiceException(ErrorMessage.UNIFORM_NOT_MINUS, 409);

  await current.update({
    score: currentScore - 1
  });

  return current;
};
