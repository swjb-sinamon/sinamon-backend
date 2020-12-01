import Users from '../databases/models/users';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Permissions from '../databases/models/permissions';
import { PermissionType } from '../types';
import { pagination, search } from '../utils/router-util';

interface UserInfoParams {
  readonly id: string;
  readonly name: string;
  readonly department: number;
  readonly studentGrade: number;
  readonly studentClass: number;
  readonly studentNumber: number;
}

export const registerUser = async (userInfo: UserInfoParams): Promise<Users> => {
  const { id, name, department, studentGrade, studentClass, studentNumber } = userInfo;

  await Users.update({
    name,
    department,
    studentGrade,
    studentClass,
    studentNumber
  }, {
    where: {
      id
    }
  });

  const sendedUser = await Users.findOne({
    where: {
      id
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

export const getMyPermission = async (uuid: string): Promise<PermissionType[]> => {
  const data = await Permissions.findOne({
    where: {
      uuid
    }
  });

  if (!data) return [];

  const myPermission: PermissionType[] = [];

  if (data.isAdmin) {
    myPermission.push('admin');
  }

  if (data.isTeacher) {
    myPermission.push('teacher');
  }

  if (data.isSchoolUnion) {
    myPermission.push('schoolunion');
  }

  return myPermission;
};

export const getUser = async (uuid: string): Promise<Users> => {
  const result = await Users.findOne({
    where: {
      uuid
    },
    include: [
      {
        model: Permissions,
        attributes: ['isAdmin', 'isTeacher', 'isSchoolUnion'],
        as: 'permission'
      }
    ] as never
  });

  if (!result) throw new ServiceException(ErrorMessage.USER_NOT_FOUND, 404);

  return result;
};

export const getUsers = async (
  usePagination = false,
  page = 0,
  limit = 10,
  searchQuery?: string
): Promise<{ count: number, data: Users[] }> => {
  const searchOption = search<Users>(searchQuery, 'name');
  const option = pagination(usePagination, page, limit);

  const count = await Users.count({
    ...searchOption
  });

  const data = await Users.findAll({
    ...searchOption,
    ...option,
    attributes: {
      exclude: ['password']
    },
    include: [
      {
        model: Permissions,
        attributes: ['isAdmin', 'isTeacher', 'isSchoolUnion'],
        as: 'permission'
      }
    ] as never
  });

  return {
    count,
    data
  };
};
