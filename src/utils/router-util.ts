import { Model } from 'sequelize';
import exp from 'constants';
import { Parser } from 'json2csv';
import express from 'express';

interface PaginationResult {
  readonly offset: number;
  readonly limit: number;
}

export const pagination = (
  page: number,
  limit: number
): PaginationResult | Record<string, unknown> => {
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

export type FilterParam<T> = [symbol, keyof T, unknown][];
export const filter = <T extends Model>(
  properties: FilterParam<T>
): Record<keyof T, Record<symbol, unknown>> | Record<string, unknown> => {
  let option = {};

  properties.forEach((property) => {
    const [expression, key, value] = property;
    option = {
      [key]: {
        [expression]: value
      },
      ...option
    };
  });

  return option;
};

interface OrderResult<T extends Model> {
  readonly order: [keyof T, 'ASC' | 'DESC'][];
}
export const order = <T extends Model>(properties: [keyof T, 'ASC' | 'DESC'][]): OrderResult<T> => {
  return {
    order: properties
  };
};

export const sendCsv = (res: express.Response, fields: string[], data: Readonly<unknown>) => {
  const parser = new Parser({
    fields
  });

  res.setHeader('Content-Type', 'text/csv');
  res.status(200).send(parser.parse(data));
};
