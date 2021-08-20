import ServerConfigs from './models/server-configs';
import { logger } from '../index';

export const initializeServerConfig = async (): Promise<void> => {
  let commit = false;

  const notice = await ServerConfigs.findOne({
    where: {
      configKey: 'notice'
    }
  });

  const canSubject = await ServerConfigs.findOne({
    where: {
      configKey: 'canSubject'
    }
  });

  if (!notice) {
    await ServerConfigs.create({
      configKey: 'notice',
      configValue: ''
    });
    commit = true;
  }

  if (!canSubject) {
    await ServerConfigs.create({
      configKey: 'canSubject',
      configValue: 'false'
    });
    commit = true;
  }

  if (commit) logger.info('ServerConfigs initialized successfully');
};
