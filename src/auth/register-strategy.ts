import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import uuid from 'uuid';
import Users from '../databases/models/users';
import ErrorMessage from '../error/error-message';
import config from '../config';
import { logger } from '../index';

export default () => {
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
