import Umbrellas from '../databases/models/umbrellas';
import { UmbrellaStatus } from '../types';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Rentals from '../databases/models/rentals';
import { logger } from '../index';

export const getUmbrellas = async (): Promise<Umbrellas[]> => {
  const result = await Umbrellas.findAll();
  return result;
};

export const getNoRentalUmbrellas = async (): Promise<Umbrellas[]> => {
  const umbrellas = await Umbrellas.findAll();

  if (umbrellas.length === 0) return [];

  const resultPromises = umbrellas.map(async (umbrella) => {
    const rental = await Rentals.findOne({
      where: {
        umbrellaName: umbrella.name
      }
    });

    if (!rental) return umbrella;
    return undefined;
  });

  const result = (await Promise.all(resultPromises)).filter((i) => i) as Umbrellas[];
  return result;
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
