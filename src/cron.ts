import { schedule } from 'node-cron';
import Rentals from './databases/models/rentals';
import { setExpire } from './services/rental-service';
import { logger } from './index';
import {
  fetchCalendarCache,
  fetchDustCache,
  fetchMealCache,
  fetchTimetableCache,
  fetchWeatherCache
} from './cache/api-cache';
import Users from './databases/models/users';

export default (): void => {
  // 4시간 주기
  schedule('0 */4 * * *', async () => {
    logger.info('우산 연체 여부를 확인합니다.');

    const now = Math.floor(new Date().getTime() / 1000);
    const current = await Rentals.findAll({
      where: {
        isExpire: false
      }
    });

    let count = 0;
    const promise = current.map(async (info) => {
      const time = Math.floor(info.expiryDate.getTime() / 1000);
      if (now >= time) {
        await setExpire(info.uuid);
        count += 1;
      }
    });

    await Promise.all(promise);

    logger.info(`우산 ${count}개가 연체되었습니다.`);
    logger.info('우산 연체 여부를 확인 완료했습니다.');

    await fetchTimetableCache();
    logger.info('시간표를 새롭게 불러옵니다.');
  });

  // 1일 주기
  schedule('0 0 */1 * *', async () => {
    await fetchMealCache();
    await fetchCalendarCache();

    logger.info('급식, 학사일정을 새롭게 불러옵니다.');
  });

  // 1시간 주기
  schedule('0 */1 * * *', async () => {
    await fetchWeatherCache();
    await fetchDustCache();

    logger.info('날씨, 미세먼지 정보를 새롭게 불러옵니다.');
  });
};
  // 3월 2일 주기
schedule('0 0 2 3 *' , async () => {
  try {
    const users = await Users.findAll({
      where: {
          studentGrade: 3
      }
  });
    await Users.destroy();
    logger.info("탈퇴성공");
  } catch (e) {
    logger.error("탈퇴 실패");
    logger.error(e)
  }
});