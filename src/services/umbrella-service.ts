import { Op } from 'sequelize';
import Umbrellas from '../databases/models/umbrellas';
import { UmbrellaStatus } from '../types';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Rentals from '../databases/models/rentals';
import { filter, pagination } from '../utils/router-util';
import { PaginationResult } from '../types/pagination-result';

type SomeRentals = Pick<Rentals, 'lender' | 'expiryDate' | 'isExpire'>;
type UmbrellaWithRental = Umbrellas & { rental: SomeRentals };

export const getUmbrellaAllData = async (
  page?: number,
  limit?: number,
  searchQuery?: string
): Promise<PaginationResult<Array<UmbrellaWithRental>>> => {
  const pageOption = page && limit ? pagination(page, limit) : {};
  const searchOption = searchQuery ? filter<Umbrellas>([[Op.like, 'name', `%${searchQuery}%`]]) : {};

  const { count, rows } = await Umbrellas.findAndCountAll({
    ...pageOption,
    where: {
      ...searchOption
    },
    include: [
      {
        model: Rentals,
        attributes: ['lender', 'expiryDate', 'isExpire']
      }
    ] as never
  });

  return {
    count,
    data: rows as Array<UmbrellaWithRental>
  };
};

export const getUmbrellas = async (
  page?: number,
  limit?: number,
  searchQuery?: string
): Promise<PaginationResult<Umbrellas[]>> => {
  const searchOption = searchQuery ? filter<Umbrellas>([[Op.like, 'name', `%${searchQuery}%`]]) : {};

  const umbrellas = await Umbrellas.findAll({
    where: {
      ...searchOption
    },
    include: {
      model: Rentals,
      attributes: ['uuid']
    } as never
  }) as Array<Umbrellas & { rental: Rentals }>;

  const data: Umbrellas[] = umbrellas
    .filter((umbrella) => !umbrella.rental)
    .map((item) => item.toJSON() as Umbrellas & { rental: Rentals })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ rental, ...current }) => current as Umbrellas);

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
): Promise<PaginationResult<Umbrellas[]>> => {
  const pageOption = page && limit ? pagination(page, limit) : {};
  const searchOption = searchQuery ? filter<Umbrellas>([[Op.like, 'name', `%${searchQuery}%`]]) : {};

  const { count, rows } = await Umbrellas.findAndCountAll({
    ...pageOption,
    where: {
      ...searchOption
    },
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
    data: rows
  };
};

export const getExpiryUmbrellas = async (
  page?: number,
  limit?: number,
  searchQuery?: string
): Promise<PaginationResult<Umbrellas[]>> => {
  const pageOption = page && limit ? pagination(page, limit) : {};
  const searchOption = searchQuery ? filter<Umbrellas>([[Op.like, 'name', `%${searchQuery}%`]]) : {};

  const { count, rows } = await Umbrellas.findAndCountAll({
    ...pageOption,
    where: {
      ...searchOption
    },
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
    data: rows
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
