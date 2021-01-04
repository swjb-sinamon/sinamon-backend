export enum UmbrellaStatus {
  GOOD = 'good',
  WORSE = 'worse'
}

export const DayWeekArray = ['월', '화', '수', '목', '금', '토', '일'] as const;
export type DayWeek = typeof DayWeekArray[number];

export type PermissionType = 'admin' | 'teacher' | 'schoolunion';

export interface ComciganTimetable {
  readonly grade: number;
  readonly class: number;
  readonly weekday: number;
  readonly weekdayString: string;
  // eslint-disable-next-line camelcase
  readonly class_time: number;
  readonly code: string;
  readonly teacher: string;
  readonly subject: string;
}

export interface WeatherPayload {
  readonly status: string;
  readonly temp: number;
}

export interface DustPayload {
  readonly pm25: number;
  readonly pm10: number;
}

export const ContestRole: Record<'IDEA' | 'DEVELOP' | 'DESIGN', number> = {
  IDEA: 0,
  DEVELOP: 1,
  DESIGN: 2
};
