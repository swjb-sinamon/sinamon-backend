import { Op } from 'sequelize';

export const pagination = (page?: number, limit?: number): Record<string, number> => {
  let option = {};

  if (page && limit) {
    let offset = 0;

    if (page > 1) {
      offset = limit * (page - 1);
    }

    option = {
      offset,
      limit
    };
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
