import ServerConfigs from './models/server-configs';
import { logger } from '../index';

export const initializeServerConfig = async (): Promise<void> => {
  const notice = await ServerConfigs.findOne({
    where: {
      configKey: 'notice'
    }
  });

  if (!notice) {
    await ServerConfigs.create({
      configKey: 'notice',
      configValue: ''
    });

    logger.info('ServerConfigs initialized successfully');
  }
};
