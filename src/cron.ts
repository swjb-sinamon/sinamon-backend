import { schedule } from 'node-cron';
import { logger } from './index';
import { getUsers } from './services/auth-service';
import timetableParser from './managers/timetable-parser';
import { CalendarCache, DustCache, MealCache, WeatherCache } from './cache';

export default (): void => {
  // 4시간 주기
  schedule('0 */4 * * *', async () => {
    await timetableParser.fetchTimetable();
    logger.info('시간표를 새롭게 불러옵니다.');
  });

  // 1일 주기
  schedule('0 0 */1 * *', async () => {
    await MealCache.fetchCache();
    await CalendarCache.fetchCache();

    logger.info('급식, 학사일정을 새롭게 불러옵니다.');
  });

  // 1시간 주기
  schedule('0 */1 * * *', async () => {
    await WeatherCache.fetchCache();
    await DustCache.fetchCache();

    logger.info('날씨, 미세먼지 정보를 새롭게 불러옵니다.');
  });

  // 2월 20일 주기
  schedule('0 0 20 2 *', async () => {
    try {
      const { data: totalUsers } = await getUsers(undefined, undefined, '', {
        studentGrade: 3
      });

      let count = 0;
      const deletePromise = totalUsers.map(async (user) => {
        if (user.permission === undefined) return;
        if (user.permission.isAdmin || user.permission.isTeacher) return;
        await user.destroy();
        count += 1;
      });

      await Promise.all(deletePromise);

      logger.info(`${count}명 탈퇴 성공`);
    } catch (e) {
      logger.error('탈퇴 실패');
      logger.error(e);
    }
  });
};
