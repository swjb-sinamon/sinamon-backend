import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import Users from '../databases/models/users';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';

const authLocalStrategy = (): void => {
  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await Users.findOne({
        where: {
          email
        }
      });

      if (!user) return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });

      const compared = bcrypt.compareSync(password, user.password);
      if (!compared) return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });

      logger.info(`${user.uuid} ${user.email} 님이 로그인 중입니다.`);

      return done(null, user);
    } catch (e) {
      logger.error('로그인 중 오류가 발생하였습니다.');
      logger.error(e);
      return done(e);
    }
  }));
};

export default authLocalStrategy;
