import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Users from '../databases/models/users';
import ErrorMessage from '../error/error-message';
import config from '../config';

export default (): void => {
  passport.use('register', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password'
  }, async (id, password, done) => {
    try {
      const currentUser = await Users.findOne({
        where: {
          id
        }
      });

      if (currentUser) {
        return done(null, false, { message: ErrorMessage.USER_ALREADY_EXISTS });
      }

      const hashed = await bcrypt.hash(password, config.saltRound);
      const user = await Users.create({
        uuid: uuidv4(),
        id,
        password: hashed
      });

      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));
};
