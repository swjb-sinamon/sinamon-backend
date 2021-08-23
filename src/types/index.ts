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
  SUCCESS = 'SUCCESS', // 배정 성공
  NONE = 'NONE', // 이미 배정 성공하여, 더 이상 쓸모가 없음.
  WAITING = 'WAITING' // 배정 대기 중
}

export enum ApplicationType {
  ORDER = 'ORDER', // 선착순
  RANDOM = 'RANDOM' // 랜덤
}
