import passport from 'passport';
import AuthLocalStrategy from './local-strategy';

const authPassport = (): void => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  AuthLocalStrategy();
};

export default authPassport;
