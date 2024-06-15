import { HttpStatusCode } from 'axios';
import { RestApiException } from './rest-api-exception';
import { BaseException } from './base-exception';

describe('request-error', () => {
  const errorMessage = 'error message';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be an instance of RestApiException', () => {
    const error = new RestApiException(errorMessage);
    expect(error).toBeInstanceOf(RestApiException);
  });

  it('should inherit from BaseException', () => {
    const error = new RestApiException(errorMessage);
    expect(error).toBeInstanceOf(BaseException);
  });

  it('should contain default httpCode (400/bad request)', () => {
    const error = new RestApiException(errorMessage);
    expect(error).toHaveProperty('httpCode');
    expect(error.httpCode).toEqual(HttpStatusCode.BadRequest);
    expect(error.message).toEqual(errorMessage);
  });

  it('should contain specified error message and httpCode', () => {
    const error = new RestApiException(errorMessage, HttpStatusCode.InternalServerError);
    expect(error).toHaveProperty('httpCode');
    expect(error.httpCode).toEqual(HttpStatusCode.InternalServerError);
    expect(error.message).toEqual(errorMessage);
  });
});
