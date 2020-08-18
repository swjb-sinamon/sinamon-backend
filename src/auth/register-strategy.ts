import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Users from '../databases/models/users';
import ErrorMessage from '../error/error-message';
import config from '../config';

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
        uuid: uuidv4(),
        email,
        password: hashed,
        isAdmin: false
      });

      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));
};
