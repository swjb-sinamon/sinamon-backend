import Users from '../databases/models/users';
import Permissions from '../databases/models/permissions';

export enum UmbrellaStatus {
  GOOD = 'good',
  WORSE = 'worse'
}

export type PermissionType = 'admin' | 'teacher' | 'schoolunion';

export interface WeatherPayload {
  readonly status: string;
  readonly temp: number;
}

export interface DustPayload {
  readonly pm25: number;
  readonly pm10: number;
}

export type UserWithPermissions = Users & { permission: Permissions };

export enum SubjectType {
  SELECT_SUBJECT = 'SELECT_SUBJECT', // 선택과목
  MAJOR_SUBJECT = 'MAJOR_SUBJECT' // 전공코스
}

export enum SubjectApplicationStatus {
  WAITING = 'WAITING', // 배정 대기 중
  FAIL = 'FAIL' // 배정 실패
}
