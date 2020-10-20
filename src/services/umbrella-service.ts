import Umbrellas from '../databases/models/umbrellas';
import { UmbrellaStatus } from '../types';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Rentals from '../databases/models/rentals';

export const getUmbrellas = async (): Promise<Umbrellas[]> => {
  const result = await Umbrellas.findAll();
  return result;
};

export const getAbleUmbrellaWithStatus = async (status: UmbrellaStatus):
  Promise<string | undefined> => {
  const umbrellas = await Umbrellas.findAll({
    where: {
      status
    }
  });

  if (umbrellas.length === 0) return undefined;

  const resultPromises = umbrellas
    .map((umbrella) => umbrella.name)
    .map(async (umbrellaName) => {
      const rental = await Rentals.findOne({
        where: {
          umbrellaName
        }
      });

      if (!rental) return umbrellaName;
      return undefined;
    })
    .filter((value) => value);

  const result = await Promise.all(resultPromises);
  if (result.length === 0) return undefined;
  return result[0];
};

export const getUmbrella = async (name: string): Promise<Umbrellas> => {
  const result = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (!result) throw new ServiceException(ErrorMessage.UMBRELLA_NOT_FOUND, 404);

  return result;
};

export const createUmbrella = async (name: string, status: UmbrellaStatus): Promise<Umbrellas> => {
  const current = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (current) throw new ServiceException(ErrorMessage.UMBRELLA_ALREADY_EXISTS, 409);

  const result = await Umbrellas.create({
    name,
    status
  });

  return result;
};

export const updateUmbrella = async (name: string, status: UmbrellaStatus): Promise<Umbrellas> => {
  const current = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.UMBRELLA_NOT_FOUND, 404);

  await current.update({
    status
  });

  return current;
};

export const removeUmbrella = async (name: string): Promise<Umbrellas> => {
  const current = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.UMBRELLA_NOT_FOUND, 404);

  await current.destroy();

  return current;
};
