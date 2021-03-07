import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUser, initUserPermission, registerUser } from '../services/auth-service';
import ServiceException from '../exceptions';

export default (): void => {
  passport.use('register', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, id, password, done) => {
    try {
      const {
        name,
        department,
        studentGrade,
        studentClass,
        studentNumber,
        code
      } = req.body;

      const result = await registerUser({
        id,
        password,
        name,
        department,
        studentGrade,
        studentClass,
        studentNumber,
        code
      });

      await initUserPermission(result.uuid);

      const userDataWithPermission = await getUser(result.uuid);

      return done(null, userDataWithPermission);
    } catch (e) {
      if (e instanceof ServiceException) {
        const errorMessage = JSON.stringify({
          message: e.message,
          status: e.httpStatus
        });
        return done(null, false, { message: errorMessage });
      }
      return done(e);
    }
  }));
};
