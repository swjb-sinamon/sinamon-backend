import { v4 as uuidv4 } from 'uuid';
import Rentals from '../databases/models/rentals';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Users from '../databases/models/users';
import Umbrellas from '../databases/models/umbrellas';

interface RentalProps {
  readonly lender: string;
  readonly umbrellaName: string;
  readonly expiryDate: Date;
}

export const getRentals = async (): Promise<Rentals[]> => {
  const result = await Rentals.findAll({
    where: {
      isExpire: false
    }
  });
  return result;
};

export const getRentalsOnlyExpire = async (): Promise<Rentals[]> => {
  const result = await Rentals.findAll({
    where: {
      isExpire: true
    }
  });
  return result;
};

export const getRental = async (uuid: string): Promise<Rentals> => {
  const result = await Rentals.findOne({
    where: {
      uuid
    }
  });

  if (!result) throw new ServiceException(ErrorMessage.RENTAL_NOT_FOUND, 404);

  return result;
};

export const borrowRental = async (createProps: RentalProps): Promise<Rentals> => {
  const { lender, umbrellaName, expiryDate } = createProps;

  const lenderUser = await Users.findOne({
    where: {
      uuid: lender
    }
  });
  if (!lenderUser) throw new ServiceException(ErrorMessage.USER_NOT_FOUND, 404);

  const umbrella = await Umbrellas.findOne({
    where: {
      name: umbrellaName
    }
  });
  if (!umbrella) throw new ServiceException(ErrorMessage.UMBRELLA_NOT_FOUND, 404);

  const currentByExpiry = await Rentals.findOne({
    where: {
      lender,
      isExpire: true
    }
  });
  if (currentByExpiry) throw new ServiceException(ErrorMessage.RENTAL_EXPIRE, 403);

  const currentByUser = await Rentals.findOne({
    where: {
      lender
    }
  });
  if (currentByUser) throw new ServiceException(ErrorMessage.RENTAL_USER_ALREADY_EXISTS, 409);

  const currentByUmbrella = await Rentals.findOne({
    where: {
      umbrellaName
    }
  });
  if (currentByUmbrella) {
    throw new ServiceException(ErrorMessage.RENTAL_UMBRELLA_ALREADY_EXISTS, 409);
  }

  const current = await Rentals.create({
    uuid: uuidv4(),
    lender,
    umbrellaName,
    expiryDate,
    isExpire: false
  });

  return current;
};

export const returnRental = async (uuid: string): Promise<Rentals> => {
  const current = await Rentals.findOne({
    where: {
      uuid
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.RENTAL_NOT_FOUND, 404);

  await current.destroy();

  return current;
};

export const setExpire = async (uuid: string): Promise<Rentals> => {
  const current = await Rentals.findOne({
    where: {
      uuid
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.RENTAL_NOT_FOUND, 404);

  await current.update({
    isExpire: true
  });

  return current;
};
