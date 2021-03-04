import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import ErrorMessage from '../error/error-message';
import ServiceException from '../exceptions';
import { getUser } from '../services/auth-service';
import { logger } from '../index';

export default (): void => {
  passport.use('login', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password'
  }, async (id, password, done) => {
    try {
      const user = await getUser(id, 'id', true);

      const compared = bcrypt.compareSync(password, user.password);
      if (!compared) {
        logger.warn(`${user.uuid} ${user.id} 사용자 비밀번호가 틀렸습니다.`);
        return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });
      }

      return done(null, user);
    } catch (e) {
      if (e instanceof ServiceException && e.message === ErrorMessage.USER_NOT_FOUND) {
        return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });
      }

      return done(e);
    }
  }));
};
