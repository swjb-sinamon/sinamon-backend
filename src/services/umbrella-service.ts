import { Op } from 'sequelize';
import Umbrellas from '../databases/models/umbrellas';
import { UmbrellaStatus } from '../types';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Rentals from '../databases/models/rentals';
import { pagination, search } from '../utils/router-util';

type UmbrellaReturn = { data: Umbrellas[], count: number };

export const getUmbrellaAllData = async (
  page?: number,
  limit?: number,
  searchQuery?: string
): Promise<UmbrellaReturn> => {
  const option = pagination(page, limit);
  const searchOption = search<Umbrellas>(searchQuery, 'name');

  const count = await Umbrellas.count({
    ...searchOption
  });

  const result = await Umbrellas.findAll({
    ...option,
    ...searchOption,
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

export const getUmbrellas = async (
  page?: number,
  limit?: number,
  searchQuery?: string
): Promise<UmbrellaReturn> => {
  const searchOption = search<Umbrellas>(searchQuery, 'name');

  const umbrellas = await Umbrellas.findAll({
    ...searchOption,
    include: {
      model: Rentals,
      attributes: ['uuid']
    } as never
  });

  const data = umbrellas
    .filter((umbrella: any) => !umbrella.rental)
    .map((item: any) => item.dataValues)
    .map(({ rental, ...current }: any) => current);

  let currentPageData: Umbrellas[] | undefined;
  if (page && limit) {
    const indexOfLastPost = page * limit;
    const indexOfFirstPost = indexOfLastPost - limit;
    currentPageData = data.slice(indexOfFirstPost, indexOfLastPost);
  }

  return {
    count: data.length,
    data: currentPageData || data
  };
};

export const getBorrowedUmbrellas = async (
  page?: number,
  limit?: number,
  searchQuery?: string
): Promise<UmbrellaReturn> => {
  const option = pagination(page, limit);
  const searchOption = search<Umbrellas>(searchQuery, 'name');

  const count = await Umbrellas.count({
    ...searchOption,
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

  const result = await Umbrellas.findAll({
    ...option,
    ...searchOption,
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

  return {
    count,
    data: result
  };
};

export const getExpiryUmbrellas = async (
  page?: number,
  limit?: number,
  searchQuery?: string
): Promise<UmbrellaReturn> => {
  const option = pagination(page, limit);
  const searchOption = search<Umbrellas>(searchQuery, 'name');

  const count = await Umbrellas.count({
    ...searchOption,
    include: {
      model: Rentals,
      attributes: [],
      where: {
        isExpire: true
      }
    } as never
  });

  const result = await Umbrellas.findAll({
    ...option,
    ...searchOption,
    include: {
      model: Rentals,
      attributes: [],
      where: {
        isExpire: true
      }
    } as never
  });

  return {
    count,
    data: result
  };
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
