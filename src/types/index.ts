export enum UmbrellaStatus {
  GOOD = 'good',
  WORSE = 'worse'
}

export const DayWeekArray = ['월', '화', '수', '목', '금', '토', '일'] as const;
export type DayWeek = typeof DayWeekArray[number];

export type PermissionType = 'admin' | 'teacher' | 'schoolunion';
