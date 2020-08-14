import passport from 'passport';
import LoginStrategy from './login-strategy';
import RegisterStrategy from './register-strategy';

const authPassport = (): void => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  LoginStrategy();
  RegisterStrategy();
};

export default authPassport;
