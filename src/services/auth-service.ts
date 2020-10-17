import Users from '../databases/models/users';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';

interface UserInfoParams {
  readonly email: string;
  readonly name: string;
  readonly department: number;
  readonly studentGrade: number;
  readonly studentClass: number;
  readonly studentNumber: number;
}

// eslint-disable-next-line import/prefer-default-export
export const registerUser = async (userInfo: UserInfoParams): Promise<Users> => {
  const { email, name, department, studentGrade, studentClass, studentNumber } = userInfo;

  await Users.update({
    name,
    department,
    studentGrade,
    studentClass,
    studentNumber
  }, {
    where: {
      email
    }
  });

  const sendedUser = await Users.findOne({
    where: {
      email
    }
  });

  if (!sendedUser) throw new ServiceException(ErrorMessage.USER_NOT_FOUND, 404);

  sendedUser.password = '';

  return sendedUser;
};
