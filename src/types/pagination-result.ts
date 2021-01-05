export interface PaginationResult<T> {
  readonly count: number;
  readonly data: T;
}
