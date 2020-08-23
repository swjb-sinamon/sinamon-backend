import Users from '../databases/models/users';

interface UserInfoParams {
  readonly email: string;
  readonly name: string;
  readonly studentGrade: number;
  readonly studentClass: number;
  readonly studentNumber: number;
}

// eslint-disable-next-line import/prefer-default-export
export const registerUser = async (userInfo: UserInfoParams):
  Promise<Record<string, any> | undefined> => {
  const { email, name, studentGrade, studentClass, studentNumber } = userInfo;

  await Users.update({
    name,
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

  if (!sendedUser) return undefined;

  sendedUser.password = '';

  return sendedUser;
};
