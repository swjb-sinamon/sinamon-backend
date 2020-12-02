import { range } from 'fxjs';
import dayjs from 'dayjs';
import { Op, Sequelize } from 'sequelize';
import Uniform from '../databases/models/uniform';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { getUserWithInfo } from './auth-service';
import UniformPersonal from '../databases/models/uniform-personal';
import Users from '../databases/models/users';
import { pagination } from '../utils/router-util';

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

const initUniformPersonalData = async (
  name: string,
  department: number,
  grade: number,
  clazz: number,
  number: number
): Promise<void> => {
  const user = await getUserWithInfo(name, department, grade, clazz, number);

  const current = await UniformPersonal.findAll({
    where: {
      uuid: user.uuid
    }
  });

  if (current.length === 8) return;

  const promise = range(9, 17)
    .map(async (i: number) => {
      const date = dayjs()
        .set('month', 11)
        .set('date', i)
        .toDate();

      await UniformPersonal.create({
        uuid: user.uuid,
        date,
        score: 0
      });
    });

  await Promise.all(promise);
};

export const getUniformPersonals = async (
  date: Date,
  usePagination = false,
  page = 0,
  limit = 10,
): Promise<{ count: number, data: UniformPersonal[] }> => {
  const option = pagination(usePagination, page, limit);

  const count = await UniformPersonal.count({
    where: {
      date,
      score: {
        [Op.gt]: 0
      }
    }
  });

  const data = await UniformPersonal.findAll({
    ...option,
    where: {
      date,
      score: {
        [Op.gt]: 0
      }
    },
    include: {
      model: Users,
      attributes: ['name', 'department', 'studentGrade', 'studentClass', 'studentNumber']
    } as never,
  });

  return {
    count,
    data
  };
};

export const getUniformPersonalRank = async (
  usePagination = false,
  page = 0,
  limit = 10,
): Promise<{ count: number, data: UniformPersonal[] }> => {
  const option = pagination(usePagination, page, limit);

  const count = await UniformPersonal.count({
    attributes: [
      'uuid',
      [Sequelize.fn('sum', Sequelize.col('score')), 'totalScore']
    ],
    where: {
      score: {
        [Op.gt]: 0
      }
    },
    group: ['uuid']
  });

  const data = await UniformPersonal.findAll({
    ...option,
    attributes: [
      'uuid',
      [Sequelize.fn('sum', Sequelize.col('score')), 'totalScore']
    ],
    where: {
      score: {
        [Op.gt]: 0
      }
    },
    order: [
      ['score', 'DESC']
    ],
    include: {
      model: Users,
      attributes: ['name', 'department', 'studentGrade', 'studentClass', 'studentNumber']
    } as never,
    group: ['uuid']
  });

  return {
    count: count.length,
    data
  };
};

export const addUniformPersonalScore = async (
  name: string,
  department: number,
  grade: number,
  clazz: number,
  number: number,
  date: Date
): Promise<UniformPersonal> => {
  await initUniformPersonalData(name, department, grade, clazz, number);

  const user = await getUserWithInfo(name, department, grade, clazz, number);

  const current = await UniformPersonal.findOne({
    where: {
      uuid: user.uuid,
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
  name: string,
  department: number,
  grade: number,
  clazz: number,
  number: number,
  date: Date
): Promise<UniformPersonal> => {
  await initUniformPersonalData(name, department, grade, clazz, number);

  const user = await getUserWithInfo(name, department, grade, clazz, number);

  const current = await UniformPersonal.findOne({
    where: {
      uuid: user.uuid,
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
