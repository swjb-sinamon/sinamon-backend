import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import ErrorMessage from '../error/error-message';
import ServiceException from '../exceptions';
import { getMyPermission, getUser } from '../services/auth-service';
import { logger } from '../index';

const userNotFoundErrorMessage = JSON.stringify({
  message: ErrorMessage.USER_NOT_FOUND,
  status: 404
});

export default (): void => {
  passport.use('login', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, id, password, done) => {
    const { admin } = req.query;

    const adminQuery = admin || 'false';
    const isAdminLogin = adminQuery.toString().toLowerCase() === 'true';

    try {
      const user = await getUser(id, 'id', true);

      const compared = bcrypt.compareSync(password, user.password);
      if (!compared) {
        logger.warn(`${user.uuid} ${user.id} 사용자 비밀번호가 틀렸습니다.`);
        return done(null, false, { message: userNotFoundErrorMessage });
      }

      const myPermission = await getMyPermission(user.uuid);
      const isHavePermission = myPermission.some((v) => ['admin', 'teacher', 'schoolunion'].includes(v));
      if (isAdminLogin && !isHavePermission) {
        const errorMessage = JSON.stringify({
          message: ErrorMessage.NO_PERMISSION,
          status: 401
        });
        logger.warn(`${user.uuid} ${user.id} 사용자가 관자 페이지 로그인을 시도하였습니다.`);
        return done(null, false, { message: errorMessage });
      }

      return done(null, user);
    } catch (e) {
      if (e instanceof ServiceException) {
        const errorMessage = JSON.stringify({
          message: e.message,
          status: e.httpStatus
        });
        return done(null, false, { message: errorMessage });
      }

      return done(e);
    }
  }));
};
