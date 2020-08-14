import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import uuid from 'uuid';
import Users from '../databases/models/users';
import ErrorMessage from '../error/error-message';
import { logger } from '../index';
import config from '../config';

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
      logger.error('로그인 진행 중 오류가 발생하였습니다.');
      logger.error(e);
      return done(e);
    }
  }));

  passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const prevUser = await Users.findOne({
        where: {
          email
        }
      });

      if (prevUser) {
        return done(null, false, { message: ErrorMessage.USER_ALREADY_EXISTS });
      }

      const hashed = await bcrypt.hash(password, config.saltRound);
      const user = await Users.create({
        uuid: uuid.v4(),
        email,
        password: hashed,
        isAdmin: false,
        name: '홍길동',
        studentGrade: 1,
        studentClass: 1,
        studentNumber: 1
      });

      return done(null, user);
    } catch (e) {
      logger.error('회원가입 진행 중 오류가 발생하였습니다.');
      logger.error(e);
      return done(e);
    }
  }));
};

export default authLocalStrategy;
