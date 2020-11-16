import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import Users from '../databases/models/users';
import ErrorMessage from '../error/error-message';
import Permissions from '../databases/models/permissions';

export default () => {
  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await Users.findOne({
        where: {
          email
        },
        include: [
          {
            model: Permissions,
            attributes: ['isAdmin', 'isTeacher', 'isSchoolUnion'],
            as: 'permission'
          }
        ] as never
      });

      if (!user) return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });

      const compared = bcrypt.compareSync(password, user.password);
      if (!compared) return done(null, false, { message: ErrorMessage.USER_NOT_FOUND });

      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));
};
