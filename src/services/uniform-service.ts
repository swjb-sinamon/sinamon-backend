import Uniform from '../databases/models/uniform';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';

export const getUniforms = async (grade: number, fullClass: number): Promise<Uniform[]> => {
  const result = await Uniform.findAll({
    where: {
      grade,
      fullClass
    }
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

  await current.update({
    score: currentScore - 1
  });

  return current;
};
