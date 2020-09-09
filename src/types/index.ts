export enum UmbrellaStatus {
  GOOD = 'good',
  WORSE = 'worse'
}

export type NotFound = undefined;
export type AlreadyExists = undefined;

export const DayWeekArray = ['월', '화', '수', '목', '금', '토', '일'] as const;
export type DayWeek = typeof DayWeekArray[number];

export interface TupleError {
  readonly prepareError: boolean;
  readonly error: boolean;
}
