// eslint-disable-next-line import/prefer-default-export
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
