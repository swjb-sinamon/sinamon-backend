export interface SuccessPayload {
  readonly success: boolean;
}

export interface ErrorPayload<T> extends SuccessPayload {
  readonly error: T;
}

export interface ResultPayload<T> extends SuccessPayload {
  readonly data: T;
}
