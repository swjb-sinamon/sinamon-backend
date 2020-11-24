import { Op } from 'sequelize';
import Umbrellas from '../databases/models/umbrellas';
import { UmbrellaStatus } from '../types';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Rentals from '../databases/models/rentals';
import { pagination } from '../utils/pagination';

type UmbrellaReturn = { data: Umbrellas[], count: number };

export const getUmbrellaAllData = async (usePagination = false, page = 0, limit = 10):
  Promise<UmbrellaReturn> => {
  const option = pagination(usePagination, page, limit);

  const count = await Umbrellas.count();

  const result = await Umbrellas.findAll({
    ...option,
    include: [
      {
        model: Rentals,
        attributes: ['lender', 'expiryDate', 'isExpire']
      }
    ] as never
  });

  return {
    data: result,
    count
  };
};

export const getUmbrellas = async (): Promise<Umbrellas[]> => {
  const umbrellas = await Umbrellas.findAll({
    include: {
      model: Rentals,
      attributes: ['uuid']
    } as never
  });

  const result = umbrellas
    .filter((umbrella: any) => !umbrella.rental)
    .map((item: any) => item.dataValues)
    .map(({ rental, ...current }: any) => current);

  return result;
};

export const getBorrowedUmbrellas = async (): Promise<Umbrellas[]> => {
  const result = await Umbrellas.findAll({
    include: {
      model: Rentals,
      attributes: [],
      where: {
        uuid: {
          [Op.not]: null
        }
      }
    } as never
  });

  return result;
};

export const getExpiryUmbrellas = async (): Promise<Umbrellas[]> => {
  const result = await Umbrellas.findAll({
    include: {
      model: Rentals,
      attributes: [],
      where: {
        isExpire: true
      }
    } as never
  });

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
