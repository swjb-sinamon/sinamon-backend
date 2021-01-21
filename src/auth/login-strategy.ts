import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import ErrorMessage from '../error/error-message';
import { getUserById } from '../services/auth-service';
import ServiceException from '../exceptions';

export default (): void => {
  passport.use('login', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password'
  }, async (id, password, done) => {
    try {
      const user = await getUserById(id);

      const compared = bcrypt.compareSync(password, user.password);
      if (!compared) return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });

      return done(null, user);
    } catch (e) {
      if (e instanceof ServiceException && e.message === ErrorMessage.USER_NOT_FOUND) {
        return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });
      }

      return done(e);
    }
  }));
};
