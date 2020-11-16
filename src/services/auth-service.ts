import Users from '../databases/models/users';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Permissions from '../databases/models/permissions';

interface UserInfoParams {
  readonly email: string;
  readonly name: string;
  readonly department: number;
  readonly studentGrade: number;
  readonly studentClass: number;
  readonly studentNumber: number;
}

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

export const initUserPermission = async (uuid: string): Promise<Permissions> => {
  const result = await Permissions.create({
    uuid,
    isAdmin: false,
    isTeacher: false,
    isSchoolUnion: false
  });

  return result;
};

export const getUser = async (uuid: string): Promise<Users> => {
  const result = await Users.findOne({
    where: {
      uuid
    }
  });

  if (!result) throw new ServiceException(ErrorMessage.USER_NOT_FOUND, 404);

  return result;
};
