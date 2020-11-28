import ActivationCode from '../databases/models/activation-code';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { pagination } from '../utils/router-util';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';

const generateCode = (): string => {
  let result = '';

  for (let i = 0; i < 3; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  for (let j = 0; j < 2; j += 1) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return result;
};

const makeAbleActivationCode = async (): Promise<string> => {
  const code = generateCode();

  const current = await ActivationCode.findOne({
    where: {
      code
    }
  });

  if (current) {
    setTimeout(() => makeAbleActivationCode(), 10);
  }

  return code;
};

export const addActivationCode = async (): Promise<ActivationCode> => {
  const code = await makeAbleActivationCode();

  const result = await ActivationCode.create({
    code,
    isUse: false
  });

  return result;
};

export const useActivationCode = async (code: string): Promise<ActivationCode> => {
  const current = await ActivationCode.findOne({
    where: {
      code
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.ACTIVATION_CODE_NOT_FOUND, 404);

  if (current.isUse) throw new ServiceException(ErrorMessage.ACTIVATION_CODE_USED, 409);

  await current.update({
    isUse: true,
    useAt: new Date()
  }, {
    where: {
      code
    }
  });

  return current;
};

export const getActivationCodes = async (
  usePagination = false,
  page = 0,
  limit = 10
): Promise<{ count: number, data: ActivationCode[] }> => {
  const option = pagination(usePagination, page, limit);

  const { count, rows } = await ActivationCode.findAndCountAll({
    ...option
  });

  return {
    count,
    data: rows
  };
};
