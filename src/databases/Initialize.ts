import { range } from 'fxjs';
import dayjs from 'dayjs';
import ServerConfigs from './models/server-configs';
import { logger } from '../index';
import Uniform from './models/uniform';
import config from '../config';

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

const UNIFORM_START_DATE = config.uniform.start;
const UNIFORM_END_DATE = config.uniform.end;
const UNIFORM_TOTAL_DATA = 18 * (UNIFORM_END_DATE - UNIFORM_START_DATE + 1);

export const initializeUniformData = async (): Promise<void> => {
  const count = await Uniform.count();

  if (count === UNIFORM_TOTAL_DATA) return;

  const promise = range(1, 3)
    .map((i: number) => {
      return range(1, 10)
        .map((j: number) => {
          return range(UNIFORM_START_DATE, UNIFORM_END_DATE + 1)
            .map(async (k: number) => {
              const date = dayjs()
                .set('month', 11)
                .set('date', k)
                .toDate();

              await Uniform.create({
                grade: i,
                fullClass: j,
                date,
                score: 0
              });
            });
        });
    });

  await Promise.all(promise);

  logger.info('Uniforms initialized successfully');
};
