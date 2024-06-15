import { EExceptionCodes } from './base-exception';
import { ValidationException } from './validation-exception';

describe('validation-exception', () => {
  it('should throw ValidationException with the correct code and default message', () => {
    const exception = new ValidationException();
    expect(exception.message).toBeFalsy();
    expect(exception.exceptionCode).toEqual(EExceptionCodes.Validation);
  });

  it('should throw ValidationException with the correct code and message', () => {
    const message = 'exception message';
    const exception = new ValidationException(message);
    expect(exception.message).toEqual(message);
    expect(exception.exceptionCode).toEqual(EExceptionCodes.Validation);
  });
});
