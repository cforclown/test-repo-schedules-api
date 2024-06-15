import { BaseException, EExceptionCodes } from '.';

export class ValidationException extends BaseException {
  constructor (message?: string) {
    super(EExceptionCodes.Validation, message);
  }
}
