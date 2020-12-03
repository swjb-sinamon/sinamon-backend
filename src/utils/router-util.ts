import { Op } from 'sequelize';

export const pagination = (usePagination = false, page = 0, limit = 10): Record<string, number> => {
  const option: Record<string, number> = {};
  if (usePagination) {
    let offset = 0;

    if (page > 1) {
      offset = limit * (page - 1);
    }

    option.offset = offset;
    option.limit = limit;
  }

  return option;
};

export const search = <T>(searchQuery?: string, key?: keyof T): Record<string, number> => {
  let option = {};

  if (searchQuery && key) {
    option = {
      where: {
        [key]: {
          [Op.like]: `%${searchQuery}%`
        }
      }
    };
  }

  return option;
};
