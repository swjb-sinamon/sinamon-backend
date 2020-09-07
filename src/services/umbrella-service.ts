import Umbrellas from '../databases/models/umbrellas';
import { AlreadyExists, NotFound, UmbrellaStatus } from '../types';

export const getUmbrellas = async (): Promise<Umbrellas[]> => {
  const result = await Umbrellas.findAll();
  return result;
};

export const getUmbrella = async (name: string): Promise<Umbrellas | NotFound> => {
  const result = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (!result) {
    return undefined;
  }

  return result;
};

export const createUmbrella = async (name: string, status: UmbrellaStatus):
  Promise<Umbrellas | AlreadyExists> => {
  const current = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (current) {
    return undefined;
  }

  const result = await Umbrellas.create({
    name,
    status
  });

  return result;
};

export const updateUmbrella = async (name: string, status: UmbrellaStatus):
  Promise<Umbrellas | NotFound> => {
  const current = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (!current) {
    return undefined;
  }

  await current.update({
    status
  });

  return current;
};

export const removeUmbrella = async (name: string): Promise<Umbrellas | NotFound> => {
  const current = await Umbrellas.findOne({
    where: {
      name
    }
  });

  if (!current) {
    return undefined;
  }

  await current.destroy();

  return current;
};
