import FCM from '../databases/models/fcm';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';

export const getFCMToken = async (uuid: string): Promise<FCM> => {
  const current = await FCM.findOne({
    where: {
      uuid
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.FCM_TOKEN_NOT_FOUND, 404);

  return current;
};

export const createOrUpdateFCMToken = async (uuid: string, token: string): Promise<FCM> => {
  try {
    const current = await getFCMToken(uuid);

    await current.update({
      token
    });

    return current;
  } catch (e) {
    if (e instanceof ServiceException && e.message === ErrorMessage.FCM_TOKEN_NOT_FOUND) {
      const result = await FCM.create({
        uuid,
        token
      });

      return result;
    }

    throw e;
  }
};
