import { ValidationError } from 'express-validator';
import { ErrorPayload } from '../types/rest-payload';
import ErrorMessage from './error-message';

export const makeValidationError = (errors: ValidationError[]):
  ErrorPayload<Record<string, ValidationError[]>> => {
  return {
    success: false,
    error: {
      errors
    }
  };
};

export const makeError = (message: ErrorMessage): ErrorPayload<ErrorMessage> => {
  return {
    success: false,
    error: message
  };
};
