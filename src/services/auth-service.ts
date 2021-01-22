import bcrypt from 'bcrypt';
import Users from '../databases/models/users';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import Permissions from '../databases/models/permissions';
import { PermissionType, UserWithPermissions } from '../types';
import { pagination, search } from '../utils/router-util';
import { PaginationResult } from '../types/pagination-result';
import config from '../config';

export const getUser = async (value: string, type?: 'id' | 'uuid', showPassword?: boolean): Promise<UserWithPermissions> => {
  const key = type ?? 'uuid';
  const passwordOption = showPassword ? {} : {
    attributes: {
      exclude: ['password']
    }
  };

  const result = await Users.findOne({
    where: {
      [key]: value
    },
    ...passwordOption,
    include: [
      {
        model: Permissions,
        attributes: ['isAdmin', 'isTeacher', 'isSchoolUnion'],
        as: 'permission'
      }
    ] as never
  });

  if (!result) throw new ServiceException(ErrorMessage.USER_NOT_FOUND, 404);

  return result as UserWithPermissions;
};

export const getUserWithInfo = async (
  name: string,
  department: number,
  grade: number,
  clazz: number,
  number: number,
  showPassword?: boolean
): Promise<UserWithPermissions> => {
  const passwordOption = showPassword ? {} : {
    attributes: {
      exclude: ['password']
    }
  };

  const user = await Users.findOne({
    where: {
      name,
      department,
      studentGrade: grade,
      studentClass: clazz,
      studentNumber: number
    },
    ...passwordOption,
    include: [
      {
        model: Permissions,
        attributes: ['isAdmin', 'isTeacher', 'isSchoolUnion'],
        as: 'permission'
      }
    ] as never
  });

  if (!user) throw new ServiceException(ErrorMessage.USER_NOT_FOUND, 404);

  return user as UserWithPermissions;
};

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

  const user = await Users.findOne({
    where: {
      id
    },
    attributes: {
      exclude: ['password']
    }
  });

  if (!user) throw new ServiceException(ErrorMessage.USER_NOT_FOUND, 404);

  await user.update({
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

  return user;
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

export interface GetUsersFilters {
  readonly department?: number;
  readonly studentGrade?: number;
  readonly studentClass?: number;
}

export const getUsers = async (
  page?: number,
  limit?: number,
  searchQuery?: string,
  filters?: GetUsersFilters
): Promise<PaginationResult<UserWithPermissions[]>> => {
  const searchOption = search<Users>(searchQuery, 'name');
  const option = pagination(page, limit);

  let filterOption = {};
  if (filters) {
    const { department, studentGrade, studentClass } = filters;

    if (department) {
      filterOption = { department, ...filterOption };
    }
    if (studentGrade) {
      filterOption = { studentGrade, ...filterOption };
    }
    if (studentClass) {
      filterOption = { studentClass, ...filterOption };
    }
  }

  const searchAndFilter = Object.assign(
    searchOption.where ?? {},
    filterOption ?? {}
  ) as Record<string, any>;

  const count = await Users.count({
    where: {
      ...searchAndFilter
    }
  });

  const data = await Users.findAll({
    where: {
      ...searchAndFilter
    },
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
    data: data as UserWithPermissions[]
  };
};

interface EditUserParams {
  readonly studentGrade: number;
  readonly studentClass: number;
  readonly studentNumber: number;
  readonly currentPassword: string;
  readonly newPassword: string;
}
export const editUser = async (
  uuid: string,
  params: EditUserParams
): Promise<UserWithPermissions> => {
  const { studentGrade, studentClass, studentNumber, currentPassword, newPassword } = params;
  const user = await getUser(uuid, 'uuid', true);

  const compared = bcrypt.compareSync(currentPassword, user.password);
  if (!compared) throw new ServiceException(ErrorMessage.USER_PASSWORD_NOT_MATCH, 401);

  const hashed = await bcrypt.hash(newPassword, config.saltRound);

  await user.update({
    studentGrade,
    studentClass,
    studentNumber,
    password: hashed
  });

  return user as UserWithPermissions;
};
