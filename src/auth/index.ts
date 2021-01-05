import passport from 'passport';
import LoginStrategy from './login-strategy';
import RegisterStrategy from './register-strategy';

const authPassport = (): void => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    done(null, user);
  });

  LoginStrategy();
  RegisterStrategy();
};

export default authPassport;
